import { options, string } from 'yargs';
import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class ImageElement implements ContainerElement {
  name: 'image' = 'image';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;
  source?: string;
  imageOptions?: string;
  width?:string;
  height?:string;

  constructor() {}

  isEmpty(): boolean {
    return (!this.source);
  }

  normalise() {
    this.paragraph.normalise();
  }

  parseOption(imageOptions:string)
  {
    let widthExp = new RegExp(/width=(?<width>\d+)(px)*/);
    let heightExp = new RegExp(/height=(?<height>\d+)(px)*/);

    let widthgroup = imageOptions.match(widthExp)?.groups;
    if(widthgroup)
    {
      this.width = widthgroup.width;
    }
    
    let heightgroup = imageOptions.match(heightExp)?.groups;
    if(heightgroup)
    {
      this.height= heightgroup.height;
    }
    

  }

  enter(context: Context, initiator: Token): void {
    this.source = context.get('image-source', true);
    this.imageOptions = context.get('image-options', true);
    if(this.imageOptions)
      this.parseOption(this.imageOptions);
  }

  event(name: string, context: Context, initiator: Token) {
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    let img = document.createElement('img')
    if(this.source)
    {
      img.setAttribute('src', this.source);
    }
    if(this.imageOptions)
    {
      if(this.width)
        img.setAttribute('width', this.width);
      if(this.height)
        img.setAttribute('height', this.height);
    }
    return [img];
  }
}
