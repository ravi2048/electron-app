/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import sqlite3 from 'better-sqlite3';
import path from 'path';
import { app } from '@electron/remote';
import { Grp, Req } from './types';
import './index.css';
import './app';

function init() {

    try {
        // SQLite connection
        const dbPath = path.join(app.getPath('userData'), 'data_table.db');
        const db = new sqlite3(dbPath);

        db.prepare(`
            CREATE TABLE IF NOT EXISTS request_group (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS request (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                method TEXT NOT NULL,
                url TEXT NOT NULL,
                body TEXT,
                request_group_id INTEGER NOT NULL,
                FOREIGN KEY(request_group_id) REFERENCES request_group(id)
            )
        `).run();

        return db;
    } catch (error) {
        console.error(error);
    }
}

export function addRequest(method: string, url: string, body: string, requestGroupId: number): void {
    const db = init()
    const query = db.prepare('INSERT INTO request (method, url, body, request_group_id) VALUES (?, ?, ?, ?)');
    let ss = query.run(method, url, body, requestGroupId);
}

export function showRequests(): Req[] {
    const db = init()
    if(!db) {
        return []
    }
    const query = db.prepare('SELECT * FROM request R INNER JOIN request_group RQ on R.request_group_id = RQ.id');
    let res = query.all();
    const data:Req[] = []
    for(let item of res) {
        data.push({
            // @ts-ignore
            method: item.method as string,
            // @ts-ignore
            url: item.url as string,
            // @ts-ignore
            body: item.body as string,
            // @ts-ignore
            requestGroupName: item.name as string,
        })
    }
    return data;
}

export function createGroup(name: string): void {
    console.log('creatting grp...')
    const db = init()
    const query = db.prepare('INSERT INTO request_group (name) VALUES (?)');
    let res = query.run(name);
    console.log('query res', res);
}

export function getAllGroups(): Grp[] {
    const db = init()
    if(!db) {
        return []
    }
    const query = db.prepare('SELECT * FROM request_group');
    let res = query.all();
    const data:Grp[] = []
    for(let item of res) {
        data.push({
            // @ts-ignore
            id: item.id as number,
            // @ts-ignore
            name: item.name as string
        });
    }
    return data;
}