import http from "http";
import app from './app'

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(app);

server.listen(PORT, "localhost", () => {
  console.log("Server start listening on port: ", PORT);
});
