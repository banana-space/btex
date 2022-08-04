import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const EventInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let arg = Compiler.readText(code, context, initiator);
    if (arg === undefined) return false;

    if (context.container.isInline && arg === 'par') {
      context.throw('NO_PARAGRAPHS_IN_INLINE_MODE', initiator);
      return false;
    }

    if (context.noOutput) return true;

    if (!context.container.event) {
      // TODO: warning
      return true;
    }

    context.flushSpan();
    if (!context.container.event(arg, context, initiator)) return false;

    code.spliceFrom(start);
    return true;
  },
};
