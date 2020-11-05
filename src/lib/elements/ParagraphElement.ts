import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { SpanElement } from './SpanElement';
import { TextNode } from './TextNode';

export class ParagraphElement implements RenderElement {
  name: 'paragraph' = 'paragraph';
  children: RenderElement[] = [];

  style: {
    textAlign?: string;
  } = {};

  // Provide the argument `context` only if paragraph styles (text align etc.) are desired.
  constructor(context?: Context) {
    if (context) {
      let textAlign = context.get('par-align');
      if (textAlign && /^(left|center|centre|right|justify)$/.test(textAlign)) {
        this.style.textAlign = textAlign.replace('centre', 'center');
      }
    }
  }

  normalise() {
    let prevType: 'space' | 'letter' | 'cjk' | 'punct' | 'cjk-punct' | 'other' = 'space';
    let prevText: TextNode | undefined = undefined;

    for (let child of this.children) {
      if (child instanceof SpanElement && !child.style.preservesSpaces) {
        for (let text of child.children) {
          let newText = text.text;

          // Adjacent spaces are merged into one
          if (prevType === 'space' || prevType === 'cjk-punct') newText = newText.trimStart();

          // Spacing between letters and CJK characters
          if (
            (prevType === 'letter' || prevType === 'punct') &&
            /^[\p{sc=Hang}\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]/u.test(newText)
          )
            newText = ' ' + newText;
          if (
            prevType === 'cjk' &&
            prevText &&
            /^[\p{Ll}\p{Lu}\p{Nd}\p{Mn}\(\[\{%'"‘“]/u.test(newText)
          )
            prevText.text += ' ';

          if (newText) {
            prevText = text;

            if (/\s+$/.test(newText)) {
              newText = newText.trimEnd() + ' ';
              prevType = 'space';
            } else if (/[\p{Ll}\p{Lu}\p{Nd}\p{Mn}]$/u.test(newText)) {
              prevType = 'letter';
            } else if (/[\p{sc=Hang}\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]$/u.test(newText)) {
              prevType = 'cjk';
            } else if (/[\)\]\},.!%;:?'"’”]$/.test(newText)) {
              prevType = 'punct';
            } else if (/[\u3000-\u301f\uff00-\uff60]$/.test(newText)) {
              prevType = 'cjk-punct';
            } else {
              prevType = 'other';
            }
          }

          text.text = newText;
        }

        child.children = child.children.filter((text) => {
          return text.text !== '';
        });
      } else {
        child.normalise();
        if (!child.isEmpty()) {
          if (child instanceof SpanElement) {
            prevType = 'other';
          } else if ((child as ContainerElement).isInline) {
            if (prevType === 'cjk' && prevText) prevText.text += ' ';
            prevType = 'letter';
          } else {
            if (prevText && prevType === 'space') prevText.text = prevText.text.trimRight();
            prevType = 'space';
          }
          prevText = undefined;
        }
      }
    }

    // Remove trailing spaces of the paragraph
    if (prevText && prevType === 'space') {
      prevText.text = prevText.text.trimRight();
    }

    // Merge adjacent spans whenever possible
    let mergeWith: SpanElement | undefined = undefined;
    for (let span of this.children) {
      if (!(span instanceof SpanElement)) {
        mergeWith = undefined;
        continue;
      }

      if (mergeWith && mergeWith.canMergeWith(span)) {
        mergeWith.children.push(...span.children);
        span.children = [];
      } else {
        mergeWith = span;
      }
    }

    // Remove empty spans
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

    if (this.style.textAlign) element.style.textAlign = this.style.textAlign;

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
