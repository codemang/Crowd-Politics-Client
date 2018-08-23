chrome.runtime.onMessage.addListener(
  function(data, sender, sendResponse) {
    if (data.type === 'post_highlight') {
      $.ajax({
        type: "POST",
        url: 'http://localhost:3000/api/highlights',
        data: data,
      })
      .done(function(data) {
        sendResponse({response: data.response})
      })
      .fail(function() {
        console.log( "error!!!" );
      })
      .always(function() {
        console.log( "complete" );
      });
    } else if (data.type === 'load_highlights') {
      $.ajax({
        type: "GET",
        url: 'http://localhost:3000/api/highlights',
        data: data,
      })
      .done(function(data) {
        sendResponse({response: data.response})
      })
      .fail(function() {
        console.log( "error!!!" );
      })
      .always(function() {
        console.log( "complete" );
      });
    }
    return true;
  }
);
