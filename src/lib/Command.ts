import { Code } from './Code';

export class Command {
  name: string;
  definitions: {
    pattern: Code;
    replace: Code;
  }[] = [];
  isGlobal: boolean = false;
  isTextCommand: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  clone(): Command {
    let cloned = new Command(this.name);
    cloned.definitions.push(...this.definitions);
    cloned.isGlobal = this.isGlobal;
    cloned.isTextCommand = this.isTextCommand;
    return cloned;
  }

  // Used in worker threads
  static reconstructFrom(command: Command): Command {
    let c = new Command(command.name);
    for (let def of command.definitions) {
      c.definitions.push({
        pattern: new Code(def.pattern.tokens),
        replace: new Code(def.replace.tokens),
      });
    }
    c.isGlobal = command.isGlobal;
    c.isTextCommand = command.isTextCommand;
    return c;
  }
}
