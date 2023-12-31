import axios from 'axios';
import { config } from 'dotenv';
import express from 'express';
import fs from 'fs-extra';
import { join } from 'path';

config();
const app = express();

const JOKE_API = 'https://v2.jokeapi.dev/joke/Programming?type=single';
const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post('/new-message', async (req, res) => {
  const { message } = req.body;

  const messageText = message?.text?.toLowerCase()?.trim();
  const chatId = message?.chat?.id;
  if (!messageText || !chatId) {
    return res.sendStatus(400);
  }

  // local json
  const dataFromJson = fs.readJSONSync(join(process.cwd(), 'todos.json'));

  let responseText = 'I have nothing to say.';
  // generate responseText
  if (messageText === 'joke') {
    try {
      const response = await axios(JOKE_API);
      responseText = response.data.joke;
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  } else if (/\d\d\.\d\d/.test(messageText)) {
    responseText =
      dataFromJson[messageText] || 'You have nothing to do on this day.';
  }

  // send response
  try {
    await axios.post(TELEGRAM_URI, {
      chat_id: chatId,
      text: responseText,
    });
    res.send('Done');
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
