"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParagraphElement = void 0;
var Token_1 = require("../Token");
var DiagramElement_1 = require("./DiagramElement");
var SpanElement_1 = require("./SpanElement");
var TikzElement_1 = require("./TikzElement");
var ParagraphElement = /** @class */ (function () {
    // Provide the argument `context` only if paragraph styles (text align etc.) are desired.
    function ParagraphElement(context) {
        this.name = 'paragraph';
        this.children = [];
        this.style = {};
        if (context) {
            var textAlign = context.get('par-align');
            if (textAlign && /^(left|center|centre|right|justify)$/.test(textAlign)) {
                this.style.textAlign = textAlign.replace('centre', 'center');
            }
        }
    }
    // Incomplete clone - children are not cloned.
    ParagraphElement.prototype.clone = function () {
        var paragraph = new ParagraphElement();
        paragraph.children = __spreadArray([], this.children, true);
        paragraph.style = this.style;
        return paragraph;
    };
    ParagraphElement.prototype.normalise = function () {
        var _a;
        // Insert auxiliary span between non-span elements
        for (var i = 0; i < this.children.length - 1; i++) {
            if (this.children[i] instanceof SpanElement_1.SpanElement || this.children[i + 1] instanceof SpanElement_1.SpanElement)
                continue;
            var span = new SpanElement_1.SpanElement();
            span.append('', Token_1.Token.fromCode('', Token_1.TokenType.Whitespace, { line: 0, col: 0 }, { line: 0, col: 0 }));
            this.children.splice(i + 1, 0, span);
            i++;
        }
        // Insert spaces between CJK and letters, etc.
        var prevType = 'space';
        var prevText = undefined;
        var first = '', last = '';
        var spaceBeforeCjk = false, spaceAfterCjk = false;
        for (var _i = 0, _b = this.children; _i < _b.length; _i++) {
            var child = _b[_i];
            if (child instanceof SpanElement_1.SpanElement && !child.style.preservesSpaces) {
                for (var index = 0; index < child.children.length; index++) {
                    var text = child.children[index];
                    var newText = text.text;
                    var nextText = child.children[index + 1];
                    // Adjacent spaces are merged into one
                    if (prevType === 'space' || prevType === 'cjk-punct')
                        newText = newText.trimStart();
                    // Disallow spacing between cjk characters
                    // But preserve spaces at end as refs may follow
                    if (prevType === 'cjk') {
                        if (nextText && /^\s+/.test(newText)) {
                            newText = newText.trimStart();
                            spaceAfterCjk = true;
                        }
                    }
                    else {
                        spaceAfterCjk = false;
                    }
                    if ((prevText === null || prevText === void 0 ? void 0 : prevText.text) && /[\(\[\{‘“]$/u.test(prevText.text)) {
                        if (nextText && /^\s+/.test(newText)) {
                            newText = newText.trimStart();
                            spaceBeforeCjk = true;
                        }
                    }
                    else {
                        spaceBeforeCjk = false;
                    }
                    // Spacing between letters and CJK characters
                    if ((prevType === 'letter' || prevType === 'punct') &&
                        /^[\p{sc=Hang}\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]/u.test(newText))
                        newText = ' ' + newText;
                    if (prevType === 'cjk' &&
                        /^[\p{Ll}\p{Lu}\p{Nd}\p{Mn}\(\[\{#%&*§¶'"‘“\uedae\uedaf]/u.test(newText)) {
                        if (prevText)
                            prevText.text += ' ';
                        else
                            newText = ' ' + newText;
                    }
                    prevText = text;
                    if (newText) {
                        if (/\s+$/.test(newText)) {
                            newText = newText.trimEnd() + ' ';
                            prevType = 'space';
                        }
                        else if (/[\p{Ll}\p{Lu}\p{Nd}\p{Mn}\uedae\uedaf]$/u.test(newText)) {
                            prevType = 'letter';
                        }
                        else if (/[\p{sc=Hang}\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]$/u.test(newText)) {
                            prevType = 'cjk';
                            spaceAfterCjk = false;
                        }
                        else if (/[\)\]\},.!#%&*§¶;:?'"’”\u2026]$/.test(newText)) {
                            prevType = 'punct';
                        }
                        else if (/[\u3000-\u301f\uff00-\uff60\uff64]$/.test(newText)) {
                            prevType = 'cjk-punct';
                        }
                        else {
                            prevType = 'other';
                        }
                        if ((spaceAfterCjk &&
                            !/^[\)\]\},.!;:?’”\u2026\p{sc=Hang}\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}\u3000-\u301f\uff00-\uff60\uff64]/u.test(newText)) ||
                            (spaceBeforeCjk && prevType === 'cjk')) {
                            newText = ' ' + newText;
                            spaceBeforeCjk = spaceAfterCjk = false;
                        }
                        if (prevType !== 'space') {
                            if (!first)
                                first = prevType;
                            last = prevType;
                        }
                    }
                    text.text = newText;
                }
            }
            else {
                child.normalise();
                if (!child.isEmpty()) {
                    if (child instanceof SpanElement_1.SpanElement) {
                        prevType = 'other';
                    }
                    else if (child.isInline) {
                        var childType = child.spacingType;
                        if (childType) {
                            if (prevText &&
                                ((prevType === 'letter' && childType.first === 'cjk') ||
                                    (prevType === 'cjk' && childType.first === 'letter')))
                                prevText.text += ' ';
                            prevType = childType.last;
                        }
                        else {
                            if (prevType === 'cjk' && prevText)
                                prevText.text += ' ';
                            prevType = 'letter';
                        }
                    }
                    else {
                        if (prevText && prevType === 'space')
                            prevText.text = prevText.text.trimRight();
                        prevType = 'space';
                    }
                    prevText = undefined;
                }
            }
        }
        // Remove trailing spaces of the paragraph
        if (prevText && prevType === 'space') {
            prevText.text = prevText.text.trimRight();
        }
        // Merge adjacent spans whenever possible
        var mergeWith = undefined;
        for (var _c = 0, _d = this.children; _c < _d.length; _c++) {
            var span = _d[_c];
            if (!(span instanceof SpanElement_1.SpanElement)) {
                mergeWith = undefined;
                continue;
            }
            if (mergeWith && mergeWith.canMergeWith(span)) {
                (_a = mergeWith.children).push.apply(_a, span.children);
                span.children = [];
            }
            else {
                mergeWith = span;
            }
        }
        // Remove empty spans
        this.children = this.children.filter(function (child) {
            if (child instanceof SpanElement_1.SpanElement) {
                child.children = child.children.filter(function (text) {
                    return text.text !== '';
                });
                return !child.isEmpty();
            }
            return true;
        });
        return { first: first || 'other', last: last || 'other' };
    };
    ParagraphElement.prototype.isEmpty = function () {
        return this.children.length === 0;
    };
    ParagraphElement.prototype.append = function (element) {
        this.children.push(element);
    };
    ParagraphElement.prototype.render = function (options) {
        if (this.isEmpty())
            return [];
        // In some cases the <p> or <div> tag is unnecessary
        if (this.children.length === 1) {
            switch (this.children[0].name) {
                case 'div':
                case 'list':
                case 'header':
                    return this.renderInner(options);
            }
        }
        // Create a <p> element only if it does not contain non-math containers,
        // because <p> elements cannot be nested
        var name = 'p';
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            if (child.name !== 'span' &&
                child.name !== 'math' &&
                child.name !== 'bookmark' &&
                child.name !== 'ref' &&
                !(child === null || child === void 0 ? void 0 : child.isInline)) {
                name = 'div';
                break;
            }
        }
        var element = document.createElement(name);
        if (name !== 'p')
            element.classList.add('p');
        if (this.style.textAlign)
            element.style.textAlign = this.style.textAlign;
        element.append.apply(element, this.renderInner(options));
        return [element];
    };
    ParagraphElement.prototype.renderInner = function (options) {
        var result = [];
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            // Skip tikz elements
            if (child instanceof TikzElement_1.TikzElement)
                continue;
            // Turn diagrams into \text{...}
            if (child instanceof DiagramElement_1.DiagramElement) {
                child.render(options);
                var node = document.createTextNode("\\rule{0em}{".concat(child.renderedHeight / 2, "em}\\text{").concat(child.id, "}"));
                result.push(node);
                continue;
            }
            result.push.apply(result, child.render(options));
        }
        return result;
    };
    ParagraphElement.prototype.getText = function () {
        var _a;
        var div = document.createElement('div');
        div.append.apply(div, this.renderInner());
        return (_a = div.textContent) !== null && _a !== void 0 ? _a : '';
    };
    return ParagraphElement;
}());
exports.ParagraphElement = ParagraphElement;
//# sourceMappingURL=ParagraphElement.js.map