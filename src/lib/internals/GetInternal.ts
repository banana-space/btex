import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';
import { Token, TokenType } from '../Token';

export const GetInternal: Internal = {
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

    let value = context.get(key);
    if (value === undefined) {
      // TODO: warning
    }

    // TODO: implement get-format (alph, roman, ...)

    if (value) code.spliceFrom(start, Token.fromParent(value, TokenType.Text, initiator));
    else code.spliceFrom(start);
    return true;
  },
};
