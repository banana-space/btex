"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var RootElement = /** @class */ (function () {
    function RootElement() {
        this.name = 'root';
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.children = [this.paragraph];
        this.isInline = false;
    }
    RootElement.prototype.normalise = function () {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.normalise();
        }
        this.children = this.children.filter(function (child) {
            return !child.isEmpty();
        });
    };
    RootElement.prototype.isEmpty = function () {
        return this.children.length === 0;
    };
    RootElement.prototype.event = function (name, context, initiator) {
        switch (name) {
            case 'par':
                if (this.isInline) {
                    context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
                }
                else {
                    this.paragraph = new ParagraphElement_1.ParagraphElement(context);
                    this.children.push(this.paragraph);
                }
                return true;
        }
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    RootElement.prototype.render = function (options) {
        var _a;
        if (this.isEmpty())
            return [];
        if (this.isInline) {
            var span = document.createElement('span');
            span.classList.add('btex-output');
            span.append.apply(span, this.paragraph.renderInner(options));
            return [span];
        }
        else {
            var div = document.createElement('div');
            div.classList.add('btex-output');
            for (var _i = 0, _b = this.children; _i < _b.length; _i++) {
                var child = _b[_i];
                div.append.apply(div, child.render(options));
            }
            if (this.tocRendered) {
                var position = div.querySelector('h2');
                (_a = position === null || position === void 0 ? void 0 : position.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(this.tocRendered, position);
            }
            return [div];
        }
    };
    return RootElement;
}());
exports.RootElement = RootElement;
//# sourceMappingURL=RootElement.js.map