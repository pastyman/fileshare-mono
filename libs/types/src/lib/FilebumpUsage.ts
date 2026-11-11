import { prop } from "@typegoose/typegoose"

/**
 * Short-lived marker linking the two sides of one filebump so a successful
 * connection is counted once, not once per browser. Keyed by a salted hash
 * of the two random session ids; expires after an hour.
 */
export class FilebumpPair {
  public id?: string

  @prop({ required: true, unique: true, index: true })
  public pairHash!: string

  @prop({ default: false })
  public connected!: boolean

  @prop({ required: true, expires: 60 * 60 })
  public createdAt!: Date
}

/** Aggregate filebump counters per UTC day. No identifiers are stored. */
export class FilebumpDailyStat {
  public id?: string

  @prop({ required: true, unique: true, index: true })
  public day!: string

  /** Senders that picked files and were given a 6 digit PIN */
  @prop({ default: 0 })
  public pinsCreated!: number

  /** Receivers that entered a valid PIN */
  @prop({ default: 0 })
  public pinsMatched!: number

  /** Receivers that entered a wrong or expired PIN */
  @prop({ default: 0 })
  public pinsIncorrect!: number

  /** Pairs whose peer-to-peer connection was established */
  @prop({ default: 0 })
  public connections!: number

  /** ICE/TURN credential fetches */
  @prop({ default: 0 })
  public iceRequests!: number
}
