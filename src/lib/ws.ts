import { Consumer, Producer, Router, RtpCapabilities, Transport, WebRtcTransport } from "mediasoup/node/lib/types.js";
import createWebRtcTransport from "./createWebRtcTransport.js";
import { createWorker } from "./worker.js";
import {v4} from "uuid";
import { WebSocket, WebSocketServer } from "ws";
import {RoomManager} from "../managers/roomManager.js"
import { Room } from "../managers/room.js";

let mediasoupRouter:Router;
let producer:Producer;
let producerTransport:Transport;
let consumerTransport:Transport;
let consumer:Consumer;
let room:Room;
let roomManger:RoomManager;

let genrateRoomId = 1;

export const webSocketConnection = async (websocket:WebSocketServer)=>{
    try{
        mediasoupRouter = await createWorker();
        roomManger = new RoomManager();
    }catch(error){
        throw error;
    }
    websocket.on('connection',(ws:WebSocket)=>{
        (ws as any).id = v4();
        console.log("connected to");

        ws.on('message',(message:string)=>{
            console.log("message",JSON.parse(message));


            const event = JSON.parse(message);

            switch(event.type){

                case "create-room":
                    const roomId = genrateRoomId++;
                    onCreateRoom(roomId.toString(),ws);
                    break;

                case 'getRouterRtpCapabilities':
                    onRouterRtpCapbilities(event,ws);
                break;

                case 'createProducerTransport':
                    oncreateProducerTransport(event,ws);
                break;
                
                case 'connectProducerTransport':
                    onconnectProducerTransport(event,ws);
                break;

                case 'produce':
                    onProduce(event,ws,websocket);
                break;

                case "iamproducer":
                    onIAmProducer(event);

                case 'createConsumerTransport':
                    oncreateconsumerTransport(event,ws);
                break;

                case 'connectConsumerTransport':
                    onconnectConsumerTransport(event,ws);
                break;

                case 'resume':
                    onResume(ws);
                    break;
                case 'consume':
                    onConsume(event,ws);
                    break;
                case 'broadcaster-closed':
                    onclose(event,ws);
                    break;
                default:
                    break;
            }
        });
    });

    const onIAmProducer = (event:any)=>{
        room.setProducer(event.producer);
        console.log("producer this---------",event.producer);
    }

    const onclose = (event:any,ws:WebSocket)=>{
        console.log("this is roomid ",event.roomId.data.toString());
        roomManger.removeRoom(event.roomId.data);
        send(ws,"closed","hello");
        // roomManger.getRoom(event.roomId.data);
       
    }

    const onCreateRoom = async(roomId:string,ws:WebSocket)=>{
         room = await roomManger.createRoom(roomId);
         send(ws,"roomCreated",roomId);
    }

    const onRouterRtpCapbilities = (event:string, ws:WebSocket)=>{
        send(ws,"routerCapabilities",mediasoupRouter.rtpCapabilities)
        console.log("get id :",(ws as any).id);
        console.log("send routerCapabilities :",mediasoupRouter.rtpCapabilities);
    }


    const oncreateProducerTransport= async(event:string,ws:WebSocket)=>{
        try{
            console.log("producerTransport rtpCapabilites : ",event); 
            const { transport,params } = await createWebRtcTransport(mediasoupRouter);
            producerTransport = transport;
            console.log("producer transport : ",producerTransport);
            console.log("params : ",params);
            send(ws,"ProducerTransportCreated",params);

        }catch(error){
            console.error(error)
            send(ws,"error",error); 
        }
    }

    const  onconnectProducerTransport = async (event:any, ws:WebSocket) => {
        console.log("sender connected to server");
        const dtlsParameters = event.dtlsParameters;
        console.log("dtlsParameters : ",dtlsParameters);
        await producerTransport.connect({dtlsParameters});
        console.log("producer transport : ",producerTransport);
        send(ws,'producerConnected','producer connted!');
      };
      

    const send = (ws:WebSocket,type:string,msg:any)=>{
        const message = {
            type,
            id:(ws as any).id,
            data:msg
        }
        const resp = JSON.stringify(message);
        ws.send(resp); 
    }

    const onResume = async(ws:WebSocket)=>{
        await consumer.resume();
        send(ws,"resumed","resumed"); 
    }

    const onProduce =async (event:any,ws:WebSocket,WebSocket:WebSocketServer)=>{
            const { kind,rtpParameters} = event;
            producer = await producerTransport.produce({ kind,rtpParameters});
            const res = {
                id: producer.id,
            }
           
            console.log("got produce!");
            console.log("id : ",res.id);
            console.log("server get IceCandidates : ",event); 
            send(ws,'produced',res);
            brodcast(WebSocket,'newProducer','new user');
        }

    const brodcast = (ws:WebSocketServer,type:string,msg:any)=>{
        const message = {
            type,
            data:msg
        }
        const res= JSON.stringify(message);
        ws.clients.forEach((client)=>{
            client.send(res);
        })
    }
    const oncreateconsumerTransport = async(event:string,ws:WebSocket)=>{
        try{
            console.log("consumerTransport rtpCapabilites : ",event);
            const {transport,params} = await createWebRtcTransport(mediasoupRouter)
            consumerTransport =  transport;
            console.log("consumer transport : ",consumerTransport);
            send(ws,"subTransportCreated",params);
            console.log("params : ",params);
        }catch(error){
            console.error(error);
        }
    }


    const onconnectConsumerTransport = async (event:any,ws:WebSocket)=>{
        console.log("reciever connected to server");
        const dtlsParameters = event.dtlsParameters;
        console.log("dtlsparametres of consumer : ",event.dtlsParameters);
        await consumerTransport.connect({ dtlsParameters})
        console.log("consumerTransport : ",consumerTransport);
        send(ws,"subConnected","consummer transport connected")
    }



    const onConsume = async(event:any,ws:WebSocket)=>{
        console.log(producer.id);
        const res = await createConsumer(producer,event.rtpCapabilities);
        console.log("IceCandidates : ",event.rtpCapabilities)
        send(ws,"subscribed",res);
    }

    const  createConsumer = async (producer:Producer,rtpCapabilities:RtpCapabilities)=>{
        if(!mediasoupRouter.canConsume(
            {
                producerId : producer.id,
                rtpCapabilities,
            }
        )){
             console.error('can not consume');
             return;
        }
        try{
            consumer = await consumerTransport.consume({
                producerId: producer.id,
                rtpCapabilities,
                paused: false
            })
        }catch(error){
            console.error("consume failed",error);
            return;
        }
        return{
            producerId : producer.id,
            id:consumer.id,
            kind:consumer.kind,
            rtpParameters:consumer.rtpParameters,
            type:consumer.type,
            producerPaused: consumer.producerPaused
        }
    }
}

export default webSocketConnection;
