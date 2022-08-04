"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionInternal = void 0;
var Compiler_1 = require("../Compiler");
var FunctionElement_1 = require("../elements/FunctionElement");
var Token_1 = require("../Token");
exports.FunctionInternal = {
    execute: function (code, context) {
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        var arg = code.readGroup();
        if (!arg) {
            context.throw('UNMATCHED_LEFT_BRACKET', initiator);
            return false;
        }
        var pipePositions = [-1];
        var nest = 0;
        for (var j = 0; j < arg.tokens.length; j++) {
            if (arg.tokens[j].type === Token_1.TokenType.BeginGroup)
                nest++;
            if (arg.tokens[j].type === Token_1.TokenType.EndGroup)
                nest--;
            if (nest === 0 && arg.tokens[j].type === Token_1.TokenType.Text && arg.tokens[j].text === '|')
                pipePositions.push(j);
        }
        pipePositions.push(arg.tokens.length);
        var container = new FunctionElement_1.FunctionElement();
        for (var i = 1; i < pipePositions.length; i++) {
            var fragment = arg.slice(pipePositions[i - 1] + 1, pipePositions[i]);
            if (i === 1) {
                fragment.tokens.splice(0, 0, Token_1.Token.fromParent('{', Token_1.TokenType.BeginGroup, initiator));
                fragment.tokens.splice(fragment.tokens.length, 0, Token_1.Token.fromParent('}', Token_1.TokenType.EndGroup, initiator));
                var name_1 = Compiler_1.Compiler.readText(fragment, context, initiator);
                if (name_1 === undefined)
                    return false;
                context.set('fun-name', name_1);
                context.enterContainer(container, initiator);
                // use ',' as separator for biblatex entries; recalculate pipe positions
                if (/^@\w+/.test(name_1)) {
                    pipePositions = [-1, pipePositions[1]];
                    for (var j = pipePositions[1] + 1; j < arg.tokens.length; j++) {
                        if (arg.tokens[j].type === Token_1.TokenType.BeginGroup)
                            nest++;
                        if (arg.tokens[j].type === Token_1.TokenType.EndGroup)
                            nest--;
                        if (nest === 0 &&
                            arg.tokens[j].type === Token_1.TokenType.Text &&
                            (arg.tokens[j].text === ',' || arg.tokens[j].text === '|'))
                            pipePositions.push(j);
                    }
                    pipePositions.push(arg.tokens.length);
                }
            }
            else {
                context.container.event('fun-arg', context, arg.tokens[pipePositions[i - 1]]);
                Compiler_1.Compiler.compileGroup(fragment, context, i === pipePositions.length - 1 ? code.tokenAtOffset(-1) : arg.tokens[pipePositions[i]]);
            }
        }
        if (context.container === container)
            context.exitContainer();
        else {
            context.throw('UNCLOSED_CONTAINER', initiator);
            return false;
        }
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=FunctionInternal.js.map