import { buildSchema } from "@typegoose/typegoose"
import { HostRegistration } from "types"

const HostRegistrationSchema = buildSchema(HostRegistration)

HostRegistrationSchema.virtual("id").get(function () {
  return this._id.toHexString()
})
HostRegistrationSchema.set("toJSON", {
  virtuals: true,
})
HostRegistrationSchema.set("toObject", {
  virtuals: true,
})

export { HostRegistrationSchema }
