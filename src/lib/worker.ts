import * as mediasoup from "mediasoup";
import {config} from "../config";
import { Router } from "mediasoup/node/lib/RouterTypes";
import { WorkerLogLevel, WorkerLogTag, RtpCodecCapability } from "mediasoup/node/lib/types";


const createWorker = async ():Promise<Router> => {
    const worker = await mediasoup.createWorker({
        logLevel: config.mediasoup.workerSetting.logLevel as WorkerLogLevel,
        logTags: config.mediasoup.workerSetting.logTags as WorkerLogTag[],
        rtcMinPort:config.mediasoup.workerSetting.rtcMinPort,
        rtcMaxPort:config.mediasoup.workerSetting.rtcMaxPort,
    })

    worker.on('died',()=>{
        console.log('mediasoup worker died , exiting in 2 secands ...[pid:&d]',worker.pid);
        setTimeout(()=>{
            process.exit(1);
        },2000);
    })

    const mediaCodecs = config.mediasoup.routerOptions.mediaCodecs as RtpCodecCapability[];
    const mediasoupRouter = await worker.createRouter({mediaCodecs});
    return mediasoupRouter;
}

export {createWorker};
