import { Command } from './Command';
import { Token, TokenType } from './Token';
export declare class Code {
    tokens: Token[];
    pointer: number;
    constructor(tokens: Token[]);
    get token(): Token;
    tokenAtOffset(offset: number): Token;
    step(): void;
    canStep(): boolean;
    reset(): void;
    slice(start?: number, end?: number): Code;
    spliceFrom(start: number, ...tokens: Token[]): void;
    findNext(token: {
        type: TokenType;
        text: string;
    }): number;
    matchGroup(start?: number): number | undefined;
    readGroup(): Code | undefined;
    readSquareBracket(): Code | undefined;
    expandMacro(command: Command, strict?: boolean): boolean;
}
//# sourceMappingURL=Code.d.ts.map