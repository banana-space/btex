"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefineInternal = void 0;
var Command_1 = require("../Command");
var Compiler_1 = require("../Compiler");
var Internal_1 = require("../Internal");
var Token_1 = require("../Token");
exports.DefineInternal = {
    execute: function (code, context) {
        var _a;
        var _b, _c, _d;
        var start = code.pointer;
        var initiator = code.token;
        code.step();
        if (!code.canStep()) {
            context.throw('COMMAND_EXPECTED', initiator);
            return false;
        }
        var t = code.token;
        var name = t.text;
        if (name === '@') {
            var defName = context.get('def-name', true);
            if (defName === undefined) {
                context.throw('INVALID_COMMAND_NAME', t, '\\');
                return false;
            }
            name = '\\' + defName;
        }
        else {
            if ((t.type !== Token_1.TokenType.Command &&
                t.type !== Token_1.TokenType.Text &&
                t.type !== Token_1.TokenType.Whitespace) ||
                Internal_1.Internals[name]) {
                context.throw('INVALID_COMMAND_NAME', t, t.text);
                return false;
            }
        }
        // LaTeX style \newcommand{command}[numArgs][defaultValues]{definition}.
        // Could be implemented using btex only, but it would be ugly.
        var latexStyle = context.getBoolean('def-latex-style', false, true);
        if (latexStyle) {
            code.step();
            var isSquareBracket = code.token.type === Token_1.TokenType.Text && code.token.text === '[';
            var totalArgs = 0;
            if (isSquareBracket) {
                var first = code.readSquareBracket();
                if (first && first.tokens.length === 1 && first.token.type === Token_1.TokenType.Text) {
                    var int = (_b = parseInt(first.token.text)) !== null && _b !== void 0 ? _b : 0;
                    if (int >= 0 && int <= 9)
                        totalArgs = int;
                }
                else {
                    context.throw('NO_MATCHING_DEFINITIONS', initiator);
                    return false;
                }
            }
            var defaultValues = [];
            for (var i = 0; i < totalArgs; i++) {
                while (code.canStep() && code.token.type === Token_1.TokenType.Whitespace)
                    code.step();
                isSquareBracket = code.token.type === Token_1.TokenType.Text && code.token.text === '[';
                if (!isSquareBracket)
                    break;
                var value = code.readSquareBracket();
                if (!value) {
                    context.throw('NO_MATCHING_DEFINITIONS', initiator);
                    return false;
                }
                defaultValues.push(value);
            }
            if (code.token.type === Token_1.TokenType.Text && code.token.text === '[') {
                context.throw('NO_MATCHING_DEFINITIONS', initiator);
                return false;
            }
            // Now the pointer should be at the '{' opening the definition.
            // We do not touch the actual definition part after it; we replace the part before it.
            // This process requires \@pdef to be defined.
            context.set('def-prepend', undefined);
            context.set('def-append', undefined);
            context.set('def-expand', undefined);
            var tokens = [];
            var optionalArgs = defaultValues.length;
            for (var i = 0; i <= optionalArgs; i++) {
                // \pdef <cmd> [#(o - i + 1)] ... [#o] #(o + 1) ... #n {<cmd> [#1] ... [#o] {#(o + 1)} ... {#n}}
                tokens.push(Token_1.Token.fromParent(i ? '\\@pdef' : '\\@@def', Token_1.TokenType.Command, initiator));
                tokens.push(Token_1.Token.fromParent(name, Token_1.TokenType.Command, initiator));
                for (var j = optionalArgs - i + 1; j <= optionalArgs; j++) {
                    tokens.push(Token_1.Token.fromParent('[', Token_1.TokenType.Text, initiator));
                    tokens.push(Token_1.Token.fromParent('#' + j, Token_1.TokenType.Argument, initiator));
                    tokens.push(Token_1.Token.fromParent(']', Token_1.TokenType.Text, initiator));
                }
                for (var j = optionalArgs + 1; j <= totalArgs; j++) {
                    tokens.push(Token_1.Token.fromParent('#' + j, Token_1.TokenType.Argument, initiator));
                }
                if (i === optionalArgs)
                    break;
                tokens.push(Token_1.Token.fromParent('{', Token_1.TokenType.BeginGroup, initiator));
                tokens.push(Token_1.Token.fromParent(name, Token_1.TokenType.Command, initiator));
                for (var j = 1; j <= optionalArgs - i; j++) {
                    tokens.push(Token_1.Token.fromParent('[', Token_1.TokenType.Text, initiator));
                    tokens.push.apply(tokens, defaultValues[j - 1].tokens);
                    tokens.push(Token_1.Token.fromParent(']', Token_1.TokenType.Text, initiator));
                }
                for (var j = optionalArgs - i + 1; j <= optionalArgs; j++) {
                    tokens.push(Token_1.Token.fromParent('[', Token_1.TokenType.Text, initiator));
                    tokens.push(Token_1.Token.fromParent('#' + j, Token_1.TokenType.Argument, initiator));
                    tokens.push(Token_1.Token.fromParent(']', Token_1.TokenType.Text, initiator));
                }
                for (var j = optionalArgs + 1; j <= totalArgs; j++) {
                    tokens.push(Token_1.Token.fromParent('{', Token_1.TokenType.BeginGroup, initiator));
                    tokens.push(Token_1.Token.fromParent('#' + j, Token_1.TokenType.Argument, initiator));
                    tokens.push(Token_1.Token.fromParent('}', Token_1.TokenType.EndGroup, initiator));
                }
                tokens.push(Token_1.Token.fromParent('}', Token_1.TokenType.EndGroup, initiator));
            }
            code.spliceFrom.apply(code, __spreadArrays([start], tokens));
            return true;
        }
        var bracketStart = code.findNext({ type: Token_1.TokenType.BeginGroup, text: '{' });
        if (bracketStart === -1) {
            context.throw('TOKEN_EXPECTED', initiator, '{');
            return false;
        }
        code.pointer = bracketStart;
        var pattern = code.slice(start + 2, bracketStart);
        var replace = code.readGroup();
        if (!replace)
            return false;
        // TODO: check for repeated arg names in pattern
        // TODO: nested args must be escaped as ##N in replace; args must not be escaped in pattern
        var command = context.newCommands[name];
        if (!command) {
            command = (_d = (_c = context.findCommand(name)) === null || _c === void 0 ? void 0 : _c.clone()) !== null && _d !== void 0 ? _d : new Command_1.Command(name);
        }
        var overwrite = true;
        if (context.getBoolean('def-expand', false, true)) {
            var noOutput = context.noOutput;
            context.noOutput = true;
            Compiler_1.Compiler.compileGroup(replace, context, code.tokenAtOffset(-1));
            context.noOutput = noOutput;
        }
        if (context.getBoolean('def-patch', false, true)) {
            for (var _i = 0, _e = command.definitions; _i < _e.length; _i++) {
                var def = _e[_i];
                (_a = def.replace.tokens).push.apply(_a, replace.tokens);
            }
            overwrite = false;
        }
        if (context.getBoolean('def-prepend', false, true)) {
            command.definitions.splice(0, 0, { pattern: pattern, replace: replace });
            overwrite = false;
        }
        if (context.getBoolean('def-append', false, true)) {
            command.definitions.push({ pattern: pattern, replace: replace });
            overwrite = false;
        }
        if (overwrite) {
            command.definitions = [{ pattern: pattern, replace: replace }];
        }
        if (context.get('def-global') !== undefined)
            command.isGlobal = context.getBoolean('def-global', false, true);
        if (overwrite || context.get('def-text') !== undefined)
            command.isTextCommand = context.getBoolean('def-text', false, true);
        context.defineCommand(command);
        code.spliceFrom(start);
        return true;
    },
};
//# sourceMappingURL=DefineInternal.js.map