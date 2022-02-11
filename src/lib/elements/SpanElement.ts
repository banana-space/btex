import { Context } from '../Context';
import { RenderElement, RenderOptions } from '../Element';
import { Token } from '../Token';
import { TextNode } from './TextNode';

export interface SpanStyle {
  italic?: boolean;
  bold?: boolean;
  colour?: string;
  fontSize?: number;
  preservesSpaces?: boolean;
  lang?: string;
  classes?: string;
  sup?: boolean;
  sub?: boolean;
}

export class SpanElement implements RenderElement {
  name: 'span' = 'span';
  children: TextNode[] = [];
  style: SpanStyle = {};

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
    this.style.sup = context.getBoolean('text-sup', false);
    this.style.sub = context.getBoolean('text-sub', false);

    this.style.classes = '';
    if (context.getBoolean('text-class-error', false)) this.style.classes += ' error';
    if (context.getBoolean('text-class-header', false)) this.style.classes += ' item-header';
    this.style.classes = this.style.classes.trim();
  }

  canMergeWith(span: SpanElement): boolean {
    return (
      (this.style.italic ?? false) === (span.style.italic ?? false) &&
      (this.style.bold ?? false) === (span.style.bold ?? false) &&
      this.style.colour === span.style.colour &&
      this.style.fontSize === span.style.fontSize &&
      (this.style.preservesSpaces ?? false) === (span.style.preservesSpaces ?? false) &&
      this.style.lang === span.style.lang &&
      (this.style.classes ?? '') === (span.style.classes ?? '') &&
      (this.style.sup ?? false) === (span.style.sup ?? false) &&
      (this.style.sub ?? false) === (span.style.sub ?? false)
    );
  }

  append(text: string, source?: Token) {
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
      text = text.normalize('NFC');
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

    let tagName = 'span';
    if (this.style.sub && !this.style.sup) tagName = 'sub';
    if (this.style.sup && !this.style.sub) tagName = 'sup';

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
          let span = document.createElement(tagName);
          if (this.style.classes) span.setAttribute('class', this.style.classes);
          if (styles.length > 0) span.setAttribute('style', styles.join(';'));
          if (this.style.lang) span.setAttribute('lang', this.style.lang);
          let line = lines[i];
          if (line !== undefined) span.setAttribute('data-pos', (line + 1).toString());
          span.append(...toHTML(text[i]));
          spans.push(span);
        }
      }
      return spans;
    }

    if (!this.style.lang && !this.style.classes && tagName === 'span') {
      if (styles.length === 0) {
        // Create text nodes directly
        return toHTML(fullText);
      } else if (styles.length === 1) {
        // Create a <b> or <i> tag
        let name = this.style.bold ? 'b' : this.style.italic ? 'i' : '';
        if (name) {
          let element = document.createElement(name);
          element.append(...toHTML(fullText));
          return [element];
        }
      }
    }

    // Create a <span> tag
    let span = document.createElement(tagName);
    if (this.style.lang) span.setAttribute('lang', this.style.lang);
    if (styles.length > 0) span.setAttribute('style', styles.join(';'));
    if (this.style.classes) span.setAttribute('class', this.style.classes);
    span.append(...toHTML(fullText));
    return [span];
  }
}
