import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Container, Spacer } from "ui-components"
import { client, serverSendRecieve, loadIce, decodeChunkWithHeader, encodeChunkWithHeader } from "rtc-client"
import { FileInfo } from "../components/File"
import { Connecting, Connected, Disconnected } from "../components/Status"
import { filesender } from "helpers"

const Index = ({ fileInfo, onNavigate }: {fileInfo: FileInfo, onNavigate: any }) => {
  const handleNavClick = (url: string, replace: boolean = false) => {
    onNavigate(url, replace)
  }

  const [status, setStatus] = useState("connecting")

  //get client id's
  const router = useRouter()
  const clientId = router.query.clientId as string;
  const peerId = router.query.peerId as string;

  useEffect(() => {
    let rtcClient = null as any
    const fileSender = filesender()

    const run = async () => {
      //load ice
      const iceConfig = await loadIce()

      //set up handshake server
      const onTimeout = () => {
        //TODO, show user the 5 mins is up
        handleNavClick(`/timeout?reason=timeout-send`, true)
      }
      const handshakeServer = serverSendRecieve(clientId, peerId, (from: string, to: string, data: object, rtcid: number) => rtcClient.handshakeMsgRecieve(from, to, data, rtcid), onTimeout);

      const onConnectionSuccess = () => {
        console.log("onConnectionSuccess")

        //connection finished, close server 
        handshakeServer.close()

        setStatus("connected")

        const payload = encodeChunkWithHeader({ type: "fileInfo", data: fileInfo })


        console.log("sending", payload)

        //send file info
        rtcClient.send(payload)

        console.log("sent", payload)
      }

      const onMessageRecieved = (data: any) => {
        const { header, chunk } =  decodeChunkWithHeader(data);

        if (header.type === "file-send") {
          //get file ref
          var filedom = document.getElementById('home-files');
          //@ts-ignore
          const fileHandle = filedom.files[header.data.fileinfo.index];

          //send file
          if (fileHandle) {
            fileSender.sendFile(fileHandle, header.data.requestID, header.data.range, rtcClient.send, rtcClient.bufferedAmount, () => { }, () => { });
          }
        }

        if (header.type === "cancel") {
          //cancel current upload
          fileSender.cancelUpload(header.data.requestID);
          console.log('canceled!');
        }

        //console.log("onMessageRecieved", data)
      }

      const onConnectionClosed = () => {
        console.log("onConnectionClosed")
        setStatus("disconnected")
      }

      //set up rtc client and connect to peer
      if (iceConfig) {
        rtcClient = client(iceConfig, onMessageRecieved, onConnectionSuccess, onConnectionClosed, handshakeServer.send);
        rtcClient.connect(clientId, peerId, false)
      }
      else {
        console.log("iceConfig not loaded")
        handleNavClick(`/error?reason=ice-load-fail`, true)
      }
    }
    if (clientId && peerId) {
      run()
    }

    return () => 
      {
        rtcClient && rtcClient.disconnect();
        fileSender.cancelAll();
      }
  }, [clientId, peerId]);

  return (
    <Container uc="main">

      {status === "connecting" && (<Connecting />)}

      {status === "connected" && (<Connected />)}

      {status === "disconnected" && (<Disconnected handleNavClick={handleNavClick} />)}

      <Spacer uc="medium" />
    </Container>
  );
}

export default Index;
