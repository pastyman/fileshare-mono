import { buildSchema } from "@typegoose/typegoose"
import { Connect } from "types"

const ConnectSchema = buildSchema(Connect)

ConnectSchema.virtual("id").get(function () {
  return this._id.toHexString()
})
ConnectSchema.set("toJSON", {
  virtuals: true,
})
ConnectSchema.set("toObject", {
  virtuals: true,
})

export { ConnectSchema }