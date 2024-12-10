import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Container, Spacer } from "ui-components"
import { client, serverSendRecieve, loadIce } from "rtc-client"
import { FileInfo } from "../components/File"
import { Connecting, Connected, Disconnected } from "../components/Status"
import { filesender } from "helpers"

export function Index({ fileInfo }: { fileData: FileList, fileInfo: FileInfo }) {
  const router = useRouter()

  const handleNavClick = (url: string) => {
    router.push(url)
  }

  const [status, setStatus] = useState("connecting")

  //get client id's
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
        router.replace(`/timeout?reason=timeout-send`)
      }
      const handshakeServer = serverSendRecieve(clientId, peerId, (from: string, to: string, data: object, rtcid: number) => rtcClient.handshakeMsgRecieve(from, to, data, rtcid), onTimeout);

      const onConnectionSuccess = () => {
        console.log("onConnectionSuccess")

        //connection finished, close server 
        handshakeServer.close()

        setStatus("connected")

        const payload = JSON.stringify({ type: "fileInfo", data: fileInfo })

        //send file info
        rtcClient.send(payload)

        console.log("sent", payload)
      }

      const onMessageRecieved = (data: any) => {
        let message: { type: string, data?: any } = { type: "base64file" };
        if (data.length > 0 && data[0] === "{") {
          message = JSON.parse(data);
        }

        if (message.type === "send") {
          //get file ref
          var filedom = document.getElementById('home-files');
          //@ts-ignore
          const fileHandle = filedom.files[message.data.fileinfo.index];

          //send file
          if (fileHandle) {
            fileSender.sendFile(fileHandle, message.data.requestID, message.data.range, rtcClient.send, rtcClient.bufferedAmount, () => { }, () => { });
          }
        }

        if (message.type === "cancel") {
          //cancel current upload
          fileSender.cancelUpload(message.data.requestID);
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
        router.replace(`/error?reason=ice-load-fail`)
      }
    }
    if (clientId && peerId) {
      run()
    }

    return () => rtcClient && rtcClient.disconnect()
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
