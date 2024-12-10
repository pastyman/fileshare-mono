import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { IceResponse } from "types"

let cache = null as any
let cacheTime = 0
// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {

  if (Date.now() - cacheTime > 300000) {
    cache = null
  }
  if (!cache) {
    const response = await axios.put(
      "https://global.xirsys.net/_turn/sharefolder",
      { "format": "urls", "expire": "360" },
      {
        headers: {
          "Authorization": "Basic " + btoa("parisvb:563fe5de-77e3-11e9-9ec3-0242ac110003"),
          "Content-Type": "application/json"
        }
      }
    )
    cacheTime = Date.now()
    cache = { ...response.data.v, cacheTime }
  }

  //reshape output
  let output: IceResponse = {
    iceServers: [cache.iceServers]
  }

  return res.status(200).json(output)
}