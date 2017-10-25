const parse = require('./parser');
const adminUtils = require('../utils');

module.exports = (app, njk) => {
  const AdminUtils = adminUtils(app);

  function ApiQueryExtension() {
    this.tags = ['apiquery'];
    this.parse = parse('apiquery', this);

    this.run = (context, params = {}, q = {}, options = {}, body, errorBody, cb) => {
      const { object, querymen = {} } = context.ctx;
      const { model, name, qName, qType = 'all' } = params;
      let { limit = 10, skip = 0, sort, populate = [] } = options;
      const queryName = name || object;
      const { query = {}, select = {}, cursor = {} } = querymen;
      const Model = AdminUtils.getModel(model || object);

      // parse query
      const parsedQuery = AdminUtils.parseQuery(Model, q);
      const { query: pQuery = {}, select: pSelect = {}, cursor: pCursor = {} } = parsedQuery;

      // override parsed query options
      Object.assign(query, pQuery);
      Object.assign(select, pSelect);
      Object.assign(cursor, pCursor);

      // options
      const { sort: pSort, limit: pLimit, skip: pSkip, populate: pPopulate } = cursor;
      sort = pSort || sort;
      limit = pLimit || limit;
      skip = pSkip || skip;
      populate = pPopulate || populate;

      populate.push({
        path: 'lastPatches.actor',
        model: 'profile',
      });

      Object.assign(query, { qType });

      if (qName) {
        Object.assign(query, { qName });
      }

      Model.apiQuery(query, Object.assign(options, { sort, limit, skip, populate, fields: select }))
        .then((modelData) => {
          if (!context.ctx.modelData) {
            Object.assign(context.ctx, { modelData: {} });
          }

          Object.assign(context.ctx.modelData, { [queryName]: modelData });
          cb(null);
        })
        .catch(() => cb(null));
    };
  }

  njk.env.addExtension('ApiQueryExtension', new ApiQueryExtension());
};
