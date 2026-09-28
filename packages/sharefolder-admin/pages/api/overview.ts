import type { NextApiRequest, NextApiResponse } from 'next';
import { getOverview } from '../../src/stats';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(await getOverview());
  } catch (error) {
    console.error('overview error', error);
    return res.status(500).json({ error: 'Failed to load overview' });
  }
}
