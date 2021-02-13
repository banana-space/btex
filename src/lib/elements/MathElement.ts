import { render } from 'katex';
import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { ParagraphElement } from './ParagraphElement';
import { SpanElement } from './SpanElement';
import { TikzElement } from './TikzElement';

export class MathElement implements ContainerElement {
  name: 'math' = 'math';
  mainParagraph: ParagraphElement = new ParagraphElement(); // ghost element that will not be rendered
  paragraph: ParagraphElement = this.mainParagraph;
  children: RenderElement[] = this.mainParagraph.children;
  isInline: boolean = true;

  // Equation numbering for display equations
  tagMode?: 'left' | 'right';
  tagLeft?: ParagraphElement;
  tagRight?: ParagraphElement;

  isEmpty(): boolean {
    return (
      !this.getText() &&
      this.mainParagraph.children.filter((e) => e instanceof TikzElement).length === 0
    );
  }

  normalise() {
    this.tagLeft?.normalise();
    if (this.tagLeft?.isEmpty()) delete this.tagLeft;

    this.tagRight?.normalise();
    if (this.tagRight?.isEmpty()) delete this.tagRight;
  }

  enter(context: Context) {
    this.isInline = context.container.isInline || !context.getBoolean('math-display', false, true);
    context.set('g.math-mode', '1');
  }

  exit(context: Context) {
    context.set('g.math-mode', undefined);
  }

  event(name: string, context: Context, initiator: Token) {
    switch (name) {
      case 'par':
        // TODO: if in tag mode, give warning
        return true;
      case 'leqno':
        // TODO: if in inline mode, give warning
        this.tagMode = 'left';
        this.tagLeft ??= new ParagraphElement();
        this.paragraph = this.tagLeft;
        context.set('g.math-mode', undefined);
        return true;
      case 'reqno':
        // TODO: if in inline mode, give warning
        this.tagMode = 'right';
        this.tagRight ??= new ParagraphElement();
        this.paragraph = this.tagRight;
        context.set('g.math-mode', undefined);
        return true;
      case 'xeqno':
        delete this.tagMode;
        this.paragraph = this.mainParagraph;
        context.set('g.math-mode', '1');
        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  getText(): string {
    return this.mainParagraph.getText();
  }

  render(options?: RenderOptions): HTMLElement[] {
    let span = document.createElement('span');
    span.classList.add(this.isInline ? 'inline-math' : 'display-math');

    // Check if is tikz.
    // If there is a tikz element, other elements will be ignored.
    let tikz: TikzElement | undefined = undefined;
    for (let child of this.mainParagraph.children) {
      if (child instanceof TikzElement) {
        tikz = child;
        break;
      }
    }

    // Compile the equation
    if (options?.noKatex) {
      let code = document.createElement('code');
      code.append(document.createTextNode(this.getText()));
      span.append(code);
    } else if (tikz) {
      span.append(...tikz.render(options));
    } else {
      render(this.getText(), span, {
        displayMode: !this.isInline,
        output: 'html',
        strict: false,
        throwOnError: false,
      });
    }

    if (!this.isInline && this.tagLeft) {
      let tag = document.createElement('span');
      span.prepend(tag);
      tag.classList.add('equation-tag-left');
      tag.append(...this.tagLeft.renderInner(options));
    }

    if (!this.isInline && this.tagRight) {
      let tag = document.createElement('span');
      span.append(tag);
      tag.classList.add('equation-tag-right');
      tag.append(...this.tagRight.renderInner(options));
    }

    // Add inverse search data
    if (options?.inverseSearch) {
      let lines: number[] = [];
      for (let child of this.children) {
        if (child instanceof SpanElement) {
          for (let text of child.children) {
            if (text.position && text.position.file && !lines.includes(text.position.line))
              lines.push(text.position.line);
          }
        }
      }
      lines.sort((a, b) => a - b);
      if (lines.length > 0)
        span.setAttribute('data-pos', lines.map((l) => (l + 1).toString()).join(','));
    }

    return [span];
  }
}
