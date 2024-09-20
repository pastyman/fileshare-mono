import { getORMi } from "orm"
import { Connect } from "types"
import { NextApiRequest, NextApiResponse } from "next"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  //payload
  const secret = req.query.secret as string
  const peerId = req.query.peerId as string

  //get 5 mins ago
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000
  console.log("fiveMinsAgo", fiveMinsAgo)

  //get
  const ormi = getORMi(process.env.MONGODB_URI!)
  const ConnectModel = ormi.getConnectModel()
  const result = await ConnectModel.findOne({
    secret: secret,
    timestamp: { $gt: fiveMinsAgo }
  })

  if (!result) {
    return res.status(400).json({ message: "invalid secret" })
  }

  //update peerId
  await ConnectModel.findByIdAndUpdate(result.id, { $set: { peerId } })

  console.log("recieve", { message: "saved", peerId: result.clientId })

  return res.status(200).json({ message: "saved", peerId: result.clientId })
}