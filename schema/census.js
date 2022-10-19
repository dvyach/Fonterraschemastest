import db_prefix from '../prefix';

cube(`Census`, {
  sql: `select C.id, site,host,os,last AS 'ReportingTime',Cu.username as username
from ${db_prefix()}core.Census  as C join ${db_prefix()}core.Customers Cu on C.site = Cu.customer `, // where ${SECURITY_CONTEXT.username.filter('Cu.username')}
  joins: {},
  measures: {
    count: {
      type: `countDistinct`,
      sql: `host`,
      title: `Count`,
    },
    deviceReported30: {
      sql: `host`,
      type: `countDistinct`,
      rollingWindow: {
        trailing: `31 day`,
        offset: `end`,
      },
      drillMembers: [site, host, os, ReportingTime],
      title: `Device Reported in last 30 days`,
    },
    deviceReported7: {
      sql: `host`,
      type: `countDistinct`,
      rollingWindow: {
        trailing: `8 day`,
        offset: `end`,
      },
      drillMembers: [site, host, os, ReportingTime],
      title: `Device Reported in last 7 days`,
    },
    deviceReported1: {
      sql: `host`,
      type: `countDistinct`,
      rollingWindow: {
        trailing: `2 day`,
        offset: `end`,
      },
      drillMembers: [site, host, os, ReportingTime],
      title: `Device Reported last 24 hours`,
    },
    deviceReportedN: {
      sql: `host`,
      type: `countDistinct`,
      drillMembers: [site, host, os, ReportingTime],
      title: `Device Reported Today`,
    },
    deviceReportedAll: {
      sql: `host`,
      type: `countDistinct`,
      rollingWindow: {
        trailing: `unbounded`,
        offset: `end`,
      },
      drillMembers: [site, host, os, ReportingTime],
      title: `Devices Reported`,
    },
  },
  dimensions: {
    idx: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    host: {
      type: `string`,
      sql: `host`,
      title: `Machine`,
      shown: true,
    },
    site: {
      sql: `site`,
      type: `string`,
      title: `Site`,
      shown: true,
    },
    os: {
      sql: `os`,
      type: `string`,
      title: `OS`,
      shown: true,
    },
    ReportingTime: {
      sql: `from_unixtime(ReportingTime,'%Y-%m-%d %H:%M:%S')`,
      type: `time`,
      title: `ReportingTime`,
      shown: true,
    },
  },
  preAggregations: {
    // main: {
    //   type: `originalSql`,
    //   partitionGranularity: `month`,
    //   timeDimensionReference: ReportingTime,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `900 seconds`,
    //     incremental: true,
    //     updateWindow: `6 hour`,
    //   },
    // },

    C1Hour: {
      type: `rollup`,
      useOriginalSqlPreAggregations: true,
      measures: [deviceReported1],
      dimensions: [site, os, host],
      timeDimension: ReportingTime,
      granularity: `second`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
      },
      indexes: {
        main: {
          columns: [host, site],
        },
      },
    },

    C7Hour: {
      type: `rollup`,
      useOriginalSqlPreAggregations: true,
      measures: [deviceReported7],
      dimensions: [site, os, host],
      timeDimension: ReportingTime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
      },
      indexes: {
        main: {
          columns: [host, site],
        },
      },
    },

    C30Hour: {
      type: `rollup`,
      useOriginalSqlPreAggregations: true,
      measures: [deviceReported30],
      dimensions: [site, os, host],
      timeDimension: ReportingTime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
      },
      indexes: {
        main: {
          columns: [host, site],
        },
      },
    },
  },
});
