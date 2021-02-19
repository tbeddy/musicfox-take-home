import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

/*
Store all the band names from the local text file.
We'll read the data synchronously since we don't want the server
to be able to do anything if we don't have this set up first.
*/
const data: Buffer = fs.readFileSync('fake_artist_names_mit.txt');

/*
We'll filter out common words that would bring up too many false positives
when searching. One drawback to this approach is that groups such as
'The The' are going to be unsearchable, though they already are pretty
unsearchable...
*/
const filterOutCommonWords = (words: string[]): string[] => {
  const commonWords = ["the", "a", "an", "of", "and", "to"];
  return words.filter(w => commonWords.indexOf(w) === -1);
}

/*
Every time we search, we're going to split up the data into words,
make them lowercase, and filter out the common words, so let's get that
work out of the way now. Rather than just store the strings in an array,
let's make a hash map with the artist names as the keys and the processed
words as the values.
*/
const artistNames: string[] = data.toString().split("\n")
  .map((s: string) => s.trim())
  .filter(w => w !== "")
  .sort((x, y) => x.localeCompare(y));

const artistData: {[name: string]: string[]} = {};
for (let artistName of artistNames) {
  const words = artistName.split(" ").map(w => w.toLowerCase())
  artistData[artistName] = filterOutCommonWords(words);
}
  
/*
We'll use the Levenshtein distance (aka the edit distance) as our measurement
of string difference. It shows the fewest number of insertions, deletions, and
substitutions of characters required to change one string into another. It's one
of the most famous measurements for string difference, so it seems like a good
choice here.
Adapted from the Java example given in this lecture:
https://people.cs.pitt.edu/~kirk/cs1501/Pruhs/Spring2006/assignments/editdistance/Levenshtein%20Distance.htm
*/
const levenshtein = (str1: string = "", str2: string = ""): number => {
  const n = str1.length;
  const m = str2.length;

  // If either string is empty, we'll return the length of the other string,
  // because that's how many insertions we would need to make.
  if (n === 0) return m;
  if (m === 0) return n;

  // We'll intialize the matrix with a row representing the first word
  // and rows filled zeros we'll change over the course of the algorithm. 
  let matrix: number[][] = [[...Array(m+1).keys()]];
  for (let i = 1; i <= n; i++) {
    matrix.push(Array(m+1).fill(0));
  }

  // The first element of each row will represent the second word.
  for (let j = 0; j <= n; j++) {
    matrix[j][0] = j;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i-1][j]+1,     // deletion
        matrix[i][j-1]+1,     // insertion
        matrix[i-1][j-1]+cost // substitution or no change
      );
    }
  }

  return matrix[n][m];
}

/*
We'll find the average of the Levenshtein distances between the corresponding
words in the search and each artist name. One disadvantage to this approach is
that if you forget a word in your search, the alignment will be off and you
won't find what you're looking for.
*/
const levenshteinAverage = (words1: string[], words2: string[]): number => {
  const maxLength = Math.max(words1.length, words2.length);
  let sum = 0;
  for (let i = 0; i < maxLength; i++) {
    sum += levenshtein(words1[i], words2[i]);
  }
  return sum / maxLength;
}

/*
We're searching through every single artist and then returning only as many as
the user requested. Previously, I stopped once we had found enough that passed
the criteria, but that sometimes left out more relevant results. Searching
everything isn't terribly efficient (especially if we had the proposed 50
trillion names), but without a more sophisticated searching method, it's
probably for the best.
*/
const findArtists = (text: string, accuracy: number, maxResults: number): string[] => {
  if (maxResults === 0) maxResults = artistNames.length;
  let answers = [];
  for (let artistName of artistNames) {
    const artistWords = artistData[artistName];
    const searchWords = filterOutCommonWords(
      text.split(" ").map(w => w.toLowerCase()));
    const distance = levenshteinAverage(searchWords, artistWords);
    if (distance <= accuracy) {
      answers.push({ distance, artistName });
    }
  }
  const sortedAnswers = answers
    .sort((x, y) => x.distance -y.distance)
    .map(w => w.artistName);
  return sortedAnswers.slice(0, maxResults);
}

const app = express();
const PORT = 8000;
app.use(bodyParser.json());

app.post('/api/query/:text', (req, res) => {
  const accuracy = Number(req.body.accuracy);
  const maxResults = Number(req.body.maxResults);
  const { text } = req.params;
  if (accuracy == NaN || maxResults == NaN || !text) {
    return res.status(500).send("There was an error with the input...");
  }
  const names = findArtists(text, accuracy, maxResults);
  const nameData = names.map((name: string, idx: number) => ({
    "rank": idx+1,
    "artistName": name
  }));
  return res.json({
    "searchText": text,
    "similarArtists": nameData
  })
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});