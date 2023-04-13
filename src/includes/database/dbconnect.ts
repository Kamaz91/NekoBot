import knex from "knex";
import { Knex } from "knex";
import logger from "../logger";

let knexConnection: Knex;

interface config {
  client: string;
  host: string;
  user: string;
  password: string;
  database: string;
}

export function connect({
  client,
  host,
  user,
  password,
  database,
}: config): Promise<{ status: boolean; message: string }> {
  knexConnection = knex({
    client: client,
    connection: {
      host: host,
      user: user,
      password: password,
      database: database,
      typeCast: (field, next) => {
        // Casting TINYINT with 1 length to boolean - null -> false
        if (field.type == 'TINY' && field.length == 1) {
          let value = field.string();
          return value ? (value == '1') : false;
        }
        return next();
      }
    },
  })
    .on("connection-error", (e) => {
      logger.error("Knex database connection-error");
      logger.error(e);
    });

  return knexConnection.schema
    .hasTable("users")
    .then((exists) => {
      return { status: true, message: "Database Connected" };
    })
    .catch((error) => {
      console.log("Connection Error:");
      console.error(error);
      return { status: false, message: error.toString() };
    });
}

export function disconnect(): void {
  console.log(`Database successfully disconnected`);
  knexConnection.destroy();
}

export function getConnection(): Knex {
  return knexConnection;
}
