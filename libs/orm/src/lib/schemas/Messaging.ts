import { buildSchema } from "@typegoose/typegoose"
import { Messaging } from "types"

const MessagingSchema = buildSchema(Messaging)

MessagingSchema.virtual("id").get(function () {
  return this._id.toHexString()
})
MessagingSchema.set("toJSON", {
  virtuals: true,
})
MessagingSchema.set("toObject", {
  virtuals: true,
})

export { MessagingSchema }