const dot = require('dotty');

module.exports = (app) => {
  const getModel = object => app.service('Mongoose').model(object);

  return {
    search(req, res) {
      const { field, q } = req.query;
      const { object } = req.params;
      let Model;

      try {
        Model = getModel(object);
      } catch (e) {
        return app.handler.ok([], res);
      }

      return Model.find({ [field]: new RegExp(q, 'i') })
        .select({ _id: 1, [field]: 1 })
          .then(data => app.handler.ok(data, res))
          .catch(() => app.handler.ok([], res));
    },

    ids(req, res) {
      const { field, ids } = req.query;
      const { object } = req.params;
      let Model;

      try {
        Model = getModel(object);
      } catch (e) {
        return app.handler.ok([], res);
      }

      return Model.find({ _id: { $in: ids.split(',') } })
        .select({ _id: 1, [field]: 1 })
          .then(data => app.handler.ok(data, res))
          .catch(() => app.handler.ok([], res));
    },

    apiQuery(req, res) {
      const { object } = req.params;
      let Model;

      try {
        Model = getModel(object);
      } catch (e) {
        return app.handler.ok([], res);
      }

      if (!req.query.qType) {
        Object.assign(req.query, { qType: 'all' });
      }

      return Model.apiQuery(req.query)
        .then(data => app.handler.ok(data, res))
        .catch(() => app.handler.ok([], res));
    },
  };
};
