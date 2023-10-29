import { options, string } from 'yargs';
import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
import { BookmarkElement } from './BookmarkElement';
import { ImageElement } from './ImageElement';
import { CaptionElement } from './CaptionElement';

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

  event(arg: string, context: Context, initiator: Token) {
    switch(arg){
      case 'par':
        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator, arg);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    let fig = document.createElement('figure');
    fig.classList.add('btex-figure');
    let imageId = '';
    let imageChild = new ImageElement;
    var captionChild: CaptionElement | undefined = undefined;
    for (let child of this.paragraph.children)
    {
      if (child instanceof BookmarkElement && !child.isUnused)
      {
        imageId = (child.prefix ?? '') + (child.id + 1);
        child.isUnused = true; // pass the id to figure and remove bmk element
        fig.setAttribute('id', imageId);
      }
    }
    fig.append(...this.paragraph.renderInner(options));
    return [fig]
  }
}
