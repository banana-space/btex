import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class LabelElement implements ContainerElement {
  name: 'label' = 'label';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;

  constructor(public key: string, public bookmarkId: string) {}

  isEmpty(): boolean {
    // Prevents from being added to the root element
    return true;
  }

  normalise() {
    this.paragraph.normalise();
  }

  event(name: string, context: Context, initiator: Token) {
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(): never[] {
    return [];
  }

  getHTML(options?: RenderOptions): string {
    let div = document.createElement('div');
    div.append(...this.paragraph.renderInner(options));
    return div.innerHTML;
  }
}
