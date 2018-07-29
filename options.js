const homedir = require('os').homedir();
const program = require('commander');

program
  .option('--cors', 'Enable CORS', false)
  .option('-h, --host [host]', 'Bind to address (127.0.0.1 by default)')
  .option('-p, --port [port]', 'Port to be launched (9911  by default)')
  .option('-v, --verbose', 'Increase verbosity', true, 40)
  .parse(process.argv);

const { verbose, cors } = program;
const host = program.host || "127.0.0.1";
const port = program.port || 9911;
module.exports = { host, port, verbose, cors };
