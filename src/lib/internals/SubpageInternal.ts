import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { Internal } from '../Internal';

export const SubpageInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let initiator = code.token;
    code.step();

    if (!code.canStep()) {
      context.throw('ARGUMENT_EXPECTED', initiator);
      return false;
    }

    let text = Compiler.readText(code, context, initiator);
    if (text === undefined) return false;

    let level = context.getInteger('subpage-level', 1, true);
    if (!(level >= 1 && level <= 3)) level = 1;

    while (context.subpageOfLevel.length > level - 1) context.subpageOfLevel.pop();
    context.subpageOfLevel.push(text);
    let fullTitle = './' + context.subpageOfLevel.join('/');
    context.set('subpage-title', fullTitle);

    let isDuplicate = false;
    for (let subpage of context.subpages) if (subpage.title === fullTitle) isDuplicate = true;

    if (isDuplicate) {
      context.warn('DUPLICATE_SUBPAGE', initiator, fullTitle);
    } else {
      context.subpages.push({
        title: fullTitle,
        level,
        number: context.get('subpage-number', true) ?? '',
      });
    }

    return true;
  },
};

export interface SubpageDeclaration {
  title: string;
  number: string;
  level: number;
}
