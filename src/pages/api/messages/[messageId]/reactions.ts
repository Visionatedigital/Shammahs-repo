import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { messageId } = req.query;
  const { emoji } = req.body;

  if (req.method === 'POST') {
    // Toggle reaction
    const existing = await prisma.chatReaction.findFirst({
      where: { messageId: String(messageId), userId: session.user.id, emoji },
    });
    if (existing) {
      await prisma.chatReaction.delete({ where: { id: existing.id } });
      return res.json({ removed: true });
    } else {
      const reaction = await prisma.chatReaction.create({
        data: { messageId: String(messageId), userId: session.user.id, emoji },
      });
      return res.status(201).json({ reaction });
    }
  }

  res.status(405).end();
} 