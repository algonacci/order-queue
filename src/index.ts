import { Elysia, t } from "elysia";
import { client } from "./models/client";


const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .post("/join", async ({ body }) => {
    const { user_id, product_id } = body
    if (!user_id || !product_id) {
      return {
        status: {
          code: 404,
          message: "Not found"
        },
        data: null
      }
    }

    const queue: any = client.query("SELECT * FROM queues WHERE product_id = ? AND status = 'Pending'").all(product_id)

    if (queue.length === 0) {
      client.query("INSERT INTO queues (status, created_at, product_id) VALUES ('Pending', DATETIME('now'), ?)").all(product_id)
      const newQueueID: any = client.query("SELECT * FROM queues WHERE product_id = ? AND status = 'Pending'").all(product_id)
      console.log(newQueueID[0].id);
      client.query("INSERT INTO queue_users (user_id, queue_id) VALUES (?, ?)").all(user_id, newQueueID[0].id);
      return {
        status: {
          code: 200,
          message: "Success create and join new queue"
        },
        data: null
      }
    } else {
      const queue_id = queue[0].id;

      const countResult: any = client.query("SELECT COUNT(*) AS user_count FROM queue_users WHERE queue_id = ?").all(queue_id);
      const user_count = countResult[0].user_count || 0;
      const maxUsersResult: any = client.query("SELECT max_users FROM products WHERE id = ?").all(product_id);
      const max_users = maxUsersResult[0].max_users;

      if (user_count == max_users) {
        client.query("UPDATE queues SET status = 'Full' WHERE id = ?").all(queue_id);
        return {
          status: {
            code: 200,
            message: "Queue is full, status updated to Full"
          },
          data: {
            queue_id: queue_id
          }
        };
      } else {
        // Masukkan data ke dalam tabel queue_users
        client.query("INSERT INTO queue_users (user_id, queue_id) VALUES (?, ?)").all(user_id, queue_id);
        const updatedCountResult: any = client.query("SELECT COUNT(*) AS user_count FROM queue_users WHERE queue_id = ?").all(queue_id);
        const updated_user_count = updatedCountResult[0].user_count || 0;
        if (updated_user_count >= max_users) {
          client.query("UPDATE queues SET status = 'Full' WHERE id = ?").all(queue_id);
        }
        return {
          status: {
            code: 200,
            message: "User joined queue successfully"
          },
          data: {
            queue_id: queue_id
          }
        };
      }
    }
  }, {
    body: t.Object({
      user_id: t.Integer(),
      product_id: t.Integer()
    })
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
