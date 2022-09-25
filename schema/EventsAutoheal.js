cube(`EventsAutoheal`, {
  sql: `SELECT * FROM event.\`Events_autoheal\``,
  
  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started  
  },
  
  joins: {
    
  },
  
  measures: {
    count: {
      type: `count`,
      drillMembers: [username, id, windowtitle, uuid]
    }
  },
  
  dimensions: {
    customer: {
      sql: `customer`,
      type: `string`
    },
    
    machine: {
      sql: `machine`,
      type: `string`
    },
    
    username: {
      sql: `username`,
      type: `string`
    },
    
    clientversion: {
      sql: `clientversion`,
      type: `string`
    },
    
    description: {
      sql: `description`,
      type: `string`
    },
    
    type: {
      sql: `type`,
      type: `string`
    },
    
    path: {
      sql: `path`,
      type: `string`
    },
    
    executable: {
      sql: `executable`,
      type: `string`
    },
    
    version: {
      sql: `version`,
      type: `string`
    },
    
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true
    },
    
    windowtitle: {
      sql: `windowtitle`,
      type: `string`
    },
    
    string1: {
      sql: `string1`,
      type: `string`
    },
    
    string2: {
      sql: `string2`,
      type: `string`
    },
    
    text1: {
      sql: `text1`,
      type: `string`
    },
    
    text2: {
      sql: `text2`,
      type: `string`
    },
    
    text3: {
      sql: `text3`,
      type: `string`
    },
    
    text4: {
      sql: `text4`,
      type: `string`
    },
    
    uuid: {
      sql: `uuid`,
      type: `string`
    }
  }
});
