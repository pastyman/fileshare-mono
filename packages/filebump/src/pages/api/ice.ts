import { NextApiRequest, NextApiResponse } from "next"
import { resolveIceServers } from "types"
import { trackDaily } from "../../lib/usage"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  trackDaily("iceRequests")
  return res.status(200).json(await resolveIceServers())
}
