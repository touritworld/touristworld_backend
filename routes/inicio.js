import express from 'express';

const router = express.Router();

router.get ("/", (req, res) => {
  const htmlRespose = `
  <html>
    <head>
      <title> NodeJs y express en vercel </title>
    </head>
    <body>
      <h1>Backend en vercel</h1>
    </body>
  </html>`;
  res.send(htmlRespose)
})

export default router;