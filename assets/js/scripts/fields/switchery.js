import $ from 'jquery';

const switchery = (selector) => {
  const elems = Array.prototype.slice.call(document.querySelectorAll(selector));

  elems.forEach((el) => {
    const elSwitch = new window.Switchery(el, { size: 'small' });

    el.onchange = function (e) {
      const checked = $(this).prop('checked');
      const hidden = $(this).siblings('input[type=hidden]');
      hidden.val(checked);

      if (checked) {
        hidden.attr('disabled', 'disabled');
      } else {
        hidden.removeAttr('disabled');
      }
    };
  });
};

export default () => {
  switchery('.f-boolean');
};
