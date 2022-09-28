import db_prefix from '../prefix';

cube(`AHSG`, {
  sql: `SELECT idx,servertime as stime, from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  customer,machine,username,
  cast((text1->>'$.resolution') AS CHAR) AS 'autoheal',
  cast((text1->>'$.issuedescription') as CHAR) AS 'issue',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where  scrip = 69
  and ${FILTER_PARAMS.AHSG.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
   `, //  and ${USER_CONTEXT.machine.filter('machine')}
  title: `Autoheal Analytics test`,
  description: `Autoheal Analytics test`,

  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA}.site = ${CUBE}.customer and ${CA}.host = ${CUBE}.machine`,
    }

   // GA: {
   //   relationship: 'belongsTo',
  //    sql: `${GA}.host = ${CUBE}.machine`,
  //  },
  },
  measures: {
    autohealcount: {
      type: `count`,
      sql: `idx`,
      drillMembers: [machine, autoheal, issuedescription, ETime],
      title: `Count`,
      filters: [
        {
          sql: `${CUBE}.autoheal is not null`,
        },
      ],
    },
  },

  dimensions: {
    idx: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
    },

    site: {
      sql: `customer`,
      type: `string`,
      title: `Site`,
    },

  //  group: {
  //    case: {
  //      when: [
  //        {
  //          sql: `${GA}.name is null`,
  //          label: `Un-Grouped`,
  //        },
  //      ],
  //      else: {
   //       label: {
   //         sql: `${GA}.name`,
    //      },
    //    },
    //  },
   //   type: `string`,
   //   title: `Group`,
  //  },

    os: {
      sql: `${CA}.os`,
      type: `string`,
      title: `Operating System`,
    },

    machine: {
      sql: `machine`,
      type: `string`,
      title: `Machine`,
    },

    autoheal: {
      type: `string`,
      sql: `autoheal`,
      title: `Autoheal Executed`,
    },

    issuedescription: {
      type: `string`,
      sql: `issue`,
      title: `Issue Description`,
    },

    username: {
      sql: `username`,
      type: `string`,
      title: `Device User`,
    },

    clientver: {
      sql: `clientversion`,
      type: `string`,
      title: `Version`,
    },

    ETime: {
      type: `time`,
      sql: `dtime`,
      title: `Autoheal Execution Time`,
    },
  },

  preAggregations: {
    main: {
      type: `originalSql`,
      partitionGranularity: `day`,
      timeDimension: ETime,
      scheduledRefresh: true,
      refreshKey: {
        every: `300 seconds`,
        incremental: true,
        updateWindow: `1 day`,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },

    SDCount: {
      type: `rollup`,
      // useOriginalSqlPreAggregations: true,
      measures: [autohealcount],
      dimensions: [site, os, autoheal, issuedescription],
      timeDimension: ETime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },

    SHCount: {
      type: `rollup`,
      // useOriginalSqlPreAggregations: true,
      measures: [autohealcount],
      dimensions: [site, os, autoheal, issuedescription],
      timeDimension: ETime,
      granularity: `hour`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },
    MDCount: {
      type: `rollup`,
      // useOriginalSqlPreAggregations: true,
      measures: [autohealcount],
      dimensions: [site, machine, os, autoheal, issuedescription],
      timeDimension: ETime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },
  },
});
