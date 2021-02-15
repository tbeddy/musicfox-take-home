import express from 'express';

const app = express();
const PORT = 8000;

app.get('/api/query/:text', (req, res) => {
  return res.send(`You said ${req.params.text}`)
});
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});