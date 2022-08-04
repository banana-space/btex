import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class DivElement implements ContainerElement {
  name: 'div' = 'div';
  type: string = 'block';
  classList: string[] = [];
  headerParagraph?: ParagraphElement;
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

      case 'proofc':
        if (this.type !== 'proof' || this.headerParagraph) {
          context.throw('UNKNOWN_EVENT', initiator);
          return false;
        }

        this.headerParagraph = this.paragraph;
        this.paragraph = new ParagraphElement(context);
        this.children = [this.paragraph];
        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator);
    return false;
  }

  render(options?: RenderOptions): HTMLDivElement[] {
    if (this.isEmpty()) return [];

    let div = document.createElement('div');
    if (/^block|floatright|proof$/.test(this.type)) div.classList.add(this.type);
    div.classList.add(...this.classList);

    if (this.type === 'proof' && this.headerParagraph) {
      div.classList.add('proof-collapsible');
      div.classList.add('proof-collapsible-collapsed');
      let headerContent = this.headerParagraph.renderInner(options);

      let expander = document.createElement('div');
      expander.classList.add('proof-expander');
      expander.classList.add('proof-expander-expanding');
      div.append(expander);

      expander = document.createElement('div');
      expander.classList.add('proof-expander');
      expander.classList.add('proof-expander-collapsing');
      div.append(expander);

      let header = document.createElement('div');
      header.classList.add('proof-header');
      header.append(...headerContent);
      header.innerHTML = header.innerHTML; // Clone elements

      expander = document.createElement('div');
      expander.classList.add('proof-expander');
      expander.classList.add('proof-expander-ellipsis');
      header.append(expander);
      div.append(header);

      let content = document.createElement('div');
      content.classList.add('proof-content');
      for (let child of this.children) {
        content.append(...child.render(options));
      }
      div.append(content);

      return [div];
    }

    for (let child of this.children) {
      div.append(...child.render(options));
    }

    return [div];
  }
}
