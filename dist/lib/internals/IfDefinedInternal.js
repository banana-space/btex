"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfDefinedInternal = void 0;
exports.IfDefinedInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        var first = code.readGroup();
        if (first === undefined || first.tokens.length === 0) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        if (first.tokens.length > 1) {
            context.throw('COMMAND_EXPECTED', initiator);
            return false;
        }
        var command = first.tokens[0];
        var second = code.readGroup();
        if (!second) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var third = code.readGroup();
        if (!third) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var replace = context.findCommand(command.text) ? second : third;
        code.spliceFrom.apply(code, __spreadArrays([start], replace.tokens));
        return true;
    },
};
//# sourceMappingURL=IfDefinedInternal.js.map