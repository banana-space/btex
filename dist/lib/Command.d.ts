import { Code } from './Code';
export declare class Command {
    name: string;
    definitions: {
        pattern: Code;
        replace: Code;
    }[];
    isGlobal: boolean;
    isTextCommand: boolean;
    constructor(name: string);
    clone(): Command;
    static reconstructFrom(command: Command): Command;
}
//# sourceMappingURL=Command.d.ts.map