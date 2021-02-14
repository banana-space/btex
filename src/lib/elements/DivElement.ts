import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class DivElement implements ContainerElement {
  name: 'div' = 'div';
  type: string = 'block';
  classList: string[] = [];
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
    this.type = context.get('g.div-type', true) ?? 'block';
    let classes = (context.get('g.div-class', true) ?? '').split(' ').filter((x) => x);
    for (let cl of classes) this.classList.push(cl);
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
    div.classList.add(...this.classList);
    for (let child of this.children) {
      div.append(...child.render(options));
    }

    return [div];
  }
}
