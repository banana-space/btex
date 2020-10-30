import { JSDOM } from 'jsdom';
import { parentPort } from 'worker_threads';
import { Command } from './lib/Command';
import { Compiler } from './lib/Compiler';
import { Context } from './lib/Context';
import { Parser } from './lib/Parser';
import { LabelDictionary, WorkerData, WorkerResult } from './WorkerPool';

const window = new JSDOM().window;
global['document'] = window.document;

parentPort?.on('message', (value) => {
  parentPort?.postMessage(work(value));
});

function work(data: WorkerData): WorkerResult {
  if (data.expiresAt && new Date().getTime() > data.expiresAt) {
    return {
      taskId: data.taskId ?? 0,
      html: '',
      labels: {},
      errors: ['SERVER_IS_BUSY'],
      warnings: [],
    };
  }

  // Reconstruct the Context object from JSON data
  let globalContext = new Context(undefined, data.options);
  let contextData = data.globalContext as Context;
  globalContext.newCommands = {};
  globalContext.newVariables = contextData.newVariables;
  for (let key in contextData.newCommands)
    globalContext.newCommands[key] = Command.reconstructFrom(contextData.newCommands[key]);
  let context = new Context(globalContext);

  // Parse and compile
  let code = Parser.parse(data.code, '0');
  Compiler.compile(code, context);

  // Render to HTML
  let root = context.root;
  let html = root.render(data.renderOptions)[0]?.outerHTML ?? '';

  let labels: LabelDictionary = {};
  for (let label of context.labels)
    labels[label.key] = { id: label.bookmarkId, html: label.getHTML() };

  return {
    taskId: data.taskId ?? 0,
    html,
    labels,
    errors: context.errors.map((e) => e.getMessage()),
    warnings: context.warnings.map((e) => e.getMessage()),
  };
}
