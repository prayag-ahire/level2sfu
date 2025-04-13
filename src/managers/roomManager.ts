
import { createWorker } from "../lib/worker";
import { Room } from "./room";



export class RoomManager{

    private rooms:Map<string,Room>

    constructor(){
        this.rooms = new Map();
    }

    async createRoom(roomId:string):Promise<Room>{
        if(this.rooms.has(roomId)){
            throw new Error("room already exist")
        }

        const router = await createWorker();
        const room = new Room(roomId,router);
        this.rooms.set(roomId,room);
        console.log("room created");
        return room;
    }

    getRoom(roomId:string):Room | undefined{
        return this.rooms.get(roomId);
    }

    removeRoom(roomId:string):void{
       const room = this.rooms.get(roomId);
       console.log(`this is room id ${roomId} and this is room ${room}`);
        if(room){
            room.close();
            console.log(roomId)
            this.rooms.delete(roomId);

        }
    }
}