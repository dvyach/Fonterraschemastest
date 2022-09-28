import db_prefix from '../prefix';

cube(`AASG`, {
  sql: `SELECT idx,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  customer,machine,username,ctime as cltime,
  cast((REPLACE(REPLACE(text1->>'$.sequencename',']',''),'[','')) as CHAR) AS 'tilename',
  cast((text1->>'$.sequence') AS CHAR) AS 'statusText',
  cast((string1->>'$.log') AS CHAR) AS 'executedBy',
  CONV(SUBSTRING(CAST(SHA(CONCAT(json_keys(text1))) AS CHAR), 1, 16), 16, 10) as keylist,
  cast(SUBSTRING_INDEX(text2->>'$.log',':',-1) as CHAR) as 'log',
  cast((text1->>'$.totaldurationofsequence_seconds') as unsigned integer) AS 'duration',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 286
  and ${FILTER_PARAMS.AASG.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `, //  and ${USER_CONTEXT.machine.filter('machine') }
  title: `Automation Analytics`,
  description: `Automation Analytics`,

  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA}.site = ${CUBE}.customer and ${CA}.host = ${CUBE}.machine`,
    }

    //GA: {
   //   relationship: 'belongsTo',
  //    sql: `${GA}.host = ${CUBE}.machine`,
  //  },
  },

  measures: {
    automationcount: {
      type: `count`,
      //	sql: `idx`,
      drillMembers: [machine, tilename, typeofrun, ETime],
      title: `Count`,
    },

    automationsuccesscount: {
      type: `count`,
      //		sql: `idx`,
      filters: [
        {
          sql: `${CUBE}.statusText = 'completed successfully'`,
        },
      ],
      title: `Successeful`,
    },

    automationterminationcount: {
      type: `count`,
      //		sql: `idx`,
      filters: [
        {
          sql: `${CUBE}.statusText = 'Has been terminated'`,
        },
      ],
      title: `Terminated`,
    },

    executiontimetotal: {
      type: `sum`,
      sql: `duration`,
      shown: false,
    },

    durationTotal: {
      type: `sum`,
      sql: `duration`,
      filters: [
        {
          sql: `${CUBE}.statusText = 'completed successfully'`,
        },
      ],
      shown: false,
    },

    terminatedafterTotal: {
      type: `sum`,
      sql: `duration`,
      filters: [
        {
          sql: `${CUBE}.statusText = 'Has been terminated'`,
        },
      ],
      shown: false,
    },

    executiontime: {
      type: `sum`,
      sql: `${executiontimetotal} / NULLIF(${automationcount}, 0)`,
      title: `Execution time`,
    },

    duration: {
      type: `number`,
      sql: `${durationTotal} / NULLIF(${automationsuccesscount}, 0)`,
      title: `Execution Duration`,
    },

    terminatedafter: {
      type: `number`,
      sql: `${terminatedafterTotal} / NULLIF(${automationterminationcount}, 0)`,
      title: `Terminated After`,
    },
  },

  dimensions: {
    idx: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
      shown: true,
      title: `Event ID`,
    },

    site: {
      sql: `customer`,
      type: `string`,
      title: `Site`,
    },

    machine: {
      sql: `machine`,
      type: `string`,
      title: `Device`,
    },

    //group: {
  //    case: {
  //      when: [
  //        {
  //          sql: `${GA}.name is null`,
  //          label: `Un-Grouped`,
  //        },
  //      ],
  //      else: {
  //        label: {
  //          sql: `${GA}.name`,
  //        },
  //      },
  //    },
  //    type: `string`,
  //    title: `Group`,
  //  },

    os: {
      sql: `${CA}.os`,
      type: `string`,
      title: `Operating System`,
    },

    tilename: {
      type: `string`,
      sql: `tilename`,
      title: `Automation Name`,
    },

    typeofrun: {
      type: `string`,
      sql: `log`,
      title: `Type of Run`,
    },

    statusText: {
      type: `string`,
      sql: `statusText`,
      title: `Status`,
    },

    executedBy: {
      type: `string`,
      sql: `executedBy`,
      title: `Executed By`,
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

    /*CLTime: {
			type: `time`,
			sql: `from_unixtime(cltime,'%Y-%m-%d %H:%i:%s')`,
			title: `Client Time`
		},*/

    ETime: {
      type: `time`,
      sql: `dtime`,
      title: `Time`,
    },
  },

  preAggregations: {
    main: {
      type: `originalSql`,
      partitionGranularity: `day`,
      timeDimension: ETime,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
        // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,
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
      measures: [
        executiontimetotal,
        durationTotal,
        terminatedafterTotal,
        automationcount,
        automationsuccesscount,
        automationterminationcount,
      ],
      dimensions: [site, os, tilename, typeofrun, statusText],
      timeDimension: ETime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
        // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },

    SCCount: {
      type: `rollup`,
      // useOriginalSqlPreAggregations: true,
      measures: [
        executiontimetotal,
        durationTotal,
        terminatedafterTotal,
        automationcount,
        automationsuccesscount,
        automationterminationcount,
      ],
      dimensions: [site, os, tilename, typeofrun, statusText],
      timeDimension: ETime,
      granularity: `hour`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
        // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,
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
      measures: [
        executiontimetotal,
        durationTotal,
        terminatedafterTotal,
        automationcount,
        automationsuccesscount,
        automationterminationcount,
      ],
      dimensions: [site, os, machine, username, tilename, typeofrun, statusText],
      timeDimension: ETime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
        // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,
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
