import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { Container, Spacer } from "ui-components"
import { client, serverSendRecieve, loadIce, decodeChunkWithHeader, encodeChunkWithHeader } from "rtc-client"
import { FileInfo } from "../components/File"
import { Connecting, Connected, Disconnected, Sending, UploadProgress } from "../components/Status"
import { filesender } from "helpers"

type RangeProgress = {
  rangeBytes: number
  percent: number
  done: boolean
}

type FileTransferState = {
  fileIndex: number
  name: string
  size: number
  completedBytes: number
  ranges: Map<number, RangeProgress>
}

const buildUpload = (file: FileTransferState): UploadProgress => {
  let inFlightBytes = 0
  let activeRanges = 0

  file.ranges.forEach((range) => {
    if (!range.done) {
      activeRanges += 1
      inFlightBytes += (range.rangeBytes * range.percent) / 100
    }
  })

  const totalSent = Math.min(file.size, file.completedBytes + inFlightBytes)
  const percent = Math.min(100, Math.floor((totalSent / Math.max(file.size, 1)) * 100))

  return {
    fileIndex: file.fileIndex,
    name: file.name,
    size: file.size,
    percent,
    done: activeRanges === 0 && percent >= 100,
  }
}

const Index = ({ fileInfo, onNavigate }: {fileInfo: FileInfo, onNavigate: any }) => {
  const handleNavClick = (url: string, replace: boolean = false) => {
    onNavigate(url, replace)
  }

  const [status, setStatus] = useState("connecting")
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const fileTransfersRef = useRef<Map<number, FileTransferState>>(new Map())

  //get client id's
  const router = useRouter()
  const clientId = router.query.clientId as string;
  const peerId = router.query.peerId as string;

  useEffect(() => {
    let rtcClient = null as any
    const fileSender = filesender()
    fileTransfersRef.current = new Map()

    const publishUploads = () => {
      const nextUploads = Array.from(fileTransfersRef.current.values()).map(buildUpload)
      setUploads(nextUploads)
    }

    const ensureFileTransfer = (fileIndex: number, fileHandle: File) => {
      let fileTransfer = fileTransfersRef.current.get(fileIndex)
      if (!fileTransfer) {
        fileTransfer = {
          fileIndex,
          name: fileHandle.name,
          size: fileHandle.size,
          completedBytes: 0,
          ranges: new Map(),
        }
        fileTransfersRef.current.set(fileIndex, fileTransfer)
      }
      return fileTransfer
    }

    const updateRangeProgress = (
      fileIndex: number,
      requestID: number,
      rangeBytes: number,
      percent: number,
      done: boolean
    ) => {
      const fileTransfer = fileTransfersRef.current.get(fileIndex)
      if (!fileTransfer) {
        return
      }

      const existing = fileTransfer.ranges.get(requestID)
      if (done) {
        if (existing && !existing.done) {
          fileTransfer.completedBytes = Math.min(
            fileTransfer.size,
            fileTransfer.completedBytes + rangeBytes
          )
        } else if (!existing) {
          fileTransfer.completedBytes = Math.min(
            fileTransfer.size,
            fileTransfer.completedBytes + rangeBytes
          )
        }
        fileTransfer.ranges.delete(requestID)
      } else {
        fileTransfer.ranges.set(requestID, { rangeBytes, percent, done: false })
      }

      publishUploads()
    }

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

        const fileInput = document.getElementById('home-files') as HTMLInputElement | null;
        const actualFileInfo = fileInfo.map((file, index) => ({
          name: file.name,
          size: fileInput?.files?.[index]?.size ?? file.size,
        }));

        const payload = encodeChunkWithHeader({ type: "fileInfo", data: actualFileInfo })


        console.log("sending", payload)

        //send file info
        rtcClient.send(payload)

        console.log("sent", payload)
      }

      const onMessageRecieved = (data: any) => {
        const { header } =  decodeChunkWithHeader(data);

        if (header.type === "file-send") {
          //get file ref
          var filedom = document.getElementById('home-files');
          //@ts-ignore
          const fileHandle = filedom.files[header.data.fileinfo.index];

          //send file
          if (fileHandle) {
            const requestID = header.data.requestID;
            const fileIndex = header.data.fileinfo.index;
            const actualEndPos = Math.min(header.data.range.endPos, fileHandle.size);
            const rangeBytes = Math.max(actualEndPos - header.data.range.startPos, 1);

            ensureFileTransfer(fileIndex, fileHandle)
            updateRangeProgress(fileIndex, requestID, rangeBytes, 0, false)

            fileSender.sendFile(
              fileHandle,
              requestID,
              { startPos: header.data.range.startPos, endPos: actualEndPos },
              rtcClient.send,
              rtcClient.bufferedAmount,
              (percent: number) => {
                updateRangeProgress(fileIndex, requestID, rangeBytes, percent, false)
              },
              () => {
                updateRangeProgress(fileIndex, requestID, rangeBytes, 100, true)
              }
            );
          }
        }

        if (header.type === "cancel") {
          //cancel current upload
          const requestID = header.data.requestID
          fileSender.cancelUpload(requestID);

          fileTransfersRef.current.forEach((fileTransfer, fileIndex) => {
            const range = fileTransfer.ranges.get(requestID)
            if (range) {
              updateRangeProgress(fileIndex, requestID, range.rangeBytes, range.percent, true)
            }
          })
          console.log('canceled!');
        }

        if (header.type === "pause") {
          fileSender.pauseUpload(header.data.requestID);
        }

        if (header.type === "resume") {
          fileSender.resumeUpload(header.data.requestID);
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

      {status === "connected" && (
        <>
          {uploads.length === 0 ? <Connected /> : <Sending uploads={uploads} />}
        </>
      )}

      {status === "disconnected" && (<Disconnected handleNavClick={handleNavClick} />)}

      <Spacer uc="medium" />
    </Container>
  );
}

export default Index;
