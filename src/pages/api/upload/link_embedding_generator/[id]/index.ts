import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getServerSession } from '@roq/nextjs';
import puppeteer from 'puppeteer';

const supabaseUrl = process.env.SUPABASE_BASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaikey = process.env.OPENAI_API_KEY;

const client = createClient(supabaseUrl, supabaseServiceKey);

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: any, res: any) => {
  let text = '';
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 50,
  });
  try {
    text = await getTextFromLink(req?.body?.link);
    const docs = await textSplitter.createDocuments([text]);
      const embeddings = await createEmbeddings(docs,req.query.id);

  } catch (error) {
    console.log(error,"error")
    return res.status(503).json({ message: 'something went wrong try again later' });
  }
  return res.status(200).json({ message: 'File uploaded successfully' });
};

const createEmbeddings = async (docs:any,tableName:string) => {
    await SupabaseVectorStore.fromDocuments(
      docs,
      new OpenAIEmbeddings({ openAIApiKey: openaikey }),
      {
        client,
        tableName:`bot_${tableName}`,
    queryName: `match_bot_${tableName}`, 
      }
    );
  };

const getTextFromLink = async (url:string, maxLinks = 50) => {
    const browser = await puppeteer.launch({ timeout: 60000 });
    const page = await browser.newPage();

    const visitedUrls = new Set();
    let visitedPageCount = 0;
    let allText = '';

    const crawl = async (currentUrl:string) => {
        if (!visitedUrls.has(currentUrl) && visitedPageCount < maxLinks) {
            visitedUrls.add(currentUrl);
            try {
                await page.goto(currentUrl, { timeout: 60000 });

                let pageText = await page.evaluate(() => document.body.innerText);
                allText += pageText; // Append text from the current page

                const links = await page.evaluate(() => {
                    // Select all <a> elements
                    return Array.from(document.querySelectorAll('a'), (e) => e.href);
                });
                for (let i = 0; i < links.length && visitedPageCount < maxLinks; i++) {
                    if (links[i].startsWith(url) && !visitedUrls.has(links[i])) {
                        visitedPageCount++;
                        visitedUrls.add(links[i]);

                        // Collect text only from links on the initial page
                        await page.goto(links[i], { timeout: 60000 });
                        let linkText = await page.evaluate(() => document.body.innerText);
                        allText += linkText;
                    }
                }

                visitedPageCount++;
            } catch (error) {
                console.error(`Error crawling ${currentUrl}: ${error}`);
            }
        }
    };

    await crawl(url);
    // Close the page and browser after all operations are complete
    await page.close();
    await browser.close();
    return allText;
};

// const getTextFromLink = async (url:string, maxPages = 50) => {
//     const browser = await puppeteer.launch({ timeout: 60000 });
//     const page = await browser.newPage();
//     const visitedUrls = new Set();
//     let visitedPageCount = 0;
//     let appendedText = ''; // Initialize an empty string to store the appended text

//     const crawl = async (currentUrl:any) => {
//         console.log(visitedPageCount, "counter");
//         if (!visitedUrls.has(currentUrl) && visitedPageCount < maxPages) {
//             visitedUrls.add(currentUrl);
//             await page.goto(currentUrl, { timeout: 60000 });

//             let onlyText = await page.evaluate(() => document.body.innerText);
//             appendedText += onlyText + '\n'; // Append the text from the current page
//             const links = await page.evaluate(() => {
//                 // Select all <a> elements
//                 return Array.from(document.querySelectorAll('a'), (e) => e.href);
//             });

//             for (const link of links) {
//                 if (link.startsWith(url) && !visitedUrls.has(link)) {
//                     // Check if the link matches the domain URL and hasn't been visited
//                     console.log(link, "current");
//                     visitedPageCount++;
//                     if (visitedPageCount >= maxPages) {
//                         break; // Exit the loop when the maximum page count is reached
//                     }
//                     await crawl(link); // Recursively crawl the matched links
//                 }
//             }
//             await page.close();
//         }
//     };

//     await crawl(url);
//     await browser.close();
//     console.log("reached here");
//     return appendedText; // Return the appended text from all visited pages
// };


