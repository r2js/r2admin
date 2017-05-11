import $ from 'jquery';
import debug from 'debug';
import 'float-labels.js/src/float-labels.js';
import relation from './scripts/fields/relation';
import richText from './scripts/fields/richText';

const log = debug('r2admin');
localStorage.debug = '*'; // eslint-disable-line

$(() => {
  new window.FloatLabels('form', { // eslint-disable-line
    style: 1,
    transform: 'input, select, textarea',
  });

  log('page init');
  relation();
  richText();
});
