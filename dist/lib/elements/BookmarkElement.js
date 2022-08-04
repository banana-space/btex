"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkElement = void 0;
var BookmarkElement = /** @class */ (function () {
    function BookmarkElement() {
        this.name = 'bookmark';
        this.id = -1;
    }
    BookmarkElement.prototype.isEmpty = function () {
        return this.isUnused === true;
    };
    BookmarkElement.prototype.normalise = function () { };
    BookmarkElement.prototype.render = function () {
        var _a;
        if (this.isUnused)
            return [];
        var element = document.createElement('span');
        element.setAttribute('id', ((_a = this.prefix) !== null && _a !== void 0 ? _a : '') + (this.id + 1));
        return [element];
    };
    return BookmarkElement;
}());
exports.BookmarkElement = BookmarkElement;
//# sourceMappingURL=BookmarkElement.js.map