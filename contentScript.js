function renderModal(paragraphText) {
  $("body").prepend("<div class='cpe_overlay'> \
    <div class='cpe_container'> \
      <h3 class='cpe_modal_title'>SELECTED TEXT</h3> \
      <p class='cpe_modal_body'>"+
    paragraphText
    +"</p> \
      <h3 class='cpe_modal_title'>YOUR COMMENT</h3> \
      <form id='cpe_form'> \
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

  $("#cpe_form").on("submit", function(e) {
    e.preventDefault();

    var data = {
      highlightedText: paragraphText,
      url: window.location.host + window.location.pathname,
      comment: $(".cpe_modal_textarea")[0].value,
      type: 'post_highlight',
    }

    chrome.runtime.sendMessage(data, function(highlight) {
      highlightText(paragraphText, highlight.id);
      $(".cpe_overlay").remove();
    });
  })
}

function highlightText(text, highlight_id) {
  var instance = new Mark(document.querySelector("body"));
  $("body").mark(text, {
    separateWordSearch: false,
    acrossElements: true,
    className: "cpe_highlight cpe_highlight_" + highlight_id
  });
}

$(document).ready(function() {
  var message = {
    type: 'load_highlights',
    url: window.location.host + window.location.pathname
  }
  chrome.runtime.sendMessage(message, function(response) {
    response.response.highlights.forEach(function(highlight) {
      highlightText(highlight.body, highlight.id)
    })
  });

  $(document).bind('keypress', function(event) {
    if (event.which === 11 ) {
      var highlightedText = window.getSelection(0).toString();
      renderModal(highlightedText)
    }
  });
});
