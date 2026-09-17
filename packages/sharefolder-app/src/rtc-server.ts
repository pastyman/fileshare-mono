// RTC Server - Pure TypeScript version with lib imports
import { getUUID, filesender } from "helpers"
import { client, serverSendRecieve, serverConnectSend, loadIce, decodeChunkWithHeader, encodeChunkWithHeader } from "rtc-client"
type FileInfo = {
  name: string
  size: number
}[]

interface RTCConnectionInfo {
  peerId: string;
  folderId: string;
  folderPath: string;
}

//interface RTCServerState {
//  connectionInfo: RTCConnectionInfo | null;
//  status: string;
//  rtcClient: any | null;
//}

class RTCServer {
  private state: RTCServerState = {
    connectionInfo: null,
    status: 'Initializing...',
    rtcClient: null
  };

  constructor() {
    this.init();
  }

  private init(): void {
    this.updateUI();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for connection info from main process
    if (window.electronAPI && window.electronAPI.onRTCConnectionInfo) {
      window.electronAPI.onRTCConnectionInfo((info: RTCConnectionInfo) => {
        console.log('Received RTC connection info:', info);
        this.state.connectionInfo = info;
        this.state.status = 'Connected';
        this.updateUI();

      });
    } else {
      this.state.status = 'Electron API not available';
      this.updateUI();
    }
  }


  private updateUI(): void {
    const app = document.getElementById('app');
    if (!app) return;

    if (!this.state.connectionInfo) {
      app.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2>RTC Server TS FROM PARIS edit 2</h2>
          <p>Status: ${this.state.status}</p>
          <p>Waiting for connection info...</p>
        </div>
      `;
    } else {
      app.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2>RTC Server TS FROM PARIS edit 2</h2>
          <p>Status: ${this.state.status}</p>
          <div style="margin-top: 20px;">
            <h3>Connection Details:</h3>
            <p><strong>Peer ID:</strong> ${this.state.connectionInfo.peerId}</p>
            <p><strong>Folder ID:</strong> ${this.state.connectionInfo.folderId}</p>
            <p><strong>Folder Path:</strong> ${this.state.connectionInfo.folderPath}</p>
          </div>
          <div style="margin-top: 20px;">
            <h3>RTC Controls:</h3>
            <button 
              style="padding: 10px 20px; margin: 5px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
              onclick="window.startRTCConnection()"
            >
              Start Connection
            </button>
            <button 
              style="padding: 10px 20px; margin: 5px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
              onclick="window.stopRTCConnection()"
            >
              Stop Connection
            </button>
          </div>
        </div>
      `;
    }
  }
}

const logToDom = (message: string) => {
  console.log(message);

  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML += `<p>${message}</p>`;
}

//wait for dom to load
document.addEventListener('DOMContentLoaded', () => {
  // Listen for connection info from main process
  if (window.electronAPI && window.electronAPI.onRTCConnectionInfo) {
    window.electronAPI.onRTCConnectionInfo((info: RTCConnectionInfo) => {
      logToDom(`Received RTC connection info: ${info}`);
      //handshake with server to initiate the connection start
      ///////////////////////////////////////////////////////////////////
      //get uuid
      const clientId = getUUID()

      ///////////////////////////////////////////////////////////////////
      //server funcs
      const onPeerId = async (peerId: string | null) => {
        if (peerId) {
      //load ice
      const iceConfig = await loadIce()

          logToDom(`peer id: ${peerId} - ready to make rtc connection`)

          let rtcClient = null as any
          const fileSender = filesender()
          const handshakeServer = serverSendRecieve(clientId, peerId, (from: string, to: string, data: object, rtcid: number) => rtcClient.handshakeMsgRecieve(from, to, data, rtcid), onTimeout);

          const onConnectionSuccess = () => {
            console.log("onConnectionSuccess")
    
            //connection finished, close server 
            handshakeServer.close()
    
            logToDom("RTC connected")
    
            const payload = encodeChunkWithHeader({ type: "fileInfo", data: FileInfo })
    
    
            logToDom(`sending ${payload}`)
    
            //send file info
            rtcClient.send(payload)
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
            logToDom("disconnected")
          }

          //we are ready to make rtc connection
          rtcClient = client(iceConfig, onMessageRecieved, onConnectionSuccess, onConnectionClosed, handshakeServer.send);
          rtcClient.connect(clientId, peerId, false)
        }
        else {
          //navigate to error page
          logToDom(`error - no peer id`)
        }
      }
      const onTimeout = () => {
        logToDom(`error - timeout`)
      }
      const scs = serverConnectSend(onPeerId, onSecret, onTimeout)
      scs.connectSend(clientId)

    });
  } else {
    logToDom('Electron API not available')
  }


});
