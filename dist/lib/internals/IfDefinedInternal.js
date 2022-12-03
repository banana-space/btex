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
        code.spliceFrom.apply(code, __spreadArray([start], replace.tokens, false));
        return true;
    },
};
//# sourceMappingURL=IfDefinedInternal.js.map