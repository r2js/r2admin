import Flatpickr from 'flatpickr';

const dateBox = (selector) => {
  new Flatpickr(document.querySelector(selector), { // eslint-disable-line
    altInput: true,
    dateFormat: 'Y-m-dTH:i:S+00:00',
  });
};

export default () => {
  dateBox('.f-datebox');
};
