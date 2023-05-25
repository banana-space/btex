"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabelOfContentElement = void 0;
var ParagraphElement_1 = require("./ParagraphElement");
var TabelOfContentElement = /** @class */ (function () {
    function TabelOfContentElement() {
        this.name = 'toc';
        this.bookmarkId = '';
        this.level = -1;
        this.paragraph = new ParagraphElement_1.ParagraphElement();
        this.isInline = true;
    }
    TabelOfContentElement.prototype.isEmpty = function () {
        return this.paragraph.isEmpty();
    };
    TabelOfContentElement.prototype.normalise = function () {
        this.paragraph.normalise();
    };
    TabelOfContentElement.prototype.enter = function (context, initiator) {
        var _a, _b;
        this.level = context.getInteger('toc-level', 4, true);
        if (context.getBoolean('toc-numbered', false, true)) {
            this.numberHTML = (_a = context.commandToHTML('\\@tocnumber', initiator)) !== null && _a !== void 0 ? _a : undefined;
        }
        this.bookmarkId = (_b = context.get('ref-id')) !== null && _b !== void 0 ? _b : '';
    };
    TabelOfContentElement.prototype.event = function (name, context, initiator) {
        context.throw('UNKNOWN_EVENT', initiator, name);
        return false;
    };
    TabelOfContentElement.prototype.exit = function (context) {
        context.tableOfContents.push(this);
    };
    TabelOfContentElement.prototype.render = function () {
        return [];
    };
    return TabelOfContentElement;
}());
exports.TabelOfContentElement = TabelOfContentElement;
//# sourceMappingURL=TableOfContentElement.js.map