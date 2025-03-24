import Application from "./app.js";

(async () => {
  const app = new Application();

  await app.listen();
  await app.run();
})();
