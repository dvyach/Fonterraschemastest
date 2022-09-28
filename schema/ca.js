import db_prefix from '../prefix';

cube(`CA`, {
  sql: `select C.id as cid, site,host, C.os,
  last AS 'ReportingTime',Cu.username as username
from ${db_prefix()}core.Census  as C join ${db_prefix()}core.Customers Cu on C.site = Cu.customer  and Cu.lastmodified is not null
  `, //  where ${SECURITY_CONTEXT.username.filter('Cu.username')}
  title: ` Location Cube`,
  description: `All Location cube`,
  joins: {},

  measures: {},

  dimensions: {
    // The Census level dimensions like site name, operating system, host are here

    cid: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
      shown: false,
    },
    site: {
      sql: `site`,
      type: `string`,
    },
    host: {
      sql: `host`,
      type: `string`,
    },
    os: {
      sql: `os`,
      type: `string`,
    },
    ReportingTime: {
      sql: `ReportingTime`,
      type: `string`,
    },
    username: {
      sql: `username`,
      type: `string`,
    },
  },
  preAggregations: {
    main: {
      type: `originalSql`,
      scheduledRefresh: true,
      refreshKey: {
        every: `1 hour`,
      },
      indexes: {
        machs: {
          columns: ['site', 'host'],
        },
      },
    },
  },
});
