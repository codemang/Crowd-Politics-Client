function renderModal(paragraphText) {
  $("body").prepend("<div class='cpe_overlay'> \
    <div class='cpe_container'> \
      <h3 class='cpe_modal_title'>SELECTED TEXT</h3> \
      <p class='cpe_modal_body'>"+
    paragraphText
    +"</p> \
      <h3 class='cpe_modal_title'>YOUR COMMENT</h3> \
      <form> \
        <textarea class='cpe_modal_textarea' placeholder='What did you think of this section?'></textarea> \
        <input type='submit' value='SUBMIT' class='cpe_modal_submission'/> \
      </form> \
    </div> \
  </div>");

  $(document).on("click", function(event) {
    if (event.target.className === 'cpe_overlay') {
      $(".cpe_overlay").remove();
    }
  });
}

$(document).ready(function() {
  var instance = new Mark(document.querySelector("body"));

  $(document).bind('keypress', function(event) {
    if (event.which === 11 ) {
      var highlightedText = window.getSelection().toString();
      var instance = new Mark(document.querySelector("body"));

      $("body").mark(highlightedText, {
        separateWordSearch: false,
        acrossElements: true,
        className: "cpe_highlight"
      });
      renderModal(highlightedText)
    }
  });
});
