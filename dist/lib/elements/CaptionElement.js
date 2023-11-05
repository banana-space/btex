"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var CaptionElement = /** @class */ (function () {
    function CaptionElement() {
        this.name = 'caption';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = true;
    }
    CaptionElement.prototype.isEmpty = function () {
        return !this.paragraph.getText();
    };
    CaptionElement.prototype.getText = function () {
        return this.paragraph.getText();
    };
    CaptionElement.prototype.normalise = function () {
        this.paragraph.normalise();
    };
    CaptionElement.prototype.enter = function (context, initiator) {
        // do nothing
    };
    CaptionElement.prototype.event = function (arg, context, initiator) {
        switch (arg) {
            case 'par':
                context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
                return false;
        }
        context.throw('UNKNOWN_EVENT', initiator, arg);
        return false;
    };
    CaptionElement.prototype.render = function (options) {
        var caption = document.createElement('figcaption');
        caption.append.apply(caption, this.paragraph.renderInner(options));
        return [caption];
    };
    return CaptionElement;
}());
exports.CaptionElement = CaptionElement;
//# sourceMappingURL=CaptionElement.js.map