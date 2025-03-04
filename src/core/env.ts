import dotenv from "@dotenvx/dotenvx";
import path from "path";
import process from "process";

let envPath = path.resolve(process.cwd(), ".env");
console.log("ENV path:", envPath);
dotenv.config({ path: envPath });