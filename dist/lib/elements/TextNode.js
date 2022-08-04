"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextNode = void 0;
var TextNode = /** @class */ (function () {
    function TextNode(text, source) {
        this.text = text;
        this.position = source === null || source === void 0 ? void 0 : source.source.start;
    }
    TextNode.prototype.render = function () {
        var h = document.createTextNode(this.text);
        return h;
    };
    return TextNode;
}());
exports.TextNode = TextNode;
//# sourceMappingURL=TextNode.js.map