import { prop } from "@typegoose/typegoose"


export class Messaging {
  public id?: string

  @prop()
  public order!: number

  @prop()
  public from!: string

  @prop()
  public to!: string

  @prop()
  public data!: object

  @prop()
  public rtcid!: string

  @prop()
  public timestamp!: Date
}