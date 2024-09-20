import { getORMi } from "orm"
import { Connect } from "types"
import { NextApiRequest, NextApiResponse } from "next"

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  const body: Connect = req.body

  //create random 6 digit number
  const secret = Math.floor(100000 + Math.random() * 900000)

  //insert message into database
  const ormi = getORMi(process.env.MONGODB_URI!)
  const ConnectModel = ormi.getConnectModel()
  await ConnectModel.create({
    clientId: body.clientId,
    peerId: null,
    secret: secret,
    timestamp: Date.now()
  })

  return res.status(200).json({ message: "saved", secret })
}