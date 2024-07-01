import { Elysia, t } from "elysia";
import { client } from "./models/client";

const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .post("/join", async ({ body }) => {
        const { user_id, product_id } = body;
        if (!user_id || !product_id) {
            return {
                status: {
                    code: 404,
                    message: "Not found"
                },
                data: null
            };
        }

        const queue: any = await findOrCreateQueue(product_id);
        const user_count = await getUserCount(queue.id);
        const max_users = await getMaxUsers(product_id);

        if (user_count >= max_users) {
            await setQueueFull(queue.id);
            return {
                status: {
                    code: 200,
                    message: "Queue is full, status updated to Full"
                },
                data: {
                    queue_id: queue.id
                }
            };
        } else {
            await addUserToQueue(user_id, queue.id);
            const updated_user_count = await getUserCount(queue.id);
            if (updated_user_count >= max_users) {
                await setQueueFull(queue.id);
            }
            return {
                status: {
                    code: 200,
                    message: "User joined queue successfully"
                },
                data: {
                    queue_id: queue.id
                }
            };
        }
    }, {
        body: t.Object({
            user_id: t.Integer(),
            product_id: t.Integer()
        })
    })
    .listen(3000);

async function findOrCreateQueue(product_id: any) {
    let queue = client.query("SELECT * FROM queues WHERE product_id = ? AND status = 'Pending'").all(product_id);
    if (queue.length === 0) {
        client.query("INSERT INTO queues (status, created_at, product_id) VALUES ('Pending', DATETIME('now'), ?)").all(product_id);
        queue = client.query("SELECT * FROM queues WHERE product_id = ? AND status = 'Pending'").all(product_id);
    }
    return queue[0];
}

async function getUserCount(queue_id: any) {
    const result: any = client.query("SELECT COUNT(*) AS user_count FROM queue_users WHERE queue_id = ?").all(queue_id);
    return result[0].user_count || 0;
}

async function getMaxUsers(product_id: any) {
    const result: any = client.query("SELECT max_users FROM products WHERE id = ?").all(product_id);
    return result[0].max_users;
}

async function addUserToQueue(user_id: any, queue_id: any) {
    client.query("INSERT INTO queue_users (user_id, queue_id) VALUES (?, ?)").all(user_id, queue_id);
}

async function setQueueFull(queue_id: any) {
    client.query("UPDATE queues SET status = 'Full' WHERE id = ?").all(queue_id);
}

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
