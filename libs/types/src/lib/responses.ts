export type IceResponse = {
  iceServers: {
    urls: string
    username?: string
    credential?: string
  }[]
}