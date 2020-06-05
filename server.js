import { config } from "https://deno.land/x/dotenv/mod.ts";
const env = config();
import { MongoClient } from "https://deno.land/x/mongo@v0.7.0/mod.ts";

const client = new MongoClient();
client.connectWithUri(env.MONGO_URL);

const db = client.database(env.MONGO_DBNAME);
const notesCollection = db.collection(env.MONGO_COLLECTION_NAME);

import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .get("/notes/getall", async (context) => {
    //TODO: return all notes
    context.response.body = notes;
  })
  .get("/notes/:id", (context) => {
    //TODO: return spesified note
  })
  .post("/notes/insert", (context) => {
    //TODO: insert note
  })
  .post("/notes/update", (context) => {
    //TODO: update note
  })
  .post("/notes/delete", (context) => {
    //TODO: delete note
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
