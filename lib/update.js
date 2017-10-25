const _ = require('underscore');
const adminUtils = require('./utils');

module.exports = (app, conf = {}) => {
  const AdminUtils = adminUtils(app);
  const { baseUrl = 'admin' } = conf;

  return {
    form(req, res) {
      const { object, id: objectId } = req.params;
      const Model = AdminUtils.getModel(object);
      const { query } = AdminUtils.parseQuery(Model, req.query);
      let populate;
      let patches;
      let objectData;

      if (query) {
        populate = query.populate;
      }

      const patchOpts = { sort: { date: -1 } };
      if (app.service('model/profile')) {
        Object.assign(patchOpts, { populate: [{ path: 'actor', model: 'profile' }] });
      }

      Model.findOneOrError({ _id: req.params.id })
        .then(data => populate ? data.populate(populate).execPopulate() : data)
        .then((data) => {
          objectData = data.toObject();
          patches = data.patches;
          return patches
            ? data.patches.find({ ref: data.id }, {}, patchOpts)
            : data;
        })
        .then((data) => {
          if (patches) { // apply patches
            Object.assign(objectData, { patches: data });
          }

          res.render(`admin/object/${object}/form.html`, {
            data: objectData, object, objectId, type: 'update',
          });
        })
        .catch(() => res.redirect(`/${baseUrl}/${object}`));
    },

    object(req, res) {
      const { object } = req.params;
      const body = _.omit(req.body, _.isEmpty);
      let modelData;

      AdminUtils.getModel(object).findById(req.params.id)
        .then((model) => {
          if (!model) {
            req.flash('info', { type: 'objectNotFound' });
            return res.redirect(`/${baseUrl}/${object}`);
          }

          Object.assign(model, body, {
            actor: req.session.adminUser.userId,
            i18n: 'en',
          });

          return model.save();
        })
        .then((data) => {
          modelData = data;
          req.flash('info', { type: 'objectUpdated' });
          res.redirect(`/${baseUrl}/${object}`);
          return Promise.resolve();
        })
        .catch((err) => {
          res.render(`admin/object/${object}/form.html`, {
            type: 'update',
            errors: err.errors,
            data: req.body,
            object,
          });
        })
        .then(() => modelData.applyPatch ? modelData.applyPatch() : Promise.resolve());
    },
  };
};
