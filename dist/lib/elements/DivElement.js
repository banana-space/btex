"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var DivElement = /** @class */ (function () {
    function DivElement() {
        this.name = 'div';
        this.type = 'block';
        this.classList = [];
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.children = [];
    }
    DivElement.prototype.normalise = function () {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.normalise();
        }
        this.children = this.children.filter(function (child) { return !child.isEmpty(); });
    };
    DivElement.prototype.isEmpty = function () {
        return this.children.length === 0;
    };
    DivElement.prototype.enter = function (context) {
        var _a, _b;
        this.paragraph = new ParagraphElement_1.ParagraphElement(context);
        this.children.push(this.paragraph);
        this.type = (_a = context.get('g.div-type', true)) !== null && _a !== void 0 ? _a : 'block';
        var classes = ((_b = context.get('g.div-class', true)) !== null && _b !== void 0 ? _b : '').split(' ').filter(function (x) { return x; });
        for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
            var cl = classes_1[_i];
            this.classList.push(cl);
        }
    };
    DivElement.prototype.event = function (arg, context, initiator) {
        switch (arg) {
            case 'par':
                this.paragraph = new ParagraphElement_1.ParagraphElement(context);
                this.children.push(this.paragraph);
                return true;
            case 'proofc':
                if (this.type !== 'proof' || this.headerParagraph) {
                    context.throw('UNKNOWN_EVENT', initiator);
                    return false;
                }
                this.headerParagraph = this.paragraph;
                this.paragraph = new ParagraphElement_1.ParagraphElement(context);
                this.children = [this.paragraph];
                return true;
        }
        context.throw('UNKNOWN_EVENT', initiator);
        return false;
    };
    DivElement.prototype.render = function (options) {
        var _a;
        if (this.isEmpty())
            return [];
        var div = document.createElement('div');
        if (/^block|floatright|proof$/.test(this.type))
            div.classList.add(this.type);
        (_a = div.classList).add.apply(_a, this.classList);
        if (this.type === 'proof' && this.headerParagraph) {
            div.classList.add('proof-collapsible');
            div.classList.add('proof-collapsible-collapsed');
            var headerContent = this.headerParagraph.renderInner(options);
            var expander = document.createElement('div');
            expander.classList.add('proof-expander');
            expander.classList.add('proof-expander-expanding');
            div.append(expander);
            expander = document.createElement('div');
            expander.classList.add('proof-expander');
            expander.classList.add('proof-expander-collapsing');
            div.append(expander);
            var header = document.createElement('div');
            header.classList.add('proof-header');
            header.append.apply(header, headerContent);
            header.innerHTML = header.innerHTML; // Clone elements
            expander = document.createElement('div');
            expander.classList.add('proof-expander');
            expander.classList.add('proof-expander-ellipsis');
            header.append(expander);
            div.append(header);
            var content = document.createElement('div');
            content.classList.add('proof-content');
            for (var _i = 0, _b = this.children; _i < _b.length; _i++) {
                var child = _b[_i];
                content.append.apply(content, child.render(options));
            }
            div.append(content);
            return [div];
        }
        for (var _c = 0, _d = this.children; _c < _d.length; _c++) {
            var child = _d[_c];
            div.append.apply(div, child.render(options));
        }
        return [div];
    };
    return DivElement;
}());
exports.DivElement = DivElement;
//# sourceMappingURL=DivElement.js.map