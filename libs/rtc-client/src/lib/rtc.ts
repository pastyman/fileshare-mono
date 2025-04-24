export type HandshakeData = { action: string; sdp: any };

export const rtc = (
  configuration: RTCConfiguration,
  receiveMessageCallback: (message: string, rtcid: number) => void,
  connectionEstablishedCallback: (rtcid: number) => void,
  connectionClosedCallback: () => void,
  sendHandshakeMsgCallback: (
    order: number,
    from: string,
    to: string,
    data: { action: string; sdp: any },
    rtcid: number
  ) => void,
  rtcid: number
) => {
  let messageSendCount = 0;
  let user = "";
  let user2 = "";

  const peerConnection = new RTCPeerConnection(configuration);

  const dataChannel = peerConnection.createDataChannel(rtcid.toString(), {
    ordered: true, // Maintain message order for reliability
  });

  // SDP optimization: increase throughput and message size
  const mungeSDP = (sdp: string): string => {
    sdp = sdp.replace(/a=mid:(.*)\r\n/g, 'a=mid:$1\r\nb=AS:1048576\r\n'); // 1 Gbps
    if (!sdp.includes("a=max-message-size")) {
      sdp += "a=max-message-size:262144\r\n"; // Max safe message size
    }
    return sdp;
  };

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      console.log("Sending ICE candidate:", e.candidate);
      sendNegotiation("candidate", e.candidate);
    }
  };

  dataChannel.onopen = () => {
    console.log("------ DATACHANNEL OPENED ------");
    connectionEstablishedCallback(rtcid);
  };

  dataChannel.onclose = () => {
    console.log("------ DataChannel CLOSED ------");
    connectionClosedCallback();
  };

  dataChannel.onerror = (error) => {
    console.error("DataChannel ERROR:", error);
    connectionClosedCallback();
  };

  peerConnection.ondatachannel = (ev) => {
    ev.channel.onopen = () => {
      console.log("Remote DataChannel is open");
      connectionEstablishedCallback(rtcid);
    };
    ev.channel.onmessage = (e) => {
      receiveMessageCallback(e.data, rtcid);
    };
  };

  const connect = (fuser: string, fuser2: string, polite = false) => {
    user = fuser;
    user2 = fuser2;

    const sdpConstraints = { offerToReceiveAudio: false, offerToReceiveVideo: false };

    const initializeConnection = async () => {
      if (!polite) {
        const offer = await peerConnection.createOffer(sdpConstraints);
        offer.sdp = mungeSDP(offer.sdp || '');
        await peerConnection.setLocalDescription(offer);
        sendNegotiation("offer", peerConnection.localDescription);
      }
    };

    initializeConnection().catch(console.error);
  };

  const handshake = (from: string, to: string, data: HandshakeData) => {
    if (to === user) {
      switch (data.action) {
        case "candidate":
          processIce(data.sdp);
          break;
        case "offer":
          processOffer(data.sdp);
          break;
        case "answer":
          processAnswer(data.sdp);
          break;
      }
    }
  };

  const processOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      answer.sdp = mungeSDP(answer.sdp || '');
      await peerConnection.setLocalDescription(answer);
      sendNegotiation("answer", peerConnection.localDescription);
    } catch (e) {
      console.error("Error processing offer:", e);
    }
  };

  const processAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      await peerConnection.setRemoteDescription(answer);
    } catch (e) {
      console.error("Error processing answer:", e);
    }
  };

  const processIce = (iceCandidate: RTCIceCandidateInit) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate))
      .then(() => console.log("ICE candidate added"))
      .catch((e) => console.error("Error adding ICE candidate:", e));
  };

  const closeConnection = () => {
    if (dataChannel.readyState === "open") {
      dataChannel.close();
    }
    peerConnection.close();
    console.log("Peer connection closed");
  };

  const send = (message: ArrayBuffer) => {
    if (dataChannel.readyState === "open") {
      try {
        dataChannel.send(message);
      } catch (e) {
        console.error("Send error:", e);
      }
    } else {
      console.warn("DataChannel not open — message not sent");
    }
  };

  const bufferedAmount = () => dataChannel?.bufferedAmount ?? null;

  const sendNegotiation = (type: string, sdp: any) => {
    const data = { action: type, sdp };
    messageSendCount++;
    sendHandshakeMsgCallback(messageSendCount, user, user2, data, rtcid);
  };

  return {
    handshake,
    connect,
    send,
    bufferedAmount,
    closeConnection,
  };
};
