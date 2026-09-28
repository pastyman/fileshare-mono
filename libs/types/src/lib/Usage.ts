import { prop } from "@typegoose/typegoose"

/**
 * One row per ShareFolder desktop install, keyed by a salted hash of its
 * instance GUID so the raw GUID (which appears in share links) is never stored.
 */
export class InstanceSeen {
  public id?: string

  @prop({ required: true, unique: true, index: true })
  public instanceHash!: string

  @prop({ required: true })
  public firstSeen!: Date

  @prop({ required: true, index: true })
  public lastSeen!: Date

  /** UTC day (YYYY-MM-DD) this instance was last counted as active */
  @prop({ required: true })
  public lastActiveDay!: string
}

/** Aggregate counters per UTC day. No identifiers are stored. */
export class DailyStat {
  public id?: string

  @prop({ required: true, unique: true, index: true })
  public day!: string

  /** Distinct desktop apps that polled for connections this day */
  @prop({ default: 0 })
  public activeInstances!: number

  /** Desktop apps seen for the first time this day */
  @prop({ default: 0 })
  public newInstances!: number

  /** Browsers that opened a share link and requested a connection */
  @prop({ default: 0 })
  public connectRequests!: number

  /** Desktop apps that registered as RTC host for a waiting browser */
  @prop({ default: 0 })
  public hostRegistrations!: number

  /** ICE/TURN credential fetches */
  @prop({ default: 0 })
  public iceRequests!: number
}
