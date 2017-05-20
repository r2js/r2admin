import $ from 'jquery';
import debug from 'debug';
import 'selectize';

global.jQuery = $;
const log = debug('r2admin:field:relation');

const select = (el) => {
  const { ref, display, value, placeholder } = el.data();
  if (!display) {
    return log(`${ref}, data-display not found`);
  }

  return el.selectize({
    placeholder,
    valueField: '_id',
    labelField: display,
    searchField: display,
    load(q, cb) {
      if (!q.length) {
        return cb();
      }

      return $.get(`/admin/${ref}/search`, { field: display, q }, (res) => {
        cb(res.data);
      }, 'json');
    },
    onInitialize() {
      const self = this;
      if (!value) {
        return false;
      }

      return $.get(`/admin/${ref}/ids`, { field: display, ids: value }, (res) => {
        self.clear();
        const vals = [];
        res.data.forEach((item) => {
          self.updateOption(item._id, item); // eslint-disable-line
          vals.push(item._id); // eslint-disable-line
        });
        self.setValue(vals);
      }, 'json');
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
