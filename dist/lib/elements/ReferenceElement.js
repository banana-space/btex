"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var SpanElement_1 = require("./SpanElement");
var ReferenceElement = /** @class */ (function () {
    function ReferenceElement() {
        this.name = 'ref';
        this.noLink = false;
        this.isInline = true;
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.style = {};
    }
    ReferenceElement.prototype.isEmpty = function () {
        return false;
    };
    ReferenceElement.prototype.normalise = function () {
        if (this.paragraph.isEmpty())
            this.spacingType = { first: 'letter', last: 'letter' };
        else
            this.spacingType = this.paragraph.normalise();
        if (this.page) {
            this.page = this.page.normalize('NFC');
        }
    };
    ReferenceElement.prototype.enter = function (context) {
        this.style.italic = context.getBoolean('text-italic', false) || undefined;
        this.style.bold = context.getBoolean('text-bold', false) || undefined;
        this.style.fontSize = context.getFloat('text-size', 0) || undefined;
        this.style.classes = '';
        if (context.getBoolean('text-class-header', false))
            this.style.classes += ' item-header';
        this.style.classes = this.style.classes.trim();
        this.page = context.get('ref-page', true);
        this.key = context.get('ref-key', true);
        this.url = context.get('ref-url', true);
        this.pageSuffix = context.get('ref-page-suffix', true);
        this.inferPage = context.getBoolean('ref-infer-page', false, true);
        this.noLink = context.getBoolean('ref-no-link', false, true);
        if (this.url && /^https?:\/\/\w/.test(this.url)) {
            context.externalLinks.push(this.url);
        }
        else {
            delete this.url;
        }
    };
    ReferenceElement.prototype.exit = function (context) {
        context.references.push(this);
    };
    ReferenceElement.prototype.event = function (name, context, initiator) {
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    ReferenceElement.prototype.render = function (options) {
        var _a, _b, _c;
        var span = document.createElement('span');
        var styles = [];
        if (this.style) {
            if (this.style.italic)
                styles.push('font-style:italic');
            if (this.style.bold)
                styles.push('font-weight:bold');
            if (this.style.fontSize && isFinite(this.style.fontSize)) {
                var fontSize = this.style.fontSize;
                if (fontSize < SpanElement_1.SpanElement.minFontSize)
                    fontSize = SpanElement_1.SpanElement.minFontSize;
                if (fontSize > SpanElement_1.SpanElement.maxFontSize)
                    fontSize = SpanElement_1.SpanElement.maxFontSize;
                styles.push("font-size:".concat(fontSize, "px"));
            }
            if (styles.length > 0)
                span.setAttribute('style', styles.join(';'));
        }
        if (this.target) {
            var nodes = this.target.paragraph.renderInner(options);
            if (this.noLink)
                return nodes;
            var link = document.createElement('a');
            link.setAttribute('href', '#' + encodeURIComponent(this.target.bookmarkId));
            link.append.apply(link, nodes);
            span.append(link);
            return [span];
        }
        if (this.url) {
            var a = document.createElement('a');
            a.classList.add('external');
            a.setAttribute('href', this.url);
            a.append.apply(a, this.paragraph.renderInner(options));
            span.append(a);
            return [span];
        }
        var ref = document.createElement('btex-ref');
        span.append(ref);
        if (this.key)
            ref.setAttribute('data-key', this.key);
        if (this.page)
            ref.setAttribute('data-page', this.page);
        if (this.inferPage) {
            // Handle [[$\mathbb{Z}$]] etc.
            var tempParagraph = this.paragraph.clone();
            if (this.pageSuffix) {
                var noSpace = ((_a = this.spacingType) === null || _a === void 0 ? void 0 : _a.last) === 'cjk' &&
                    /^[\p{sc=Hang}\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]/u.test(this.pageSuffix);
                var span_1 = new SpanElement_1.SpanElement();
                if (!noSpace)
                    span_1.append(' ');
                span_1.append(this.pageSuffix);
                tempParagraph.append(span_1);
            }
            var page = tempParagraph.getText();
            page = page.replace(/_/g, ' ');
            for (var symbol in symbolName)
                page = page.replace(new RegExp(symbol, 'g'), '_' + symbolName[symbol] + '_');
            page = page
                .replace(/\u200b/g, '') // zwsp generated by katex
                .replace(/\u2217/g, '*') // mathematical asterisk
                .replace(/([\w\p{sc=Hani}])_+([\w\p{sc=Hani}])/gu, '$1 $2')
                .replace(/_/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            this.page = page;
        }
        if (this.noLink) {
            return [span];
        }
        else {
            var isCategory = (((_b = this.page) === null || _b === void 0 ? void 0 : _b.startsWith('分类:')) || ((_c = this.page) === null || _c === void 0 ? void 0 : _c.startsWith('Category:'))) && this.inferPage;
            var link = document.createElement('btex-link');
            if (this.key)
                link.setAttribute('data-key', this.key);
            if (this.page)
                link.setAttribute('data-page', this.page);
            if (isCategory)
                link.setAttribute('data-is-category', 'True');
            if (this.paragraph.isEmpty()) {
                link.append(span);
            }
            else if (!isCategory) {
                link.append.apply(link, this.paragraph.renderInner(options));
            }
            return [link];
        }
    };
    return ReferenceElement;
}());
exports.ReferenceElement = ReferenceElement;
var symbolName = {
    Α: 'Alpha',
    Β: 'Beta',
    Γ: 'Gamma',
    Δ: 'Delta',
    Ε: 'Epsilon',
    Ζ: 'Zeta',
    Η: 'Eta',
    Θ: 'Theta',
    Ι: 'Iota',
    Κ: 'Kappa',
    Λ: 'Lambda',
    Μ: 'Mu',
    Ν: 'Nu',
    Ξ: 'Xi',
    Ο: 'Omicron',
    Π: 'Pi',
    Ρ: 'Rho',
    Σ: 'Sigma',
    Τ: 'Tau',
    Υ: 'Upsilon',
    Φ: 'Phi',
    Χ: 'Chi',
    Ψ: 'Psi',
    Ω: 'Omega',
    α: 'alpha',
    β: 'beta',
    γ: 'gamma',
    δ: 'delta',
    ε: 'epsilon',
    ζ: 'zeta',
    η: 'eta',
    θ: 'theta',
    ι: 'iota',
    κ: 'kappa',
    λ: 'lambda',
    μ: 'mu',
    ν: 'nu',
    ξ: 'xi',
    ο: 'omicron',
    π: 'pi',
    ρ: 'rho',
    σ: 'sigma',
    τ: 'tau',
    υ: 'upsilon',
    φ: 'phi',
    χ: 'chi',
    ψ: 'psi',
    ω: 'omega',
};
//# sourceMappingURL=ReferenceElement.js.map