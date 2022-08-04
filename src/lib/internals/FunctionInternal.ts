import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Containers } from '../Element';
import { FunctionElement } from '../elements/FunctionElement';
import { Internal } from '../Internal';
import { Token, TokenType } from '../Token';

export const FunctionInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let arg = code.readGroup();
    if (!arg) {
      context.throw('UNMATCHED_LEFT_BRACKET', initiator);
      return false;
    }

    let pipePositions: number[] = [-1];
    let nest = 0;

    for (let j = 0; j < arg.tokens.length; j++) {
      if (arg.tokens[j].type === TokenType.BeginGroup) nest++;
      if (arg.tokens[j].type === TokenType.EndGroup) nest--;
      if (nest === 0 && arg.tokens[j].type === TokenType.Text && arg.tokens[j].text === '|')
        pipePositions.push(j);
    }
    pipePositions.push(arg.tokens.length);

    let container = new FunctionElement();
    for (let i = 1; i < pipePositions.length; i++) {
      let fragment = arg.slice(pipePositions[i - 1] + 1, pipePositions[i]);

      if (i === 1) {
        fragment.tokens.splice(0, 0, Token.fromParent('{', TokenType.BeginGroup, initiator));
        fragment.tokens.splice(
          fragment.tokens.length,
          0,
          Token.fromParent('}', TokenType.EndGroup, initiator)
        );

        let name = Compiler.readText(fragment, context, initiator);
        if (name === undefined) return false;

        context.set('fun-name', name);
        context.enterContainer(container, initiator);

        // use ',' as separator for biblatex entries; recalculate pipe positions
        if (/^@\w+/.test(name)) {
          pipePositions = [-1, pipePositions[1]];
          for (let j = pipePositions[1] + 1; j < arg.tokens.length; j++) {
            if (arg.tokens[j].type === TokenType.BeginGroup) nest++;
            if (arg.tokens[j].type === TokenType.EndGroup) nest--;
            if (
              nest === 0 &&
              arg.tokens[j].type === TokenType.Text &&
              (arg.tokens[j].text === ',' || arg.tokens[j].text === '|')
            )
              pipePositions.push(j);
          }
          pipePositions.push(arg.tokens.length);
        }
      } else {
        context.container.event('fun-arg', context, arg.tokens[pipePositions[i - 1]]);
        Compiler.compileGroup(
          fragment,
          context,
          i === pipePositions.length - 1 ? code.tokenAtOffset(-1) : arg.tokens[pipePositions[i]]
        );
      }
    }

    if (context.container === container) context.exitContainer();
    else {
      context.throw('UNCLOSED_CONTAINER', initiator);
      return false;
    }

    code.spliceFrom(start);
    return true;
  },
};
