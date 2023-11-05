"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var ImageElement = /** @class */ (function () {
    function ImageElement() {
        this.name = 'image';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = true;
    }
    ImageElement.prototype.isEmpty = function () {
        return (!this.source);
    };
    ImageElement.prototype.normalise = function () {
        this.paragraph.normalise();
    };
    ImageElement.prototype.parseOption = function (imageOptions) {
        var _a, _b;
        var widthExp = new RegExp(/width=(?<width>\d+)(px)*/);
        var heightExp = new RegExp(/height=(?<height>\d+)(px)*/);
        var widthgroup = (_a = imageOptions.match(widthExp)) === null || _a === void 0 ? void 0 : _a.groups;
        if (widthgroup) {
            this.width = widthgroup.width;
        }
        var heightgroup = (_b = imageOptions.match(heightExp)) === null || _b === void 0 ? void 0 : _b.groups;
        if (heightgroup) {
            this.height = heightgroup.height;
        }
    };
    ImageElement.prototype.enter = function (context, initiator) {
        this.source = context.get('image-source', true);
        this.imageOptions = context.get('image-options', true);
        if (this.imageOptions)
            this.parseOption(this.imageOptions);
    };
    ImageElement.prototype.event = function (name, context, initiator) {
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    ImageElement.prototype.render = function (options) {
        var img = document.createElement('img');
        if (this.source) {
            img.setAttribute('src', this.source);
        }
        if (this.imageOptions) {
            if (this.width)
                img.setAttribute('width', this.width);
            if (this.height)
                img.setAttribute('height', this.height);
        }
        return [img];
    };
    return ImageElement;
}());
exports.ImageElement = ImageElement;
//# sourceMappingURL=ImageElement.js.map