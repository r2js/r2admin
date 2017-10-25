import Flatpickr from 'flatpickr';
import debug from 'debug';

const log = debug('r2admin:field:dateTime');

const dateTime = (selector) => {
  const el = document.querySelector(selector); // eslint-disable-line
  if (!el) {
    return log('element not found!');
  }

  return new Flatpickr(el, {
    altInput: true,
    dateFormat: 'Y-m-d H:i:S',
    enableTime: true,
  });
};

export default () => {
  dateTime('.f-datetime');
};
