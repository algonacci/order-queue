import { Elysia, t } from "elysia";
import { controllers } from "./controllers";
import { cors } from '@elysiajs/cors'


const app = new Elysia()
  .use(cors())
  .get("/", () => "Hello Elysia")
  .use(controllers)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
