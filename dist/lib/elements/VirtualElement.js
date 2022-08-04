"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var VirtualElement = /** @class */ (function () {
    function VirtualElement() {
        this.name = 'virtual';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = true;
    }
    VirtualElement.prototype.isEmpty = function () {
        return true;
    };
    VirtualElement.prototype.normalise = function () {
        this.paragraph.normalise();
    };
    VirtualElement.prototype.event = function (name, context, initiator) {
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    VirtualElement.prototype.render = function () {
        return [];
    };
    VirtualElement.prototype.getHTML = function (options) {
        var div = document.createElement('div');
        div.append.apply(div, this.paragraph.renderInner(options));
        return div.innerHTML;
    };
    return VirtualElement;
}());
exports.VirtualElement = VirtualElement;
//# sourceMappingURL=VirtualElement.js.map