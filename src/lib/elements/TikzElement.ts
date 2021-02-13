import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { ParagraphElement } from './ParagraphElement';
import request from 'sync-request';
import { URL } from 'url';
import { Token } from '../Token';

export class TikzElement implements ContainerElement {
  name: 'tikz' = 'tikz';
  paragraph: ParagraphElement = new ParagraphElement();
  isInline: boolean = true;
  variant: string = 'tikzpicture';

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

  enter(context: Context) {
    this.variant = context.get('tikz-variant') === 'tikzcd' ? 'tikzcd' : 'tikzpicture';
  }

  render(options?: RenderOptions): Node[] {
    let url = new URL('http://127.0.0.1:9292');
    url.searchParams.append('type', this.variant);

    let text = this.getText().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
    url.searchParams.append('tex', text);

    let svg = '';
    let body = request('POST', url).body;
    if (body instanceof Buffer) {
      body = body.toString();
    }
    if (typeof body === 'string') {
      // rescale 1pt -> 0.1em for better display
      svg = body
        .replace(/\n\s*/g, '')
        .replace(/^<\?xml[^>]*\?>/, '')
        .replace(/width="([\d\.]+)(pt)?"/, function (_, width) {
          return 'width="' + width * 0.1 + 'em"';
        })
        .replace(/height="([\d\.]+)(pt)?"/, function (_, height) {
          return 'height="' + height * 0.1 + 'em"';
        });
    }

    if (svg) {
      let div = document.createElement('div');
      div.innerHTML = svg;

      let element = div.firstChild;
      if (element) return [element];
    }

    let span = document.createElement('span');
    span.classList.add('error');
    span.append(document.createTextNode('[TikZ 编译错误]'));
    return [span];
  }
}
