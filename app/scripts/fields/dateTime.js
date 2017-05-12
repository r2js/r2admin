import Flatpickr from 'flatpickr';

const dateTime = (selector) => {
  new Flatpickr(document.querySelector(selector), { // eslint-disable-line
    altInput: true,
    dateFormat: 'Y-m-d H:i:S',
    enableTime: true,
  });
};

export default () => {
  dateTime('.f-datetime');
};
