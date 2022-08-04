"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInternal = void 0;
exports.TextInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        if (!code.canStep()) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var group = code.readGroup();
        if (!group) {
            context.throw('UNMATCHED_LEFT_BRACKET', code.token);
            return false;
        }
        if (context.noOutput)
            return true;
        context.flushSpan();
        context.span.style.preservesSpaces = true;
        for (var _i = 0, _a = group.tokens; _i < _a.length; _i++) {
            var token = _a[_i];
            context.span.append(token.text, token);
        }
        context.flushSpan();
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=TextInternal.js.map