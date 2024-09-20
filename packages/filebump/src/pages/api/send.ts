import { getORMi } from "orm"
import { Messaging } from "types"
import { NextApiRequest, NextApiResponse } from "next"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  const body: Messaging = req.body

  //insert message into database
  const ormi = getORMi(process.env.MONGODB_URI!)
  const MessagingModel = ormi.getMessagingModel()
  await MessagingModel.create({
    order: body.order,
    from: body.from,
    to: body.to,
    data: body.data,
    rtcid: parseInt(body.rtcid),
    timestamp: Date.now()
  })

  return res.status(200).json({ message: "message sent" })
}