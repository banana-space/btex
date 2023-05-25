import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class TabelOfContentElement implements ContainerElement {
  name: 'toc' = 'toc';
  numberHTML?: string;
  bookmarkId: string = '';
  level: number = -1;
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;

  isEmpty(): boolean {
    return this.paragraph.isEmpty();
  }

  normalise() {
    this.paragraph.normalise();
  }

  enter(context: Context, initiator: Token) {
    this.level = context.getInteger('toc-level', 4, true);
    if (context.getBoolean('toc-numbered', false, true)) {
      this.numberHTML = context.commandToHTML('\\@tocnumber', initiator) ?? undefined;
    }
    this.bookmarkId = context.get('ref-id') ?? '';
  }

  event(name: string, context: Context, initiator: Token) {
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  exit(context: Context) {
    context.tableOfContents.push(this);
  }

  render(): never[] {
    return [];
  }
}
