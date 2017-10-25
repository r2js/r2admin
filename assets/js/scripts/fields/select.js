import $ from 'jquery';
import 'selectize';

const select = (el) => {
  const { placeholder, value } = el.data();

  return el.selectize({
    placeholder,
    persist: false,
    onInitialize() {
      if (!value) {
        return false;
      }
      el.parent().addClass('fl-is-active');
      return this.setValue(value, true);
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
  $('.f-select').each(function () {
    select($(this));
  });
};
