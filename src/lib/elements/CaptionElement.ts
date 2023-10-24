import { options, string } from 'yargs';
import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class CaptionElement implements ContainerElement {
  name: 'caption' = 'caption';
  paragraph: ParagraphElement = new ParagraphElement();
  inFigure: Boolean = false;
  inTable: Boolean = false;

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
   this.inFigure = context.getBoolean('caption-in-figure', true);
   this.inTable = context.getBoolean('caption-in-table', true);
  }

  event(name: string, context: Context, initiator: Token) {
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    var caption: HTMLElement = new HTMLElement();
    if(this.inFigure)
    {
      caption = document.createElement('figcaption');
    }
    else if(this.inTable)
    {
      caption = document.createElement('caption');
    }
    else{
      throw Error('Invalid envriont to use caption');
    }
    caption.append(...this.paragraph.renderInner(options));
    return [caption]
  }
}
