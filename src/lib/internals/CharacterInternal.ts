import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const CharacterInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    if (!code.canStep()) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let text = Compiler.readText(code, context, initiator);
    if (text === undefined) return false;

    let charCode = parseInt(text, 16);
    if (!isFinite(charCode) || charCode < 0 || charCode > 0x10ffff) {
      // TODO: throw 'invalid char code'
      return false;
    }

    if (!context.noOutput) {
      let char = String.fromCodePoint(charCode);
      let isWhitespace = /\s/.test(char);
      if (isWhitespace) {
        context.flushSpan();
        context.span.style.preservesSpaces = true;
        context.span.append(char, initiator);
        context.flushSpan();
      } else {
        context.span.append(char, initiator);
      }
      code.spliceFrom(start);
    }
    return true;
  },
};
