// scratch/search-logs.js
const fs = require('fs');
const readline = require('readline');

async function search() {
  const fileStream = fs.createReadStream('C:/Users/USER/.gemini/antigravity/brain/272fa2fa-2ce1-48fe-8f43-7c89879e3bb6/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (line.toLowerCase().includes('elo') || line.toLowerCase().includes('formula')) {
      // Print first 200 characters of the matching line to avoid output bloat
      console.log(`Line ${lineNum}: ${line.substring(0, 300)}...`);
    }
  }
}

search();
