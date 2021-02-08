import { Code } from '../Code';
import { Compiler } from '../Compiler';
import { Context } from '../Context';
import { VirtualElement } from '../elements/VirtualElement';
import { Internal } from '../Internal';
import { Token, TokenType } from '../Token';

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

    // Get display title of subpage
    let sdt = new Code([Token.fromParent('\\@subdisplaytitle', TokenType.Command, initiator)]);
    let element = new VirtualElement();

    context.enterContainer(element, initiator);
    if (!Compiler.compileGroup(sdt, context, initiator)) return false;
    context.exitContainer();
    element.normalise();

    if (isDuplicate) {
      context.warn('DUPLICATE_SUBPAGE', initiator, fullTitle);
    } else {
      context.subpages.push({
        title: fullTitle,
        displayTitle: element.getHTML(),
        level,
        number: context.get('subpage-number') ?? '', // No resetting; subpage-number is used after this.
      });
    }

    return true;
  },
};

export interface SubpageDeclaration {
  title: string;
  displayTitle: string;
  number: string;
  level: number;
}
