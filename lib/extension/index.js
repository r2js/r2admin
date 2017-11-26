const viewExtension = require('./view');
const fieldExtension = require('./field');
const paginateExtension = require('./paginate');
const apiQueryExtension = require('./apiQuery');
const serviceExtension = require('./service');
const dateFilter = require('nunjucks-date-filter');
const dateFilterLocal = require('nunjucks-date-filter-local');

module.exports = (app, njk) => {
  viewExtension(app, njk);
  fieldExtension(app, njk);
  paginateExtension(app, njk);
  apiQueryExtension(app, njk);
  serviceExtension(app, njk);
  njk.env.addFilter('date', dateFilter);
  njk.env.addFilter('dateLocal', dateFilterLocal);
};

