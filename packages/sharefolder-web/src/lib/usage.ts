import { createHash } from 'node:crypto';
import { getOrm } from '@/lib/signaling';

/**
 * Minimal, anonymous usage counters for the owner admin panel.
 * Only derived from requests the app/browser already make; no IPs,
 * user agents, folder ids or peer ids are stored.
 */

type DailyCounter =
  | 'connectRequests'
  | 'hostRegistrations'
  | 'iceRequests';

/** Desktop apps poll /connections every few seconds; persist at most this often per instance. */
const INSTANCE_WRITE_INTERVAL_MS = 60_000;
const lastInstanceWrite = new Map<string, number>();

function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function hashInstance(guid: string): string {
  const salt = process.env.USAGE_HASH_SALT || 'sharefolder-usage';
  return createHash('sha256').update(`${salt}:${guid}`).digest('hex').slice(0, 32);
}

async function incrementDaily(fields: Partial<Record<string, number>>) {
  await getOrm()
    .getDailyStatModel()
    .updateOne({ day: utcDay() }, { $inc: fields }, { upsert: true });
}

async function recordInstancePoll(guid: string) {
  const instanceHash = hashInstance(guid);
  const nowMs = Date.now();
  const last = lastInstanceWrite.get(instanceHash);
  if (last && nowMs - last < INSTANCE_WRITE_INTERVAL_MS) return;
  lastInstanceWrite.set(instanceHash, nowMs);

  const now = new Date(nowMs);
  const today = utcDay(now);
  const previous = await getOrm()
    .getInstanceSeenModel()
    .findOneAndUpdate(
      { instanceHash },
      {
        $set: { lastSeen: now, lastActiveDay: today },
        $setOnInsert: { firstSeen: now },
      },
      { upsert: true, new: false }
    )
    .lean();

  if (!previous) {
    await incrementDaily({ activeInstances: 1, newInstances: 1 });
  } else if (previous.lastActiveDay !== today) {
    await incrementDaily({ activeInstances: 1 });
  }
}

function swallow(promise: Promise<unknown>) {
  promise.catch((error) => console.error('usage stat error', error));
}

export function trackInstancePoll(guid: string) {
  swallow(recordInstancePoll(guid));
}

export function trackDaily(counter: DailyCounter) {
  swallow(incrementDaily({ [counter]: 1 }));
}
