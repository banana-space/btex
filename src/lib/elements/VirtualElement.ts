import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class VirtualElement implements ContainerElement {
  name: 'virtual' = 'virtual';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;

  isEmpty(): boolean {
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
