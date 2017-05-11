var RichText = {
  init: function () {
    this.tinymce();
  },

  tinymce: function () {
    tinymce.init({
      height: '300',
      selector: ".f-richtext",
      content_css : '/assets/css/richText.css',
      plugins: [
        "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
        "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
        "save table contextmenu directionality emoticons template paste textcolor"
      ],
      toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor"
    });
  },
};

$(function() {
  RichText.init();
});


