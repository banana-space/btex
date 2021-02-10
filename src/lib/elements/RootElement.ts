import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class RootElement implements ContainerElement {
  name: 'root' = 'root';
  paragraph: ParagraphElement = new ParagraphElement();
  children: RenderElement[] = [this.paragraph];
  isInline: boolean = false;

  tocRendered?: HTMLElement;

  normalise() {
    for (let child of this.children) {
      child.normalise();
    }
    this.children = this.children.filter((child) => {
      return !child.isEmpty();
    });
  }

  isEmpty(): boolean {
    return this.children.length === 0;
  }

  event(name: string, context: Context, initiator: Token): boolean {
    switch (name) {
      case 'par':
        if (this.isInline) {
          context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
        } else {
          this.paragraph = new ParagraphElement(context);
          this.children.push(this.paragraph);
        }
        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    if (this.isEmpty()) return [];

    if (this.isInline) {
      let span = document.createElement('span');
      span.classList.add('btex-output');
      span.append(...this.paragraph.renderInner(options));

      return [span];
    } else {
      let div = document.createElement('div');
      div.classList.add('btex-output');

      for (let child of this.children) {
        div.append(...child.render(options));
      }

      if (this.tocRendered) {
        let position = div.querySelector('h2');
        position?.parentNode?.insertBefore(this.tocRendered, position);
      }

      return [div];
    }
  }
}
