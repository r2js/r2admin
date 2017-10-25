const nunjucks = require('nunjucks');
const _ = require('underscore');
const parse = require('./parser');

const view = (tag, type, app, njk) => {
  function ViewExtension() {
    this.tags = [type];
    this.parse = parse(type, this);
    this.run = (context, name, options = {}, body, errorBody, cb) => {
      const { errors = {}, data = {} } = context.ctx;

      app.render(
        `tag/${tag}/${type}.html`,
        Object.assign({ name, errors, data }, options),
        (err, html) => {
          cb(null, new nunjucks.runtime.SafeString(html));
        });
    };
  }

  return njk.env.addExtension(`${type}Extension`, new ViewExtension());
};

module.exports = (app, njk) => {
  const component = _.partial(view, 'component', _, _, _);
  const field = _.partial(view, 'field', _, _, _);

  ['string', 'password', 'hidden', 'select', 'array'].map(val => field(val, app, njk));
  ['submit', 'linkButton'].map(val => component(val, app, njk));
};
