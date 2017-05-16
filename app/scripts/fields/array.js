import $ from 'jquery';
import 'selectize';

const select = (el) => {
  const { placeholder } = el.data();

  return el.selectize({
    placeholder,
    delimiter: ',',
    persist: false,
    create(input) {
      return {
        value: input,
        text: input,
      };
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
  $('.f-array').each(function () {
    select($(this));
  });
};
