import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {

  // //test
  // res.status(200).json({
  //   "v": {
  //     "iceServers": {
  //       "username": "wwR9KAOpsQ5ZjM_KkV6i5cwoCb0Za6o2JHW3cQKvW5oajGkZpDiz9i3SSG3DgQKFAAAAAGa_en1wYXJpc3Zi",
  //       "urls": [
  //         "stun:eu-turn8.xirsys.com",
  //         "turn:eu-turn8.xirsys.com:80?transport=udp",
  //         "turn:eu-turn8.xirsys.com:3478?transport=udp",
  //         "turn:eu-turn8.xirsys.com:80?transport=tcp",
  //         "turn:eu-turn8.xirsys.com:3478?transport=tcp",
  //         "turns:eu-turn8.xirsys.com:443?transport=tcp",
  //         "turns:eu-turn8.xirsys.com:5349?transport=tcp"
  //       ],
  //       "credential": "5f922926-5bea-11ef-ad3b-0242ac140004"
  //     }
  //   },
  //   "s": "ok"
  // })

  const response = await axios.put(
    "https://global.xirsys.net/_turn/sharefolder",
    { "format": "urls", "expire": "120" },
    {
      headers: {
        "Authorization": "Basic " + btoa("parisvb:563fe5de-77e3-11e9-9ec3-0242ac110003"),
        "Content-Type": "application/json"
      }
    }
  )

  return res.status(200).json(response.data)
}