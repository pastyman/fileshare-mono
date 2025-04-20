export type HandshakeData = { action: string; sdp: any };

export const rtc = (
  configuration: RTCConfiguration,
  receiveMessageCallback: (message: string, rtcid: number) => void,
  connectionEstablishedCallback: (rtcid: number) => void,
  connectionClosedCallback: () => void,
  sendHandshakeMsgCallback: (order: number, from: string, to: string, data: { action: string; sdp: any }, rtcid: number) => void,
  rtcid: number
) => {
  let messageSendCount = 0;
  let user = "";
  let user2 = "";
  const config = configuration;
  const peerConnection = new RTCPeerConnection(config);
  const dataChannel = peerConnection.createDataChannel(rtcid.toString());

  // Event Handlers
  peerConnection.onicecandidate = (e) => {
    //ice candidate
    console.log("ICE candidate event:", e);

    if (e.candidate) {
      console.log("Sending ICE candidate:", e.candidate);
      sendNegotiation("candidate", e.candidate)
    }
  };

  dataChannel.onopen = () => {
    console.log("------ DATACHANNEL OPENED ------");
  };

  dataChannel.onclose = () => {
    console.log("------ DC closed! ------ " + rtcid);
    connectionClosedCallback();
  };

  dataChannel.onerror = (error) => {
    console.log("DC ERROR!!!", error);
    connectionClosedCallback();
  };

  peerConnection.ondatachannel = (ev) => {
    console.log("peerConnection.ondatachannel event fired.");
    ev.channel.onopen = () => {
      console.log("Data channel is open and ready to be used.");
      connectionEstablishedCallback(rtcid);
    };
    ev.channel.onmessage = (e) => {
      receiveMessageCallback(e.data, rtcid);
    };
  };

  function connect(fuser: string, fuser2: string, polite: boolean = false) {
    user = fuser;
    user2 = fuser2;

    const sdpConstraints = { offerToReceiveAudio: false, offerToReceiveVideo: false };
    // var sdpConstraints = {
    //   'mandatory':
    //   {
    //     'OfferToReceiveAudio': false,
    //     'OfferToReceiveVideo': false
    //   }
    // };

    const intializeConnection = async () => {
      if (!polite) {
        console.log("NOT POLITE MODE")
        const offer = await peerConnection.createOffer(sdpConstraints);
        await peerConnection.setLocalDescription(offer);
        sendNegotiation("offer", peerConnection.localDescription);
      }
    }
    intializeConnection();
  }

  function handshake(from: string, to: string, data: HandshakeData) {
    console.log(`Handshake received from ${from} to ${to}:`, data);
    if (to === user) {
      if (data.action === "candidate") {
        processIce(data.sdp);
      } else if (data.action === "offer") {
        processOffer(data.sdp);
      } else if (data.action === "answer") {
        processAnswer(data.sdp);
      }
    }
  }

  function processOffer(offer: RTCSessionDescriptionInit) {
    console.log("Processing offer:", offer);

    const processWork = async () => {
      // Set the remote description for the offer
      await peerConnection.setRemoteDescription(offer);
      // Create an answer to the offer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      sendNegotiation("answer", peerConnection.localDescription);
    }
    processWork();
  }

  function processAnswer(answer: RTCSessionDescriptionInit) {
    console.log("Processing answer:", answer);

    const processWork = async () => {
      try{
      // Set the remote description for the answer
      await peerConnection.setRemoteDescription(answer);
      }
      catch(e){
        console.log("processAnswer error", e);
      }
    }
    processWork();
  }

  function processIce(iceCandidate: RTCIceCandidateInit) {
    console.log("Processing ICE candidate:", iceCandidate);
    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate))
      .then(() => console.log("ICE candidate added successfully!"))
      .catch((e) => console.log("Error adding ICE candidate:", e));
  }

  function closeConnection() {
    console.log("Closed connection called");

    if (dataChannel.readyState === "open") {
      dataChannel.close();
    }
    peerConnection.close();
  }

  function send(message: ArrayBuffer) {
    if (dataChannel.readyState === "open") {
      try {
        dataChannel.send(message);
      } catch (e) {
        console.log("SEND MSG ERROR", e);
      }
    } else {
      console.log("Data channel is not open. Message not sent.");
    }
  }

  function bufferedAmount() {
    return dataChannel ? dataChannel.bufferedAmount : null;
  }

  function sendNegotiation(type: string, sdp: any) {
    const data = { action: type, sdp };
    messageSendCount = messageSendCount + 1;
    sendHandshakeMsgCallback(messageSendCount, user, user2, data, rtcid);
  }

  return {
    handshake,
    connect,
    send,
    bufferedAmount,
    closeConnection,
  };
};
