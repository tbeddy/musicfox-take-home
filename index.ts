import express from 'express';
import fs from 'fs';

const data = fs.readFileSync('data.txt');
const bandnames: string[] = data.toString().split("\n")
  .map((s: string) => s.trim());

const app = express();
const PORT = 8000;

app.get('/api/query/:text', (req, res) => {
  return res.send(`You said ${req.params.text}`)
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});