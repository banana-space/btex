"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInternal = void 0;
var Compiler_1 = require("../Compiler");
exports.EventInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        var arg = Compiler_1.Compiler.readText(code, context, initiator);
        if (arg === undefined)
            return false;
        if (context.container.isInline && arg === 'par') {
            context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
            return false;
        }
        if (context.noOutput)
            return true;
        if (!context.container.event) {
            // TODO: warning
            return true;
        }
        context.flushSpan();
        if (!context.container.event(arg, context, initiator))
            return false;
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=EventInternal.js.map