#!/usr/bin/env node
const ngrok = require("ngrok");

(async () => {
  try {
    const url = await ngrok.connect({
      addr: 19000, // default Expo dev server port
      authtoken: "<YOUR_NGROK_AUTHTOKEN>", // optional if you want custom tunnels
    });
    console.log("Ngrok tunnel started at:", url);
    console.log("Use this URL in Expo or open your phone browser to test.");
  } catch (err) {
    console.error(err);
  }
})();
