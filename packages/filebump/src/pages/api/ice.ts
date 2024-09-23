import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {

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