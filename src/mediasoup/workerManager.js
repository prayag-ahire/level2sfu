import * as mediasoup from "mediasoup";
import { config } from "../config"

let workers = [];
let nextWorkerIndex = 0;

// here i am creating worker and give it configration
export const createWorkerManager = async()=>{
    const worker = await mediasoup.createWorker({
        logLevel:config.mediasoup.workerSetting.logLevel,
        logTags: config.mediasoup.workerSetting.logTags,
        rtcMinPort:config.mediasoup.workerSetting.rtcMinPort,
        rtcMaxPort:config.mediasoup.workerSetting.rtcMaxPort,
    });


    console.log(`worker PID : ${worker.pid}`);

    worker.on('died',()=>{
        console.error("worker died , exiting.....");
        process.exit(1);
    })

    //push worker to arry to reuse
    workers.push(worker);
    return{
        getworker:() => workers[nextWorkerIndex % worker.length]
    }
}