import { JSDOM } from 'jsdom';
import { parentPort } from 'worker_threads';
import { Command } from './lib/Command';
import { Compiler } from './lib/Compiler';
import { Context } from './lib/Context';
import { MathElement } from './lib/elements/MathElement';
import { Parser } from './lib/Parser';
import { Token, TokenType } from './lib/Token';
import { WorkerData, WorkerResult } from './WorkerPool';

const window = new JSDOM().window;
global['document'] = window.document;

parentPort?.on('message', (value: WorkerData) => {
  work(value).then(
    (res) => parentPort?.postMessage(res),
    () => {
      parentPort?.postMessage({
        taskId: value.taskId ?? 0,
        html: '',
        data: '',
        errors: ['UNKNOWN'],
        warnings: [],
      });
    }
  );
});

export async function rawWork(data: WorkerData): Promise<WorkerResult> {
  // Reconstruct the Context object from JSON data
  if (data.options?.equationMode) data.options.inline = true;

  let globalContext = new Context(undefined, data.options);
  let contextData = data.globalContext as Context;
  globalContext.newCommands = {};
  globalContext.newVariables = contextData.newVariables;
  for (let key in contextData.newCommands)
    globalContext.newCommands[key] = Command.reconstructFrom(contextData.newCommands[key]);

  let codeString = data.code.replace(/\r\n/g, '\n');
  globalContext.set('__code__', codeString);

  let context = new Context(globalContext);

  // Compile preamble
  if (data.preamble) {
    let preamble = Parser.parse(data.preamble, 'preamble');
    context.noOutput = true;
    Compiler.compile(preamble, context);
    context.noOutput = false;
  }

  // Parse and compile
  if (data.options?.equationMode) {
    context.enterContainer(
      new MathElement(),
      Token.fromCode('$', TokenType.Text, { line: 0, col: 0 }, { line: 0, col: 0 })
    );
  }

  let code = Parser.parse(codeString, 'code');

  if (!data.options?.inline) {
    // prepend 2 line-breaks to start the first paragraph
    let lineBreak = Token.fromCode(
      '\n',
      TokenType.Whitespace,
      { line: 0, col: 0 },
      { line: 0, col: 0 }
    );
    code.tokens.splice(0, 0, lineBreak, lineBreak);
  }

  Compiler.compile(code, context);

  if (data.options?.equationMode) {
    context.exitContainer();
  }

  // Render to HTML
  let html = await context.render(data.renderOptions);

  return {
    html,
    data: JSON.stringify(context.compilerData),
    errors: context.errors.map((e) => e.getMessage('zh')),
    warnings: context.warnings.map((e) => e.getMessage('zh')),
  };
}

async function work(data: WorkerData): Promise<WorkerResult> {
  if (data.expiresAt && new Date().getTime() > data.expiresAt) {
    return {
      taskId: data.taskId ?? 0,
      html: '',
      data: '',
      errors: ['SERVER_IS_BUSY'],
      warnings: [],
    };
  }
  let result = await rawWork(data);
  result.taskId = data.taskId ?? 0;
  return result;
}
