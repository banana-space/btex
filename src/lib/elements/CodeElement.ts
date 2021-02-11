import { Context } from '../Context';
import { ContainerElement, RenderOptions } from '../Element';
import { ParagraphElement } from './ParagraphElement';

export class CodeElement implements ContainerElement {
  name: 'code' = 'code';
  text: string = '';
  lang?: string;
  isInline: boolean = true;
  paragraph: ParagraphElement = new ParagraphElement();

  normalise() {}

  isEmpty(): boolean {
    return this.text === '';
  }

  enter(context: Context) {
    this.isInline = !context.getBoolean('code-display', false, true);
    this.lang = context.get('code-lang', true);
  }

  event(): boolean {
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    if (this.isEmpty()) return [];

    if (this.isInline) {
      this.text = this.text.replace(/\n/g, ' ');
    }

    let element = document.createElement(this.isInline ? 'code' : 'pre');
    if (this.lang) element.classList.add('code-' + this.lang);
    element.append(document.createTextNode(this.text));
    return [element];
  }
}
