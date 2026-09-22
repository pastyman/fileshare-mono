import { NextApiRequest, NextApiResponse } from "next"
import { resolveIceServers } from "types"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json(await resolveIceServers())
}
