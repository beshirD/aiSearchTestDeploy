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
import { createClient } from '@supabase/supabase-js';

import { Pool } from 'pg';

// Initialize the Supabase client with your Supabase URL and service role key
const supabaseUrl = process.env.SUPABASE_BASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL, 
});

async function createTableForUser(apiKey:any) {
  const tableName = `bot_${apiKey}`;

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      id bigserial,
      content text null,
      metadata jsonb null,
      embedding public.vector null,
      constraint "${tableName}_pkey" primary key (id)
    );
  `;

  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    client.release();
  } catch (error) {
    console.error('Error creating table:', error);
  }
}
// Function to create the match_documents function
async function createMatchDocumentsFunction(apiKey:any) {
  const functionName = `bot_${apiKey}`;

  const createFunctionQuery = `
  create function "match_${functionName}" (
    query_embedding vector (1536),
    match_count int default null,
    filter jsonb default '{}'
  ) returns table (
    id bigint,
    content text,
    metadata jsonb,
    similarity float
  ) language plpgsql as $$
  #variable_conflict use_column
  begin
    return query
    select
      id,
      content,
      metadata,
      1 - ("${functionName}".embedding <=> query_embedding) as similarity
    from "${functionName}"
    where metadata @> filter
    order by "${functionName}".embedding <=> query_embedding
    limit match_count;
  end;
  $$
  `;

  try {
    const client = await pool.connect();
    await client.query(createFunctionQuery);
    client.release();
  } catch (error) {
    console.error(`Error creating function ${functionName}:`, error);
  }
}

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
    await createTableForUser(data.id);
    await createMatchDocumentsFunction(data.id);
    await notificationHandlerMiddleware(req, data.id);
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(authorizationValidationMiddleware(handler))(req, res);
}
