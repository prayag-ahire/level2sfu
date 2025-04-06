import express from "express"
import http from "http"
import cors from "cors"
import {WebSocketServer} from "ws"
import { createWorkerManager } from "./mediasoup/workerManager";
import { webSocketConnection } from "./mediasoup/webSocket";

const app = express();
const server = http.createServer(app);
const port = 3000;
const wss = new WebSocketServer({server});

const workerManager = await createWorkerManager();

app.use(express.body())
app.use(cors());

wss.on("connection",(socket)=>{
    webSocketConnection(socket,workerManager);
})

app.post("/create-room",(res,req)=>{
    
});

app.get("/rooms-list",(req,res)=>{
    
})

server.listen(port,()=>{
    console.log(`server is running on prot ${port}`);
})
