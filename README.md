# @mastra/dsql ignores startExclusive and endExclusive

`DSQLStore` memory `listMessages` always uses `>=` and `<=` for `filter.dateRange`. `PostgresStore` honors `startExclusive` and `endExclusive`. This script runs the same calls on both stores and prints the result.

DSQL speaks the Postgres wire protocol, and `DSQLStore` accepts a `pg` pool, so a local Postgres is enough to run it.

```bash
npm install
DATABASE_URL=postgres://postgres@127.0.0.1:5432/postgres npm start
```

The script saves five messages one second apart, then filters from message 2 to message 4.

Output with @mastra/dsql 1.5.4 and @mastra/pg 1.32.0:

```
dsql  startExclusive  Message 2, Message 3, Message 4
dsql  endExclusive    Message 2, Message 3, Message 4
dsql  bothExclusive   Message 2, Message 3, Message 4
pg    startExclusive  Message 3, Message 4
pg    endExclusive    Message 2, Message 3
pg    bothExclusive   Message 3
```
