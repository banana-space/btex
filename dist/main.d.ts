import { CompilerOptions } from './lib/Compiler';
import { RenderOptions } from './lib/Element';
import { WorkerResult } from './WorkerPool';
export { rawWork } from './worker';
export declare function runWorker(code: string, preamble?: string, options?: CompilerOptions, renderOptions?: RenderOptions): Promise<WorkerResult>;
export declare function render(data: string, preamble?: string): Promise<string>;
//# sourceMappingURL=main.d.ts.map