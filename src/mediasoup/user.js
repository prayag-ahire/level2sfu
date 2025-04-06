export class User{
    constructor(socketId){
        this.socketId = socketId;
        this.producerTransport = null;
        this.consumerTransport = null;
        this.producer = null;
        this.consumer = null;
    }

    setProducerTransport(transport){
        this.producerTransport = transport;
    }

    setConsumerTransport(transport){
        this.consumerTransport = transport;
    }

    setProducer(producer){
        this.producer = producer;
    }

    setconsumer(consumer){
        this.consumer = consumer;
    }
}