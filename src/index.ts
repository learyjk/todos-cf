import { v4 as uuidv4 } from "uuid";
import { Hono } from "hono";

type Context = {
  Bindings: {
    TODOS: KVNamespace;
  };
};

const app = new Hono<Context>();

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
  const data = await c.req.formData();
  const title = data.get("title");
  if (!title) {
    throw new Error("title is required");
  }
  const completed = data.get("completed") === "on";
  const id = uuidv4();
  const todo = { id, title, completed };

  await c.env.TODOS.put(`${user_id}_${id}`, JSON.stringify(todo));

  return c.json(todo);
});

export default app;
