//@flow
import Transport from "@ledgerhq/hw-transport";

const HARDENED_KEY_MULTIPLIER = 0x80000000;
const BIP44_MAX_OFFSET = 0x0FFFFFFF;
const AION_BASIC_PATH  =  Buffer.from('8000002C800001A98000000080000000', 'hex');
const AION_APP_PREFIX = 0xe0;

const P1 = 0x00;
const P2 = 0x00;

const INS_GET_PUBLIC_KEY = 0x02;
const INS_SIGN = 0x04;

function getHardenedNumber(nr){
    return Buffer.from(((HARDENED_KEY_MULTIPLIER | nr) >>> 0).toString(16), 'hex');
}

export function AionApp(transport: Transport<*>) {

    function generateBip44Path(derivationIndex: number) {
        let offsetExpanded = derivationIndex & 0x00000000FFFFFFFF;
        if(offsetExpanded>BIP44_MAX_OFFSET){
            throw Error(`derivationIndex cannot be greater than BIP44_MAX_OFFSET ${BIP44_MAX_OFFSET}`);
        }
        return Buffer.concat([AION_BASIC_PATH, getHardenedNumber(derivationIndex)]);
    }
    
    function genGetPublicKeyAPDUCommand(path: Buffer) {
        return Buffer.concat([Buffer.from([path.length+1]), Buffer.from([path.length/4]), path]);
    }

    function genSignPayloadAPDUCommand(path: Buffer, payload: Buffer) {
        return Buffer.concat([Buffer.from([payload.length+1]), Buffer.from([path.length/4]), path, payload]);
    }


    async function getAccount(derivationIndex: number){
        try {
            let path = generateBip44Path(derivationIndex);
            let buffer = genGetPublicKeyAPDUCommand(path);
            const response = await transport.send(
                AION_APP_PREFIX,
                INS_GET_PUBLIC_KEY,
                P1,
                P2,
                buffer
            );
            const pubKey = Buffer.from(response.slice(0, 32)).toString('hex');
            const address = '0x'+ Buffer.from(response.slice(32)).toString('hex');
            return {pubKey, address}
        }catch (e) {
            console.log(`get Account error => ${e}`);
            throw e;
        }
    }

    async function signPayload(derivationIndex: number, payload: Buffer) {
        try {
            let path = generateBip44Path(derivationIndex);
            let buffer = genSignPayloadAPDUCommand(path, payload);
            const response = await transport.send(
                AION_APP_PREFIX,
                INS_SIGN,
                P1,
                P2,
                buffer
            );
            return Buffer.from(response).toString('hex')
        }catch (e) {
            console.log(`get Account error => ${e}`);
            throw e;
        }
    }


    return {getAccount, signPayload};
}