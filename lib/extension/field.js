const nunjucks = require('nunjucks');
const dot = require('dotty');
const parse = require('./parser');

module.exports = (app, njk) => {
  function FieldExtension() {
    this.tags = ['field'];
    this.parse = parse('field', this);
    this.run = (context, options = {}, body, errorBody, cb) => {
      const { name } = options;
      const { errors = {}, data = {} } = context.ctx;
      const model = context.ctx.object || options.model;
      const path = app.service('Mongoose').model(model).schema.paths[name];
      const pathOpts = dot.get(path, 'caster.options') || path.options;
      let type = path.options.field || path.instance.toLowerCase();
      const ref = dot.get(path, 'caster.options.ref') || path.options.ref;

      console.log(type, name);
      console.log(path);
      console.log('--------------------------------');

      if (type === 'array' && path.schema) {
        type = 'embeddedArray';
      } else if (ref) {
        type = 'relation';
      }

      // console.log(path);
      // console.log('------------------------------');
      app.render(
        `admin/tag/field/${type}.html`,
        Object.assign({ name, errors, data, type, path, pathOpts }, options),
      (err, html) => {
        cb(null, new nunjucks.runtime.SafeString(html));
      });
    };
  }

  njk.env.addExtension('FieldExtension', new FieldExtension());
};
