"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfInternal = void 0;
var Compiler_1 = require("../Compiler");
exports.IfInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        var first = Compiler_1.Compiler.readText(code, context, initiator);
        if (first === undefined)
            return false;
        var second = Compiler_1.Compiler.readText(code, context, initiator);
        if (second === undefined)
            return false;
        var third = code.readGroup();
        if (!third) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var fourth = code.readGroup();
        if (!fourth) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var replace = first === second ? third : fourth;
        code.spliceFrom.apply(code, __spreadArray([start], replace.tokens, false));
        return true;
    },
};
//# sourceMappingURL=IfInternal.js.map