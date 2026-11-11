import mongoose from "mongoose"
import {
  setGlobalOptions,
  addModelToTypegoose,
  ReturnModelType,
} from "@typegoose/typegoose"
import {
  MessagingSchema,
  ConnectSchema,
  HostRegistrationSchema,
  InstanceSeenSchema,
  DailyStatSchema,
  FilebumpPairSchema,
  FilebumpDailyStatSchema,
} from "./schemas"
import {
  Messaging,
  Connect,
  HostRegistration,
  InstanceSeen,
  DailyStat,
  FilebumpPair,
  FilebumpDailyStat,
} from "types"

export const getORMi = (mongoURI: string) => {
  let cachedMongoose: typeof mongoose = (global as any).mongoose;
  if (!cachedMongoose) {
    console.log("CACHED MONGO IS NOT FOUND")
    cachedMongoose = (global as any).mongoose = mongoose;
  }

  const setModels = (mongoURI: string) => {
    setGlobalOptions({ globalOptions: { disableGlobalCaching: true } })

    console.log("CONNECTIONS", cachedMongoose.connections.length)

    const connIndex = cachedMongoose.connections.length - 1
    const mongooseInstance = cachedMongoose.connections.length > 1 && cachedMongoose.connections[connIndex].readyState === 1 ?
      cachedMongoose.connections[connIndex]
      : cachedMongoose.createConnection(mongoURI)

    const ModelMessagingRaw = mongooseInstance.model(
      "messaging",
      MessagingSchema,
      "messages"
    )
    const ModelMessaging = addModelToTypegoose(ModelMessagingRaw, Messaging)

    const ModelConnectRaw = mongooseInstance.model(
      "connect",
      ConnectSchema,
      "connects"
    )
    const ModelConnect = addModelToTypegoose(ModelConnectRaw, Connect)

    const ModelHostRegistrationRaw = mongooseInstance.model(
      "hostRegistration",
      HostRegistrationSchema,
      "host_registrations"
    )
    const ModelHostRegistration = addModelToTypegoose(
      ModelHostRegistrationRaw,
      HostRegistration
    )

    const ModelInstanceSeen = addModelToTypegoose(
      mongooseInstance.model("instanceSeen", InstanceSeenSchema, "instances_seen"),
      InstanceSeen
    )

    const ModelDailyStat = addModelToTypegoose(
      mongooseInstance.model("dailyStat", DailyStatSchema, "daily_stats"),
      DailyStat
    )

    const ModelFilebumpPair = addModelToTypegoose(
      mongooseInstance.model("filebumpPair", FilebumpPairSchema, "filebump_pairs"),
      FilebumpPair
    )

    const ModelFilebumpDailyStat = addModelToTypegoose(
      mongooseInstance.model("filebumpDailyStat", FilebumpDailyStatSchema, "filebump_daily_stats"),
      FilebumpDailyStat
    )

    return {
      ModelMessaging,
      ModelConnect,
      ModelHostRegistration,
      ModelInstanceSeen,
      ModelDailyStat,
      ModelFilebumpPair,
      ModelFilebumpDailyStat,
    }
  }

  const savedClientMap: Record<
    string,
    {
      ModelMessaging: ReturnModelType<typeof Messaging>,
      ModelConnect: ReturnModelType<typeof Connect>,
      ModelHostRegistration: ReturnModelType<typeof HostRegistration>,
      ModelInstanceSeen: ReturnModelType<typeof InstanceSeen>,
      ModelDailyStat: ReturnModelType<typeof DailyStat>,
      ModelFilebumpPair: ReturnModelType<typeof FilebumpPair>,
      ModelFilebumpDailyStat: ReturnModelType<typeof FilebumpDailyStat>,
    }
  > = {}
  const getClient = () => {
    if (!savedClientMap[mongoURI]) {
      savedClientMap[mongoURI] = setModels(mongoURI)
    }
    return savedClientMap[mongoURI]
  }

  const getMessagingModel = () => getClient().ModelMessaging
  const getConnectModel = () => getClient().ModelConnect
  const getHostRegistrationModel = () => getClient().ModelHostRegistration
  const getInstanceSeenModel = () => getClient().ModelInstanceSeen
  const getDailyStatModel = () => getClient().ModelDailyStat
  const getFilebumpPairModel = () => getClient().ModelFilebumpPair
  const getFilebumpDailyStatModel = () => getClient().ModelFilebumpDailyStat

  return {
    getMessagingModel,
    getConnectModel,
    getHostRegistrationModel,
    getInstanceSeenModel,
    getDailyStatModel,
    getFilebumpPairModel,
    getFilebumpDailyStatModel,
  }
}

export type Orm = ReturnType<typeof getORMi>
