import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';

/**
 * Adds entries to compiler data.
 */
export const DataInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let dataKey = context.get('data-key', true);
    let value = '';

    if (dataKey && allowedKeys.includes(dataKey)) {
      if (richKeys.includes(dataKey)) {
        let group = code.readGroup();
        if (group) {
          value = context.codeToHTML(group, initiator) ?? '';
        }
      } else {
        value = Compiler.readText(code, context, initiator) ?? '';
      }

      if (value) context.compilerData[dataKey] = value;
    } else {
      code.readGroup();
    }

    code.spliceFrom(start);
    return true;
  },
};

const allowedKeys: string[] = ['displayTitle', 'htmlTitle', 'lang'];
const richKeys: string[] = ['displayTitle'];
