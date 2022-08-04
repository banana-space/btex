"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var LabelElement = /** @class */ (function () {
    function LabelElement(key, bookmarkId) {
        this.key = key;
        this.bookmarkId = bookmarkId;
        this.name = 'label';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = true;
    }
    LabelElement.prototype.isEmpty = function () {
        // Prevents from being added to the root element
        return true;
    };
    LabelElement.prototype.normalise = function () {
        this.paragraph.normalise();
    };
    LabelElement.prototype.event = function (name, context, initiator) {
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    LabelElement.prototype.render = function () {
        return [];
    };
    LabelElement.prototype.getHTML = function (options) {
        var div = document.createElement('div');
        div.append.apply(div, this.paragraph.renderInner(options));
        return div.innerHTML;
    };
    return LabelElement;
}());
exports.LabelElement = LabelElement;
//# sourceMappingURL=LabelElement.js.map