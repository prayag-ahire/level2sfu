import { config } from "../config"

export const webRtcTransport = async (router)=>{
    const {
            maxIncomeBitrate,
            initialAvailableOutgoingBitrate
        }  = config.mediasoup.webRtcTransport;

    const transport = await router.webRtcTransport({
        listenIps : config.mediasoup.webRtcTransport.listenIps,
        encodeUdp:true,
        encodeTcp:true,
        preferudp:true,
        initialAvailableOutgoingBitrate,
    });

    if(maxIncomeBitrate){
        try{
            await transport.setMaxIncomingBitrate(maxIncomeBitrate);
        }catch(error){
            console.error(error);
        }
    }

    return {
        transport,
        params:{
            id:transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
        },
    };
}