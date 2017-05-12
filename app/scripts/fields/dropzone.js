import $ from 'jquery';
import Dropzone from 'dropzone';

Dropzone.autoDiscover = false;
const dropzone = (el) => {
  const filesArr = [];
  const maxFiles = 10;
  let uploading;

  new Dropzone(el.get(0), {
    url: '/management/upload',
    autoProcessQueue: false,
    uploadMultiple: false,
    parallelUploads: 2,
    maxFilesize: 10,
    createImageThumbnails: true,
    maxFiles,

    init() {
      this.on('addedfile', (file) => {

      });
      this.on('processing', () => {

      });
      this.on('success', (files, response) => {

      });
      this.on('complete', (file) => {

      });
      this.on('uploadprogress', (file, progress, bytesSent) => {

      });
      this.on('sending', (file, xhr, formData) => {

      });
    },
  });
};

export default () => {
  $('.f-dropzone').each(function () {
    dropzone($(this));
  });
};
