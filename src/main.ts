import { readFileSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import { Compiler, CompilerOptions, defaultCompilerOptions } from './lib/Compiler';
import { Context } from './lib/Context';
import { RenderOptions } from './lib/Element';
import { Parser } from './lib/Parser';
import { WorkerPool, WorkerResult } from './WorkerPool';
export { WorkerPool, WorkerResult } from './WorkerPool';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
export { rawWork } from './worker';

const window = new JSDOM().window;
global['document'] = window.document;

// Initialise context using lib/init.btx
export const globalContext = new Context();
Compiler.compile(Parser.parse(readFileSync(join(__dirname, '../src/lib/init.btx')).toString()), globalContext);

var pool : WorkerPool | undefined = undefined;

export function runWorker(
  code: string,
  preamble?: string,
  options?: CompilerOptions,
  renderOptions?: RenderOptions
): Promise<WorkerResult> {
  if (pool === undefined) {
    pool = new WorkerPool(4);
  }
  return pool.work({
    code,
    preamble,
    options,
    renderOptions,
    globalContext,
  });
}

export function render(data: string, preamble?: string) : Promise<string> {
  return runWorker(data, preamble, defaultCompilerOptions, { inverseSearch: false }).then(
    result => {
      if (result.errors.length) {
        return result.errors.join();
      } else {
        return result.html;
      }
    },
    err => { return err; });
}

function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function serve(port : number) {
  let requests = 0;
  let server = createServer((request, response) => {
    if (request.method !== 'POST') {
      response.statusCode = 400;
      response.setHeader('Content-Type', 'text/plain');
      response.end("Please send a POST request with a 'code' field.");
    } else {
      let body = '';
      request.on('data', (data) => (body += data));
      request.on('end', function () {
        let start = new Date();
        let id = ++requests;
        console.log(`[${getTimestamp()}] #${id} Accepted.`);

        let post = JSON.parse(body);
        let code = post['code'] ?? '';

        let renderOptions: RenderOptions = {
          inverseSearch: post['inverseSearch'] === true,
        };

        let options: CompilerOptions = defaultCompilerOptions;
        options.inline = post['inline'] === true;
        options.equationMode = post['equationMode'] === true;

        runWorker(code, post['preamble'], options, renderOptions).then((result) => {
          let ms = new Date().getTime() - start.getTime();
          console.log(`[${getTimestamp()}] #${id} Resolved (${ms} ms).`);

          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(result));
        });
      });
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`[${getTimestamp()}] bTeX running at http://127.0.0.1:${port}`);
  });
}

async function test() {
  let result = await runWorker(readFileSync('./test/test.btx').toString());
  console.log(result);

  const katexCss = 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css';
  writeFileSync(
    'test/test.html',
    `<!DOCTYPE html><head><meta charset="UTF-8"><link rel="stylesheet" href="${katexCss}"><link rel="stylesheet" href="test.css"><title>Test Page</title></head><body>${result.html}</body>`
  );

  process.exit(0);
}

if (require.main === module) {
  const argv = yargs(hideBin(process.argv))
    .option('port', {
      alias: 'p',
      describe: 'Port to bind on',
      default: 7200,
      number: true,
    }).option('worker', {
      alias: 'w',
      describe: 'Number of workers',
      default: 4,
      number: true
    }).parseSync();

  pool = new WorkerPool(argv.worker);
  serve(argv.port);

  // Uncomment to compile ./test/test.btx to ./test/test.html
  // test();
}
