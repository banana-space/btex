import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';
import { Token, TokenType } from '../Token';

export const CommandInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let name = Compiler.readText(code, context, initiator);
    if (name === undefined) return false;

    code.spliceFrom(start, Token.fromParent('\\' + name, TokenType.Command, initiator));
    return true;
  },
};
