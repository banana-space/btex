import { readFileSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import { JSDOM } from 'jsdom';
import { Compiler, CompilerOptions } from './lib/Compiler';
import { Context } from './lib/Context';
import { RenderOptions } from './lib/Element';
import { Parser } from './lib/Parser';
import { WorkerPool, WorkerResult } from './WorkerPool';

const window = new JSDOM().window;
global['document'] = window.document;

// Initialise context using lib/init.btx
const globalContext = new Context();
Compiler.compile(Parser.parse(readFileSync('./src/lib/init.btx').toString()), globalContext);

const pool = new WorkerPool(1);

function runWorker(
  code: string,
  options?: CompilerOptions,
  renderOptions?: RenderOptions
): Promise<WorkerResult> {
  return pool.work({
    code,
    options,
    renderOptions,
    globalContext,
  });
}

function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function serve() {
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

        runWorker(code, undefined, renderOptions).then((result) => {
          let ms = new Date().getTime() - start.getTime();
          console.log(`[${getTimestamp()}] #${id} Resolved (${ms} ms).`);

          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(result));
        });
      });
    }
  });

  server.listen(7200, '127.0.0.1', () => {
    console.log(`[${getTimestamp()}] bTeX running at http://127.0.0.1:7200`);
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

serve();

// Uncomment to compile ./test/test.btx to ./test/test.html
// test();
