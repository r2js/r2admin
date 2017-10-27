import $ from 'jquery';
import debug from 'debug';
import 'selectize';

global.jQuery = $;
const log = debug('r2admin:field:relation');

const select2nested = (data, valueField, displayField, prefix, initPrefix = '-') => {
  let r = [];
  let getPrefix = prefix;
  if (!getPrefix) {
    getPrefix = initPrefix;
  }

  for (const d in data) { // eslint-disable-line
    if (data.hasOwnProperty(d) && data[d][displayField]) { // eslint-disable-line
      r.push({ [valueField]: data[d][valueField], [displayField]: `${getPrefix} ${data[d][displayField]}` });

      if (data[d].children) {
        r = r.concat(
          select2nested(data[d].children, valueField, displayField, initPrefix + getPrefix)
        );
      }
    }
  }

  return r;
};

const select = (el) => {
  const data = el.data();
  const { ref, display, value, qtype, placeholder } = data;
  const { sort = display } = data;

  if (!display) {
    return log(`${ref}, data-display not found`);
  }

  return el.selectize({
    placeholder,
    valueField: '_id',
    labelField: display,
    searchField: display,
    score: () => () => 1,
    load(q, cb) {
      if (!q.length) {
        return cb();
      }

      return $.get(`/admin/${ref}/search`, { term: q }, (res) => {
        cb(res.data);
      }, 'json');
    },
    onInitialize() {
      const self = this;
      const q = { limit: 100, sort };

      if (qtype === 'fullArrayTree') {
        $.get(`/admin/${ref}/search`, Object.assign({}, { qType: 'fullArrayTree' }), (res) => {
          const nested = select2nested(res.data, '_id', display);
          const getValue = value.split(',');
          const vals = [];
          self.clearOptions();
          nested.forEach((item) => {
            self.addOption(item);
            if (getValue.includes(item._id)) {
              vals.push(item._id);
            }
          });

          if (vals.length) {
            self.setValue(vals, true);
          }
        }, 'json');
      } else {
        if (value) {
          const getIds = Object.assign({}, q, { ids: value });
          $.get(`/admin/${ref}/search`, getIds, (res) => {
            self.clear();
            const vals = [];
            res.data.forEach((item) => {
              self.updateOption(item._id, item); // eslint-disable-line
              vals.push(item._id); // eslint-disable-line
            });

            if (vals.length) {
              self.setValue(vals);
            }
          }, 'json');
        }

        $.get(`/admin/${ref}/search`, q, (res) => {
          if (!value) {
            self.clear();
          }

          res.data.forEach((item) => {
            self.addOption(item);
          });
        }, 'json');
      }
    },
    onFocus() {
      el.parent().addClass('fl-has-focus');
    },
    onBlur() {
      el.parent().removeClass('fl-has-focus');
    },
    onChange(elValue) {
      if (!elValue || !elValue.length) {
        return el.parent().removeClass('fl-is-active');
      }

      return el.parent().addClass('fl-is-active');
    },
  });
};

export default () => {
  $('.f-relation').each(function () {
    select($(this));
  });
};
