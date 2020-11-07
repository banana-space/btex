import { Code } from '../Code';
import { Context } from '../Context';
import { BookmarkElement } from '../elements/BookmarkElement';
import { Internal } from '../Internal';

export const BookmarkInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    code.step();

    if (context.noOutput) return true;

    let bookmark = new BookmarkElement();
    bookmark.id = context.bookmarks.push(bookmark) - 1;
    let prefix = context.get('ref-prefix', true);
    if (prefix && !/^[a-z]$/.test(prefix)) prefix = undefined;
    if (prefix) bookmark.prefix = prefix;

    context.flushSpan();
    context.container.paragraph.append(bookmark);
    context.set('ref-id', bookmark.id.toString());

    return true;
  },
};
