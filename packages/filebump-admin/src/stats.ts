import { getORMi } from 'orm';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export type DailyRow = {
  day: string;
  pinsCreated: number;
  pinsMatched: number;
  pinsIncorrect: number;
  connections: number;
  iceRequests: number;
};

export type Overview = {
  generatedAt: string;
  lastHour: { matched: number; connected: number };
  today: DailyRow;
  allTime: Omit<DailyRow, 'day'>;
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
    pinsCreated: doc.pinsCreated ?? 0,
    pinsMatched: doc.pinsMatched ?? 0,
    pinsIncorrect: doc.pinsIncorrect ?? 0,
    connections: doc.connections ?? 0,
    iceRequests: doc.iceRequests ?? 0,
  };
}

function emptyRow(day: string): DailyRow {
  return toRow({ day });
}

export async function getOverview(): Promise<Overview> {
  const orm = getOrm();
  const Pairs = orm.getFilebumpPairModel();
  const Daily = orm.getFilebumpDailyStatModel();

  const now = new Date();
  const startOfToday = new Date(`${utcDay(now)}T00:00:00.000Z`);
  const hourAgo = new Date(now.getTime() - HOUR_MS);

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push(utcDay(new Date(startOfToday.getTime() - i * DAY_MS)));
  }

  const [matched, connected, recent, totals] = await Promise.all([
    Pairs.countDocuments({ createdAt: { $gte: hourAgo } }),
    Pairs.countDocuments({ createdAt: { $gte: hourAgo }, connected: true }),
    Daily.find({ day: { $gte: days[0] } }).lean(),
    Daily.aggregate([
      {
        $group: {
          _id: null,
          pinsCreated: { $sum: '$pinsCreated' },
          pinsMatched: { $sum: '$pinsMatched' },
          pinsIncorrect: { $sum: '$pinsIncorrect' },
          connections: { $sum: '$connections' },
          iceRequests: { $sum: '$iceRequests' },
        },
      },
    ]),
  ]);

  const byDay = new Map(recent.map((doc) => [doc.day, toRow(doc)]));
  const last30Days = days.map((day) => byDay.get(day) ?? emptyRow(day));
  const { day: _day, ...allTime } = toRow({ day: '', ...(totals[0] ?? {}) });

  return {
    generatedAt: now.toISOString(),
    lastHour: { matched, connected },
    today: last30Days[last30Days.length - 1],
    allTime,
    last30Days,
  };
}

export async function getDailyPage(pageIndex: number, pageSize: number) {
  const Daily = getOrm().getFilebumpDailyStatModel();
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
