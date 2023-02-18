"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var CodeElement = /** @class */ (function () {
    function CodeElement() {
        this.name = 'code';
        this.text = '';
        this.isInline = true;
        this.paragraph = new ParagraphElement_1.ParagraphElement();
    }
    CodeElement.prototype.normalise = function () { };
    CodeElement.prototype.isEmpty = function () {
        return this.text === '';
    };
    CodeElement.prototype.enter = function (context) {
        this.isInline = !context.getBoolean('code-display', false, true);
        this.lang = context.get('code-lang', true);
    };
    CodeElement.prototype.event = function () {
        return false;
    };
    CodeElement.prototype.render = function (options) {
        if (this.isEmpty())
            return [];
        if (this.isInline) {
            this.text = this.text.replace(/\s*(\n\s*)+/g, ' ');
        }
        var element = document.createElement(this.isInline ? 'code' : 'pre');
        if (this.lang)
            element.classList.add('code-' + this.lang);
        var isFirst = true;
        for (var _i = 0, _a = this.text.split('\n'); _i < _a.length; _i++) {
            var line = _a[_i];
            if (isFirst)
                isFirst = false;
            else
                element.append(document.createElement('br'));
            element.append(document.createTextNode(line));
        }
        return [element];
    };
    return CodeElement;
}());
exports.CodeElement = CodeElement;
//# sourceMappingURL=CodeElement.js.map