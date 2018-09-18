window.globalHighlights = {};
window.nate = 'This Worked!';

function renderModal(highlightedObj) {
  const highlightedText =
    highlightedObj.highlightedText ||
    globalHighlights[highlightedObj.highlightId].body;
  $('body').prepend(
    "<div class='cpe_overlay'> \
    <div class='cpe_container'> \
      <h3 class='cpe_modal_title'>SELECTED TEXT</h3> \
      <p class='cpe_modal_body'>" +
      highlightedText +
      "</p> \
      <h3 class='cpe_modal_title'>YOUR COMMENT</h3> \
      <form id='cpe_form'> \
        <textarea class='cpe_modal_textarea' placeholder='What did you think of this section?'></textarea> \
        <input type='submit' value='SUBMIT' class='cpe_modal_submission'/> \
      </form> \
    </div> \
  </div>",
  );

  $(document).on('click', event => {
    if (event.target.className === 'cpe_overlay') {
      $('.cpe_overlay').remove();
    }
  });

  $('#cpe_form').on('submit', e => {
    e.preventDefault();

    const data = {
      highlightedText,
      articleTitle: getArticleTitle(),
      highlightedId: highlightedObj.highlightId,
      url: window.location.host + window.location.pathname,
      comment: $('.cpe_modal_textarea')[0].value,
      type: 'post_highlight',
    };

    chrome.runtime.sendMessage(data, highlight => {
      // TODO: Where is this response key coming from?
      highlight = highlight.response;
      globalHighlights[highlight.id] = highlight;
      highlightText(highlightedText, highlight.id);
      $('.cpe_overlay').remove();
    });
  });
}

function getArticleTitle() {
  if (window.location.host.indexOf('nationalreview') !== -1) {
    return $('h1.article-header__title')
      .text()
      .trim();
  }
  if (window.location.host.indexOf('nytimes') !== -1) {
    return $('span.balancedHeadline')
      .text()
      .trim();
  }
  if (window.location.host.indexOf('vox') !== -1) {
    return $('h1.c-page-title')
      .text()
      .trim();
  }
  if (window.location.host.indexOf('thefederalist') !== -1) {
    return $('h2.entry-title a')
      .text()
      .trim();
  }
  if (window.location.host.indexOf('salon') !== -1) {
    return $('.title-container h1')
      .text()
      .trim();
  }
  if (window.location.host.indexOf('washingtonpost') !== -1) {
    return $('.topper-headline h1')
      .text()
      .trim();
  }
}

function highlightText(text, highlightId) {
  const instance = new Mark(document.querySelector('body'));
  const highlightClass = 'cpe_highlight_' + highlightId;

  $('body').mark(text, {
    separateWordSearch: false,
    acrossElements: true,
    className: 'cpe_highlight ' + highlightClass,
    done() {
      $('.' + highlightClass).on('click', elm => {
        showComments(highlightId);
      });
    },
  });
}

function showComments(highlightId) {
  let commentsHtml = '';
  $.each(globalHighlights[highlightId].comments, (index, elm) => {
    commentsHtml +=
      "<div class='cpe_comment_container'> \
      <div class='cpe_comment_username'>" +
      elm.username +
      "</div> \
      <div class='cpe_comment_body'>" +
      elm.comment +
      '</div></div>';
  });

  $('body').prepend(
    "<div class='cpe_overlay'> \
    <div class='cpe_container'> \
      <h3 class='cpe_modal_title'>SELECTED TEXT</h3> \
      <p class='cpe_modal_body'>" +
      globalHighlights[highlightId].body +
      "</p> \
      <h3 class='cpe_modal_title'>COMMENTS</h3>" +
      commentsHtml +
      "<input type='submit' value='ADD COMMENT' class='cpe_modal_submission' id='add_comment_button'/> \
    </div> \
  </div>",
  );

  $('.cpe_comment_container').linkify({ target: '_blank' });

  $(document).on('click', event => {
    if (event.target.className === 'cpe_overlay') {
      $('.cpe_overlay').remove();
    }
  });

  $('#add_comment_button').on('click', () => {
    $('.cpe_overlay').remove();
    renderModal({ highlightId });
  });
}

$(document).ready(() => {
  // var message = {
  //   type: 'load_highlights',
  //   url: window.location.host + window.location.pathname
  // }
  // chrome.runtime.sendMessage(message, function(response) {
  //   if (response.response.highlights) {
  //     response.response.highlights.forEach(function(highlight) {
  //       window.globalHighlights[highlight.id] = highlight;
  //       highlightText(highlight.body, highlight.id)
  //     })
  //   }
  // });
  //
  // $(document).bind('keypress', function(event) {
  //   if (event.which === 11 ) {
  //     var highlightedText = window.getSelection(0).toString();
  //     renderModal({highlightedText: highlightedText})
  //   }
  // });
});

console.log('Adding');
$('body').prepend("<div id='cpe-app'></div>");
