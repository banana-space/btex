import { Context } from '../Context';
import { RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { TextNode } from './TextNode';

export class SpanElement implements RenderElement {
  name: 'span' = 'span';
  children: TextNode[] = [];
  style: {
    italic?: boolean;
    bold?: boolean;
    colour?: string;
    fontSize?: number;
    preservesSpaces?: boolean;
    lang?: string;
  } = {};

  // Used for determining whether to add a space after a command, e.g. $\a b$ vs. $\a($
  spacyCommand?: Token;

  static colourRegex: RegExp = /^([0-9a-f]{3}){1,2}$/i;
  static langRegex: RegExp = /^[a-zA-Z\-]+$/i;
  static minFontSize = 6;
  static maxFontSize = 48;

  isEmpty(): boolean {
    return this.children.length === 0;
  }

  // Normalisation is done on the paragraph level, since spans can't see the text around it.
  normalise() {}

  initialise(context: Context) {
    this.style.italic = context.getBoolean('text-italic', false) || undefined;
    this.style.bold = context.getBoolean('text-bold', false) || undefined;
    this.style.colour = context.get('text-colour');
    this.style.fontSize = context.getFloat('text-size', 0) || undefined;
    this.style.lang = context.get('text-lang');
  }

  append(text: string, source: Token) {
    if (this.spacyCommand) {
      if (/^[a-zA-Z]/.test(text)) this.children.push(new TextNode(' ', this.spacyCommand));
      delete this.spacyCommand;
    }

    this.children.push(new TextNode(text, source));
  }

  getText(): string {
    if (this.spacyCommand) {
      this.children.push(new TextNode(' ', this.spacyCommand));
      delete this.spacyCommand;
    }

    let text = '';
    for (let child of this.children) text += child.text;
    return text;
  }

  render(options?: RenderOptions): Node[] {
    function toHTML(text: string): Node[] {
      let result: Node[] = [];
      let lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) result.push(document.createElement('br'));
        if (lines[i]) result.push(document.createTextNode(lines[i]));
      }
      return result;
    }

    let styles = [];
    let fullText = this.getText();

    if (this.style.italic) styles.push('font-style:italic');
    if (this.style.bold) styles.push('font-weight:bold');
    if (this.style.colour && SpanElement.colourRegex.test(this.style.colour))
      styles.push(`color:#${this.style.colour}`);
    if (this.style.fontSize && isFinite(this.style.fontSize)) {
      let fontSize = this.style.fontSize;
      if (fontSize < SpanElement.minFontSize) fontSize = SpanElement.minFontSize;
      if (fontSize > SpanElement.maxFontSize) fontSize = SpanElement.maxFontSize;
      styles.push(`font-size:${fontSize}px`);
    }
    if (this.style.preservesSpaces && /\s/.test(fullText) && fullText !== '\n') {
      styles.push('white-space:pre-wrap');
    }

    if (this.style.lang && !SpanElement.langRegex.test(this.style.lang)) delete this.style.lang;

    if (options?.inverseSearch) {
      // Create <span> tags
      let spans: HTMLSpanElement[] = [];
      let text: string[] = [''];
      let lines: (number | undefined)[] = [undefined];

      for (let child of this.children) {
        let line = child.position?.file ? child.position?.line : undefined;
        if (line === lines[lines.length - 1]) text[text.length - 1] += child.text;
        else {
          text.push(child.text);
          lines.push(line);
        }
      }

      for (let i = 0; i < text.length; i++) {
        if (text[i]) {
          let span = document.createElement('span');
          if (this.style.lang) span.setAttribute('lang', this.style.lang);
          if (styles.length > 0) span.setAttribute('style', styles.join(';'));
          let line = lines[i];
          if (line !== undefined) span.setAttribute('data-pos', (line + 1).toString());
          span.append(...toHTML(text[i]));
          spans.push(span);
        }
      }
      return spans;
    }

    if (!this.style.lang && styles.length === 0) {
      // Create text nodes directly
      return toHTML(fullText);
    } else if (!this.style.lang && styles.length === 1) {
      // Create a <b> or <i> tag
      let name = this.style.bold ? 'b' : this.style.italic ? 'i' : '';
      if (name) {
        let element = document.createElement(name);
        element.append(...toHTML(fullText));
        return [element];
      }
    }

    // Create a <span> tag
    let span = document.createElement('span');
    if (this.style.lang) span.setAttribute('lang', this.style.lang);
    if (styles.length > 0) span.setAttribute('style', styles.join(';'));
    span.append(...toHTML(fullText));
    return [span];
  }
}
