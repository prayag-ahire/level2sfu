import { RoomManager } from "./roomManager"

const roomManager = new RoomManager();

export const webSocketConnection = (socket,workerManager)=>{
    socket.on("message",async (data)=>{
        const event = JSON.parse(data);
        const { type, roomId } = event;  

        switch(type){
            case "createRoom":
                const worker = workerManager.getworker();
                const room = roomManager.getOrCreateRoom(roomId,worker);
                await room.createRouter(config.mediasoup.routerOptions.mediaCodecs)
                socket.send(JSON.stringify({type:"roomCreated",roomId}));
                break;
        }
    })
}