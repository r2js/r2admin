const pagination = require('ultimate-pagination');
const parse = require('./parser');
const adminUtils = require('../utils');

module.exports = (app, njk) => {
  const AdminUtils = adminUtils(app);

  function PaginateExtension() {
    this.tags = ['paginate'];
    this.parse = parse('paginate', this);

    this.run = (context, params = {}, q = {}, options = {}, body, errorBody, cb) => {
      const { object, querymen = {} } = context.ctx;
      const { model, name, pageBaseUrl } = params;
      let { page = 1, limit = 10, sort, populate = [] } = options;
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
      const { sort: pSort, limit: pLimit, populate: pPopulate } = cursor;
      sort = pSort || sort;
      limit = pLimit || limit;
      populate = pPopulate || populate;

      // page param
      const { p } = query;
      page = p || page;
      delete query.p;

      if (app.service('model/profile')) {
        populate.push({
          path: 'lastPatches.actor',
          model: 'profile',
        });
      }

      Model.paginate(
        Object.assign({}, query),
        Object.assign({}, { select, page, limit, sort, populate }, options)
      )
        .then((modelData) => {
          if (!context.ctx.modelData) {
            Object.assign(context.ctx, { modelData: {} });
          }

          Object.assign(modelData, {
            baseUrl: pageBaseUrl || `/admin/${object}?p=`,
            pageObj: pagination.getPaginationModel({
              currentPage: modelData.page,
              totalPages: modelData.pages,
            }),
          });

          Object.assign(context.ctx.modelData, { [queryName]: modelData });
          cb(null);
        })
        .catch(() => cb(null));
    };
  }

  njk.env.addExtension('PaginateExtension', new PaginateExtension());
};
