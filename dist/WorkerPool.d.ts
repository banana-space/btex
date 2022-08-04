/// <reference types="node" />
import { Worker } from 'worker_threads';
import { CompilerOptions } from './lib/Compiler';
import { Context } from './lib/Context';
import { RenderOptions } from './lib/Element';
export interface WorkerData {
    code: string;
    globalContext: Context;
    preamble?: string;
    options?: CompilerOptions;
    renderOptions?: RenderOptions;
    taskId?: number;
    expiresAt?: number;
}
export interface WorkerResult {
    taskId?: number;
    html: string;
    data: string;
    errors: string[];
    warnings: string[];
}
export declare class WorkerPool {
    workers: {
        id: number;
        worker: Worker;
        queue: WorkerData[];
    }[];
    onMessage(workerId: number, value: WorkerResult): void;
    constructor(number: number);
    work(data: WorkerData): Promise<WorkerResult>;
    setWorkerTimeout(workerId: number): void;
}
//# sourceMappingURL=WorkerPool.d.ts.map