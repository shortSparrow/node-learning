const http = require("http");
const ws = require("ws");

const wss = new ws.Server({ noServer: true });

function accept(req, res) {
  console.log("req.url: ", req.url);
  console.log("req.httpVersion: ", req.httpVersion);
  console.log("req.method: ", req.method);
  console.log("req.headers: ", req.headers);

  /**
   * REQUEST FROM https://caniuse.com/ (
   * open devtools and paste:
   *    const ws = new WebSocket("ws://localhost:8000")
   *    ws.onmessage = message => console.log(`${message.data}`)
   * )
   *
   *
   * req.url:  /
   * req.httpVersion:  1.1
   * req.method:  GET
   * req.headers:  {
   *    host: 'localhost:8000',
   *    connection: 'Upgrade',
   *    pragma: 'no-cache',
   *    'cache-control': 'no-cache',
   *    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
   *    upgrade: 'websocket',
   *    origin: 'https://caniuse.com',
   *    'sec-websocket-version': '13',
   *    'accept-encoding': 'gzip, deflate, br, zstd',
   *    'accept-language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7,ru-UA;q=0.6,ru;q=0.5,fr-FR;q=0.4,fr;q=0.3',
   *    'sec-websocket-key': 'WiCVDHcqQqLYPIlc4h2cjA==',
   *    'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits'
   * }
   */

  // all incoming requests must be websockets
  if (
    !req.headers.upgrade ||
    req.headers.upgrade.toLowerCase() != "websocket"
  ) {
    res.end();
    return;
  }

  // can be Connection: keep-alive, Upgrade
  if (!req.headers.connection.match(/\bupgrade\b/i)) {
    res.end();
    return;
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}

function onConnect(ws) {
  ws.on("message", function (message) {
    message = message.toString();
    console.log("message: ", message);
    ws.send(`Привіт із сервера, ${message}!`);

    setTimeout(() => ws.close(1000, "Bye!"), 5000);
  });
}

http.createServer(accept).listen(8000, () => {
  console.log("Listening on port: ", 8000);
});

// CODE FOR BROWSER
// const ws = new WebSocket("ws://localhost:8000")
// ws.onmessage = message => console.log(`${message.data}`)
// ws.onclose = data => console.log(data.reason)
// ws.send('hello')