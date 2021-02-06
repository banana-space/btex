import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { LabelElement } from '../elements/LabelElement';
import { Internal } from '../Internal';
import { Token, TokenType } from '../Token';

export const LabelInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let initiator = code.token;
    code.step();

    if (!code.canStep()) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let text = Compiler.readText(code, context, initiator);
    if (text === undefined) return false;

    if (context.noOutput || context.container.isInline) return true;

    // TODO: detect conflicting labels

    let label = new Code([Token.fromParent('\\@currentlabel', TokenType.Command, initiator)]);
    let element = new LabelElement(text, context.get('ref-id') ?? '');
    context.labels.push(element);

    context.enterContainer(element, initiator);
    if (!Compiler.compileGroup(label, context, initiator)) return false;
    context.exitContainer();

    return true;
  },
};
