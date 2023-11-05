"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigureElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var BookmarkElement_1 = require("./BookmarkElement");
var ImageElement_1 = require("./ImageElement");
var CaptionElement_1 = require("./CaptionElement");
var FigureElement = /** @class */ (function () {
    function FigureElement() {
        this.name = 'figure';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = false;
        this.textAlign = 'center';
    }
    FigureElement.prototype.isEmpty = function () {
        return !this.paragraph.getText();
    };
    FigureElement.prototype.getText = function () {
        return this.paragraph.getText();
    };
    FigureElement.prototype.normalise = function () {
        this.paragraph.normalise();
    };
    FigureElement.prototype.enter = function (context, initiator) {
        var align = context.get('par-align');
        if (context) {
            var textAlign = context.get('par-align');
            if (textAlign && /^(left|center|centre|right|justify)$/.test(textAlign)) {
                this.textAlign = textAlign.replace('centre', 'center');
            }
        }
    };
    FigureElement.prototype.event = function (arg, context, initiator) {
        switch (arg) {
            case 'par':
                return true;
        }
        context.throw('UNKNOWN_EVENT', initiator, arg);
        return false;
    };
    FigureElement.prototype.render = function (options) {
        var _a;
        var div = document.createElement('div');
        div.classList.add('p');
        div.style.textAlign = this.textAlign;
        var fig = document.createElement('figure');
        div.append(fig);
        fig.classList.add('btex-figure');
        var imageId = '';
        var imageChild = new ImageElement_1.ImageElement;
        var captionChild = undefined;
        var newChildren = [];
        for (var _i = 0, _b = this.paragraph.children; _i < _b.length; _i++) {
            var child = _b[_i];
            if (child instanceof BookmarkElement_1.BookmarkElement && !child.isUnused) {
                imageId = ((_a = child.prefix) !== null && _a !== void 0 ? _a : '') + (child.id + 1);
                fig.setAttribute('id', imageId);
            }
            else if (child instanceof CaptionElement_1.CaptionElement) {
                captionChild = child;
            }
            else {
                newChildren.push(child);
            }
        }
        // always place caption at the end if any
        if (captionChild)
            newChildren.push(captionChild);
        this.paragraph.children = newChildren;
        fig.append.apply(fig, this.paragraph.renderInner(options));
        return [div];
    };
    return FigureElement;
}());
exports.FigureElement = FigureElement;
//# sourceMappingURL=FigureElement.js.map