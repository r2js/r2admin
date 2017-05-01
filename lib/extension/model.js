const nunjucks = require('nunjucks');
const parse = require('./parser');

module.exports = (app, njk) => {
  function ModelExtension() {
    this.tags = ['model'];
    this.parse = parse('model', this);
    this.run = (context, options, body, errorBody, cb) => {
      Object.assign(context.ctx, {});
      cb(null, new nunjucks.runtime.SafeString(njk.env.renderString(body())));
    };
  }

  njk.env.addExtension('ModelExtension', new ModelExtension());
};
