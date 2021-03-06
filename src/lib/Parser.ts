import { Code } from './Code';
import { TextPosition, Token, TokenType } from './Token';

export abstract class Parser {
  /**
   * Converts `text` to a list of tokens.
   */
  static parse(text: string, file?: string): Code {
    text =
      text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n\s*\n/g, '\n\n') + ' ';

    let tokens: Token[] = [];
    let line = 0;
    let lineStart = 0;
    let ignoreSpace = false;

    function pos(i: number): TextPosition {
      return { line, col: i - lineStart, file };
    }

    function charAt(i: number): string {
      let codePoint = text.codePointAt(i) ?? 0;
      return text.substr(i, codePoint > 0xffff ? 2 : 1);
    }

    for (let i = 0; i < text.length - 1; i++) {
      let ch = charAt(i);

      // whitespaces
      if (/^\s$/.test(ch)) {
        if (ch === '\n') {
          tokens.push(Token.fromCode('\n', TokenType.Whitespace, pos(i), pos(i + 1)));
          line++;
          lineStart = i + 1;
        } else if (!ignoreSpace) {
          tokens.push(Token.fromCode(ch, TokenType.Whitespace, pos(i), pos(i + 1)));
        }
        continue;
      }

      ignoreSpace = false;
      switch (ch) {
        // specials
        case '{':
          tokens.push(Token.fromCode('{', TokenType.BeginGroup, pos(i), pos(i + 1)));
          break;

        case '}':
          tokens.push(Token.fromCode('}', TokenType.EndGroup, pos(i), pos(i + 1)));
          break;

        // comments
        case '%':
          while (i < text.length - 1 && charAt(i) !== '\n') i++;
          ignoreSpace = true;
          line++;
          lineStart = i + 1;
          break;

        // commands
        case '\\':
          var first = charAt(i + 1);
          if (/^[a-zA-Z@]/.test(first)) {
            var j = i + 1;
            while (text[j] === '@') j++;
            while (/^[a-zA-Z]/.test(text[j])) j++;
          } else {
            var j = i + 1 + first.length;
            if (first === '\n') j--;
          }

          tokens.push(Token.fromCode(text.substring(i, j), TokenType.Command, pos(i), pos(j)));
          i = j - 1;
          ignoreSpace = true;

          if (first === '\n') {
            line++, i++;
            lineStart = i + 1;
          }
          break;

        // arguments
        case '#':
          var j = i + 1;
          while (text[j] === '#') j++;
          if (text[j] === '+' || text[j] === '-') j++;
          var first = charAt(j);
          if (/^[a-zA-Z]/.test(first)) {
            while (/^[a-zA-Z]/.test(text[j])) j++;
            ignoreSpace = true;
          } else {
            j += first.length;
            if (first === '\n') j--;
          }

          tokens.push(Token.fromCode(text.substring(i, j), TokenType.Argument, pos(i), pos(j)));
          i = j - 1;

          if (first === '\n') {
            line++, i++;
            lineStart = i + 1;
          }
          break;

        // text
        default:
          // TODO: remove invalid characters
          tokens.push(Token.fromCode(ch, TokenType.Text, pos(i), pos(i + ch.length)));
          i += ch.length - 1;
          break;
      }
    }

    return new Code(tokens);
  }
}
