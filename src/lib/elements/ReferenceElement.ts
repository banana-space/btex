import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { LabelElement } from './LabelElement';
import { ParagraphElement } from './ParagraphElement';

export class ReferenceElement implements ContainerElement {
  name: 'ref' = 'ref';
  page?: string;
  key?: string;
  noLink: boolean = false;
  isInline: boolean = true;
  paragraph: ParagraphElement = new ParagraphElement();
  target?: LabelElement;
  spacingType?: {
    first: string;
    last: string;
  };

  isEmpty(): boolean {
    return false;
  }

  normalise() {
    this.spacingType = this.paragraph.normalise();
  }

  enter(context: Context) {
    this.page = context.get('ref-page', true);
    this.key = context.get('ref-key', true);
    this.noLink = context.getBoolean('ref-no-link', false, true);
  }

  exit(context: Context) {
    context.references.push(this);
  }

  event(name: string, context: Context, initiator: Token) {
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): Node[] {
    if (this.target) {
      let nodes = this.target.paragraph.renderInner(options);
      if (this.noLink) return nodes;

      let link = document.createElement('a');
      link.setAttribute('href', '#' + this.target.bookmarkId);
      link.append(...nodes);
      return [link];
    }

    let ref = document.createElement('btex-ref');
    if (this.key) ref.setAttribute('data-key', this.key);
    if (this.page) ref.setAttribute('data-page', this.page);

    if (this.noLink) {
      return [ref];
    } else {
      let link = document.createElement('btex-link');
      if (this.key) link.setAttribute('data-key', this.key);
      if (this.page) link.setAttribute('data-page', this.page);

      if (this.paragraph.isEmpty()) {
        link.append(ref);
      } else {
        link.append(...this.paragraph.renderInner(options));
      }
      return [link];
    }
  }
}
