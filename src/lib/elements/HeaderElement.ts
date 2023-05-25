import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class HeaderElement implements ContainerElement {
  name: 'header' = 'header';
  type?: string;
  hash?: string;
  numberHTML?: string;
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;

  isEmpty(): boolean {
    return this.paragraph.isEmpty();
  }

  normalise() {
    this.paragraph.normalise();
  }

  enter(context: Context, initiator: Token) {
    this.type = context.get('header-type', true);

    if (context.getBoolean('header-numbered', false)) {
      this.numberHTML = context.commandToHTML('\\@headernumber', initiator) ?? undefined;
    }
  }

  exit(context: Context) {
    let hash = context.get('header-hash', true) ?? this.paragraph.getText();
    hash = hash.trim().replace(/\s/g, '_');

    // Find an available hash of the form hash_1, hash_2, ...
    let i = /^([a-z]?\d+)?$/i.test(hash) ? 1 : 0;
    let name = hash;
    for (; ; i++) {
      if (i > 0) name = hash + '_' + i;
      let flag = true;
      for (let header of context.headers)
        if (header.hash === name) {
          flag = false;
          break;
        }
      if (flag) break;
    }

    this.hash = name;
    context.set('ref-id', name);
    context.headers.push(this);
  }

  event(name: string, context: Context, initiator: Token) {
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    if (!this.type || !/^h[234]$/.test(this.type)) this.type = 'h2';

    let element = document.createElement(this.type);
    if (this.hash) element.setAttribute('id', this.hash);

    if (this.numberHTML) {
      let span = document.createElement('span');
      span.classList.add('header-number');
      span.append(this.numberHTML);
      element.append(span);
    }

    element.append(...this.paragraph.renderInner(options));
    return [element];
  }
}
