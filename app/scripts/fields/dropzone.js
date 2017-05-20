import $ from 'jquery';
import Dropzone from 'dropzone';
import _ from 'underscore';
import filesize from 'filesize';

const makeId = (len = 8) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let text = '';

  for (let i = 0; i < len; i++) { // eslint-disable-line
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text.toString();
};

const dzTemplate = _.template(`
  <div class="progress-template" id="<%= id %>">
    <div class="file-image"><img src="<%= image %>"></div>
    <div class="file-meta">
      <div class="file-name"><%= fileName %></div>
      <div class="progress">
        <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <div class="file-size"><%= size %></div>
      <div class="hidden file-field"></div>
    </div>
    <div class="clearfix"></div>
  </div>`);

Dropzone.autoDiscover = false;
const dropzone = (el) => {
  const container = $('.progress-container', el);
  const fieldType = el.data('type');
  const fieldName = el.data('name');
  const fieldValue = el.data('value');
  let getFieldName = fieldName;
  let maxFiles = 1;
  if (fieldType === 'array') {
    getFieldName = `${fieldName}[]`;
    maxFiles = 10;
  }
  let uploading; // eslint-disable-line

  const myDropzone = new Dropzone(el.get(0), {
    url: '/admin/upload',
    autoProcessQueue: false,
    uploadMultiple: false,
    parallelUploads: 2,
    maxFilesize: 10,
    createImageThumbnails: true,
    thumbnailWidth: 50,
    thumbnailHeight: 50,
    addRemoveLinks: false,
    clickable: `.f-${fieldName} *`,
    maxFiles,

    init() {
      this.on('addedfile', (file) => {
        const id = makeId(16);
        Object.assign(file, { id });

        if ($.isNumeric(maxFiles) && this.files.length > maxFiles) {
          const lastEl = this.files.pop();
          this.files.map((val) => {
            $(`#${val.id}`).remove();
            return val;
          });
          this.files = [lastEl];
        }
      });
      this.on('thumbnail', (file, dataUrl) => {
        container.append(dzTemplate({
          id: file.id,
          fileName: file.name,
          image: dataUrl,
          size: filesize(file.size),
          fieldName,
        }));

        if (!file.init) {
          myDropzone.processFile(file);
        }
      });
      this.on('processing', () => {
        uploading = true;
      });
      this.on('success', (file, response) => {
        Object.assign(file, { _id: response._id }); // eslint-disable-line
      });
      this.on('complete', (file) => { // eslint-disable-line
        if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
          uploading = false;
        }

        $(`#${file.id} .file-name`).append('&nbsp;&nbsp;✔');
        $(`#${file.id} .file-field`).append(`<input type="hidden" name="${getFieldName}" value="${file._id}" />`); // eslint-disable-line

        if (file.init) {
          $(`#${file.id} .progress-bar`).css('width', '100%');
        }
      });
      this.on('uploadprogress', (file, progress, bytesSent) => { // eslint-disable-line
        if (file && file.id) {
          $(`#${file.id} .progress-bar`).css('width', `${progress}%`);
        }
      });
      // this.on('sending', (file, xhr, formData) => {});

      // TODO: remove file butonu ekle

      if (fieldValue) {
        $.get('/admin/file/query', { _id: fieldValue }, (res) => {
          res.data.forEach((item) => {
            const { _id, name, size, path } = item;
            const fileData = {
              _id,
              name,
              size,
              accepted: true,
              status: Dropzone.SUCCESS,
              url: `/${path}`,
              init: true,
            };

            myDropzone.files.push(fileData);
            myDropzone.emit('addedfile', fileData);
            myDropzone.createThumbnailFromUrl(fileData, `/${path}`, () => {
              myDropzone.emit('complete', fileData);
            });
          });
        }, 'json');
      }
    },
  });
};

export default () => {
  $('.f-dropzone').each(function () {
    dropzone($(this));
  });
};
