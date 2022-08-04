"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterInternal = void 0;
var Compiler_1 = require("../Compiler");
var Token_1 = require("../Token");
exports.CharacterInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        if (!code.canStep()) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var text = Compiler_1.Compiler.readText(code, context, initiator);
        if (text === undefined)
            return false;
        var charCode = parseInt(text, 16);
        if (!isFinite(charCode) || charCode < 0 || charCode > 0x10ffff) {
            // TODO: throw 'invalid char code'
            return false;
        }
        var char = String.fromCodePoint(charCode);
        code.spliceFrom(start);
        var token = Token_1.Token.fromParent(char, Token_1.TokenType.Text, initiator);
        token.noExpand = true;
        code.tokens.splice(start, 0, token);
        return true;
    },
};
//# sourceMappingURL=CharacterInternal.js.map