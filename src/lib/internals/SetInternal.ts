import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const SetInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    if (!code.canStep()) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let key = Compiler.readText(code, context, initiator);
    if (key === undefined) return false;

    let value = Compiler.readText(code, context, initiator);
    if (value === undefined) return false;

    // TODO: key cannot begin with a number

    let flushSpan = !context.noOutput && key.startsWith('text-') && context.get(key) !== value;

    context.set(key, value);
    if (flushSpan) {
      context.set('text-style-changed', '1');
      context.flushSpan();
    }
    code.spliceFrom(start);
    return true;
  },
};
