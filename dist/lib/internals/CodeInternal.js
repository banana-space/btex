"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeInternal = void 0;
var CodeElement_1 = require("../elements/CodeElement");
exports.CodeInternal = {
    execute: function (code, context) {
        var _a, _b, _c;
        var initiator = code.token;
        code.step();
        var group = code.readGroup();
        var source = context.get('__code__');
        var text = '';
        if (!context.noOutput && source && group && group.tokens.length > 0) {
            var startPosition = group.tokens[0].source.start;
            var endPosition = group.tokens[group.tokens.length - 1].source.end;
            var lines = source.split('\n');
            if (startPosition && endPosition) {
                if (startPosition.line === endPosition.line) {
                    text = (_a = lines[startPosition.line]) === null || _a === void 0 ? void 0 : _a.substring(startPosition.col, endPosition.col);
                }
                else {
                    text = ((_b = lines[startPosition.line]) === null || _b === void 0 ? void 0 : _b.substring(startPosition.col)) + '\n';
                    for (var i = startPosition.line + 1; i < endPosition.line; i++)
                        text += ((_c = lines[i]) !== null && _c !== void 0 ? _c : '') + '\n';
                    text += lines[endPosition.line].substring(0, endPosition.col);
                }
            }
            else {
                text = '??';
            }
            // Remove leading and trailing empty line; remove indentation
            var textLines = text.split('\n');
            if (textLines.length > 1) {
                if (textLines[0].trim() === '')
                    textLines.splice(0, 1);
                if (textLines[textLines.length - 1].trim() === '')
                    textLines.pop();
                if (textLines.length > 0) {
                    var indent = textLines.map(function (line) { var _a, _b; return line.trim() ? (_b = (_a = line.match(/^\s*/)) === null || _a === void 0 ? void 0 : _a[0].length) !== null && _b !== void 0 ? _b : 0 : 1000; });
                    var leastIndent_1 = indent[0];
                    for (var i = 1; i < indent.length; i++)
                        if (indent[i] < leastIndent_1)
                            leastIndent_1 = indent[i];
                    textLines = textLines.map(function (line) { return (line.trim() ? line.substring(leastIndent_1) : ''); });
                }
                text = textLines.join('\n');
            }
            // Escape {, }, \, ~
            text = text.replace(/#([{}\\~ ])/g, '$1');
            // In display mode, do an equivalent of \@par <pre> ... </pre> \@par
            var isDisplay = context.getBoolean('code-display', false);
            var element = new CodeElement_1.CodeElement();
            element.text = text;
            if (isDisplay) {
                context.flushSpan();
                if (!context.container.event('par', context, initiator))
                    return false;
            }
            context.enterContainer(element, initiator);
            context.exitContainer();
            if (isDisplay) {
                if (!context.container.event('par', context, initiator))
                    return false;
            }
        }
        return true;
    },
};
//# sourceMappingURL=CodeInternal.js.map