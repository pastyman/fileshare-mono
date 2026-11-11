import { buildSchema } from "@typegoose/typegoose"
import { DailyStat, FilebumpDailyStat, FilebumpPair, InstanceSeen } from "types"

const InstanceSeenSchema = buildSchema(InstanceSeen)
InstanceSeenSchema.set("toJSON", { virtuals: true })

const DailyStatSchema = buildSchema(DailyStat)
DailyStatSchema.set("toJSON", { virtuals: true })

const FilebumpPairSchema = buildSchema(FilebumpPair)

const FilebumpDailyStatSchema = buildSchema(FilebumpDailyStat)
FilebumpDailyStatSchema.set("toJSON", { virtuals: true })

export {
  InstanceSeenSchema,
  DailyStatSchema,
  FilebumpPairSchema,
  FilebumpDailyStatSchema,
}
