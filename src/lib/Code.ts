import { Command } from './Command';
import { Token, TokenType } from './Token';

export class Code {
  tokens: Token[];
  pointer: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  get token(): Token {
    return this.tokenAtOffset(0);
  }

  tokenAtOffset(offset: number): Token {
    let index = this.pointer + offset;
    if (index < 0) index = 0;
    if (index >= this.tokens.length) index = this.tokens.length - 1;
    return this.tokens[index];
  }

  step() {
    if (this.pointer < this.tokens.length) this.pointer++;
  }

  canStep(): boolean {
    return this.pointer < this.tokens.length;
  }

  reset() {
    this.pointer = 0;
  }

  slice(start?: number, end?: number) {
    return new Code(this.tokens.slice(start, end));
  }

  spliceFrom(start: number, ...tokens: Token[]) {
    if (start >= this.pointer) return;
    this.tokens.splice(start, this.pointer - start, ...tokens);
    this.pointer = start;
  }

  findNext(token: { type: TokenType; text: string }): number {
    for (var i = this.pointer; i < this.tokens.length; i++)
      if (Token.equals(this.tokens[i], token)) return i;
    return -1;
  }

  matchGroup(start?: number): number | undefined {
    start ??= this.pointer;
    let nest = 0;
    for (var i = start; i < this.tokens.length; i++) {
      if (this.tokens[i].type === TokenType.BeginGroup) nest++;
      if (this.tokens[i].type === TokenType.EndGroup) nest--;
      if (nest === 0) break;
    }
    if (nest > 0) return;
    return i;
  }

  readGroup(): Code | undefined {
    let t = this.tokens[this.pointer];
    if (t.type === TokenType.BeginGroup) {
      let end = this.matchGroup();
      if (end === undefined) return undefined;

      let code = this.slice(this.pointer + 1, end);
      this.pointer = end + 1;
      return code;
    } else {
      this.pointer++;
      return new Code([t]);
    }
  }

  readSquareBracket(): Code | undefined {
    let t = this.tokens[this.pointer];
    if (t.type === TokenType.Text && t.text === '[') {
      let groupNest = 0,
        nest = 0;
      for (var i = this.pointer; i < this.tokens.length; i++) {
        t = this.tokens[i];
        if (t.type === TokenType.BeginGroup) groupNest++;
        if (t.type === TokenType.EndGroup) groupNest--;
        if (groupNest === 0 && t.type === TokenType.Text && t.text === '[') nest++;
        if (groupNest === 0 && t.type === TokenType.Text && t.text === ']') nest--;
        if (groupNest === 0 && nest === 0) break;
      }
      if (nest > 0 || groupNest > 0) return undefined;

      let code = this.slice(this.pointer + 1, i);
      this.pointer = i + 1;
      return code;
    } else {
      return undefined;
    }
  }

  // When strict: false, does nothing if matching fails
  expandMacro(command: Command, strict: boolean = true): boolean {
    let start = this.pointer;
    let initiator = this.token;
    let match: Code | undefined;
    let argNames: string[] = [];
    let args: Code[] = [];

    for (let definition of command.definitions) {
      this.pointer = start + 1;
      let pattern = definition.pattern;
      pattern.reset();
      argNames = [];
      args = [];

      // every loop matches one argument
      while (pattern.canStep()) {
        if (!this.canStep()) break; // match fails

        // skip leading whitespaces unless pattern begins with a newline
        if (!(pattern.token.type === TokenType.Whitespace && pattern.token.text === '\n')) {
          while (this.canStep() && this.token.type === TokenType.Whitespace) this.step();
          while (pattern.canStep() && pattern.token.type === TokenType.Whitespace) pattern.step();
        }

        // the parts between arguments need exact matching
        let fails = false;
        while (pattern.canStep() && pattern.token.type !== TokenType.Argument) {
          // allow extra whitespace before '['
          if (pattern.token.type === TokenType.Text && pattern.token.text === '[') {
            while (this.canStep() && this.token.type === TokenType.Whitespace) this.step();
          }

          if (!(this.canStep() && Token.equals(this.token, pattern.token))) {
            fails = true;
            break;
          }
          this.step();
          pattern.step();
        }
        if (fails) break;

        if (!pattern.canStep()) break; // match completed

        // Now, the pointer is right at the argument #N.
        // Short arguments match either one group or one token; long arguments can match more.
        // By default only [#N] is long; #+N and #-N specify long and short arguments.
        let p = pattern.pointer;
        let isSquareBracket =
          pattern.tokens[p - 1]?.type === TokenType.Text &&
          pattern.tokens[p + 1]?.type === TokenType.Text &&
          pattern.tokens[p - 1]?.text === '[' &&
          pattern.tokens[p + 1]?.text === ']';
        let longArgument = isSquareBracket;
        if (/^#+\+/.test(pattern.token.text)) longArgument = true;
        if (/^#+-/.test(pattern.token.text)) longArgument = false;
        if (p === pattern.tokens.length - 1) longArgument = false;

        argNames.push(pattern.token.text.replace(/^(#+)[\+\-]/, '$1'));
        pattern.step();

        // match the argument
        while (this.canStep() && this.token.type === TokenType.Whitespace) this.step();
        if (!this.canStep() || this.token.type === TokenType.EndGroup) break; // match fails

        if (isSquareBracket && longArgument) {
          this.pointer--;
          let result = this.readSquareBracket();
          if (!result) break;
          this.pointer--;

          args.push(result);
          continue;
        } else if (longArgument) {
          let lookFor = pattern.tokens[p + 1];
          for (var i = this.pointer; i < this.tokens.length; i++) {
            let t = this.tokens[i];
            if (t.type === TokenType.BeginGroup) {
              let m = this.matchGroup(i);
              if (m === undefined) break;
              i = m;
              continue;
            }
            if (t.type === TokenType.EndGroup) break;
            if (Token.equals(lookFor, t)) break;
          }

          if (i < this.tokens.length && Token.equals(lookFor, this.tokens[i])) {
            // match succeeds
            args.push(this.slice(this.pointer, i));
            this.pointer = i;
            continue;
          } else break;
        } else {
          let result = this.readGroup();
          if (!result) break;

          args.push(result); // match succeeds
          continue;
        }
      }

      if (!pattern.canStep()) {
        match = definition.replace;
        break;
      }
    }

    if (!match) {
      if (strict) {
        this.pointer = start + 1;
        this.spliceFrom(start);
      } else {
        this.pointer = start;
      }
      return false;
    }

    // replace
    let replace: Token[] = [];

    for (match.reset(); match.canStep(); match.step()) {
      let t = match.token;
      if (t.type !== TokenType.Argument) {
        replace.push(Token.cloneAsChildOf(t, initiator));
        continue;
      }

      let index = argNames.indexOf(t.text);
      if (index === -1) {
        let cloned = Token.cloneAsChildOf(t, initiator);
        if (cloned.text.startsWith('##')) cloned.text = cloned.text.substring(1);
        replace.push(cloned);
        continue;
      }

      // For #N -> tokens, the source token should not be the initiator!
      replace.push(...args[index].tokens.map((t) => Token.cloneAsChildOf(t, t)));
    }

    this.spliceFrom(start, ...replace);
    return true;
  }
}
