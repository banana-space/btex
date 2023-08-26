import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token, TokenType } from '../Token';
import { DiagramElement } from './DiagramElement';
import { SpanElement } from './SpanElement';
import { TextNode } from './TextNode';
import { TikzElement } from './TikzElement';

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

  // Incomplete clone - children are not cloned.
  clone(): ParagraphElement {
    let paragraph = new ParagraphElement();
    paragraph.children = [...this.children];
    paragraph.style = this.style;
    return paragraph;
  }

  normalise(): {
    first: string;
    last: string;
  } {
    // Insert auxiliary span between non-span elements
    for (let i = 0; i < this.children.length - 1; i++) {
      if (this.children[i] instanceof SpanElement || this.children[i + 1] instanceof SpanElement)
        continue;
      let span = new SpanElement();
      span.append(
        '',
        Token.fromCode('', TokenType.Whitespace, { line: 0, col: 0 }, { line: 0, col: 0 })
      );
      this.children.splice(i + 1, 0, span);
      i++;
    }

    // Insert spaces between CJK and letters, etc.
    let prevType: 'space' | 'letter' | 'han' | 'jk' | 'punct' | 'cjk-punct' | 'other' = 'space';
    let prevText: TextNode | undefined = undefined;
    let first = '',
      last = '';
    let spaceBeforeCjk = false,
      spaceAfterCjk = false;

    for (let child of this.children) {
      if (child instanceof SpanElement && !child.style.preservesSpaces) {
        for (let index = 0; index < child.children.length; index++) {
          let text = child.children[index];
          let newText = text.text;
          let nextText = child.children[index + 1];

          // Adjacent spaces are merged into one
          if (prevType === 'space' || prevType === 'cjk-punct') newText = newText.trimStart();

          // Disallow spacing between han characters
          // But preserve spaces at end as refs may follow
          if (prevType === 'han') {
            if (nextText && /^\s+/.test(newText)) {
              newText = newText.trimStart();
              spaceAfterCjk = true;
            }
          } else {
            spaceAfterCjk = false;
          }

          if (prevText?.text && /[\(\[\{‘“]$/u.test(prevText.text)) {
            if (nextText && /^\s+/.test(newText)) {
              newText = newText.trimStart();
              spaceBeforeCjk = true;
            }
          } else {
            spaceBeforeCjk = false;
          }

          // Spacing between letters and han characters
          if (
            (prevType === 'letter' && /^\p{sc=Hani}/u.test(newText)) ||
            (prevType === 'punct' &&
              /^[\p{sc=Hang}\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}]/u.test(newText))
          )
            newText = ' ' + newText;
          if (
            (prevType === 'han' &&
              /^[\p{Ll}\p{Lu}\p{Nd}\p{Mn}\(\[\{#%&*§¶'"‘“\uedae\uedaf]/u.test(newText)) ||
            (prevType === 'jk' && /^[\(\[\{‘“]/u.test(newText))
          ) {
            if (prevText) prevText.text += ' ';
            else newText = ' ' + newText;
          }

          prevText = text;

          if (newText) {
            if (/\s+$/.test(newText)) {
              newText = newText.trimEnd() + ' ';
              prevType = 'space';
            } else if (/[\p{Ll}\p{Lu}\p{Nd}\p{Mn}\uedae\uedaf]$/u.test(newText)) {
              prevType = 'letter';
            } else if (/\p{sc=Hani}$/u.test(newText)) {
              prevType = 'han';
              spaceAfterCjk = false;
            } else if (/[\p{sc=Hang}\p{sc=Hira}\p{sc=Kana}]$/u.test(newText)) {
              prevType = 'jk';
            } else if (/[\)\]\},.!#%&*§¶;:?'"’”\u2026]$/.test(newText)) {
              prevType = 'punct';
            } else if (/[\u3000-\u301f\uff00-\uff60\uff64]$/.test(newText)) {
              prevType = 'cjk-punct';
            } else {
              prevType = 'other';
            }

            if (
              (spaceAfterCjk &&
                !/^[\)\]\},.!;:?’”\u2026\p{sc=Hang}\p{sc=Hani}\p{sc=Hira}\p{sc=Kana}\u3000-\u301f\uff00-\uff60\uff64]/u.test(
                  newText
                )) ||
              (spaceBeforeCjk && prevType === 'han')
            ) {
              newText = ' ' + newText;
              spaceBeforeCjk = spaceAfterCjk = false;
            }

            if (prevType !== 'space') {
              if (!first) first = prevType;
              last = prevType;
            }
          }

          text.text = newText;
        }
      } else {
        child.normalise();
        if (!child.isEmpty()) {
          if (child instanceof SpanElement) {
            prevType = 'other';
          } else if ((child as ContainerElement).isInline) {
            let childType = (child as ContainerElement).spacingType;
            if (childType) {
              if (
                prevText &&
                ((prevType === 'letter' && childType.first === 'han') ||
                  (prevType === 'han' && childType.first === 'letter'))
              )
                prevText.text += ' ';

              prevType = childType.last as typeof prevType;
            } else {
              if (prevType === 'han' && prevText) prevText.text += ' ';
              prevType = 'letter';
            }
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
      if (child instanceof SpanElement) {
        child.children = child.children.filter((text) => {
          return text.text !== '';
        });
        return !child.isEmpty();
      }
      return true;
    });

    return { first: first || 'other', last: last || 'other' };
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
        child.name !== 'ref' &&
        !(child as ContainerElement)?.isInline
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
      // Skip tikz elements
      if (child instanceof TikzElement) continue;

      // Turn diagrams into \text{...}
      if (child instanceof DiagramElement) {
        child.render(options);
        let node = document.createTextNode(
          `\\rule{0em}{${child.renderedHeight / 2}em}\\text{${child.id}}`
        );
        result.push(node);
        continue;
      }

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
