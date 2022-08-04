import { Code } from '../Code';
import { Command } from '../Command';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internals, Internal } from '../Internal';
import { Token, TokenType } from '../Token';

export const DefineInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    if (!code.canStep()) {
      context.throw('COMMAND_EXPECTED', initiator);
      return false;
    }

    let t = code.token;
    let name = t.text;

    if (name === '@') {
      let defName = context.get('def-name', true);
      if (defName === undefined) {
        context.throw('INVALID_COMMAND_NAME', t, '\\');
        return false;
      }
      name = '\\' + defName;
    } else {
      if (
        (t.type !== TokenType.Command &&
          t.type !== TokenType.Text &&
          t.type !== TokenType.Whitespace) ||
        Internals[name]
      ) {
        context.throw('INVALID_COMMAND_NAME', t, t.text);
        return false;
      }
    }

    // LaTeX style \newcommand{command}[numArgs][defaultValues]{definition}.
    // Could be implemented using btex only, but it would be ugly.
    let latexStyle = context.getBoolean('def-latex-style', false, true);
    if (latexStyle) {
      code.step();
      let isSquareBracket = code.token.type === TokenType.Text && code.token.text === '[';
      let totalArgs = 0;
      if (isSquareBracket) {
        let first = code.readSquareBracket();
        if (first && first.tokens.length === 1 && first.token.type === TokenType.Text) {
          let int = parseInt(first.token.text) ?? 0;
          if (int >= 0 && int <= 9) totalArgs = int;
        } else {
          context.throw('NO_MATCHING_DEFINITIONS', initiator);
          return false;
        }
      }

      let defaultValues: Code[] = [];
      for (let i = 0; i < totalArgs; i++) {
        while (code.canStep() && code.token.type === TokenType.Whitespace) code.step();
        isSquareBracket = code.token.type === TokenType.Text && code.token.text === '[';
        if (!isSquareBracket) break;

        let value = code.readSquareBracket();
        if (!value) {
          context.throw('NO_MATCHING_DEFINITIONS', initiator);
          return false;
        }

        defaultValues.push(value);
      }

      if (code.token.type === TokenType.Text && code.token.text === '[') {
        context.throw('NO_MATCHING_DEFINITIONS', initiator);
        return false;
      }

      // Now the pointer should be at the '{' opening the definition.
      // We do not touch the actual definition part after it; we replace the part before it.
      // This process requires \@pdef to be defined.
      context.set('def-prepend', undefined);
      context.set('def-append', undefined);
      context.set('def-expand', undefined);

      let tokens: Token[] = [];
      let optionalArgs = defaultValues.length;
      for (let i = 0; i <= optionalArgs; i++) {
        // \pdef <cmd> [#(o - i + 1)] ... [#o] #(o + 1) ... #n {<cmd> [#1] ... [#o] {#(o + 1)} ... {#n}}
        tokens.push(Token.fromParent(i ? '\\@pdef' : '\\@@def', TokenType.Command, initiator));
        tokens.push(Token.fromParent(name, TokenType.Command, initiator));
        for (let j = optionalArgs - i + 1; j <= optionalArgs; j++) {
          tokens.push(Token.fromParent('[', TokenType.Text, initiator));
          tokens.push(Token.fromParent('#' + j, TokenType.Argument, initiator));
          tokens.push(Token.fromParent(']', TokenType.Text, initiator));
        }
        for (let j = optionalArgs + 1; j <= totalArgs; j++) {
          tokens.push(Token.fromParent('#' + j, TokenType.Argument, initiator));
        }
        if (i === optionalArgs) break;

        tokens.push(Token.fromParent('{', TokenType.BeginGroup, initiator));
        tokens.push(Token.fromParent(name, TokenType.Command, initiator));
        for (let j = 1; j <= optionalArgs - i; j++) {
          tokens.push(Token.fromParent('[', TokenType.Text, initiator));
          tokens.push(...defaultValues[j - 1].tokens);
          tokens.push(Token.fromParent(']', TokenType.Text, initiator));
        }
        for (let j = optionalArgs - i + 1; j <= optionalArgs; j++) {
          tokens.push(Token.fromParent('[', TokenType.Text, initiator));
          tokens.push(Token.fromParent('#' + j, TokenType.Argument, initiator));
          tokens.push(Token.fromParent(']', TokenType.Text, initiator));
        }
        for (let j = optionalArgs + 1; j <= totalArgs; j++) {
          tokens.push(Token.fromParent('{', TokenType.BeginGroup, initiator));
          tokens.push(Token.fromParent('#' + j, TokenType.Argument, initiator));
          tokens.push(Token.fromParent('}', TokenType.EndGroup, initiator));
        }
        tokens.push(Token.fromParent('}', TokenType.EndGroup, initiator));
      }

      code.spliceFrom(start, ...tokens);
      return true;
    }

    let bracketStart = code.findNext({ type: TokenType.BeginGroup, text: '{' } as Token);
    if (bracketStart === -1) {
      context.throw('TOKEN_EXPECTED', initiator, '{');
      return false;
    }

    code.pointer = bracketStart;
    let pattern = code.slice(start + 2, bracketStart);
    let replace = code.readGroup();
    if (!replace) return false;

    // TODO: check for repeated arg names in pattern
    // TODO: nested args must be escaped as ##N in replace; args must not be escaped in pattern

    let command = context.newCommands[name];
    if (!command) {
      command = context.findCommand(name)?.clone() ?? new Command(name);
    }

    let overwrite = true;
    if (context.getBoolean('def-expand', false, true)) {
      let noOutput = context.noOutput;
      context.noOutput = true;
      Compiler.compileGroup(replace, context, code.tokenAtOffset(-1));
      context.noOutput = noOutput;
    }
    if (context.getBoolean('def-patch', false, true)) {
      for (let def of command.definitions) {
        def.replace.tokens.push(...replace.tokens);
      }
      overwrite = false;
    }
    if (context.getBoolean('def-prepend', false, true)) {
      command.definitions.splice(0, 0, { pattern, replace });
      overwrite = false;
    }
    if (context.getBoolean('def-append', false, true)) {
      command.definitions.push({ pattern, replace });
      overwrite = false;
    }
    if (overwrite) {
      command.definitions = [{ pattern, replace }];
    }
    if (context.get('def-global') !== undefined)
      command.isGlobal = context.getBoolean('def-global', false, true);
    if (overwrite || context.get('def-text') !== undefined)
      command.isTextCommand = context.getBoolean('def-text', false, true);
    context.defineCommand(command);

    code.spliceFrom(start);
    return true;
  },
};
