import { options, string } from 'yargs';
import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class FigureElement implements ContainerElement {
  name: 'figure' = 'figure';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = false;

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

  event(name: string, context: Context, initiator: Token) {
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    let fig = document.createElement('figure');
    fig.append(...this.paragraph.renderInner(options));
    return [fig]
  }
}
