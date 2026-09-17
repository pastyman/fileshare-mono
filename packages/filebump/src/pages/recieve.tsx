import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { Container, Spacer } from "ui-components"
import { client, serverSendRecieve, loadIce, decodeChunkWithHeader } from "rtc-client"
import { FileInfo } from "../components/File"
import { Connecting, Disconnected } from "../components/Status"
import { ViewFile, FileDownloadProgress } from "../components/ViewFile"
import { swcomm, DownloadProgressEvent } from "helpers"

const Index = ({ onNavigate }: { onNavigate: any }) => {
  const handleNavClick = (url: string, replace: boolean = false) => {
    onNavigate(url, replace)
  }
  const router = useRouter()

  const [status, setStatus] = useState("connecting")
  const [fileInfo, setFileInfo] = useState<FileInfo>([])
  const [downloadProgress, setDownloadProgress] = useState<Record<number, FileDownloadProgress>>({})
  const trackedDownloadsRef = useRef<Set<number>>(new Set())
  const latestProgressRef = useRef<Record<number, FileDownloadProgress>>({})
  const progressFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  //get client id's
  const clientId = router.query.clientId as string;
  const peerId = router.query.peerId as string;

  useEffect(() => {
    let rtcClient = null as any
    let serviceWorkerComm = null as any
    trackedDownloadsRef.current = new Set()
    latestProgressRef.current = {}
    setDownloadProgress({})

    const flushProgress = () => {
      progressFlushTimerRef.current = null
      setDownloadProgress({ ...latestProgressRef.current })
    }

    const scheduleProgressFlush = () => {
      if (progressFlushTimerRef.current) {
        return
      }
      progressFlushTimerRef.current = setTimeout(flushProgress, 250)
    }

    const run = async () => {
      //load ice
      const iceConfig = await loadIce()

      //set up handshake server
      const onTimeout = () => {
        //TODO, show user the 5 mins is up
        handleNavClick(`/timeout?reason=timeout-recieve`, true)
      }
      const handshakeServer = serverSendRecieve(clientId, peerId, (from: string, to: string, data: object, rtcid: number) => rtcClient.handshakeMsgRecieve(from, to, data, rtcid), onTimeout);

      const onDownloadProgress = (progress: DownloadProgressEvent) => {
        // Ignore preview/stream range fetches; only show for intentional downloads.
        if (progress.isRange) {
          return
        }

        if (!trackedDownloadsRef.current.has(progress.fileIndex)) {
          return
        }

        latestProgressRef.current[progress.fileIndex] = {
          percent: progress.percent,
          done: progress.percent >= 100,
        }

        if (progress.percent >= 100) {
          if (progressFlushTimerRef.current) {
            clearTimeout(progressFlushTimerRef.current)
            progressFlushTimerRef.current = null
          }
          flushProgress()
          return
        }

        scheduleProgressFlush()
      }

      const onConnectionSuccess = () => {
        console.log("onConnectionSuccess")

        //connection finished, close server 
        handshakeServer.close()

        setStatus("connected")

        //init swcomm
        serviceWorkerComm = swcomm(onDownloadProgress, rtcClient)
        serviceWorkerComm.init()
      }

      const onMessageRecieved = (data: any) => {
        const { header } =  decodeChunkWithHeader(data);

        if (header.type === "fileInfo") {
          setFileInfo(header.data)
        }

        if (header.type === "file-send") {
          //this is file data
          serviceWorkerComm.saveChunk(data);
        }
        if (header.type === "file-end") {
          //this is EOF
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
      if (progressFlushTimerRef.current) {
        clearTimeout(progressFlushTimerRef.current)
      }
      rtcClient && rtcClient.disconnect();
      serviceWorkerComm && serviceWorkerComm.close();
    }
  }, [clientId, peerId]);

  const handleDownloadStart = (fileIndex: number) => {
    trackedDownloadsRef.current.add(fileIndex)
    latestProgressRef.current[fileIndex] = { percent: 0, done: false }
    setDownloadProgress((current) => ({
      ...current,
      [fileIndex]: { percent: 0, done: false },
    }))
  }

  return (
    <Container uc="main">

      {status === "connecting" && (<Connecting />)}

      {status === "connected" && (
        <>
          {fileInfo.map((file, index) => (
            <div key={index}>
              <ViewFile
                file={file}
                index={index}
                downloadProgress={downloadProgress[index] ?? null}
                onDownloadStart={handleDownloadStart}
              />
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
