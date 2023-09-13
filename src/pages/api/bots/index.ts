import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import {
  authorizationValidationMiddleware,
  errorHandlerMiddleware,
  notificationHandlerMiddleware,
} from 'server/middlewares';
import { botValidationSchema } from 'validationSchema/bots';
import { convertQueryToPrismaUtil, getOrderByOptions, parseQueryParams } from 'server/utils';
import { getServerSession } from '@roq/nextjs';
import { GetManyQueryOptions } from 'interfaces';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  switch (req.method) {
    case 'GET':
      return getBots();
    case 'POST':
      return createBot();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getBots() {
    const {
      limit: _limit,
      offset: _offset,
      order,
      ...query
    } = parseQueryParams(req.query) as Partial<GetManyQueryOptions>;
    const limit = parseInt(_limit as string, 10) || 20;
    const offset = parseInt(_offset as string, 10) || 0;
    const response = await prisma.bot
      .withAuthorization({
        roqUserId,
        tenantId: user.tenantId,
        roles: user.roles,
      })
      .findManyPaginated({
        ...convertQueryToPrismaUtil(query, 'bot'),
      
      
        take: limit,
        
        skip: offset,
        ...(order?.length && {
          orderBy: getOrderByOptions(order),
        }),
      });
      console.log({response})
    return res.status(200).json(response);
  }

  async function createBot() {
    await botValidationSchema.validate(req.body);
    const body = { ...req.body };
    const user = await prisma.user.findMany({
      where: { roq_user_id: roqUserId },
      include: { organization: true },
    });    
    const org  = await prisma.organization.findFirst({where:{
      user_id:user[0].id
    }})

    const data = await prisma.bot.create({
      data: {...body,organization_id:org.id},
    });
    await notificationHandlerMiddleware(req, data.id);
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(authorizationValidationMiddleware(handler))(req, res);
}
