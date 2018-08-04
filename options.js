const homedir = require('os').homedir();
const program = require('commander');

program
  .option('--cors', 'Enable CORS', false)
  .option('--replay', 'Replay blockchain and reinstall database', false)
  .option('-h, --host [host]', 'Bind to address (127.0.0.1 by default)')
  .option('-p, --port [port]', 'Port to be launched (9911 by default)')
  .option('-u, --url [url]', 'Connect to ETH node at address (http://127.0.0.1:8545 by default)')
  // TODO: database connection
  .option('-v, --verbose', 'Increase verbosity', true, 40)
  .parse(process.argv);

const { verbose, cors } = program;
const host = program.host || "127.0.0.1";
const port = program.port || 9911;
const web3url = program.url || 'http://127.0.0.1:8545';
module.exports = { host, port, verbose, cors, url: web3url };
