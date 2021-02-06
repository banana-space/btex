import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';

export class RootElement implements ContainerElement {
  name: 'root' = 'root';
  paragraph: ParagraphElement = new ParagraphElement();
  children: RenderElement[] = [this.paragraph];
  isInline: boolean = false;
  compilerData: any = {};

  normalise() {
    for (let child of this.children) {
      child.normalise();
    }
    this.children = this.children.filter((child) => {
      return !child.isEmpty();
    });
  }

  isEmpty(): boolean {
    return this.children.length === 0;
  }

  event(name: string, context: Context, initiator: Token): boolean {
    switch (name) {
      case 'par':
        this.paragraph = new ParagraphElement(context);
        this.children.push(this.paragraph);
        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  render(options?: RenderOptions): HTMLDivElement[] {
    if (this.isEmpty()) return [];

    let div = document.createElement('div');
    div.classList.add('btex-output');
    for (let child of this.children) {
      div.append(...child.render(options));
    }

    let dataString = JSON.stringify(this.compilerData);
    if (dataString && dataString !== '{}') {
      let dataElement = document.createElement('div');
      dataElement.classList.add('compiler-data');
      dataElement.setAttribute('data-json', dataString);
      div.append(dataElement);
    }

    return [div];
  }
}
