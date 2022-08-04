"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowInternal = void 0;
var Compiler_1 = require("../Compiler");
exports.ThrowInternal = {
    execute: function (code, context) {
        var initiator = code.token;
        code.step();
        var text = Compiler_1.Compiler.readText(code, context, initiator);
        if (text === undefined)
            return false;
        var args = [];
        for (var i = 1; i < 10; i++) {
            var arg = context.get('throw-arg-' + i, true);
            if (arg === undefined)
                break;
            args.push(arg);
        }
        // TODO: check text
        context.throw.apply(context, __spreadArrays([text, initiator], args));
        return false;
    },
};
//# sourceMappingURL=ThrowInternal.js.map