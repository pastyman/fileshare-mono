import { buffer } from "./buffer";
import { rtc, HandshakeData } from "./rtc";
import {encodeChunkWithHeader, decodeChunkWithHeader} from "./convert";
import { Messaging } from "types"

//a wrapper that abstracts multiple rtc sessions into one
export const client = (
  configuration: RTCConfiguration,
  onMessageRecieved: (data: string) => void,
  onConnectionSuccess: () => void,
  onConnectionClosed: () => void,
  onHandshakeMsgSend: (order: number, from: string, to: string, data: object, rtcid: number) => void
) => {

  let connected = [0, 0, 0, 0];
  let lastMessageFromPeer: any = null;
  let THB: any = null;

  let channel = 0;
  let incomingChannel = 0;
  const messageBuf0 = buffer();
  const messageBuf1 = buffer();
  const messageBuf2 = buffer();
  const messageBuf3 = buffer();

  const rtc0 = rtc(configuration, onMessageRecievedProxy, connectionEstablishedCallbackProxy, onConnectionClosedProxy, onHandshakeMsgSendProxy, 0);
  const rtc1 = rtc(configuration, onMessageRecievedProxy, connectionEstablishedCallbackProxy, onConnectionClosedProxy, onHandshakeMsgSendProxy, 1);
  const rtc2 = rtc(configuration, onMessageRecievedProxy, connectionEstablishedCallbackProxy, onConnectionClosedProxy, onHandshakeMsgSendProxy, 2);
  const rtc3 = rtc(configuration, onMessageRecievedProxy, connectionEstablishedCallbackProxy, onConnectionClosedProxy, onHandshakeMsgSendProxy, 3);
  const rtcs = [rtc0, rtc1, rtc2, rtc3];

  //connect to other peer
  const connect = async (fuser: any, fuser2: any, polite: boolean) => {
    //reset
    THB = null;
    connected = [0, 0, 0, 0];

    //connect
    rtc0.connect(fuser, fuser2, polite);
    rtc1.connect(fuser, fuser2, polite);
    rtc2.connect(fuser, fuser2, polite);
    rtc3.connect(fuser, fuser2, polite);

    //wait for all connections to become active
    const pollStatus = async () => {
      if (connected.find((item) => item === 0) !== undefined) {
        //continue polling
        setTimeout(() => {
          pollStatus()
        }, 500)

      } else {
        onSuccess()
      }
    }
    //init polling
    pollStatus()

    const onSuccess = () => {
      onConnectionSuccess()
    }
  }

  //deals with lost connection between peers
  function onConnectionClosedProxy() {
    onConnectionClosed();
  }

  //rtc handshake send message via server
  function onHandshakeMsgSendProxy(order: number, from: string, to: string, data: object, rtcid: number) {
    onHandshakeMsgSend(order, from, to, data, rtcid);
  }

  //rtc message recieved coming back from other peer
  function onMessageRecievedProxy(data: string, rtcid: number) {
    //update date
    lastMessageFromPeer = Date.now();

    //check for who
    if (rtcid === 0) {
      messageBuf0.push(data);
    }
    else if (rtcid === 1) {
      messageBuf1.push(data);
    }
    else if (rtcid === 2) {
      messageBuf2.push(data);
    }
    else if (rtcid === 3) {
      messageBuf3.push(data);
    }

    // console.log('0 length: ' + messageBuf0.length());
    // console.log('1 length: ' + messageBuf1.length());
    // console.log('2 length: ' + messageBuf2.length());
    // console.log('3 length: ' + messageBuf3.length());
    // console.log('incomingChannel: ' + incomingChannel);

    var recieving = true;
    var recieved = false;
    while (recieving === true) {
      //reset
      recieved = false;

      //stuff still queued to recieve
      for (var ccheck = 0; ccheck < 2; ccheck++) {
        if (incomingChannel === 0 && messageBuf0.length() > 0) {
          incomingChannel++;
          onMessageRecieved(messageBuf0.shift());
          recieved = true;
          break;
        }
        if (incomingChannel === 1 && messageBuf1.length() > 0) {
          incomingChannel++;
          onMessageRecieved(messageBuf1.shift());
          recieved = true;
          break;
        }
        if (incomingChannel === 2 && messageBuf2.length() > 0) {
          incomingChannel++;
          onMessageRecieved(messageBuf2.shift());
          recieved = true;
          break;
        }
        if (incomingChannel === 3 && messageBuf3.length() > 0) {
          incomingChannel = 0;
          onMessageRecieved(messageBuf3.shift());
          recieved = true;
          break;
        }
      }

      if (recieved !== true) {
        recieving = false;
      }
    }
  }

  function send(message: ArrayBuffer) {
    let bestIdx = -1;
    let bestAmount = Infinity;

    for (let i = 0; i < rtcs.length; i++) {
      const idx = (channel + i) % rtcs.length;
      const amount = rtcs[idx].bufferedAmount() ?? Infinity;

      if (amount < bestAmount) {
        bestAmount = amount;
        bestIdx = idx;
      }
    }

    if (bestIdx >= 0) {
      channel = (bestIdx + 1) % rtcs.length;
      rtcs[bestIdx].send(message);
    }
  }

  function bufferedAmount() {
    const amounts = rtcs
      .map(rtcInstance => rtcInstance.bufferedAmount())
      .filter((amount): amount is number => amount !== null);

    if (amounts.length === 0) {
      return null;
    }

    return Math.min(...amounts);
  }

  //connection established - only fires back when both connected (this fires on both peers)
  function connectionEstablishedCallbackProxy(rtcid: number) {
    connected[rtcid] = 1;
    var isConnected = true;
    for (var i = 0; i < connected.length; i++) {
      if (connected[i] === 0) {
        isConnected = false;
      }
    }
    if (isConnected) {
      //clear all and reset
      channel = 0;
      incomingChannel = 0;
      messageBuf0.clear();
      messageBuf1.clear();
      messageBuf2.clear();
      messageBuf3.clear();

      //monitor connection health
      console.log("RUNNING CONNECTION HEALTH")
      lastMessageFromPeer = Date.now() + 30000; //set 30 secs in future to give both chance
      THB = setTimeout(connectionHealth, 3000);
    }
  }

  function connectionHealth() {
    clearTimeout(THB);

    //send ping
    send(encodeChunkWithHeader({ type: "ping" }));

    console.log('SEND PING', lastMessageFromPeer);

    //check if message has been recieved in last 15 seconds
    if (Date.now() - lastMessageFromPeer > 15000) {
      console.log('CONNECTION DEAD');
      disconnect();
      onConnectionClosed();
    }
    else {
      THB = setTimeout(connectionHealth, 3000);
    }
  }

  //send disconnect to peer and then disconnect
  function disconnect() {
    function closeConnection() {
      //reset connection health monitoring
      clearTimeout(THB);

      //closes all rtc connections managed by this wrapper
      rtc0.closeConnection();
      rtc1.closeConnection();
      rtc2.closeConnection();
      rtc3.closeConnection();

      console.log('CLOSE CONNECTION CALLED !');
    }


    send(encodeChunkWithHeader({ type: "disconnect" }));
    setTimeout(function () {
      closeConnection();
    }, 3000);
  }

  function handshakeMsgRecieve(from: string, to: string, data: HandshakeData, rtcid: number) {
    //check for who
    if (rtcid === 0) {
      rtc0.handshake(from, to, data);
    }
    else if (rtcid === 1) {
      rtc1.handshake(from, to, data);
    }
    else if (rtcid === 2) {
      rtc2.handshake(from, to, data);
    }
    else if (rtcid === 3) {
      rtc3.handshake(from, to, data);
    }
  }

  return {
    connect,
    disconnect,
    handshakeMsgRecieve,
    send: send,
    bufferedAmount: bufferedAmount,
  };
}