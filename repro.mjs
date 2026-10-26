import pg from 'pg';
import { DSQLStore } from '@mastra/dsql';
import { PostgresStore } from '@mastra/pg';

const conn = { connectionString: process.env.DATABASE_URL };
const base = Date.UTC(2026, 0, 1);
const ts = [0, 1, 2, 3, 4].map(i => new Date(base + i * 1000));
const cases = {
  startExclusive: { start: ts[1], end: ts[3], startExclusive: true },
  endExclusive: { start: ts[1], end: ts[3], endExclusive: true },
  bothExclusive: { start: ts[1], end: ts[3], startExclusive: true, endExclusive: true },
};

async function run(name, store) {
  await store.init();
  const memory = await store.getStore('memory');
  const threadId = `t-${name}`;
  const now = new Date();
  await memory.saveThread({ thread: { id: threadId, resourceId: 'r1', title: 't', createdAt: now, updatedAt: now, metadata: {} } });
  await memory.saveMessages({
    messages: ts.map((d, i) => ({
      id: `${name}-m${i + 1}`, threadId, resourceId: 'r1', role: 'user', type: 'v2', createdAt: d,
      content: { format: 2, parts: [{ type: 'text', text: `Message ${i + 1}` }], content: `Message ${i + 1}` },
    })),
  });
  for (const [label, dateRange] of Object.entries(cases)) {
    const { messages } = await memory.listMessages({ threadId, perPage: 10, page: 0, filter: { dateRange } });
    console.log(name.padEnd(5), label.padEnd(15), messages.map(m => m.content.content).sort().join(', '));
  }
}

const dsqlPool = new pg.Pool(conn);
await run('dsql', new DSQLStore({ id: 'dsql', pool: dsqlPool, schemaName: 'dsql_s' }));
await dsqlPool.end();
const pgPool = new pg.Pool(conn);
await run('pg', new PostgresStore({ id: 'pg', pool: pgPool, schemaName: 'postgres_s' }));
await pgPool.end();
