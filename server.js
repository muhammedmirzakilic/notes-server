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
    let notes = await notesCollection.find({ isDeleted: { $ne: true } });
    notes = notes.map((note) => {
      var { _id: {$oid: id}, title, description, creadetAt, updatedAt } = note;
      return {
        id,
        title,
        description,
        creadetAt,
        updatedAt,
      };
    });
    context.response.body = notes;
  })
  .get("/notes/:id", async (context) => {
    if (!context.params || !context.params.id) {
      return context.response.body = {};
    }
    var note = await notesCollection.findOne(
      { _id: { "$oid": context.params.id } },
    );
    var { _id: {$oid: id}, title, description, creadetAt, updatedAt } = note;
    context.response.body = {
      id,
      title,
      description,
      creadetAt,
      updatedAt,
    };
  })
  .post("/notes/insert", async (context) => {
    if (!context.request.hasBody) {
      return context.response.status = 400;
    }
    const body = await context.request.body();
    var { title, description } = body.value;
    if (!title || !description) {
      return context.response.status = 400;
    }
    const result = await notesCollection.insertOne({
      title,
      description,
      createdAt: new Date(),
    });
    context.response.body = { result };
  })
  .post("/notes/update", async (context) => {
    if (!context.request.hasBody) {
      return context.response.status = 400;
    }
    const body = await context.request.body();
    var { title, description, id } = body.value;
    if (!id || !title || !description) {
      return context.response.status = 400;
    }
    const { modifiedCount } = await notesCollection.updateOne(
      { _id: { "$oid": id } },
      {
        $set: { title, description, updatedAt: new Date() },
      },
    );
    context.response.body = { result: modifiedCount == 1 };
  })
  .post("/notes/delete", async (context) => {
    if (!context.request.hasBody) {
      return context.response.status = 400;
    }
    const body = await context.request.body();
    var { title, description, id } = body.value;
    if (!id || !title || !description) {
      return context.response.status = 400;
    }
    const { modifiedCount } = await notesCollection.updateOne(
      { _id: { "$oid": id } },
      {
        $set: { isDeleted: true },
      },
    );
    context.response.body = { result: modifiedCount == 1 };
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
