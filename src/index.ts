import { v4 as uuidv4 } from "uuid";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  object,
  optional,
  string,
  boolean,
  assert,
  StructError,
} from "superstruct";
import { authenticateUser, helloMiddleWare, secretWeapon } from "./middleware";
import { CoolerError } from "./errors";

type Context = {
  Bindings: {
    TODOS: KVNamespace;
  };
  Variables: {
    secret: string;
    user_id: string;
  };
};

const todoSchema = object({
  title: string(),
  completed: optional(boolean()),
});

const app = new Hono<Context>();

app.use("/*", cors({ origin: "*" }));

app.onError((error, c) => {
  const status =
    error instanceof CoolerError
      ? error.status
      : error instanceof StructError
      ? 400
      : 500;
  return c.json({ error: error.message, status }, status);
});

app.get("/", (c) => c.text("Hello Hono!"));

app.get("/middleware", helloMiddleWare, secretWeapon, (c) => {
  const secret = c.get("secret");
  return c.text("Middleware all done!");
});

app.get("/todos", authenticateUser, async (c) => {
  const user_id = c.get("user_id");

  const items = await c.env.TODOS.list({ prefix: user_id });
  console.log(items);
  const todos = await Promise.all(
    items.keys.map(async (item) => c.env.TODOS.get(item.name))
  );
  //console.log(todos);
  return c.json(todos);
});

// app.get("/todos/:user_id", async (c) => {
//   const user_id = c.req.param("user_id");
//   const items = await c.env.TODOS.list({ prefix: user_id });
//   const todos = await Promise.all(
//     items.keys.map(async (item) => c.env.TODOS.get(item.name))
//   );
//   return c.json(todos);
// });

app.post("/todos", authenticateUser, async (c) => {
  const user_id = c.get("user_id");
  const data = await c.req.json();

  assert(data, todoSchema);
  console.log(`user_id: ${user_id}`);
  const id = uuidv4();
  const todo = { id, title: data.title, completed: data.completed };

  await c.env.TODOS.put(`${user_id}_${id}`, JSON.stringify(todo));

  return c.json(todo);
});

// for testing our custom error message
app.get("/error", async (c) => {
  const data = {
    title: "hey",
    completed: "false",
  };

  assert(data, todoSchema);

  return c.json(data);
});

export default app;
