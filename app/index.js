import $ from 'jquery';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/modern/theme';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import debug from 'debug';
import 'float-labels.js/src/float-labels.js';
import relation from './scripts/fields/relation';

const log = debug('r2admin');
localStorage.debug = '*'; // eslint-disable-line

$(() => {
const x = new window.FloatLabels( 'form', {
    style: 1,
    transform    : 'input, select, textarea',
});

  log('page init');
  relation();
  console.log(window.FloatLabels);

console.log(x);
  // $( 'form' ).floatlabels({
    // style: 1,
// });
});
