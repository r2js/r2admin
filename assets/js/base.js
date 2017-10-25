import $ from 'jquery';
import debug from 'debug';
import 'float-labels.js/src/float-labels.js'; // eslint-disable-line
import relation from './scripts/fields/relation'; // set global.jQuery = $;
import richText from './scripts/fields/richText';
import dateBox from './scripts/fields/dateBox';
import dateTime from './scripts/fields/dateTime';
import switchery from './scripts/fields/switchery';
import array from './scripts/fields/array';
import select from './scripts/fields/select';

import 'bootstrap'; // eslint-disable-line

const log = debug('admin');
localStorage.debug = '*'; // eslint-disable-line

$(() => {
  // not: float labels => Cannot read property 'value' of null hatası atarsa
  // boş da olsa bir option koyulmalı
  // <option value=""></option>
  new window.FloatLabels('form', { // eslint-disable-line
    style: 1,
    transform: 'input, select, textarea',
  });

  log('page init');
  relation();
  richText();
  dateBox();
  dateTime();
  switchery();
  array();
  select();
});
