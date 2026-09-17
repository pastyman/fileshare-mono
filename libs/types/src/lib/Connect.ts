import { prop } from "@typegoose/typegoose"

export class Connect {
  public id?: string

  @prop()
  public instanceId?: string

  @prop()
  public clientId!: string

  @prop()
  public peerId!: string

  @prop()
  public folderId?: string

  @prop()
  public secret!: string

  @prop()
  public timestamp!: Date
}