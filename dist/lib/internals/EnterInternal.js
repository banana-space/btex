"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterInternal = void 0;
var Compiler_1 = require("../Compiler");
var Element_1 = require("../Element");
exports.EnterInternal = {
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
            context.enterSemisimple();
        }
        else {
            var SomeElement = Element_1.Containers[name];
            if (!SomeElement) {
                context.throw('INVALID_CONTAINER_NAME', initiator, name);
                return false;
            }
            if (!context.enterContainer(new SomeElement(), initiator))
                return false;
        }
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=EnterInternal.js.map