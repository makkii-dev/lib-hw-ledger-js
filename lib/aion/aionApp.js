"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HARDENED_KEY_MULTIPLIER = 0x80000000;
var BIP44_MAX_OFFSET = 0x0FFFFFFF;
var AION_BASIC_PATH = Buffer.from('8000002C800001A98000000080000000', 'hex');
var AION_APP_PREFIX = 0xe0;
var P1 = 0x00;
var P2 = 0x00;
var INS_GET_PUBLIC_KEY = 0x02;
var INS_SIGN = 0x04;

function getHardenedNumber(nr) {
  return Buffer.from(((HARDENED_KEY_MULTIPLIER | nr) >>> 0).toString(16), 'hex');
}

function generateBip44Path(derivationIndex) {
  var offsetExpanded = derivationIndex & 0x00000000FFFFFFFF;

  if (offsetExpanded > BIP44_MAX_OFFSET) {
    throw Error("derivationIndex cannot be greater than BIP44_MAX_OFFSET ".concat(BIP44_MAX_OFFSET));
  }

  return Buffer.concat([AION_BASIC_PATH, getHardenedNumber(derivationIndex)]); // return Buffer.from('8000002c8000003c800000000000000000000000','hex');
}

function genGetPublicKeyAPDUCommand(path) {
  return Buffer.concat([Buffer.from([path.length / 4]), path]);
}

function genSignPayloadAPDUCommand(path, payload) {
  return Buffer.concat([Buffer.from([path.length / 4]), path, payload]);
}

var AionApp =
/*#__PURE__*/
function () {
  function AionApp(transport) {
    var scrambleKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'aion';

    _classCallCheck(this, AionApp);

    if (typeof transport === 'undefined') {
      throw new Error('Transport has not been defined');
    }

    this.transport = transport;
    transport.decorateAppAPIMethods(this, ['getAccount', 'sign'], scrambleKey);
  }

  _createClass(AionApp, [{
    key: "getAccount",
    value: function () {
      var _getAccount = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(derivationIndex) {
        var path, buffer, response, pubKey, address;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                path = generateBip44Path(derivationIndex);
                buffer = genGetPublicKeyAPDUCommand(path);
                _context.next = 5;
                return this.transport.send(AION_APP_PREFIX, INS_GET_PUBLIC_KEY, P1, P2, buffer);

              case 5:
                response = _context.sent;
                pubKey = Buffer.from(response.slice(0, 32)).toString('hex');
                address = '0x' + Buffer.from(response.slice(32)).toString('hex');
                return _context.abrupt("return", {
                  pubKey: pubKey,
                  address: address
                });

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](0);
                console.log("get Account error => ".concat(_context.t0));
                throw _context.t0;

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 11]]);
      }));

      function getAccount(_x) {
        return _getAccount.apply(this, arguments);
      }

      return getAccount;
    }()
  }, {
    key: "sign",
    value: function () {
      var _sign = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(derivationIndex, payload) {
        var path, buffer, response;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                path = generateBip44Path(derivationIndex);
                buffer = genSignPayloadAPDUCommand(path, payload);
                _context2.next = 5;
                return this.transport.send(AION_APP_PREFIX, INS_SIGN, P1, P2, buffer);

              case 5:
                response = _context2.sent;
                return _context2.abrupt("return", Buffer.from(response).toString('hex'));

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](0);
                console.log("get Account error => ".concat(_context2.t0));
                throw _context2.t0;

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 9]]);
      }));

      function sign(_x2, _x3) {
        return _sign.apply(this, arguments);
      }

      return sign;
    }()
  }]);

  return AionApp;
}();

exports["default"] = AionApp;
//# sourceMappingURL=aionApp.js.map