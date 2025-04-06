import { Room } from "./room";

export class RoomManager {
    constructor(){
        this.rooms = new Map();
    }

    getOrCreateRoom(roomId,worker){
        if(!this.rooms.has(roomId)){
            const room = new Room(roomId,worker);
            this.rooms.set(roomId,room);
        }
        return this.rooms.get(roomId);
    }

    getAllRooms(){
        return Array.from(this.rooms.keys());
    }
}