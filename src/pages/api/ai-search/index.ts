import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { getServerSession } from '@roq/nextjs';

const supabaseUrl = process.env.SUPABASE_BASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaikey = process.env.OPENAI_API_KEY;

const client = createClient(supabaseUrl, supabaseServiceKey);

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: any, res: any) => {
  try {
    const token = req?.headers.token;
    const body = req.body;
    const result = await query(body?.query, token);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.log('error:', error);
  }
};
const query = async (query: any, tableName: string) => {
  const chat = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    configuration: {
      apiKey: openaikey,
    },
  });
  const vectorStore = await SupabaseVectorStore.fromExistingIndex(new OpenAIEmbeddings(), {
    client,
    tableName: `bot_${tableName}`,
    queryName: `match_bot_${tableName}`,
  });

  // const qa_template = `Use the following pieces of context to answer the question at the end. If you don't know the answer or need further clarification, please let me know, and I'll do my best to assist you based on the available documents.
  // {context}

  // Question: {question}
  // Helpful Answer:`;

  let chain = ConversationalRetrievalQAChain.fromLLM(chat, vectorStore.asRetriever(), {
    returnSourceDocuments: true,
    // qaTemplate: qa_template,
  });
  const res = await chain.call({ question: query, chat_history: [] });
  return res.text;
};
