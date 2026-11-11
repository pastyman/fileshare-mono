import { createHash } from "node:crypto"
import { getORMi } from "orm"

/**
 * Minimal, anonymous usage counters for the owner admin panel.
 * Only derived from requests the browser already makes; no IPs, user agents,
 * PINs, file names or sizes are stored.
 */

type DailyCounter = "pinsCreated" | "pinsMatched" | "pinsIncorrect" | "iceRequests"

function orm() {
  return getORMi(process.env.MONGODB_URI!)
}

function utcDay(): string {
  return new Date().toISOString().slice(0, 10)
}

function hashPair(a: string, b: string): string {
  const salt = process.env.USAGE_HASH_SALT || "filebump-usage"
  const [first, second] = [a, b].sort()
  return createHash("sha256").update(`${salt}:${first}:${second}`).digest("hex").slice(0, 32)
}

async function incrementDaily(counter: DailyCounter | "connections") {
  await orm()
    .getFilebumpDailyStatModel()
    .updateOne({ day: utcDay() }, { $inc: { [counter]: 1 } }, { upsert: true })
}

async function recordPinMatched(senderId: string, receiverId: string) {
  await orm()
    .getFilebumpPairModel()
    .updateOne(
      { pairHash: hashPair(senderId, receiverId) },
      { $setOnInsert: { connected: false, createdAt: new Date() } },
      { upsert: true }
    )
  await incrementDaily("pinsMatched")
}

/** Both browsers report a connection; only the first one for a pair counts. */
async function recordConnected(a: string, b: string) {
  const marked = await orm()
    .getFilebumpPairModel()
    .updateOne({ pairHash: hashPair(a, b), connected: false }, { $set: { connected: true } })
  if (marked.modifiedCount > 0) {
    await incrementDaily("connections")
  }
}

function swallow(promise: Promise<unknown>) {
  promise.catch((error) => console.error("usage stat error", error))
}

export function trackDaily(counter: DailyCounter) {
  swallow(incrementDaily(counter))
}

export function trackPinMatched(senderId: string, receiverId: string) {
  swallow(recordPinMatched(senderId, receiverId))
}

export function trackConnected(a: string, b: string) {
  if (!a || !b) return
  swallow(recordConnected(a, b))
}
