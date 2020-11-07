import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const IfInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let first = Compiler.readText(code, context, initiator);
    if (first === undefined) return false;

    let second = Compiler.readText(code, context, initiator);
    if (second === undefined) return false;

    let third = code.readGroup();
    if (!third) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let fourth = code.readGroup();
    if (!fourth) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let replace = first === second ? third : fourth;
    code.spliceFrom(start, ...replace.tokens);

    return true;
  },
};
