"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = exports.defaultCompilerOptions = void 0;
var RootElement_1 = require("./elements/RootElement");
var Internal_1 = require("./Internal");
var Token_1 = require("./Token");
exports.defaultCompilerOptions = {
    maxErrors: 100,
    maxMacroExpansions: 50000,
    maxBuffer: 1000000,
    maxNesting: 1000,
    inline: false,
    equationMode: false,
};
var Compiler = /** @class */ (function () {
    function Compiler() {
    }
    Compiler.compile = function (code, context) {
        var result = this.compileGroup(code, context, code.tokens[code.tokens.length - 1], true);
        if (!result) {
            // Clear all output by replacing it with an empty element
            context.root = new RootElement_1.RootElement();
            context.root.normalise();
            return false;
        }
        context.finalise();
        return true;
    };
    // Compiles `code` as a group in the `context`.
    // Returns false if compiling cannot proceed even when trying to ignore errors.
    // The result is stored in `context`, and `code` is turned into a fully expanded form.
    // `nextToken` should be the '}' immediately after the group, used for error reporting.
    Compiler.compileGroup = function (code, context, nextToken, isGlobal) {
        var _a;
        if (isGlobal === void 0) { isGlobal = false; }
        function isMathMode() {
            return context.getBoolean('g.math-mode', false);
        }
        function isTextArg() {
            return context.getBoolean('c-text-arg', false);
        }
        function isInternalLinkArg() {
            return context.getBoolean('c-link-arg', false);
        }
        var parent = context;
        var options = context.options;
        if (!isGlobal)
            context = context.passToSubgroup();
        if (context._nesting > options.maxNesting) {
            context.throw('MAX_NESTING_EXCEEDED', nextToken, options.maxNesting.toString());
            return false;
        }
        code.pointer = 0;
        while (code.pointer < code.tokens.length) {
            if (code.tokens.length > options.maxBuffer) {
                context.throw('MAX_TOKENS_EXCEEDED', nextToken, options.maxBuffer.toString());
                return false;
            }
            var i = code.pointer;
            var t = code.tokens[i];
            var mathMode = isMathMode();
            switch (t.type) {
                case Token_1.TokenType.BeginGroup:
                    var group = code.readGroup();
                    if (group === undefined) {
                        if (context.throw('UNMATCHED_LEFT_BRACKET', t) > options.maxErrors)
                            return false;
                        code.step();
                        break;
                    }
                    // Replace {{...}} by \@@fun{...}
                    var isDoubleBrace = !mathMode &&
                        ((_a = group.tokens[0]) === null || _a === void 0 ? void 0 : _a.type) === Token_1.TokenType.BeginGroup &&
                        group.matchGroup(0) === group.tokens.length - 1;
                    if (isDoubleBrace) {
                        group.tokens.splice(0, 0, Token_1.Token.fromParent('\\@@fun', Token_1.TokenType.Command, t));
                    }
                    var preserveBrackets = !context.noOutput && isMathMode();
                    if (preserveBrackets)
                        context.span.append('{', t);
                    var result = this.compileGroup(group, context, code.tokenAtOffset(-1));
                    if (preserveBrackets)
                        context.span.append('}', code.tokenAtOffset(-1));
                    if (!result)
                        return false;
                    break;
                case Token_1.TokenType.EndGroup:
                    if (context.throw('UNMATCHED_RIGHT_BRACKET', t) > options.maxErrors)
                        return false;
                    code.step();
                    break;
                case Token_1.TokenType.Command:
                case Token_1.TokenType.Special:
                    if (context.recordExpansion() > options.maxMacroExpansions) {
                        context.throw('MAX_EXPANSIONS_EXCEEDED', t, options.maxMacroExpansions.toString());
                        return false;
                    }
                    var name_1 = t.type === Token_1.TokenType.Command ? t.text : t.specialCommand;
                    if (!name_1) {
                        code.step();
                        break;
                    }
                    var internal = Internal_1.Internals[name_1];
                    if (internal) {
                        result = internal.execute(code, context);
                        if (!result)
                            return false;
                        break;
                    }
                    var command = context.findCommand(name_1);
                    if (!command || (mathMode && command.isTextCommand)) {
                        if (mathMode) {
                            context.span.append(name_1, t);
                            if (/[a-zA-Z]$/.test(name_1))
                                context.span.spacyCommand = t;
                        }
                        else {
                            if (context.throw('UNDEFINED_COMMAND', t, name_1) > options.maxErrors)
                                return false;
                            if (!context.noOutput) {
                                context.set('text-class-error', '1');
                                context.flushSpan();
                                context.span.append(name_1, t);
                                context.set('text-class-error', undefined);
                                context.flushSpan();
                            }
                        }
                        code.step();
                        break;
                    }
                    result = code.expandMacro(command);
                    if (!result) {
                        if (context.throw('NO_MATCHING_DEFINITIONS', t, name_1) > options.maxErrors)
                            return false;
                    }
                    break;
                case Token_1.TokenType.Text:
                case Token_1.TokenType.Whitespace:
                    if (!isTextArg() || isInternalLinkArg()) {
                        command = context.findCommand(t.text);
                        if (command && !(isMathMode() && command.isTextCommand) && !t.noExpand) {
                            if (code.expandMacro(command, false))
                                break;
                        }
                    }
                    if (!context.noOutput) {
                        // Whitespaces with TokenType.Text should be preserved
                        if (t.type === Token_1.TokenType.Text && /^\s$/.test(t.text)) {
                            context.flushSpan();
                            context.span.style.preservesSpaces = true;
                            context.span.append(t.text, t);
                            context.flushSpan();
                        }
                        else {
                            var text = t.type === Token_1.TokenType.Whitespace ? ' ' : t.text;
                            context.span.append(text, t);
                        }
                    }
                    code.step();
                    break;
                case Token_1.TokenType.Argument:
                    if (!context.noOutput) {
                        context.span.append(t.text, t);
                    }
                    code.step();
                    break;
                default:
                    code.step();
                    break;
            }
        }
        if (isGlobal) {
            // All compiling has finished
            context.flushSpan();
            return true;
        }
        else {
            return parent.collectFromSubgroup(context, nextToken);
        }
    };
    Compiler.readText = function (code, context, initiator) {
        if (!code.canStep()) {
            context.throw('ARGUMENT_EXPECTED', code.token);
            return;
        }
        var group = code.readGroup();
        if (group === undefined) {
            context.throw('UNMATCHED_LEFT_BRACKET', code.token);
            return;
        }
        var noOutput = context.noOutput;
        context.noOutput = true;
        context.set('c-text-arg', '1');
        this.compileGroup(group, context, code.tokenAtOffset(-1));
        context.set('c-text-arg', '');
        context.noOutput = noOutput;
        var text = '';
        group.pointer = 0;
        while (group.pointer < group.tokens.length) {
            var t = group.token;
            switch (t.type) {
                case Token_1.TokenType.BeginGroup:
                    var result = this.readText(group, context, initiator);
                    if (result === undefined)
                        return;
                    var value = context.get(result);
                    if (value !== undefined)
                        result = value;
                    text += result;
                    break;
                case Token_1.TokenType.Text:
                case Token_1.TokenType.Whitespace:
                case Token_1.TokenType.Argument:
                    text += t.text;
                    group.step();
                    break;
                default:
                    context.throw('PLAIN_TEXT_EXPECTED', initiator);
                    return;
            }
        }
        return text;
    };
    return Compiler;
}());
exports.Compiler = Compiler;
//# sourceMappingURL=Compiler.js.map