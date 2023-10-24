import { options, string } from 'yargs';
import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class CaptionElement implements ContainerElement {
  name: 'caption' = 'caption';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;
  isInFigure: boolean = false;
  isInTable: boolean = false;

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
    this.isInFigure = context.getBoolean('caption-in-figure', false);
    this.isInTable = context.getBoolean('caption-in-table', false);
  }

  event(name: string, context: Context, initiator: Token) {
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    var caption: HTMLElement;
    if(this.isInFigure){
      caption = document.createElement('figcaption');
    }
    else if(this.isInTable)
    {
      caption = document.createElement('caption');
    }
    else
    {
      throw Error('unknown env');
    }
    caption.append(...this.paragraph.renderInner(options));
    return [caption]
  }
}
