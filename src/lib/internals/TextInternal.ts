import { Code } from '../Code';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const TextInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    if (!code.canStep()) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let group = code.readGroup();
    if (!group) {
      context.throw('UNMATCHED_LEFT_BRACKET', code.token);
      return false;
    }

    if (context.noOutput) return true;

    context.flushSpan();
    context.span.style.preservesSpaces = true;
    for (let token of group.tokens) {
      context.span.append(token.text, token);
    }
    context.flushSpan();

    code.spliceFrom(start);
    return true;
  },
};
