"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathElement = void 0;
var katex_1 = __importDefault(require("katex"));
var DiagramElement_1 = require("./DiagramElement");
var ParagraphElement_1 = require("./ParagraphElement");
var SpanElement_1 = require("./SpanElement");
var TikzElement_1 = require("./TikzElement");
var MathElement = /** @class */ (function () {
    function MathElement() {
        this.name = 'math';
        this.mainParagraph = new ParagraphElement_1.ParagraphElement(); // ghost element that will not be rendered
        this.paragraph = this.mainParagraph;
        this.children = this.mainParagraph.children;
        this.isInline = true;
        this.style = {};
    }
    MathElement.prototype.isEmpty = function () {
        return (!this.getText() &&
            this.mainParagraph.children.filter(function (e) { return e instanceof TikzElement_1.TikzElement && !e.noRender; }).length ===
                0);
    };
    MathElement.prototype.normalise = function () {
        var _a, _b, _c, _d;
        (_a = this.tagLeft) === null || _a === void 0 ? void 0 : _a.normalise();
        if ((_b = this.tagLeft) === null || _b === void 0 ? void 0 : _b.isEmpty())
            delete this.tagLeft;
        (_c = this.tagRight) === null || _c === void 0 ? void 0 : _c.normalise();
        if ((_d = this.tagRight) === null || _d === void 0 ? void 0 : _d.isEmpty())
            delete this.tagRight;
    };
    MathElement.prototype.enter = function (context) {
        this.style.colour = context.get('text-colour');
        this.style.fontSize = context.getFloat('text-size', 0) || undefined;
        this.style.bold = context.getBoolean('text-bold', false);
        this.style.classes = '';
        if (context.getBoolean('text-class-header', false))
            this.style.classes += ' item-header';
        this.style.classes = this.style.classes.trim();
        this.isInline = context.container.isInline || !context.getBoolean('math-display', false, true);
        context.set('g.math-mode', '1');
    };
    MathElement.prototype.exit = function (context) {
        context.set('g.math-mode', undefined);
    };
    MathElement.prototype.event = function (name, context, initiator) {
        var _a, _b;
        switch (name) {
            case 'par':
                if (this.tagMode) {
                    context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
                }
                return true;
            case 'leqno':
                if (this.isInline) {
                    context.throw('EQUATION_TAG_INLINE_MODE', initiator);
                }
                this.tagMode = 'left';
                (_a = this.tagLeft) !== null && _a !== void 0 ? _a : (this.tagLeft = new ParagraphElement_1.ParagraphElement());
                this.paragraph = this.tagLeft;
                context.set('g.math-mode', undefined);
                return true;
            case 'reqno':
                if (this.isInline) {
                    context.throw('EQUATION_TAG_INLINE_MODE', initiator);
                }
                this.tagMode = 'right';
                (_b = this.tagRight) !== null && _b !== void 0 ? _b : (this.tagRight = new ParagraphElement_1.ParagraphElement());
                this.paragraph = this.tagRight;
                context.set('g.math-mode', undefined);
                return true;
            case 'xeqno':
                delete this.tagMode;
                this.paragraph = this.mainParagraph;
                context.set('g.math-mode', '1');
                return true;
        }
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    MathElement.prototype.getText = function () {
        return (this.isScriptStyle ? '\\scriptstyle ' : '') + this.mainParagraph.getText().trim();
    };
    MathElement.prototype.render = function (options) {
        var _a;
        var _b, _c;
        var span = document.createElement('span');
        span.classList.add(this.isInline ? 'inline-math' : 'display-math');
        var styles = [];
        if (this.style.colour && SpanElement_1.SpanElement.colourRegex.test(this.style.colour))
            styles.push("color:#" + this.style.colour);
        if (this.style.fontSize && isFinite(this.style.fontSize)) {
            var fontSize = this.style.fontSize;
            if (fontSize < SpanElement_1.SpanElement.minFontSize)
                fontSize = SpanElement_1.SpanElement.minFontSize;
            if (fontSize > SpanElement_1.SpanElement.maxFontSize)
                fontSize = SpanElement_1.SpanElement.maxFontSize;
            styles.push("font-size:" + fontSize + "px");
        }
        if (this.style.classes)
            (_a = span.classList).add.apply(_a, this.style.classes.split(' '));
        if (styles.length > 0)
            span.setAttribute('style', styles.join(';'));
        // Check if is tikz.
        // If there is a tikz element, other elements will be ignored.
        var tikz = undefined;
        for (var _i = 0, _d = this.mainParagraph.children; _i < _d.length; _i++) {
            var child = _d[_i];
            if (child instanceof TikzElement_1.TikzElement && !child.noRender) {
                tikz = child;
                break;
            }
        }
        // Read all diagrams.
        // They will be rendered as \text{id} and replaced with actual html later
        var diagrams = [];
        for (var _e = 0, _f = this.mainParagraph.children; _e < _f.length; _e++) {
            var child = _f[_e];
            if (child instanceof DiagramElement_1.DiagramElement)
                diagrams.push(child);
        }
        // Compile the equation
        if (options === null || options === void 0 ? void 0 : options.noKatex) {
            var code = document.createElement('code');
            code.append(document.createTextNode(this.getText()));
            span.append(code);
        }
        else if (tikz) {
            span.append.apply(span, tikz.render(options));
            span.classList.add('tikz-in-math');
        }
        else {
            var tex = this.getText();
            if (this.isInline && this.style.bold) {
                tex = '\\bm{' + tex + '}';
            }
            katex_1.default.render(tex, span, {
                displayMode: !this.isInline,
                output: 'html',
                strict: false,
                throwOnError: false,
                trust: function (context) { return context.command !== '\\includegraphics'; },
            });
            // Flatten span so that it won't be messed up by MW parser
            span.innerHTML = span.innerHTML.replace(/\n/g, ' ');
        }
        if (!this.isInline && this.tagLeft) {
            var tag = document.createElement('span');
            span.prepend(tag);
            tag.classList.add('equation-tag-left');
            tag.append.apply(tag, this.tagLeft.renderInner(options));
        }
        if (!this.isInline && this.tagRight) {
            var tag = document.createElement('span');
            span.append(tag);
            tag.classList.add('equation-tag-right');
            tag.append.apply(tag, this.tagRight.renderInner(options));
        }
        // Add inverse search data
        if (options === null || options === void 0 ? void 0 : options.inverseSearch) {
            var lines = [];
            if (tikz) {
                var tikzLine = (_c = (_b = tikz.initiator) === null || _b === void 0 ? void 0 : _b.start) === null || _c === void 0 ? void 0 : _c.line;
                if (tikzLine !== undefined)
                    lines.push(tikzLine);
            }
            else {
                for (var _g = 0, _h = this.children; _g < _h.length; _g++) {
                    var child = _h[_g];
                    if (child instanceof SpanElement_1.SpanElement) {
                        for (var _j = 0, _k = child.children; _j < _k.length; _j++) {
                            var text = _k[_j];
                            if (text.position && text.position.file && !lines.includes(text.position.line))
                                lines.push(text.position.line);
                        }
                    }
                }
            }
            lines.sort(function (a, b) { return a - b; });
            if (lines.length > 0)
                span.setAttribute('data-pos', lines.map(function (l) { return (l + 1).toString(); }).join(','));
        }
        // Replace diagrams with actual html
        if (diagrams.length > 0) {
            var html = span.innerHTML;
            for (var _l = 0, diagrams_1 = diagrams; _l < diagrams_1.length; _l++) {
                var diagram = diagrams_1[_l];
                var diagramHTML = diagram.render(options)[0].outerHTML;
                var regex = new RegExp("<span class=\"mord text\"><span class=\"mord\">" + diagram.id + "</span></span>", 'g');
                html = html.replace(regex, diagramHTML);
                regex = new RegExp('([^#"])' + diagram.id, 'g');
                html = html.replace(regex, '$1');
            }
            span.innerHTML = html;
        }
        return [span];
    };
    return MathElement;
}());
exports.MathElement = MathElement;
//# sourceMappingURL=MathElement.js.map