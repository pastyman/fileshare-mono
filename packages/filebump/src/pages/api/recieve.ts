import { getORMi } from "orm"
import mongoose from "mongoose"
import { Messaging } from "types"
import { NextApiRequest, NextApiResponse } from "next"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  const body: Messaging = req.body

  //connect
  const ormi = getORMi(process.env.MONGODB_URI!)
  const MessagingModel = ormi.getMessagingModel()

  //now delete messages - old
  const sixMinsAgo = Date.now() - 6 * 60 * 1000
  console.log("sixMinsAgo", sixMinsAgo)
  await MessagingModel.deleteMany({ timestamp: { $lt: sixMinsAgo } })

  //read messages from database
  const messages = await MessagingModel.find({
    from: body.from,
    to: body.to,
  }).sort({ "order": "asc" })

  //now delete messages - returned
  const ids = messages.map((msg) => new mongoose.Types.ObjectId(msg.id))

  if (ids.length > 0) {
    console.log("delete many", { id: { $in: ids } })
    const deleteResult = await MessagingModel.deleteMany({ _id: { $in: ids } })
    console.log("deleteResult", deleteResult)
  }

  return res.status(200).json(messages)
}