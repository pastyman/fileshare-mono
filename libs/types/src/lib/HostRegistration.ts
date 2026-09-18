import { prop } from "@typegoose/typegoose"

/** Ephemeral Electron host registration for a waiting web peer */
export class HostRegistration {
  public id?: string

  @prop({ required: true, unique: true, index: true })
  public peerId!: string

  @prop({ required: true })
  public hostId!: string

  @prop()
  public folderId?: string

  @prop({ required: true, index: true })
  public timestamp!: Date
}
