import { Code } from '../Code';
import { Context } from '../Context';
import { CodeElement } from '../elements/CodeElement';
import { Internal } from '../Internal';

export const CodeInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;
    code.step();

    let group = code.readGroup();
    let source = context.get('__code__');

    let text = '';
    if (!context.noOutput && source && group && group.tokens.length > 0) {
      let startPosition = group.tokens[0].start;
      let endPosition = group.tokens[group.tokens.length - 1].end;
      let lines = source.split('\n');

      if (startPosition && endPosition) {
        if (startPosition.line === endPosition.line) {
          text = lines[startPosition.line]?.substring(startPosition.col, endPosition.col);
        } else {
          text = lines[startPosition.line]?.substring(startPosition.col) + '\n';
          for (let i = startPosition.line + 1; i < endPosition.line; i++)
            text += (lines[i] ?? '') + '\n';
          text += lines[endPosition.line].substring(0, endPosition.col);
        }
      } else {
        text = '??';
      }

      // Remove leading and trailing empty line; remove indentation
      let textLines = text.split('\n');
      if (textLines.length > 1) {
        if (textLines[0].trim() === '') textLines.splice(0, 1);
        if (textLines[textLines.length - 1].trim() === '') textLines.pop();

        if (textLines.length > 0) {
          let indent = textLines.map((line) => line.match(/^\s*/)?.[0].length ?? 0);
          let leastIndent = indent[0];
          for (let i = 1; i < indent.length; i++)
            if (indent[i] < leastIndent) leastIndent = indent[i];
          textLines = textLines.map((line) => line.substring(leastIndent));
        }

        text = textLines.join('\n');
      }

      // Escape {, }, \
      text = text.replace(/#([{}\\ ])/g, '$1');

      // In display mode, do an equivalent of \@par <pre> ... </pre> \@par
      let isDisplay = context.getBoolean('code-display', false);
      let element = new CodeElement();
      element.text = text;

      if (isDisplay) {
        context.flushSpan();
        if (!context.container.event('par', context, initiator)) return false;
      }
      context.enterContainer(element, initiator);
      context.exitContainer();
      if (isDisplay) {
        if (!context.container.event('par', context, initiator)) return false;
      }
    }

    return true;
  },
};
