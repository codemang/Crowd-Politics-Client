chrome.runtime.onMessage.addListener(
  function(data, sender, sendResponse) {
    var backend = 'natemango.com';
    if (data.type === 'post_highlight') {
      $.ajax({
        type: "POST",
        url: 'http://'+backend+'/api/highlights',
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
        url: 'http://'+backend+'/api/highlights',
        data: data,
      })
      .done(function(data) {
        console.log(data)
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
