"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Code = void 0;
var Token_1 = require("./Token");
var Code = /** @class */ (function () {
    function Code(tokens) {
        this.pointer = 0;
        this.tokens = tokens;
    }
    Object.defineProperty(Code.prototype, "token", {
        get: function () {
            return this.tokenAtOffset(0);
        },
        enumerable: false,
        configurable: true
    });
    Code.prototype.tokenAtOffset = function (offset) {
        var index = this.pointer + offset;
        if (index < 0)
            index = 0;
        if (index >= this.tokens.length)
            index = this.tokens.length - 1;
        return this.tokens[index];
    };
    Code.prototype.step = function () {
        if (this.pointer < this.tokens.length)
            this.pointer++;
    };
    Code.prototype.canStep = function () {
        return this.pointer < this.tokens.length;
    };
    Code.prototype.reset = function () {
        this.pointer = 0;
    };
    Code.prototype.slice = function (start, end) {
        return new Code(this.tokens.slice(start, end));
    };
    Code.prototype.spliceFrom = function (start) {
        var _a;
        var tokens = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            tokens[_i - 1] = arguments[_i];
        }
        if (start >= this.pointer)
            return;
        (_a = this.tokens).splice.apply(_a, __spreadArrays([start, this.pointer - start], tokens));
        this.pointer = start;
    };
    Code.prototype.findNext = function (token) {
        for (var i = this.pointer; i < this.tokens.length; i++)
            if (Token_1.Token.equals(this.tokens[i], token))
                return i;
        return -1;
    };
    Code.prototype.matchGroup = function (start) {
        start !== null && start !== void 0 ? start : (start = this.pointer);
        var nest = 0;
        for (var i = start; i < this.tokens.length; i++) {
            if (this.tokens[i].type === Token_1.TokenType.BeginGroup)
                nest++;
            if (this.tokens[i].type === Token_1.TokenType.EndGroup)
                nest--;
            if (nest === 0)
                break;
        }
        if (nest > 0)
            return;
        return i;
    };
    Code.prototype.readGroup = function () {
        var t = this.tokens[this.pointer];
        if (t.type === Token_1.TokenType.BeginGroup) {
            var end = this.matchGroup();
            if (end === undefined)
                return undefined;
            var code = this.slice(this.pointer + 1, end);
            this.pointer = end + 1;
            return code;
        }
        else {
            this.pointer++;
            return new Code([t]);
        }
    };
    Code.prototype.readSquareBracket = function () {
        var t = this.tokens[this.pointer];
        if (t.type === Token_1.TokenType.Text && t.text === '[') {
            var groupNest = 0, nest = 0;
            for (var i = this.pointer; i < this.tokens.length; i++) {
                t = this.tokens[i];
                if (t.type === Token_1.TokenType.BeginGroup)
                    groupNest++;
                if (t.type === Token_1.TokenType.EndGroup)
                    groupNest--;
                if (groupNest === 0 && t.type === Token_1.TokenType.Text && t.text === '[')
                    nest++;
                if (groupNest === 0 && t.type === Token_1.TokenType.Text && t.text === ']')
                    nest--;
                if (groupNest === 0 && nest === 0)
                    break;
            }
            if (nest > 0 || groupNest > 0)
                return undefined;
            var code = this.slice(this.pointer + 1, i);
            this.pointer = i + 1;
            return code;
        }
        else {
            return undefined;
        }
    };
    // When strict: false, does nothing if matching fails
    Code.prototype.expandMacro = function (command, strict) {
        var _a, _b, _c, _d;
        if (strict === void 0) { strict = true; }
        var start = this.pointer;
        var initiator = this.token;
        var match;
        var argNames = [];
        var args = [];
        for (var _i = 0, _e = command.definitions; _i < _e.length; _i++) {
            var definition = _e[_i];
            this.pointer = start + 1;
            var pattern = definition.pattern;
            pattern.reset();
            argNames = [];
            args = [];
            // every loop matches one argument
            while (pattern.canStep()) {
                if (!this.canStep())
                    break; // match fails
                // skip leading whitespaces unless pattern begins with a newline
                if (!(pattern.token.type === Token_1.TokenType.Whitespace && pattern.token.text === '\n')) {
                    while (this.canStep() && this.token.type === Token_1.TokenType.Whitespace)
                        this.step();
                    while (pattern.canStep() && pattern.token.type === Token_1.TokenType.Whitespace)
                        pattern.step();
                }
                // the parts between arguments need exact matching
                var fails = false;
                while (pattern.canStep() && pattern.token.type !== Token_1.TokenType.Argument) {
                    // allow extra whitespace before '['
                    if (pattern.token.type === Token_1.TokenType.Text && pattern.token.text === '[') {
                        while (this.canStep() && this.token.type === Token_1.TokenType.Whitespace)
                            this.step();
                    }
                    if (!(this.canStep() && Token_1.Token.equals(this.token, pattern.token))) {
                        fails = true;
                        break;
                    }
                    this.step();
                    pattern.step();
                }
                if (fails)
                    break;
                if (!pattern.canStep())
                    break; // match completed
                // Now, the pointer is right at the argument #N.
                // Short arguments match either one group or one token; long arguments can match more.
                // By default only [#N] is long; #+N and #-N specify long and short arguments.
                var p = pattern.pointer;
                var isSquareBracket = ((_a = pattern.tokens[p - 1]) === null || _a === void 0 ? void 0 : _a.type) === Token_1.TokenType.Text &&
                    ((_b = pattern.tokens[p + 1]) === null || _b === void 0 ? void 0 : _b.type) === Token_1.TokenType.Text &&
                    ((_c = pattern.tokens[p - 1]) === null || _c === void 0 ? void 0 : _c.text) === '[' &&
                    ((_d = pattern.tokens[p + 1]) === null || _d === void 0 ? void 0 : _d.text) === ']';
                var longArgument = isSquareBracket;
                if (/^#+\+/.test(pattern.token.text))
                    longArgument = true;
                if (/^#+-/.test(pattern.token.text))
                    longArgument = false;
                if (p === pattern.tokens.length - 1)
                    longArgument = false;
                argNames.push(pattern.token.text.replace(/^(#+)[\+\-]/, '$1'));
                pattern.step();
                // match the argument
                while (this.canStep() && this.token.type === Token_1.TokenType.Whitespace)
                    this.step();
                if (!this.canStep() || this.token.type === Token_1.TokenType.EndGroup)
                    break; // match fails
                if (isSquareBracket && longArgument) {
                    this.pointer--;
                    var result = this.readSquareBracket();
                    if (!result)
                        break;
                    this.pointer--;
                    args.push(result);
                    continue;
                }
                else if (longArgument) {
                    var lookFor = pattern.tokens[p + 1];
                    for (var i = this.pointer; i < this.tokens.length; i++) {
                        var t = this.tokens[i];
                        if (t.type === Token_1.TokenType.BeginGroup) {
                            var m = this.matchGroup(i);
                            if (m === undefined)
                                break;
                            i = m;
                            continue;
                        }
                        if (t.type === Token_1.TokenType.EndGroup)
                            break;
                        if (Token_1.Token.equals(lookFor, t))
                            break;
                    }
                    if (i < this.tokens.length && Token_1.Token.equals(lookFor, this.tokens[i])) {
                        // match succeeds
                        args.push(this.slice(this.pointer, i));
                        this.pointer = i;
                        continue;
                    }
                    else
                        break;
                }
                else {
                    var result = this.readGroup();
                    if (!result)
                        break;
                    args.push(result); // match succeeds
                    continue;
                }
            }
            if (!pattern.canStep()) {
                match = definition.replace;
                break;
            }
        }
        if (!match) {
            if (strict) {
                this.pointer = start + 1;
                this.spliceFrom(start);
            }
            else {
                this.pointer = start;
            }
            return false;
        }
        // replace
        var replace = [];
        for (match.reset(); match.canStep(); match.step()) {
            var t = match.token;
            if (t.type !== Token_1.TokenType.Argument) {
                replace.push(Token_1.Token.cloneAsChildOf(t, initiator));
                continue;
            }
            var index = argNames.indexOf(t.text);
            if (index === -1) {
                var cloned = Token_1.Token.cloneAsChildOf(t, initiator);
                if (cloned.text.startsWith('##'))
                    cloned.text = cloned.text.substring(1);
                replace.push(cloned);
                continue;
            }
            // For #N -> tokens, the source token should not be the initiator!
            replace.push.apply(replace, args[index].tokens.map(function (t) { return Token_1.Token.cloneAsChildOf(t, t); }));
        }
        this.spliceFrom.apply(this, __spreadArrays([start], replace));
        return true;
    };
    return Code;
}());
exports.Code = Code;
//# sourceMappingURL=Code.js.map