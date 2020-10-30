import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class DivElement implements ContainerElement {
  name: 'div' = 'div';
  type: string = 'block';
  paragraph: ParagraphElement = new ParagraphElement();
  children: RenderElement[] = [];

  normalise() {
    for (let child of this.children) {
      child.normalise();
    }
    this.children = this.children.filter((child) => !child.isEmpty());
  }

  isEmpty(): boolean {
    return this.children.length === 0;
  }

  enter(context: Context) {
    this.paragraph = new ParagraphElement(context);
    this.children.push(this.paragraph);
    this.type = context.get('div-type', true) ?? 'block';
  }

  event(arg: string, context: Context, initiator: Token): boolean {
    switch (arg) {
      case 'par':
        this.paragraph = new ParagraphElement(context);
        this.children.push(this.paragraph);
        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator);
    return false;
  }

  render(options?: RenderOptions): HTMLDivElement[] {
    if (this.isEmpty()) return [];

    let div = document.createElement('div');
    if (/^block|floatright$/.test(this.type)) div.classList.add(this.type);
    for (let child of this.children) {
      div.append(...child.render(options));
    }

    return [div];
  }
}
