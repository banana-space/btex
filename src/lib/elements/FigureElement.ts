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
  textAlign: string = 'center'; 

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
    let align = context.get('par-align');
    if (context) {
      let textAlign = context.get('par-align');
      if (textAlign && /^(left|center|centre|right|justify)$/.test(textAlign)) {
        this.textAlign = textAlign.replace('centre', 'center');
      }
    }
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
    let div = document.createElement('div');
    div.classList.add('p');
    div.style.textAlign = this.textAlign;


    let fig = document.createElement('figure');
    div.append(fig);

    fig.classList.add('btex-figure');
    let imageId = '';
    let imageChild = new ImageElement;
    var captionChild: CaptionElement | undefined = undefined;
    var newChildren: RenderElement[] = [];
    for (let child of this.paragraph.children)
    {
      if (child instanceof BookmarkElement && !child.isUnused)
      {
        imageId = (child.prefix ?? '') + (child.id + 1);
        fig.setAttribute('id', imageId);
      }
      else if (child instanceof CaptionElement)
      {
        captionChild = child;
      }
      else 
      {
        newChildren.push(child);
      }
    }
    // always place caption at the end if any
    if(captionChild)
      newChildren.push(captionChild);
    this.paragraph.children = newChildren;
    fig.append(...this.paragraph.renderInner(options));
    return [div]
  }
}
