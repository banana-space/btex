import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const ExitInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let name = Compiler.readText(code, context, initiator);
    if (name === undefined) return false;

    if (context.noOutput) return true;

    if (name === 'group') {
      if (context.semisimple.length === 0) {
        context.throw('UNMATCHED_SEMISIMPLE', initiator, name);
        return false;
      }

      context.exitSemisimple();
    } else {
      if (context.stack.length <= 1 || name !== context.container.name) {
        context.throw('UNMATCHED_EXIT_CONTAINER', initiator, name);
        return false;
      }

      context.exitContainer();
    }

    code.spliceFrom(start);
    return true;
  },
};
