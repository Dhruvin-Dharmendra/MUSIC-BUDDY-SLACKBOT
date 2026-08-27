const axios = require("axios");
require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/music-buddy-help", async ({ ack, respond }) => {
  await ack();

  try {
    await respond({
      text: "Music Buddy Command:\n• '/music-buddy-song <name>' - search song info & preview\n• '/music-buddy-catfact' - Get a random cat fact\n• '/music-buddy-joke' - Get a random joke\n• '/music-buddy-help' - Show this menu"
    });
  } catch (err) {
    console.error("Error running help command", err);
    await respond({ text: "MENU IS NOT AVAILABLE!" });
  }
});

app.command("/music-buddy-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "CURIOSITY KILLS THE CAT!" });
  }
});

app.command("/music-buddy-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text: `${response.data.setup}\n${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "NOT IN A MOOD TO JOKE TODAY!" });
  }
});

app.command("/music-buddy-song", async ({ ack, respond, command }) => {
  await ack();
  const songName = command.text;

  if (!songName) {
    await respond({ text: "WHAT'S THE NAME OF THE SONG?" });
    return;
  }

  try {
    const response = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&limit=1`
);

    if (response.data.resultCount === 0) {
      await respond({ text: "NO SONGS FOUND FOR THAT NAME." });
      return;
    }

    const song = response.data.results[0];
    await respond({
      text: `Song Info:\n• Name: ${song.trackName}\n• Artist: ${song.artistName}\n• Album: ${song.collectionName || "N/A"}`
    });
  } catch (err) {
    await respond({ text: "IS THIS THING FOR REAL?" });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();