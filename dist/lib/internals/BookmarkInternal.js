"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkInternal = void 0;
var BookmarkElement_1 = require("../elements/BookmarkElement");
exports.BookmarkInternal = {
    execute: function (code, context) {
        code.step();
        if (context.noOutput)
            return true;
        var bookmark = new BookmarkElement_1.BookmarkElement();
        bookmark.id = context.bookmarks.push(bookmark) - 1;
        var prefix = context.get('ref-prefix', true);
        if (prefix && !/^[a-z]$/.test(prefix))
            prefix = undefined;
        if (prefix)
            bookmark.prefix = prefix;
        context.flushSpan();
        context.container.paragraph.append(bookmark);
        context.set('ref-id', bookmark.id.toString());
        return true;
    },
};
//# sourceMappingURL=BookmarkInternal.js.map