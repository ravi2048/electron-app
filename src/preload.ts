// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// import { db } from "./Database/DBManager";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// import { contextBridge, app } from 'electron';
// import sqlite3 from 'better-sqlite3';
// import path from 'path';

// const dbPath = path.join(app.getPath('userData'), 'data_table.db');
// const db = new sqlite3(dbPath);

// contextBridge.exposeInMainWorld('db', {
//     addRequest: (method: string, url: string, body: JSON) => {
//         const query = db.prepare('INSERT INTO request (method, url, body) VALUES (?, ?)');
//         return query.run(method, url, body);
//     },
// });