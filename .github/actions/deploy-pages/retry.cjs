const {spawn} = require('node:child_process');
const {setTimeout: wait} = require('node:timers/promises');
const missing = 'No artifacts named "github-pages" were found for this workflow run';

function deploy() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['.pages-action/dist/index.js'], {stdio:['ignore','pipe','pipe']});
    let absent = false;
    for (const [stream, output] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
      let tail = '';
      stream.setEncoding('utf8');
      stream.on('data', chunk => {
        output.write(chunk);
        absent ||= (tail + chunk).includes(missing);
        tail = (tail + chunk).slice(-missing.length);
      });
    }
    const cancel = () => child.kill('SIGTERM');
    process.once('SIGTERM', cancel);
    process.once('SIGINT', cancel);
    child.once('error', reject);
    child.once('close', code => {
      process.off('SIGTERM', cancel);
      process.off('SIGINT', cancel);
      resolve({code: code ?? 1, absent: code !== null && absent});
    });
  });
}

async function publish(run = deploy, sleep = wait) {
  let result;
  for (const delay of [0, 15000, 45000]) {
    if (delay) {
      console.log('Waiting ' + delay/1000 + 's for the uploaded Pages artifact.');
      await sleep(delay);
    }
    result = await run();
    if (!result.code || !result.absent) break;
  }
  return result.code;
}
module.exports = {publish};
if (require.main === module) publish().then(code => {process.exitCode = code}).catch(err => {console.error(err); process.exitCode = 1});
