import { options, string } from 'yargs';
import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class CaptionElement implements ContainerElement {
  name: 'caption' = 'caption';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;


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
    let caption = document.createElement('figcaption');
    caption.append(...this.paragraph.renderInner(options));
    return [caption]
  }
}
