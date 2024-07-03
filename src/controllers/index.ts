import Elysia from "elysia";
import joinController from "./joinController";

export const controllers = new Elysia({ prefix: "/api" })
    .use(joinController)