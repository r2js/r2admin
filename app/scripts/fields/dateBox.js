import Flatpickr from 'flatpickr';
import debug from 'debug';

const log = debug('r2admin:field:dateBox');

const dateBox = (selector) => {
  const el = document.querySelector(selector); // eslint-disable-line
  if (!el) {
    return log('element not found!');
  }

  return new Flatpickr(el, {
    altInput: true,
    dateFormat: 'Y-m-dTH:i:S+00:00',
  });
};

export default () => {
  dateBox('.f-datebox');
};
