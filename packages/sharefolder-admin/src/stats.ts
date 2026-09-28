import { getORMi } from 'orm';

/** The desktop app polls every 3s; sharefolder-web persists lastSeen at most once a minute. */
const ONLINE_WINDOW_MS = 3 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type DailyRow = {
  day: string;
  activeInstances: number;
  newInstances: number;
  connectRequests: number;
  hostRegistrations: number;
  iceRequests: number;
};

export type Overview = {
  generatedAt: string;
  instances: {
    online: number;
    activeToday: number;
    active7d: number;
    active30d: number;
    total: number;
    newToday: number;
  };
  today: DailyRow;
  allTime: Omit<DailyRow, 'day' | 'activeInstances' | 'newInstances'>;
  last30Days: DailyRow[];
};

function getOrm() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  return getORMi(uri);
}

function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toRow(doc: Partial<DailyRow> & { day: string }): DailyRow {
  return {
    day: doc.day,
    activeInstances: doc.activeInstances ?? 0,
    newInstances: doc.newInstances ?? 0,
    connectRequests: doc.connectRequests ?? 0,
    hostRegistrations: doc.hostRegistrations ?? 0,
    iceRequests: doc.iceRequests ?? 0,
  };
}

function emptyRow(day: string): DailyRow {
  return toRow({ day });
}

export async function getOverview(): Promise<Overview> {
  const orm = getOrm();
  const Instances = orm.getInstanceSeenModel();
  const Daily = orm.getDailyStatModel();

  const now = new Date();
  const startOfToday = new Date(`${utcDay(now)}T00:00:00.000Z`);
  const since = (ms: number) => new Date(now.getTime() - ms);

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push(utcDay(new Date(startOfToday.getTime() - i * DAY_MS)));
  }

  const [online, activeToday, active7d, active30d, total, newToday, recent, totals] =
    await Promise.all([
      Instances.countDocuments({ lastSeen: { $gte: since(ONLINE_WINDOW_MS) } }),
      Instances.countDocuments({ lastSeen: { $gte: startOfToday } }),
      Instances.countDocuments({ lastSeen: { $gte: since(7 * DAY_MS) } }),
      Instances.countDocuments({ lastSeen: { $gte: since(30 * DAY_MS) } }),
      Instances.estimatedDocumentCount(),
      Instances.countDocuments({ firstSeen: { $gte: startOfToday } }),
      Daily.find({ day: { $gte: days[0] } }).lean(),
      Daily.aggregate([
        {
          $group: {
            _id: null,
            connectRequests: { $sum: '$connectRequests' },
            hostRegistrations: { $sum: '$hostRegistrations' },
            iceRequests: { $sum: '$iceRequests' },
          },
        },
      ]),
    ]);

  const byDay = new Map(recent.map((doc) => [doc.day, toRow(doc)]));
  const last30Days = days.map((day) => byDay.get(day) ?? emptyRow(day));
  const sums = totals[0] ?? {};

  return {
    generatedAt: now.toISOString(),
    instances: { online, activeToday, active7d, active30d, total, newToday },
    today: last30Days[last30Days.length - 1],
    allTime: {
      connectRequests: sums.connectRequests ?? 0,
      hostRegistrations: sums.hostRegistrations ?? 0,
      iceRequests: sums.iceRequests ?? 0,
    },
    last30Days,
  };
}

export async function getDailyPage(pageIndex: number, pageSize: number) {
  const Daily = getOrm().getDailyStatModel();
  const [docs, rowCount] = await Promise.all([
    Daily.find({})
      .sort({ day: -1 })
      .skip(pageIndex * pageSize)
      .limit(pageSize)
      .lean(),
    Daily.estimatedDocumentCount(),
  ]);
  return { data: docs.map(toRow), rowCount };
}
