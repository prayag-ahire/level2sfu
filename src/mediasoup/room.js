export class Room {

    constructor(roomId,worker){
        this.roomId = roomId;
        this.worker = worker;
        this.peers = new Map();
        this.router = null;
    }

    async createRouter(mediaCodecs){
        this.router = await this.worker.createRouter({mediaCodecs});
    }

    addPeer(socketId,user){
        this.peers.set(socketId,user);
    }

    getPeer(socketId){
        return this.peers.get(socketId);
    }
}