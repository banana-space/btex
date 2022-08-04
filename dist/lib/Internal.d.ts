import { Code } from './Code';
import { Context } from './Context';
export interface Internal {
    execute(code: Code, context: Context): boolean;
}
export declare const Internals: {
    [key: string]: Internal;
};
//# sourceMappingURL=Internal.d.ts.map