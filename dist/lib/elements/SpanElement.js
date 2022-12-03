"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpanElement = void 0;
var TextNode_1 = require("./TextNode");
var SpanElement = /** @class */ (function () {
    function SpanElement() {
        this.name = 'span';
        this.children = [];
        this.style = {};
    }
    SpanElement.prototype.isEmpty = function () {
        return this.children.length === 0;
    };
    // Normalisation is done on the paragraph level, since spans can't see the text around it.
    SpanElement.prototype.normalise = function () { };
    SpanElement.prototype.initialise = function (context) {
        this.style.italic = context.getBoolean('text-italic', false) || undefined;
        this.style.bold = context.getBoolean('text-bold', false) || undefined;
        this.style.colour = context.get('text-colour');
        this.style.fontSize = context.getFloat('text-size', 0) || undefined;
        this.style.lang = context.get('text-lang');
        this.style.sup = context.getBoolean('text-sup', false);
        this.style.sub = context.getBoolean('text-sub', false);
        this.style.classes = '';
        if (context.getBoolean('text-class-error', false))
            this.style.classes += ' error';
        if (context.getBoolean('text-class-header', false))
            this.style.classes += ' item-header';
        this.style.classes = this.style.classes.trim();
    };
    SpanElement.prototype.canMergeWith = function (span) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return (((_a = this.style.italic) !== null && _a !== void 0 ? _a : false) === ((_b = span.style.italic) !== null && _b !== void 0 ? _b : false) &&
            ((_c = this.style.bold) !== null && _c !== void 0 ? _c : false) === ((_d = span.style.bold) !== null && _d !== void 0 ? _d : false) &&
            this.style.colour === span.style.colour &&
            this.style.fontSize === span.style.fontSize &&
            ((_e = this.style.preservesSpaces) !== null && _e !== void 0 ? _e : false) === ((_f = span.style.preservesSpaces) !== null && _f !== void 0 ? _f : false) &&
            this.style.lang === span.style.lang &&
            ((_g = this.style.classes) !== null && _g !== void 0 ? _g : '') === ((_h = span.style.classes) !== null && _h !== void 0 ? _h : '') &&
            ((_j = this.style.sup) !== null && _j !== void 0 ? _j : false) === ((_k = span.style.sup) !== null && _k !== void 0 ? _k : false) &&
            ((_l = this.style.sub) !== null && _l !== void 0 ? _l : false) === ((_m = span.style.sub) !== null && _m !== void 0 ? _m : false));
    };
    SpanElement.prototype.append = function (text, source) {
        if (this.spacyCommand) {
            if (/^[a-zA-Z]/.test(text))
                this.children.push(new TextNode_1.TextNode(' ', this.spacyCommand));
            delete this.spacyCommand;
        }
        this.children.push(new TextNode_1.TextNode(text, source));
    };
    SpanElement.prototype.getText = function () {
        if (this.spacyCommand) {
            this.children.push(new TextNode_1.TextNode(' ', this.spacyCommand));
            delete this.spacyCommand;
        }
        var text = '';
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            text += child.text;
        }
        return text;
    };
    SpanElement.prototype.render = function (options) {
        var _a, _b;
        function toHTML(text) {
            var result = [];
            text = text.normalize('NFC');
            var lines = text.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (i > 0)
                    result.push(document.createElement('br'));
                if (lines[i])
                    result.push(document.createTextNode(lines[i]));
            }
            return result;
        }
        var styles = [];
        var fullText = this.getText();
        if (this.style.italic)
            styles.push('font-style:italic');
        if (this.style.bold)
            styles.push('font-weight:bold');
        if (this.style.colour && SpanElement.colourRegex.test(this.style.colour))
            styles.push("color:#".concat(this.style.colour));
        if (this.style.fontSize && isFinite(this.style.fontSize)) {
            var fontSize = this.style.fontSize;
            if (fontSize < SpanElement.minFontSize)
                fontSize = SpanElement.minFontSize;
            if (fontSize > SpanElement.maxFontSize)
                fontSize = SpanElement.maxFontSize;
            styles.push("font-size:".concat(fontSize, "px"));
        }
        if (this.style.preservesSpaces && /\s/.test(fullText) && fullText !== '\n') {
            styles.push('white-space:pre-wrap');
        }
        if (this.style.lang && !SpanElement.langRegex.test(this.style.lang))
            delete this.style.lang;
        var tagName = 'span';
        if (this.style.sub && !this.style.sup)
            tagName = 'sub';
        if (this.style.sup && !this.style.sub)
            tagName = 'sup';
        if (options === null || options === void 0 ? void 0 : options.inverseSearch) {
            // Create <span> tags
            var spans = [];
            var text = [''];
            var lines = [undefined];
            for (var _i = 0, _c = this.children; _i < _c.length; _i++) {
                var child = _c[_i];
                var line = ((_a = child.position) === null || _a === void 0 ? void 0 : _a.file) ? (_b = child.position) === null || _b === void 0 ? void 0 : _b.line : undefined;
                if (line === lines[lines.length - 1])
                    text[text.length - 1] += child.text;
                else {
                    text.push(child.text);
                    lines.push(line);
                }
            }
            for (var i = 0; i < text.length; i++) {
                if (text[i]) {
                    var span_1 = document.createElement(tagName);
                    if (this.style.classes)
                        span_1.setAttribute('class', this.style.classes);
                    if (styles.length > 0)
                        span_1.setAttribute('style', styles.join(';'));
                    if (this.style.lang)
                        span_1.setAttribute('lang', this.style.lang);
                    var line = lines[i];
                    if (line !== undefined)
                        span_1.setAttribute('data-pos', (line + 1).toString());
                    span_1.append.apply(span_1, toHTML(text[i]));
                    spans.push(span_1);
                }
            }
            return spans;
        }
        if (!this.style.lang && !this.style.classes && tagName === 'span') {
            if (styles.length === 0) {
                // Create text nodes directly
                return toHTML(fullText);
            }
            else if (styles.length === 1) {
                // Create a <b> or <i> tag
                var name_1 = this.style.bold ? 'b' : this.style.italic ? 'i' : '';
                if (name_1) {
                    var element = document.createElement(name_1);
                    element.append.apply(element, toHTML(fullText));
                    return [element];
                }
            }
        }
        // Create a <span> tag
        var span = document.createElement(tagName);
        if (this.style.lang)
            span.setAttribute('lang', this.style.lang);
        if (styles.length > 0)
            span.setAttribute('style', styles.join(';'));
        if (this.style.classes)
            span.setAttribute('class', this.style.classes);
        span.append.apply(span, toHTML(fullText));
        return [span];
    };
    SpanElement.colourRegex = /^([0-9a-f]{3}){1,2}$/i;
    SpanElement.langRegex = /^[a-zA-Z\-]+$/i;
    SpanElement.minFontSize = 6;
    SpanElement.maxFontSize = 48;
    return SpanElement;
}());
exports.SpanElement = SpanElement;
//# sourceMappingURL=SpanElement.js.map