"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandInternal = void 0;
var Compiler_1 = require("../Compiler");
var Token_1 = require("../Token");
exports.CommandInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        var name = Compiler_1.Compiler.readText(code, context, initiator);
        if (name === undefined)
            return false;
        code.spliceFrom(start, Token_1.Token.fromParent('\\' + name, Token_1.TokenType.Command, initiator));
        return true;
    },
};
//# sourceMappingURL=CommandInternal.js.map