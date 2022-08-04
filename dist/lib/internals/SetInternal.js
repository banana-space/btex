"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetInternal = void 0;
var Compiler_1 = require("../Compiler");
exports.SetInternal = {
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
        var value = Compiler_1.Compiler.readText(code, context, initiator);
        if (value === undefined)
            return false;
        // TODO: key cannot begin with a number
        var flushSpan = !context.noOutput && key.startsWith('text-') && context.get(key) !== value;
        context.set(key, value);
        if (flushSpan) {
            context.set('text-style-changed', '1');
            context.flushSpan();
        }
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=SetInternal.js.map