import { getORMi } from "orm"
import { Connect } from "types"
import { NextApiRequest, NextApiResponse } from "next"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  //payload
  const secret = req.query.secret as string

  //get 6 mins ago
  const sixMinsAgo = Date.now() - 6 * 60 * 1000
  console.log("sixMinsAgo", sixMinsAgo)

  //get
  const ormi = getORMi(process.env.MONGODB_URI!)
  const ConnectModel = ormi.getConnectModel()
  const result = await ConnectModel.findOne({
    secret: secret,
    timestamp: { $gt: sixMinsAgo }
  })

  if (!result) {
    return res.status(400).json({ message: "invalid secret" })
  }  

  if (!result?.peerId) {
    return res.status(200).json({ message: "peerId not set yet" })
  }

  //delete
  await ConnectModel.findByIdAndDelete(result.id)

  return res.status(200).json({ message: "peerId has been set", peerId: result.peerId })
}