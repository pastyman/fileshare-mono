import axios from "axios"
import { Messaging, IceResponse } from "types"

//TODO - needs work
const isClosed = (pollStart: number) => {
  //5 mins
  const timeout = 300000;

  //test 1 min
  //const timeout = 60000;

  return Date.now() - pollStart > timeout;
}

const isClosedSendRecieve = (pollStart: number) => {
  //45 secs
  const timeout = 45000;

  return Date.now() - pollStart > timeout;
}

const is2xx = (statusCode: number) =>
  Number(String(statusCode).slice(0, 1)) === 2

const axiosInstance = axios.create({
  validateStatus: (status) => {
    return true
  },
})

export const serverSendRecieve = (clientId: string, peerId: string, onMessageRecieved: (from: string, to: string, data: object, rtcid: number) => void, onTimeout: () => void) => {
  let THB: any = null;
  let closed = false;
  let pollStart = Date.now();

  const pollServer = async () => {
    const response = await axiosInstance.post("/api/recieve", { from: peerId, to: clientId })
    if (response.data) {
      response.data.forEach((message: Messaging) => {
        onMessageRecieved(message.from, message.to, message.data, parseInt(message.rtcid))
      })
    }

    if (isClosedSendRecieve(pollStart)) {
      closed = true;
      onTimeout();
    }
    if (!closed) {
      THB = setTimeout(pollServer, 500);
    }
  }
  //init polling
  THB = setTimeout(pollServer, 500);

  const send = (order: number, from: string, to: string, data: object, rtcid: number) => {
    axiosInstance.post(`/api/send`, {
      order,
      from,
      to,
      data,
      rtcid: parseInt(rtcid.toString())
    })
  }

  const close = () => {
    closed = true;
    clearTimeout(THB);

    axiosInstance.post(`/api/clean`, {
      from: clientId,
      to: peerId
    })
  }

  return {
    send,
    close
  }
}

export const serverConnectSend = (onPeerId: (peerId: string | null) => void, onSecret: (secret: string | null) => void, onTimeout: () => void) => {
  let THB: any = null;
  let secret: string = '';
  let closed = false;
  let pollStart = Date.now();

  const pollServer = async () => {
    const response = await axiosInstance.get(`/api/connectSendPoll?secret=${secret}`)
    if (response.status === 200 && response.data.peerId) {
      //success, job finished
      onPeerId(response.data.peerId)
    }
    else if (response.status !== 200) {
      onPeerId(null)
    }
    else {
      if (isClosed(pollStart)) {
        closed = true;
        onTimeout();
      }

      //continue polling
      if (!closed) {
        THB = setTimeout(pollServer, 3000);
      }
    }
  }

  const connectSend = async (clientId: string) => {
    const response = await axiosInstance.post(`/api/connectSend`, {
      clientId
    })
    if (response.status === 200) {
      //success, start polling to get peerId
      THB = setTimeout(pollServer, 3000);

      //set secret
      secret = response.data.secret;

      //return secret
      onSecret(secret);
    }

    onSecret(null);
  }

  const close = () => {
    closed = true;
    clearTimeout(THB);
  }

  return {
    close,
    connectSend
  }
}

export const serverConnectRecieve = (onPeerId: (peerId: string) => void, onError: (error: "incorrectPin" | "serverError") => void) => {

  const connectRecieve = async (clientId: string, secret: string) => {
    const response = await axiosInstance.get(`/api/connectRecieve?secret=${secret}&peerId=${clientId}`)
   
    if (response.status === 200) {
      onPeerId(response.data.peerId);
    }
    else if (response.status === 400) {
      onError("incorrectPin");
    }
    else {
      onError("serverError");
    }
  }

  return {
    connectRecieve
  }
}

export const loadIce = async (): Promise<IceResponse | null> => {
  const response = await axiosInstance.get(`/api/ice`)
  if (response.status === 200) {
    return response.data;
  }
  else {
    return null;
  }
}