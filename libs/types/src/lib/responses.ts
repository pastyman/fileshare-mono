export type IceResponse = {
  iceServers: {
    urls: string | string[];
    username?: string;
    credential?: string;
  }[];
};