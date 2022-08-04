import { Code } from './Code';
import { Context } from './Context';
import { Token } from './Token';
export interface CompilerOptions {
    /**
     * Max number of errors before giving up.
     * @default 100
     */
    maxErrors: number;
    /**
     * Max number of macro expansions before giving up.
     * @default 50000
     */
    maxMacroExpansions: number;
    /**
     * Max number of tokens allowed during macro expansion.
     * @default 1000000
     */
    maxBuffer: number;
    /**
     * Max number of nesting groups and environments.
     * @default 1000
     */
    maxNesting: number;
    /**
     * Whether to compile in inline mode (disallow paragraph breaks).
     * @default false
     */
    inline: boolean;
    /**
     * Whether to regard the source as the part between $...$ in an equation.
     * @default false
     */
    equationMode: boolean;
}
export declare const defaultCompilerOptions: CompilerOptions;
export declare abstract class Compiler {
    static compile(code: Code, context: Context): boolean;
    static compileGroup(code: Code, context: Context, nextToken: Token, isGlobal?: boolean): boolean;
    static readText(code: Code, context: Context, initiator: Token): string | undefined;
}
//# sourceMappingURL=Compiler.d.ts.map