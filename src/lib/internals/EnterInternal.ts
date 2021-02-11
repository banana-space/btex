import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Containers } from '../Element';
import { Internal } from '../Internal';

export const EnterInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let name = Compiler.readText(code, context, initiator);
    if (name === undefined) return false;

    if (context.noOutput) return true;

    if (name === 'group') {
      context.enterSemisimple();
    } else {
      let SomeElement = Containers[name];
      if (!SomeElement) {
        context.throw('INVALID_CONTAINER_NAME', initiator, name);
        return false;
      }

      if (!context.enterContainer(new SomeElement(), initiator)) return false;
    }

    code.spliceFrom(start);
    return true;
  },
};
