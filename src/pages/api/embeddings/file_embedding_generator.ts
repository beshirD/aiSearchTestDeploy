import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getServerSession } from '@roq/nextjs';
import pdf from 'pdf-parse'; // Import pdf-parse library
import mammoth from 'mammoth'; // Import mammoth library

const supabaseUrl = process.env.SUPABASE_BASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaikey = process.env.OPENAI_API_KEY;

const client = createClient(supabaseUrl, supabaseServiceKey);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for text files (adjust as needed)
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadMiddleware = upload.single('file');

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: any, res: any) => {
  const { roqUserId, user } = await getServerSession(req);
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const file = req.file;
    if (!file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = file.buffer;
    let text = '';

    if (file.mimetype === 'text/plain') {
      text = fileBuffer.toString('utf-8');
    } else if (file.mimetype === 'application/pdf') {
      text = await extractTextFromPDF(fileBuffer);
    } else if (file.mimetype === 'application/msword') {
      text = await extractTextFromDOC(fileBuffer);
    } else {
      console.log('Unsupported file type');
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 50,
    });
    const docs = await textSplitter.createDocuments([text]);
    const embeddings = await createEmbeddings(docs,roqUserId);

    return res.status(200).json({ message: 'File uploaded successfully' });
  });
};

const extractTextFromPDF = async (pdfBuffer: any) => {
  const data = await pdf(pdfBuffer);
  return data.text;
};

const extractTextFromDOC = async (docBuffer: any) => {
  const result = await mammoth.extractRawText({ buffer: docBuffer });
  return result.value;
};

const createEmbeddings = async (docs:any,tableName:string) => {
  await SupabaseVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ openAIApiKey: openaikey }),
    {
      client,
      tableName:`user_${tableName}`,
      queryName: `match_user_${tableName}`, 
    }
  );
};