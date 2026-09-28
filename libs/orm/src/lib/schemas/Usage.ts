import { buildSchema } from "@typegoose/typegoose"
import { DailyStat, InstanceSeen } from "types"

const InstanceSeenSchema = buildSchema(InstanceSeen)
InstanceSeenSchema.set("toJSON", { virtuals: true })

const DailyStatSchema = buildSchema(DailyStat)
DailyStatSchema.set("toJSON", { virtuals: true })

export { InstanceSeenSchema, DailyStatSchema }
