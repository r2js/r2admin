const nunjucks = require('nunjucks');
const dot = require('dotty');
const parse = require('./parser');

module.exports = (app, njk) => {
  function FieldExtension() {
    this.tags = ['field'];
    this.parse = parse('field', this);
    this.run = (context, options = {}, body, errorBody, cb) => {
      const { name, parent = '' } = options;
      const { errors = {}, data = {} } = context.ctx;

      const model = context.ctx.object || options.model;
      let path = app.service('Mongoose').model(model).schema.paths[parent || name];
      if (parent) {
        path = path.schema.paths[name];
      }

      const pathOpts = dot.get(path, 'caster.options') || path.options;
      let type = path.options.field || path.instance.toLowerCase();
      const ref = dot.get(path, 'caster.options.ref') || path.options.ref;

      if (type === 'array' && path.schema) {
        type = 'embeddedArray';
      } else if (ref) {
        type = 'relation';
      }

      app.render(
        `admin/tag/field/${type}.html`,
        Object.assign({ name, errors, data, type, path, pathOpts, model, parent }, options),
      (err, html) => {
        cb(null, new nunjucks.runtime.SafeString(html));
      });
    };
  }

  njk.env.addExtension('FieldExtension', new FieldExtension());
};
