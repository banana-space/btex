import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { ParagraphElement } from './ParagraphElement';
import request from 'sync-request';
import { URL } from 'url';
import { Token } from '../Token';
import { MathElement } from './MathElement';

export class TikzElement implements ContainerElement {
  name: 'tikz' = 'tikz';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;
  variant: string = 'tikzpicture';
  noRender: boolean = false;
  initiator?: Token;
  svg?: string;

  isEmpty(): boolean {
    return !this.getText();
  }

  normalise() {}

  getText(): string {
    return this.paragraph.getText();
  }

  event(name: string, context: Context, initiator: Token) {
    switch (name) {
      case 'par':
        return true;
    }
    context.throw('UNKNOWN_EVENT', initiator, name);
    return false;
  }

  enter(context: Context, initiator: Token) {
    this.variant = context.get('tikz-variant') === 'tikzcd' ? 'tikzcd' : 'tikzpicture';

    let container = context.container;
    if (container instanceof MathElement && container.isInline) {
      context.throw('TIKZ_IN_INLINE_MODE', initiator);
      this.noRender = true;
    }

    this.initiator = initiator;
  }

  render(options?: RenderOptions): Node[] {
    if (this.noRender) return [];

    let url = new URL('http://127.0.0.1:9292');
    url.searchParams.append('type', this.variant);

    let text = this.getText().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
    url.searchParams.append('tex', text);

    if (this.svg === undefined) {
      this.svg = '';
      let body: string | Buffer = '';
      try {
        body = request('POST', url).body;
        if (body instanceof Buffer) {
          body = body.toString();
        }
      } catch {}

      if (body && typeof body === 'string') {
        // rescale 1pt -> 0.11em for better display
        // (originally 10pt = 1em; but we scale all math 110% for clarity)
        // and resolve <glyph id=""> clash
        let rand = '';
        for (let i = 0; i < 16; i++) rand += Math.floor(Math.random() * 16).toString(16);
        this.svg = body
          .replace(/\n\s*/g, '')
          .replace(/^<\?xml[^>]*\?>/, '')
          .replace(/width="([\d\.]+)(pt)?"/, function (_, width) {
            return 'width="' + width * 0.11 + 'em"';
          })
          .replace(/height="([\d\.]+)(pt)?"/, function (_, height) {
            return 'height="' + height * 0.11 + 'em"';
          })
          .replace(/(id="|href="#|url\(#)/g, '$1' + rand);
      }
    }

    if (this.svg) {
      let div = document.createElement('div');
      div.innerHTML = this.svg;

      let element = div.firstChild;
      if (element) return [element];
    }

    let span = document.createElement('span');
    span.classList.add('error');
    span.append(document.createTextNode('[TikZ 编译错误]'));

    if (options?.inverseSearch && this.initiator) {
      span.setAttribute('data-pos', ((this.initiator.start?.line ?? 0) + 1).toString());
    }

    return [span];
  }
}
