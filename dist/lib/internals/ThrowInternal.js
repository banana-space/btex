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
        context.throw.apply(context, __spreadArray([text, initiator], args, false));
        return false;
    },
};
//# sourceMappingURL=ThrowInternal.js.map