const HARDENED_KEY_MULTIPLIER = 0x80000000;
const BIP44_MAX_OFFSET = 0x0FFFFFFF;
const AION_BASIC_PATH = Buffer.from('8000002C800001A98000000080000000', 'hex');
const AION_APP_PREFIX = 0xe0;
const P1 = 0x00;
const P2 = 0x00;
const INS_GET_PUBLIC_KEY = 0x02;
const INS_SIGN = 0x04;

function getHardenedNumber(nr) {
  return Buffer.from(((HARDENED_KEY_MULTIPLIER | nr) >>> 0).toString(16), 'hex');
}

function generateBip44Path(derivationIndex) {
  let offsetExpanded = derivationIndex & 0x00000000FFFFFFFF;

  if (offsetExpanded > BIP44_MAX_OFFSET) {
    throw Error(`derivationIndex cannot be greater than BIP44_MAX_OFFSET ${BIP44_MAX_OFFSET}`);
  }

  return Buffer.concat([AION_BASIC_PATH, getHardenedNumber(derivationIndex)]); // return Buffer.from('8000002c8000003c800000000000000000000000','hex');
}

function genGetPublicKeyAPDUCommand(path) {
  return Buffer.concat([Buffer.from([path.length / 4]), path]);
}

function genSignPayloadAPDUCommand(path, payload) {
  return Buffer.concat([Buffer.from([path.length / 4]), path, payload]);
}

export default class AionApp {
  constructor(transport, scrambleKey = 'aion') {
    if (typeof transport === 'undefined') {
      throw new Error('Transport has not been defined');
    }

    this.transport = transport;
    transport.decorateAppAPIMethods(this, ['getAccount', 'signPayload'], scrambleKey);
  }

  async getAccount(derivationIndex) {
    try {
      let path = generateBip44Path(derivationIndex);
      let buffer = genGetPublicKeyAPDUCommand(path);
      const response = await this.transport.send(AION_APP_PREFIX, INS_GET_PUBLIC_KEY, P1, P2, buffer);
      const pubKey = Buffer.from(response.slice(0, 32)).toString('hex');
      const address = '0x' + Buffer.from(response.slice(32)).toString('hex');
      return {
        pubKey,
        address
      };
    } catch (e) {
      console.log(`get Account error => ${e}`);
      throw e;
    }
  }

  async signPayload(derivationIndex, payload) {
    try {
      let path = generateBip44Path(derivationIndex);
      let buffer = genSignPayloadAPDUCommand(path, payload);
      const response = await this.transport.send(AION_APP_PREFIX, INS_SIGN, P1, P2, buffer);
      return Buffer.from(response).toString('hex');
    } catch (e) {
      console.log(`get Account error => ${e}`);
      throw e;
    }
  }

}
//# sourceMappingURL=aionApp.js.map