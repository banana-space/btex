export enum TokenType {
  Whitespace,
  Text,
  BeginGroup,
  EndGroup,
  Special,
  Command,
  Argument,
}

export interface TextPosition {
  file?: string;
  line: number;
  col: number;
}

export class Token {
  text: string;
  type: TokenType;
  start?: TextPosition;
  end?: TextPosition;
  source: Token;
  noExpand?: boolean;
  specialCommand?: string;

  private constructor(text: string, type: TokenType, start?: TextPosition, end?: TextPosition) {
    this.text = text;
    this.type = type;
    this.start = start;
    this.end = end;
    this.source = this;
  }

  static fromCode(text: string, type: TokenType, start: TextPosition, end: TextPosition): Token {
    return new Token(text, type, start, end);
  }

  static fromParent(text: string, type: TokenType, parent: Token): Token {
    let token = new Token(text, type);
    token.source = parent.source;
    return token;
  }

  static cloneAsChildOf(token: Token, parent: Token): Token {
    return Token.fromParent(token.text, token.type, parent);
  }

  static equals(left: { type: TokenType; text: string }, right: { type: TokenType; text: string }) {
    return left.type === right.type && left.text === right.text;
  }
}
