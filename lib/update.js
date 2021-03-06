const _ = require('underscore');
const adminUtils = require('./utils');

module.exports = (app, conf = {}) => {
  const AdminUtils = adminUtils(app);
  const { baseUrl = 'admin' } = conf;
  const { errors } = AdminUtils;
  const { created } = app.handler;
  const { partial: p } = _;

  return {
    form(req, res) {
      const { object, id: objectId } = req.params;
      const Model = AdminUtils.getModel(object);
      const { query } = AdminUtils.parseQuery(Model, req.query);
      let populate;
      let patches;
      let objectData;
      let activeDoc;

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
          activeDoc = data;
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
            data: objectData, object, objectId, type: 'update', activeDoc,
          });
        })
        .catch(() => res.redirect(`/${baseUrl}/${object}`));
    },

    object(req, res, next) {
      const { object, id: objectId } = req.params;
      const body = _.omit(req.body, _.isEmpty);
      let modelData;

      AdminUtils.getModel(object).findById(req.params.id)
        .then((model) => {
          if (!model) {
            if (req.xhr) {
              return p(errors, next)({ type: 'objectNotFound' });
            }

            req.flash('info', { type: 'objectNotFound' });
            return res.redirect(`/${baseUrl}/${object}`);
          }

          Object.assign(model, body, {
            actor: req.session.adminUser.userId,
            i18n: req.body.i18n || 'en',
            // field aynı değerlerle update edilmeye çalışıldığında
            // "Cannot read property '$where' of undefined" hatası atıyor
            // (reference field için)
            updatedAt: Date.now(),
          });

          if (body.parentId === 'null') {
            model.parentId = null;
          }

          return model.save();
        })
        .then((data) => {
          modelData = data;
          if (req.xhr) {
            created(modelData, res);
            return Promise.resolve();
          }

          req.flash('info', { type: 'objectUpdated' });

          let redirect = `/${baseUrl}/${object}`;
          if (req.query.redirect) {
            redirect = req.query.redirect;
          } else if (req.body.redirect) {
            redirect = req.body.redirect;
          }

          res.redirect(redirect);
          return Promise.resolve();
        })
        .catch((err) => {
          if (req.xhr) {
            return p(errors, next)(err);
          }

          return res.render(`admin/object/${object}/form.html`, {
            type: 'update',
            errors: err.errors,
            data: req.body,
            object,
            objectId,
          });
        })
        .then(() => modelData.applyPatch ? modelData.applyPatch() : Promise.resolve());
    },
  };
};
