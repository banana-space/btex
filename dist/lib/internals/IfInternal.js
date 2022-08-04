"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
        code.spliceFrom.apply(code, __spreadArrays([start], replace.tokens));
        return true;
    },
};
//# sourceMappingURL=IfInternal.js.map