// const Database = require("better-sqlite3")
// const path = require("path")
import Database from "better-sqlite3";
export const db = new Database("./data_table.db")
db.pragma("journal_mode = WAL")