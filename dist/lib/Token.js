"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Whitespace"] = 0] = "Whitespace";
    TokenType[TokenType["Text"] = 1] = "Text";
    TokenType[TokenType["BeginGroup"] = 2] = "BeginGroup";
    TokenType[TokenType["EndGroup"] = 3] = "EndGroup";
    TokenType[TokenType["Special"] = 4] = "Special";
    TokenType[TokenType["Command"] = 5] = "Command";
    TokenType[TokenType["Argument"] = 6] = "Argument";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var Token = /** @class */ (function () {
    function Token(text, type, start, end) {
        this.text = text;
        this.type = type;
        this.start = start;
        this.end = end;
        this.source = this;
    }
    Token.fromCode = function (text, type, start, end) {
        return new Token(text, type, start, end);
    };
    Token.fromParent = function (text, type, parent) {
        var token = new Token(text, type);
        token.source = parent.source;
        return token;
    };
    Token.cloneAsChildOf = function (token, parent) {
        return Token.fromParent(token.text, token.type, parent);
    };
    Token.equals = function (left, right) {
        return left.type === right.type && left.text === right.text;
    };
    return Token;
}());
exports.Token = Token;
//# sourceMappingURL=Token.js.map