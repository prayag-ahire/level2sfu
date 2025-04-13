import { error } from "console";
import { Consumer } from "mediasoup/node/lib/ConsumerTypes";
import { Producer } from "mediasoup/node/lib/ProducerTypes";
import { Router } from "mediasoup/node/lib/RouterTypes";

export class Room {
    private id:string;
    private router:Router;
    private producer?:Producer;
    private consumer:Map<string,Consumer>;

    constructor(id:string,router:Router){
        this.id = id,
        this.router = router,
        this.consumer = new Map();
    }

    setProducer(producer:Producer){
        if(this.producer){
            throw new Error("producer already exist in this room");
        }
        
        this.producer = producer
    }

    addConsumer(consumerId:string,consumer:Consumer){
        this.consumer.set(consumerId,consumer); 
    }

    removeConsumer(consumerId:string){
        this.consumer.delete(consumerId);
    }

    close(){
        this.producer?.close();
        this.consumer.forEach((x)=>x.close());
        this.router.close();
        console.log("room close")
    }
    
}