import { v4 as uuidv4 } from "uuid";
import { Hono } from "hono";
import { object, optional, string, boolean, assert } from "superstruct";
import { StatusCode } from "hono/utils/http-status";

type Context = {
  Bindings: {
    TODOS: KVNamespace;
  };
};

const todoSchema = object({
  title: string(),
  completed: optional(boolean()),
});

class CoolerError extends Error {
  constructor(public status: StatusCode, public message: string) {
    super(message);
    this.name = "CoolerError";
  }
}

const app = new Hono<Context>();

app.onError((error, c) => {
  const status = error instanceof CoolerError ? error.status : 500;
  return c.json({ error: error.message }, status);
});

app.get("/", (c) => c.text("Hello Hono!"));

app.get("/todos", async (c) => {
  const items = await c.env.TODOS.list();
  return c.json(items.keys);
});

app.get("/todos/:user_id", async (c) => {
  const user_id = c.req.param("user_id");
  const items = await c.env.TODOS.list({ prefix: user_id });
  const todos = await Promise.all(
    items.keys.map(async (item) => c.env.TODOS.get(item.name))
  );
  return c.json(todos);
});

app.post("/todos/:user_id", async (c) => {
  const user_id = c.req.param("user_id");
  const data = await c.req.json();

  assert(data, todoSchema);

  const id = uuidv4();
  const todo = { id, title: data.title, completed: data.completed };

  await c.env.TODOS.put(`${user_id}_${id}`, JSON.stringify(todo));

  return c.json(todo);
});

app.get("/error", async (c) => {
  const data = {
    titlee: "hey",
    completed: false,
  };

  assert(data, todoSchema);

  return c.json(data);
});

export default app;
