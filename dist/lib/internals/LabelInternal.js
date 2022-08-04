"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelInternal = void 0;
var Code_1 = require("../Code");
var Compiler_1 = require("../Compiler");
var LabelElement_1 = require("../elements/LabelElement");
var Token_1 = require("../Token");
exports.LabelInternal = {
    execute: function (code, context) {
        var _a;
        var initiator = code.token;
        code.step();
        if (!code.canStep()) {
            context.throw('ARGUMENT_EXPECTED', initiator);
            return false;
        }
        var text = Compiler_1.Compiler.readText(code, context, initiator);
        if (text === undefined)
            return false;
        if (context.noOutput || context.container.isInline)
            return true;
        var isDuplicate = false;
        for (var _i = 0, _b = context.labels; _i < _b.length; _i++) {
            var label = _b[_i];
            if (label.key === text) {
                isDuplicate = true;
                break;
            }
        }
        if (isDuplicate) {
            context.warn('DUPLICATE_LABEL', initiator, text);
        }
        var currentLabel = new Code_1.Code([
            Token_1.Token.fromParent('\\@currentlabel', Token_1.TokenType.Command, initiator),
        ]);
        var element = new LabelElement_1.LabelElement(text, (_a = context.get('ref-id')) !== null && _a !== void 0 ? _a : '');
        context.labels.push(element);
        context.enterContainer(element, initiator);
        if (!Compiler_1.Compiler.compileGroup(currentLabel, context, initiator))
            return false;
        context.exitContainer();
        return true;
    },
};
//# sourceMappingURL=LabelInternal.js.map