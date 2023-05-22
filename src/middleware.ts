import { MiddlewareHandler } from "hono";
import { CoolerError } from "./errors";

export const helloMiddleWare: MiddlewareHandler = async (c, next) => {
  console.log("hello middleware");
  await next();
};

export const secretWeapon: MiddlewareHandler = async (c, next) => {
  c.set("secret", "🔫");
  await next();
};

export const authenticateUser: MiddlewareHandler = async (c, next) => {
  // Check for headers
  const authentication = c.req.headers.get("Authentication");
  const user_id = authentication?.split("Bearer ")[1];

  console.log("user_id", user_id);

  if (!user_id) {
    throw new CoolerError(401, "Authentication header is required");
  }

  c.set("user_id", user_id);
  await next();
};
