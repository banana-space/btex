"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddInternal = void 0;
var Compiler_1 = require("../Compiler");
exports.AddInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        if (!code.canStep()) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var key = Compiler_1.Compiler.readText(code, context, initiator);
        if (key === undefined)
            return false;
        var arg = Compiler_1.Compiler.readText(code, context, initiator);
        if (arg === undefined)
            return false;
        var value = context.get(key);
        if (value === undefined) {
            // TODO: error
            return false;
        }
        var newValue = parseInt(value);
        newValue += parseInt(arg);
        if (Number.isSafeInteger(newValue)) {
            context.set(key, newValue.toString());
        }
        else {
            // TODO: error
            return false;
        }
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=AddInternal.js.map