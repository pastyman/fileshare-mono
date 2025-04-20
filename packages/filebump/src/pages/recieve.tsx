import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Container, Spacer } from "ui-components"
import { client, serverSendRecieve, loadIce, decodeChunkWithHeader } from "rtc-client"
import { FileInfo } from "../components/File"
import { Connecting, Disconnected } from "../components/Status"
import { ViewFile } from "../components/ViewFile"
import { swcomm } from "helpers"

const Index = ({ onNavigate }: { onNavigate: any }) => {
  const handleNavClick = (url: string, replace: boolean = false) => {
    onNavigate(url, replace)
  }
  const router = useRouter()

  const [status, setStatus] = useState("connecting")
  const [fileInfo, setFileInfo] = useState<FileInfo>([])

  //get client id's
  const clientId = router.query.clientId as string;
  const peerId = router.query.peerId as string;

  useEffect(() => {
    let rtcClient = null as any
    let serviceWorkerComm = null as any

    const run = async () => {
      //load ice
      const iceConfig = await loadIce()

      //set up handshake server
      const onTimeout = () => {
        //TODO, show user the 5 mins is up
        handleNavClick(`/timeout?reason=timeout-recieve`, true)
      }
      const handshakeServer = serverSendRecieve(clientId, peerId, (from: string, to: string, data: object, rtcid: number) => rtcClient.handshakeMsgRecieve(from, to, data, rtcid), onTimeout);

      const onConnectionSuccess = () => {
        console.log("onConnectionSuccess")

        //connection finished, close server 
        handshakeServer.close()

        setStatus("connected")

        //init swcomm
        serviceWorkerComm = swcomm((percent: number) => { }, rtcClient)
        serviceWorkerComm.init()
      }

      const onMessageRecieved = (data: any) => {
        console.log("message recieved", data)


        const { header, chunk } =  decodeChunkWithHeader(data);

        console.log("message header", header)

        if (header.type === "fileInfo") {
          setFileInfo(header.data)
        }

        if (header.type === "send-file") {
          //this is base 64 file data
          serviceWorkerComm.saveChunk(data);
        }
      }

      const onConnectionClosed = () => {
        console.log("onConnectionClosed")
        setStatus("disconnected")
      }

      //set up rtc client and connect to peer
      if (iceConfig) {
      rtcClient = client(iceConfig, onMessageRecieved, onConnectionSuccess, onConnectionClosed, handshakeServer.send);
      rtcClient.connect(clientId, peerId, true)
      }
      else {
        console.log("iceConfig not loaded")
        handleNavClick(`/error?reason=ice-load-fail`, true)
      }
    }
    if (clientId && peerId) {
      run()
    }

    return () => {
      rtcClient && rtcClient.disconnect();
      serviceWorkerComm && serviceWorkerComm.close();
    }
  }, [clientId, peerId]);

  return (
    <Container uc="main">

      {status === "connecting" && (<Connecting />)}

      {status === "connected" && (
        <>
          {fileInfo.map((file, index) => (
            <div key={index}>
              <ViewFile file={file} index={index} />
              <Spacer uc="medium" />
            </div>
          ))}
        </>
      )}

      {status === "disconnected" && (<Disconnected handleNavClick={handleNavClick} />)}

      <Spacer uc="medium" />
    </Container>
  );
}

export default Index;
