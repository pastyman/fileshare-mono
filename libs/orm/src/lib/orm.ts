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
} from "./schemas"
import {
  Messaging,
  Connect,
  HostRegistration,
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

    return {
      ModelMessaging,
      ModelConnect,
      ModelHostRegistration,
    }
  }

  const savedClientMap: Record<
    string,
    {
      ModelMessaging: ReturnModelType<typeof Messaging>,
      ModelConnect: ReturnModelType<typeof Connect>,
      ModelHostRegistration: ReturnModelType<typeof HostRegistration>,
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

  return {
    getMessagingModel,
    getConnectModel,
    getHostRegistrationModel,
  }
}

export type Orm = ReturnType<typeof getORMi>
