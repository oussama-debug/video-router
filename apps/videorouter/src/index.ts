import Application from "./app.js";

(async () => {
    const app = new Application()
    await app.startMediasoup()
    app.listen()
})()