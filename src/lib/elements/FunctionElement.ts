import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class FunctionElement implements ContainerElement {
  name: 'fun' = 'fun';
  isInline: boolean = true;
  functionName: string = '';
  paragraph: ParagraphElement = new ParagraphElement();
  children: ParagraphElement[] = [];

  normalise() {
    for (let child of this.children) {
      child.normalise();
    }
  }

  isEmpty(): boolean {
    return false;
  }

  enter(context: Context) {
    this.functionName = context.get('fun-name', true) ?? '';
  }

  event(arg: string, context: Context, initiator: Token): boolean {
    switch (arg) {
      case 'fun-arg':
        context.flushSpan();
        this.paragraph = new ParagraphElement(context);
        this.children.push(this.paragraph);
        return true;
      case 'par':
        context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
        return false;
    }
    context.throw('UNKNOWN_EVENT', initiator);
    return false;
  }

  render(options?: RenderOptions): HTMLElement[] {
    let element = document.createElement('btex-fun');
    element.setAttribute('data-name', this.functionName);

    let i = 1;
    for (let child of this.children) {
      let arg = document.createElement('btex-arg');
      // No options provided -- we need plain HTML for functions to work
      arg.append(...child.renderInner());
      // '=' in tags may mess up wikitext template format
      if (!/^[^<]*=/.test(arg.innerHTML)) {
        arg.innerHTML = i + '=' + arg.innerHTML;
      }
      element.append(arg);
      i++;
    }

    return [element];
  }
}
