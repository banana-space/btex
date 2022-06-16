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
        .replace(/\n\s*?(?=\n)/g, '\n')
        .replace(/\t/g, '    ') + ' ';

    let tokens: Token[] = [];
    let line = 0;
    let lineStart = 0;
    let ignoreSpace = false;

    // For '*' lists
    let currentIndent = -1;
    let lastLineWasEmpty = true;
    let currentLineHasBullet = false;
    let listIndentStack = [-1];

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
          lastLineWasEmpty = currentIndent === -1;
          currentIndent = -1;
          currentLineHasBullet = false;
        } else if (!ignoreSpace) {
          tokens.push(Token.fromCode(ch, TokenType.Whitespace, pos(i), pos(i + 1)));
        }
        continue;
      }

      // Handle indentation change
      if (currentIndent === -1) {
        currentIndent = i - lineStart;

        if (!currentLineHasBullet) {
          // Insert end-list tokens before any newlines, because some commands search for '\n\n==' etc.
          let insertPosition = tokens.length;
          while (tokens[insertPosition - 1]?.type === TokenType.Whitespace) insertPosition--;

          while (
            listIndentStack[listIndentStack.length - 1] >=
            currentIndent + (lastLineWasEmpty ? 0 : 1)
          ) {
            listIndentStack.pop();
            let listEndToken = Token.fromCode('', TokenType.Special, pos(i), pos(i));
            listEndToken.specialCommand = '\\@bulletendlist';
            tokens.splice(insertPosition, 0, listEndToken);
          }
        }
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

          let commandName = text.substring(i, j);
          tokens.push(Token.fromCode(commandName, TokenType.Command, pos(i), pos(j)));
          i = j - 1;
          ignoreSpace = !/^\\[^a-zA-Z]$/.test(commandName);

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
          let token = Token.fromCode(ch, TokenType.Text, pos(i), pos(i + ch.length));

          // line started by '* '
          if (currentIndent === i - lineStart) {
            if (ch === '*' && (text[i + 1] === ' ' || text[i + 1] === '\n')) {
              token.type = TokenType.Special;
              token.specialCommand = lastLineWasEmpty ? '\\@bulletitem' : '\\@bulletitemnosep';
              currentLineHasBullet = true;

              while (listIndentStack[listIndentStack.length - 1] > i - lineStart) {
                listIndentStack.pop();

                let listEndToken = Token.fromParent('', TokenType.Special, token);
                listEndToken.specialCommand = '\\@bulletendlist';
                tokens.push(listEndToken);
              }

              if (listIndentStack[listIndentStack.length - 1] < i - lineStart) {
                listIndentStack.push(i - lineStart);

                let listStartToken = Token.fromParent('', TokenType.Special, token);
                listStartToken.specialCommand = '\\@bulletbeginlist';
                tokens.push(listStartToken);
              }
            }
          }

          tokens.push(token);
          i += ch.length - 1;
          break;
      }
    }

    // End unended lists
    while (listIndentStack.length > 1) {
      listIndentStack.pop();

      let listEndToken = Token.fromCode(
        '',
        TokenType.Special,
        pos(text.length - 1),
        pos(text.length - 1)
      );
      listEndToken.specialCommand = '\\@bulletendlist';
      tokens.push(listEndToken);
    }

    return new Code(tokens);
  }
}
