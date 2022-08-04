"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExitInternal = void 0;
var Compiler_1 = require("../Compiler");
exports.ExitInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        var name = Compiler_1.Compiler.readText(code, context, initiator);
        if (name === undefined)
            return false;
        if (context.noOutput)
            return true;
        if (name === 'group') {
            if (context.semisimple.length === 0) {
                context.throw('UNMATCHED_SEMISIMPLE', initiator, name);
                return false;
            }
            context.exitSemisimple();
        }
        else {
            if (context.stack.length <= 1 || name !== context.container.name) {
                context.throw('UNMATCHED_EXIT_CONTAINER', initiator, name);
                return false;
            }
            context.exitContainer();
        }
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=ExitInternal.js.map