import { Code } from './Code';
import { Context } from './Context';
import { RootElement } from './elements/RootElement';
import { Internals } from './Internal';
import { Token, TokenType } from './Token';

export interface CompilerOptions {
  /**
   * Max number of errors before giving up.
   * @default 100
   */
  maxErrors: number;

  /**
   * Max number of macro expansions before giving up.
   * @default 50000
   */
  maxMacroExpansions: number;

  /**
   * Max number of tokens allowed during macro expansion.
   * @default 1000000
   */
  maxBuffer: number;

  /**
   * Max number of nesting groups and environments.
   * @default 1000
   */
  maxNesting: number;

  /**
   * Whether to compile in inline mode (disallow paragraph breaks).
   * @default false
   */
  inline: boolean;

  /**
   * Whether to regard the source as the part between $...$ in an equation.
   * @default false
   */
  equationMode: boolean;
}

export const defaultCompilerOptions: CompilerOptions = {
  maxErrors: 100,
  maxMacroExpansions: 50000,
  maxBuffer: 1000000,
  maxNesting: 1000,
  inline: false,
  equationMode: false,
};

export abstract class Compiler {
  static compile(code: Code, context: Context): boolean {
    let result = this.compileGroup(code, context, code.tokens[code.tokens.length - 1], true);

    if (!result) {
      // Clear all output by replacing it with an empty element
      context.root = new RootElement();
      context.root.normalise();
      return false;
    }

    context.finalise();
    return true;
  }

  // Compiles `code` as a group in the `context`.
  // Returns false if compiling cannot proceed even when trying to ignore errors.
  // The result is stored in `context`, and `code` is turned into a fully expanded form.
  // `nextToken` should be the '}' immediately after the group, used for error reporting.
  static compileGroup(
    code: Code,
    context: Context,
    nextToken: Token,
    isGlobal: boolean = false
  ): boolean {
    function isMathMode(): boolean {
      return context.getBoolean('g.math-mode', false);
    }

    function isTextArg(): boolean {
      return context.getBoolean('c-text-arg', false);
    }

    function isInternalLinkArg(): boolean {
      return context.getBoolean('c-link-arg', false);
    }

    let parent = context;
    let options = context.options;
    if (!isGlobal) context = context.passToSubgroup();
    if (context._nesting > options.maxNesting) {
      context.throw('MAX_NESTING_EXCEEDED', nextToken, options.maxNesting.toString());
      return false;
    }

    code.pointer = 0;
    while (code.pointer < code.tokens.length) {
      if (code.tokens.length > options.maxBuffer) {
        context.throw('MAX_TOKENS_EXCEEDED', nextToken, options.maxBuffer.toString());
        return false;
      }

      let i = code.pointer;
      let t = code.tokens[i];
      let mathMode = isMathMode();

      switch (t.type) {
        case TokenType.BeginGroup:
          let group = code.readGroup();
          if (group === undefined) {
            if (context.throw('UNMATCHED_LEFT_BRACKET', t) > options.maxErrors) return false;
            code.step();
            break;
          }

          // Replace {{...}} by \@@fun{...}
          let isDoubleBrace =
            !mathMode &&
            group.tokens[0]?.type === TokenType.BeginGroup &&
            group.matchGroup(0) === group.tokens.length - 1;
          if (isDoubleBrace) {
            group.tokens.splice(0, 0, Token.fromParent('\\@@fun', TokenType.Command, t));
          }

          let preserveBrackets = !context.noOutput && isMathMode();
          if (preserveBrackets) context.span.append('{', t);
          let result = this.compileGroup(group, context, code.tokenAtOffset(-1));
          if (preserveBrackets) context.span.append('}', code.tokenAtOffset(-1));

          if (!result) return false;
          break;

        case TokenType.EndGroup:
          if (context.throw('UNMATCHED_RIGHT_BRACKET', t) > options.maxErrors) return false;
          code.step();
          break;

        case TokenType.Command:
        case TokenType.Special:
          if (context.recordExpansion() > options.maxMacroExpansions) {
            context.throw('MAX_EXPANSIONS_EXCEEDED', t, options.maxMacroExpansions.toString());
            return false;
          }

          let name = t.type === TokenType.Command ? t.text : t.specialCommand;
          if (!name) {
            code.step();
            break;
          }

          let internal = Internals[name];
          if (internal) {
            result = internal.execute(code, context);
            if (!result) return false;
            break;
          }

          let command = context.findCommand(name);
          if (!command || (mathMode && command.isTextCommand)) {
            if (mathMode) {
              context.span.append(name, t);
              if (/[a-zA-Z]$/.test(name)) context.span.spacyCommand = t;
            } else {
              if (context.throw('UNDEFINED_COMMAND', t, name) > options.maxErrors) return false;

              if (!context.noOutput) {
                context.set('text-class-error', '1');
                context.flushSpan();
                context.span.append(name, t);
                context.set('text-class-error', undefined);
                context.flushSpan();
              }
            }
            code.step();
            break;
          }

          result = code.expandMacro(command);
          if (!result) {
            if (context.throw('NO_MATCHING_DEFINITIONS', t, name) > options.maxErrors) return false;
          }

          break;

        case TokenType.Text:
        case TokenType.Whitespace:
          if (!isTextArg() || isInternalLinkArg()) {
            command = context.findCommand(t.text);
            if (command && !(isMathMode() && command.isTextCommand) && !t.noExpand) {
              if (code.expandMacro(command, false)) break;
            }
          }

          if (!context.noOutput) {
            // Whitespaces with TokenType.Text should be preserved
            if (t.type === TokenType.Text && /^\s$/.test(t.text)) {
              context.flushSpan();
              context.span.style.preservesSpaces = true;
              context.span.append(t.text, t);
              context.flushSpan();
            } else {
              let text = t.type === TokenType.Whitespace ? ' ' : t.text;
              context.span.append(text, t);
            }
          }
          code.step();
          break;

        case TokenType.Argument:
          if (!context.noOutput) {
            context.span.append(t.text, t);
          }
          code.step();
          break;

        default:
          code.step();
          break;
      }
    }

    if (isGlobal) {
      // All compiling has finished
      context.flushSpan();
      return true;
    } else {
      return parent.collectFromSubgroup(context, nextToken);
    }
  }

  static readText(code: Code, context: Context, initiator: Token): string | undefined {
    if (!code.canStep()) {
      context.throw('ARGUMENT_EXPECTED', code.token);
      return;
    }

    let group = code.readGroup();
    if (group === undefined) {
      context.throw('UNMATCHED_LEFT_BRACKET', code.token);
      return;
    }

    let noOutput = context.noOutput;
    context.noOutput = true;
    context.set('c-text-arg', '1');
    this.compileGroup(group, context, code.tokenAtOffset(-1));
    context.set('c-text-arg', '');
    context.noOutput = noOutput;

    let text = '';
    group.pointer = 0;
    while (group.pointer < group.tokens.length) {
      let t = group.token;

      switch (t.type) {
        case TokenType.BeginGroup:
          let result = this.readText(group, context, initiator);
          if (result === undefined) return;

          let value = context.get(result);
          if (value !== undefined) result = value;

          text += result;
          break;

        case TokenType.Text:
        case TokenType.Whitespace:
        case TokenType.Argument:
          text += t.text;
          group.step();
          break;

        default:
          context.throw('PLAIN_TEXT_EXPECTED', initiator);
          return;
      }
    }

    return text;
  }
}
