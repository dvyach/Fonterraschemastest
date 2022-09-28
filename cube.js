// Cube.js configuration options: https://cube.dev/docs/config
module.exports = {
  queryRewrite: (query, { securityContext }) => {
    CubeVal = query.measures[0]
            ? query.measures[0].split(".")[0]
            : query.dimensions[0].split(".")[0];
    if (securityContext.type == 'site') {
      if(securityContext.name != 'All'){
        query.filters.push({
        member: CubeVal+'.site',
        operator: 'equals',
        values: [securityContext.name],
        });
      }
      
    }else if(securityContext.type == 'group'){
      query.filters.push({
        member: CubeVal+'.group',
        operator: 'equals',
        values: [securityContext.name],
      });
    }
    // query.filters.push({
    //     member: CubeVal+'.username',
    //     operator: 'contains',
    //     values: [securityContext.username],
    //     });

    return query;
  }
};
