import express from 'express';
import fs from 'fs';

/*
Store all the band names from the local text file.
We'll read the data synchronously since we don't want the server
to be able to do anything if we don't have this set up first.
*/
const data: Buffer = fs.readFileSync('data.txt');
const bandnames: string[] = data.toString().split("\n")
  .map((s: string) => s.trim());

const app = express();
const PORT = 8000;

/*
We'll send back an extremely simple search for now.
This search just checks if the words from the search text
are within the band names, without any case sensitivity.
We're searching for at most 10 names for now.
*/
const findNamesInList = (text: string): string[] => {
  let answers = [];
  for (let bandname of bandnames) {
    if (answers.length >= 10) break;
    const bandWords = bandname.split(" ");
    for (let word of text.split(" ")) {
      if (bandWords.indexOf(word) !== -1) {
        answers.push(bandname);
        break;
      }
    }
  }
  return answers;
}

app.post('/api/query/:text', (req, res) => {
  const names = findNamesInList(req.params.text);
  const nameData = names.map((name: string, idx: number) => ({
    "rank": idx+1,
    "artistName": name
  }));
  return res.json({
    "searchText": req.params.text,
    "similarArtists": nameData
  })
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});