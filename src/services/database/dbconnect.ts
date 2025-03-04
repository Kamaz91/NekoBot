import knexPkg, { Knex } from "knex";
import logger from "../../services/logger/index.js";

const knex = knexPkg.default;

let knexConnection: Knex;

export function connect(): Promise<{ status: boolean; message: string }> {
  knexConnection = knex({
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: Number(process.env.DB_PORT) || 3306,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
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
      console.log(e);
    });

  return isConnectionEstablished(knexConnection);
}

export function disconnect(): void {
  logger.info(`Database successfully disconnected`);
  knexConnection.destroy();
}

export function getConnection(): Knex {
  return knexConnection;
}

function isConnectionEstablished(connecting: Knex) {
  return connecting.raw('SELECT 1+1 AS result')
    .then((result) => { console.log("DB result should be 2=", result[0]); return { status: true, message: "Database Connected" } })
    .catch((error) => { console.log(error); return { status: false, message: error.toString() } });
}