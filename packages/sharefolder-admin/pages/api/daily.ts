import type { NextApiRequest, NextApiResponse } from 'next';
import { getDailyPage } from '../../src/stats';

const MAX_PAGE_SIZE = 200;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pageIndex = Math.max(0, parseInt(String(req.query.pageIndex ?? '0'), 10) || 0);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(String(req.query.pageSize ?? '30'), 10) || 30)
  );

  try {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(await getDailyPage(pageIndex, pageSize));
  } catch (error) {
    console.error('daily stats error', error);
    return res.status(500).json({ error: 'Failed to load daily stats' });
  }
}
