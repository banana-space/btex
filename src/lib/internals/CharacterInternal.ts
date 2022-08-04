import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';
import { Token, TokenType } from '../Token';

export const CharacterInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    if (!code.canStep()) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let text = Compiler.readText(code, context, initiator);
    if (text === undefined) return false;

    let charCode = parseInt(text, 16);
    if (!isFinite(charCode) || charCode < 0 || charCode > 0x10ffff) {
      // TODO: throw 'invalid char code'
      return false;
    }

    let char = String.fromCodePoint(charCode);
    code.spliceFrom(start);
    let token = Token.fromParent(char, TokenType.Text, initiator);
    token.noExpand = true;
    code.tokens.splice(start, 0, token);

    return true;
  },
};
