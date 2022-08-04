"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var Code_1 = require("./Code");
var Token_1 = require("./Token");
var Parser = /** @class */ (function () {
    function Parser() {
    }
    /**
     * Converts `text` to a list of tokens.
     */
    Parser.parse = function (text, file) {
        var _a;
        text =
            text
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/\n\s*?(?=\n)/g, '\n')
                .replace(/\t/g, '    ') + ' ';
        var tokens = [];
        var line = 0;
        var lineStart = 0;
        var ignoreSpace = false;
        // For '*' lists
        var currentIndent = -1;
        var lastLineWasEmpty = true;
        var currentLineHasBullet = false;
        var listIndentStack = [-1];
        function pos(i) {
            return { line: line, col: i - lineStart, file: file };
        }
        function charAt(i) {
            var _a;
            var codePoint = (_a = text.codePointAt(i)) !== null && _a !== void 0 ? _a : 0;
            return text.substr(i, codePoint > 0xffff ? 2 : 1);
        }
        for (var i = 0; i < text.length - 1; i++) {
            var ch = charAt(i);
            // whitespaces
            if (/^\s$/.test(ch)) {
                if (ch === '\n') {
                    tokens.push(Token_1.Token.fromCode('\n', Token_1.TokenType.Whitespace, pos(i), pos(i + 1)));
                    line++;
                    lineStart = i + 1;
                    lastLineWasEmpty = currentIndent === -1;
                    currentIndent = -1;
                    currentLineHasBullet = false;
                }
                else if (!ignoreSpace) {
                    tokens.push(Token_1.Token.fromCode(ch, Token_1.TokenType.Whitespace, pos(i), pos(i + 1)));
                }
                continue;
            }
            // Handle indentation change
            if (currentIndent === -1) {
                currentIndent = i - lineStart;
                if (!currentLineHasBullet) {
                    // Insert end-list tokens before any newlines, because some commands search for '\n\n==' etc.
                    var insertPosition = tokens.length;
                    while (((_a = tokens[insertPosition - 1]) === null || _a === void 0 ? void 0 : _a.type) === Token_1.TokenType.Whitespace)
                        insertPosition--;
                    while (listIndentStack[listIndentStack.length - 1] >=
                        currentIndent + (lastLineWasEmpty ? 0 : 1)) {
                        listIndentStack.pop();
                        var listEndToken = Token_1.Token.fromCode('', Token_1.TokenType.Special, pos(i), pos(i));
                        listEndToken.specialCommand = '\\@bulletendlist';
                        tokens.splice(insertPosition, 0, listEndToken);
                    }
                }
            }
            ignoreSpace = false;
            switch (ch) {
                // specials
                case '{':
                    tokens.push(Token_1.Token.fromCode('{', Token_1.TokenType.BeginGroup, pos(i), pos(i + 1)));
                    break;
                case '}':
                    tokens.push(Token_1.Token.fromCode('}', Token_1.TokenType.EndGroup, pos(i), pos(i + 1)));
                    break;
                // comments
                case '%':
                    while (i < text.length - 1 && charAt(i) !== '\n')
                        i++;
                    ignoreSpace = true;
                    line++;
                    lineStart = i + 1;
                    break;
                // commands
                case '\\':
                    var first = charAt(i + 1);
                    if (/^[a-zA-Z@]/.test(first)) {
                        var j = i + 1;
                        while (text[j] === '@')
                            j++;
                        while (/^[a-zA-Z]/.test(text[j]))
                            j++;
                    }
                    else {
                        var j = i + 1 + first.length;
                        if (first === '\n')
                            j--;
                    }
                    var commandName = text.substring(i, j);
                    tokens.push(Token_1.Token.fromCode(commandName, Token_1.TokenType.Command, pos(i), pos(j)));
                    i = j - 1;
                    ignoreSpace = !/^\\[^a-zA-Z]$/.test(commandName);
                    if (first === '\n') {
                        line++, i++;
                        lineStart = i + 1;
                    }
                    break;
                // arguments
                case '#':
                    var j = i + 1;
                    while (text[j] === '#')
                        j++;
                    if (text[j] === '+' || text[j] === '-')
                        j++;
                    var first = charAt(j);
                    if (/^[a-zA-Z]/.test(first)) {
                        while (/^[a-zA-Z]/.test(text[j]))
                            j++;
                        ignoreSpace = true;
                    }
                    else {
                        j += first.length;
                        if (first === '\n')
                            j--;
                    }
                    tokens.push(Token_1.Token.fromCode(text.substring(i, j), Token_1.TokenType.Argument, pos(i), pos(j)));
                    i = j - 1;
                    if (first === '\n') {
                        line++, i++;
                        lineStart = i + 1;
                    }
                    break;
                // text
                default:
                    // TODO: remove invalid characters
                    var token = Token_1.Token.fromCode(ch, Token_1.TokenType.Text, pos(i), pos(i + ch.length));
                    // line started by '* '
                    if (currentIndent === i - lineStart) {
                        if (ch === '*' && (text[i + 1] === ' ' || text[i + 1] === '\n')) {
                            token.type = Token_1.TokenType.Special;
                            token.specialCommand = lastLineWasEmpty ? '\\@bulletitem' : '\\@bulletitemnosep';
                            currentLineHasBullet = true;
                            while (listIndentStack[listIndentStack.length - 1] > i - lineStart) {
                                listIndentStack.pop();
                                var listEndToken = Token_1.Token.fromParent('', Token_1.TokenType.Special, token);
                                listEndToken.specialCommand = '\\@bulletendlist';
                                tokens.push(listEndToken);
                            }
                            if (listIndentStack[listIndentStack.length - 1] < i - lineStart) {
                                listIndentStack.push(i - lineStart);
                                var listStartToken = Token_1.Token.fromParent('', Token_1.TokenType.Special, token);
                                listStartToken.specialCommand = '\\@bulletbeginlist';
                                tokens.push(listStartToken);
                            }
                        }
                    }
                    tokens.push(token);
                    i += ch.length - 1;
                    break;
            }
        }
        // End unended lists
        while (listIndentStack.length > 1) {
            listIndentStack.pop();
            var listEndToken = Token_1.Token.fromCode('', Token_1.TokenType.Special, pos(text.length - 1), pos(text.length - 1));
            listEndToken.specialCommand = '\\@bulletendlist';
            tokens.push(listEndToken);
        }
        return new Code_1.Code(tokens);
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map