import express from "express"
import http from "http"
import cors from "cors"
import {WebSocketServer} from "ws"
import { webSocketConnection } from "./lib/ws"

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const port = 3000;
const wss = new WebSocketServer({server});

webSocketConnection(wss);



server.listen(port,()=>{
    console.log(`server is running on prot ${port}`);
})
