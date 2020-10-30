import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { SpanElement } from './SpanElement';

export class ParagraphElement implements RenderElement {
  name: 'paragraph' = 'paragraph';
  children: RenderElement[] = [];

  style: {
    textAlign?: 'left' | 'center' | 'right' | 'justify';
  } = {};

  constructor(context?: Context) {
    if (context) {
      // TODO: set styles
    }
  }

  normalise() {
    let lastText = ' ';
    for (let child of this.children) {
      if (child instanceof SpanElement && !child.style.preservesSpaces) {
        for (let text of child.children) {
          if (/^\s*$/.test(text.text) && !/\n/.test(text.text)) {
            text.text = lastText === ' ' ? '' : ' ';
            lastText = ' ';
          } else {
            lastText = text.text;
          }
        }

        child.children = child.children.filter((text) => {
          return text.text !== '';
        });
      } else {
        // Child is a container; kill the space unless it is inline.
        child.normalise();
        if (!child.isEmpty()) lastText = (child as ContainerElement).isInline ? '' : ' ';
      }
    }

    // TODO: trim right
    // TODO: merge adjacent spans when possible
    // TODO: EC spacing
    // TODO: NFC normalisation

    this.children = this.children.filter((child) => {
      if (child instanceof SpanElement) return !child.isEmpty();
      return true;
    });
  }

  isEmpty(): boolean {
    return this.children.length === 0;
  }

  append(element: RenderElement) {
    this.children.push(element);
  }

  render(options?: RenderOptions): Node[] {
    if (this.isEmpty()) return [];

    // In some cases the <p> or <div> tag is unnecessary
    if (this.children.length === 1) {
      switch (this.children[0].name) {
        case 'div':
        case 'list':
        case 'header':
          return this.renderInner(options);
      }
    }

    // Create a <p> element only if it does not contain non-math containers,
    // because <p> elements cannot be nested
    let name = 'p';
    for (let child of this.children) {
      if (
        child.name !== 'span' &&
        child.name !== 'math' &&
        child.name !== 'bookmark' &&
        child.name !== 'ref'
      ) {
        name = 'div';
        break;
      }
    }

    let element = document.createElement(name);
    if (name !== 'p') element.classList.add('p');
    element.append(...this.renderInner(options));

    return [element];
  }

  renderInner(options?: RenderOptions): Node[] {
    let result: Node[] = [];
    for (let child of this.children) {
      result.push(...child.render(options));
    }
    return result;
  }

  getText(): string {
    let div = document.createElement('div');
    div.append(...this.renderInner());
    return div.textContent ?? '';
  }
}
