import { getORMi } from "orm"
import { Messaging } from "types"
import { NextApiRequest, NextApiResponse } from "next"
import { trackConnected } from "../../lib/usage"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  const body: Messaging = req.body

  // Only called by each browser once its peer connection is established
  trackConnected(body.from, body.to)

  const ormi = getORMi(process.env.MONGODB_URI!)
  const MessagingModel = ormi.getMessagingModel()
  await MessagingModel.deleteMany({
    from: body.from,
    to: body.to,
  })

  return res.status(200).json({ message: "message sent" })
}