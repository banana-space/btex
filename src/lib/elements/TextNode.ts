import { TextPosition, Token } from '../Token';

export class TextNode {
  text: string;
  position?: TextPosition;

  constructor(text: string, source?: Token) {
    this.text = text;
    this.position = source?.source.start;
  }

  render(): Text {
    let h = document.createTextNode(this.text);

    return h;
  }
}
