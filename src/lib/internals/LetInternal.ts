import { Code } from '../Code';
import { Command } from '../Command';
import { Context } from '../Context';
import { Internals, Internal } from '../Internal';
import { Token, TokenType } from '../Token';

export const LetInternal: Internal = {
  execute(code: Code, context: Context): boolean {
    let start = code.pointer;
    let initiator = code.token;

    if (!code.canStep()) {
      context.throw('COMMAND_EXPECTED', initiator);
      return false;
    }
    code.step();

    let t = code.token;
    let name = t.text;

    if (
      (t.type !== TokenType.Command &&
        t.type !== TokenType.Text &&
        t.type !== TokenType.Whitespace) ||
      Internals[name]
    ) {
      context.throw('INVALID_COMMAND_NAME', t, t.text);
      return false;
    }

    if (!code.canStep()) {
      context.throw('COMMAND_EXPECTED', initiator);
      return false;
    }
    code.step();

    let second = code.token;
    if (second.type !== TokenType.Command) {
      context.throw('COMMAND_EXPECTED', initiator);
      return false;
    }

    let secondCommand = context.findCommand(second.text);
    if (!secondCommand) {
      let internal = Internals[second.text];
      if (internal) {
        secondCommand = new Command(second.text);
        secondCommand.definitions.push({
          pattern: new Code([]),
          replace: new Code([
            Token.fromCode(
              second.text,
              TokenType.Command,
              { line: 0, col: 0 },
              { line: 0, col: 0 }
            ),
          ]),
        });
      }

      if (!secondCommand) {
        context.throw('UNDEFINED_COMMAND', second, second.text);
        return false;
      }
    }

    let command = context.newCommands[name];
    if (!command) {
      command = context.findCommand(name)?.clone() ?? new Command(name);
    }

    let overwrite = true;
    context.getBoolean('def-expand', false, true);
    if (context.getBoolean('def-prepend', false, true)) {
      command.definitions.splice(0, 0, ...secondCommand.definitions);
      overwrite = false;
    }
    if (context.getBoolean('def-append', false, true)) {
      command.definitions.push(...secondCommand.definitions);
      overwrite = false;
    }
    if (overwrite) {
      command.definitions = [...secondCommand.definitions];
    }
    command.isGlobal = context.getBoolean('def-global', false, true);
    command.isTextCommand = context.getBoolean('def-text', false, true);
    context.defineCommand(command);

    code.step();
    code.spliceFrom(start);
    return true;
  },
};
