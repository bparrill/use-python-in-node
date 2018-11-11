const express = require('express')
const app = express()
const path = require('path')
const {spawn} = require('child_process')
const http = require("http")
const WebSocket = require("ws")
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const VIEWS_DIR = "views"
const PUBLIC_DIR = "public"
const PORT = 8080
const SCRIPT_PATH = path.join(__dirname, '../scripts/script.py')

app.set('views', path.join(__dirname, VIEWS_DIR));
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, PUBLIC_DIR)))

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/run-sync', function (req, res) {
  const scriptProcess = runScript("foobar")
  res.set('Content-Type', 'text/plain');
  scriptProcess.stdout.pipe(res)
  scriptProcess.stderr.pipe(res)
})

app.get('/run-websocket', function (req, res) {
  const scriptProcess = runScript("foobar")

  // TODO pipe data to websocket

  wss.clients
    .forEach(client => {
      client.send("request accepted");
    });

  res.send({data:'OK'})
})

/**
 * @param param {String}
 * @return {ChildProcess}
 */
function runScript(param) {

  /*
  python script.py --foo bar
  */
  return spawn('python', [
    SCRIPT_PATH,
    "--foo", param,
  ], {
    stdio: "pipe"
  });
}

// Init websocket communication
//////////////////////////////////////////////////////////////////////
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('received: %s', message);
    ws.send(`You sent -> ${message}`);
  });
  ws.send('Connection with WebSocket server initialized');
});

// Start server
//////////////////////////////////////////////////////////////////////

server.listen(PORT, () => {
  console.log('\n');
  console.log('+--------------------------')
  console.log(' PID %d', process.pid)
  console.log(' Listening on port', PORT)
  console.log('+--------------------------')
})
