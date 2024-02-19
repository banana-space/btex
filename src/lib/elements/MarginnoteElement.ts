import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class MarginnoteElement implements ContainerElement {
  name: 'marginnote' = 'marginnote';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;
  marginnotemark?: string = ''


  constructor() {}

  isEmpty(): boolean {
    return !this.paragraph.getText();
  }

  getText(): string {
    return this.paragraph.getText();
  }

  normalise() {
    this.paragraph.normalise();
  }

  enter(context: Context, initiator: Token): void {
    this.marginnotemark = context.get('marginnote-mark', true);
    // do nothing
  }

  event(arg: string, context: Context, initiator: Token) {
    switch(arg)
    {
      case 'par':
        context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
        return false;
    }
    context.throw('UNKNOWN_EVENT', initiator, arg);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    let span = document.createElement('sup');
    span.setAttribute('class', 'marginnote');
    if(this.marginnotemark)
      span.append(this.marginnotemark)
    let marginnote = document.createElement('small');
    marginnote.setAttribute('class', 'marginnotebody');
    marginnote.append(...this.paragraph.renderInner(options));
    span.appendChild(marginnote)
    return [span]
  }
}
