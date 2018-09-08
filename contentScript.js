var globalHighlights = {}

function renderModal(highlightedObj) {
  var highlightedText = highlightedObj.highlightedText || globalHighlights[highlightedObj.highlightId].body;
  console.log(highlightedText);
  $("body").prepend("<div class='cpe_overlay'> \
    <div class='cpe_container'> \
      <h3 class='cpe_modal_title'>SELECTED TEXT</h3> \
      <p class='cpe_modal_body'>"+
    highlightedText
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
      highlightedText: highlightedText,
      highlightedId: highlightedObj.highlightId,
      url: window.location.host + window.location.pathname,
      comment: $(".cpe_modal_textarea")[0].value,
      type: 'post_highlight',
    }

    chrome.runtime.sendMessage(data, function(highlight) {
      highlightText(highlightedText, highlight.id);
      $(".cpe_overlay").remove();
    });
  })
}

function highlightText(text, highlightId) {
  var instance = new Mark(document.querySelector("body"));
  var highlightClass = 'cpe_highlight_' + highlightId;

  $("body").mark(text, {
    separateWordSearch: false,
    acrossElements: true,
    className: "cpe_highlight " + highlightClass,
    done: function() {
      $("."+highlightClass).on("click", function(elm) {
        showComments(highlightId)
      });
    }
  });
}

function showComments(highlightId) {
  var commentsHtml = ""
  $.each(globalHighlights[highlightId].comments, function(index, elm) {
    commentsHtml += "<div class='cpe_comment_container'> \
      <div class='cpe_comment_username'>" + elm.username + "</div> \
      <div class='cpe_comment_body'>"+elm.comment + "</div></div>";
  });

  $("body").prepend("<div class='cpe_overlay'> \
    <div class='cpe_container'> \
      <h3 class='cpe_modal_title'>SELECTED TEXT</h3> \
      <p class='cpe_modal_body'>"+
    globalHighlights[highlightId].body
    +"</p> \
      <h3 class='cpe_modal_title'>COMMENTS</h3>" +
      commentsHtml
    +"<input type='submit' value='ADD COMMENT' class='cpe_modal_submission' id='add_comment_button'/> \
    </div> \
  </div>");

  $(".cpe_comment_container").linkify({ target: "_blank" });

  $(document).on("click", function(event) {
    if (event.target.className === 'cpe_overlay') {
      $(".cpe_overlay").remove();
    }
  });

  $("#add_comment_button").on('click', function() {
    $(".cpe_overlay").remove();
    renderModal({highlightId: highlightId})
  })
}

$(document).ready(function() {
  console.log(111111111111)
  var message = {
    type: 'load_highlights',
    url: window.location.host + window.location.pathname
  }
  chrome.runtime.sendMessage(message, function(response) {
    if (response.response.highlights) {
      response.response.highlights.forEach(function(highlight) {
        globalHighlights[highlight.id] = highlight;
        highlightText(highlight.body, highlight.id)
      })
    }
  });

  $(document).bind('keypress', function(event) {
    if (event.which === 11 ) {
      var highlightedText = window.getSelection(0).toString();
      renderModal({highlightedText: highlightedText})
    }
  });
});
