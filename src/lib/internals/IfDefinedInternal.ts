import { Code } from '../Code';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const IfDefinedInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let first = code.readGroup();
    if (first === undefined || first.tokens.length === 0) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }
    if (first.tokens.length > 1) {
      context.throw('COMMAND_EXPECTED', initiator);
      return false;
    }
    let command = first.tokens[0];

    let second = code.readGroup();
    if (!second) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let third = code.readGroup();
    if (!third) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let replace = context.findCommand(command.text) ? second : third;
    code.spliceFrom(start, ...replace.tokens);

    return true;
  },
};
