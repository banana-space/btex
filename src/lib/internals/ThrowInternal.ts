import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { CompilerErrorType } from '../CompilerError';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const ThrowInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let initiator = code.token;
    code.step();

    let text = Compiler.readText(code, context, initiator);
    if (text === undefined) return false;

    // TODO: check text
    context.throw(text as CompilerErrorType, initiator);

    return false;
  },
};
