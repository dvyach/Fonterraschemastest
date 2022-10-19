# Local tests

- Add .env file with vars from here https://nanoheal.cubecloud.dev/deployments/14/edit-env-vars
- Run it in docker

```
docker run -p 4000:4000   -v ${PWD}:/cube/conf   -e CUBEJS_DEV_MODE=true   cubejs/cube
```

# APP_CUBEJS_ID

For multitenancy support in securityContext can be passed variable `appId` it can be a string (also empty string or can have value `default`).

To add this var to the JWT token you can add the `APP_CUBEJS_ID` env variable into deployment env vars.
If this var is not empty and not `default` then it can be used in `driverFactory`

If you pass env vars like this `CUBEJS_DB_HOST_${appId}` then cubejs will use credentials depends on the appId value.

# APP_CUBEJS_SHEMA

For multitenancy support in securityContext can be passed variable `appShema` it can be a string (also empty string or can have value `default`).

To add this var to the JWT token you can add the `APP_CUBEJS_SHEMA` env variable into deployment env vars.
If this var is not empty and not `default` then it can be used in `repositoryFactory`

If you create the folder with the name `schema_${appId}` then cubejs will use schema depends on appId value.


# scheduledRefreshContexts

If we want to one of appId use non-default schema folder we have to add env var `SCHEMA_${appId}` to cube cloud with the name of schema folder for `appId`

# Warning

If you change `appId` or `appShema` preaggregations will be reset.

# MultiTenancy

Docs - https://cube.dev/docs/multitenancy-setup

Multitenancy added only in - https://gitlab.nanoheal.com/sourcecode/analyticsapi/-/tree/ADM_SECURITY_CONTEXT

For enable it, add DB connection data in `driverFactory`

```js
{
  ...
  driverFactory: ({ dataSource } = {}) => {
    if (dataSource === 'prefix'){
      return new MySQLDriver({
        host: process.env.PREFIXED_CUBEJS_DB_HOST,
        port: process.env.PREFIXED_CUBEJS_DB_PORT,
        user: process.env.PREFIXED_CUBEJS_DB_USER,
        password: process.env.PREFIXED_CUBEJS_DB_PASS,
        database: process.env.PREFIXED_DB_DATABASE,
      });
    }
    return new MySQLDriver({
      host: process.env.CUBEJS_DB_HOST,
      port: process.env.CUBEJS_DB_PORT,
      user: process.env.CUBEJS_DB_USER,
      password: process.env.CUBEJS_DB_PASS,
      database: process.env.DB_DATABASE,
    })
  },
  ...
};
```

In this function passed `dataSource` argument which is specified in the requested schema

```js
cube(`SchemaName`, {
  sql: `SELECT * FROM XXX`,
  ...
  dataSource: `prefixed_db`, // <-- this line
});

```

# DB prefixs

For enable DB prefixs add `process.env.DB_PREFIX` in main js file

```js
(process.env.DB_PREFIX || '') + process.env.DB_DATABASE;
```

Or if you needed prefix in cubejs schema import `db_prefix`:
```js
import { db_prefix } from '../prefix';
```
and place him
```sql
FROM ${db_prefix()}asset.AssetData
```

P.S.
process.env in cubejs schemes is not passed

# Warning

For now, 06.12.2021, simultaneous use multitenancy and DB prefixs - not supported
