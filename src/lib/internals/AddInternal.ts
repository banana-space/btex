import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const AddInternal: Internal = {
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

    let arg = Compiler.readText(code, context, initiator);
    if (arg === undefined) return false;

    let value = context.get(key);
    if (value === undefined) {
      // TODO: error
      return false;
    }

    let newValue = parseInt(value);
    newValue += parseInt(arg);
    if (Number.isSafeInteger(newValue)) {
      context.set(key, newValue.toString());
    } else {
      // TODO: error
      return false;
    }

    code.spliceFrom(start);
    return true;
  },
};
