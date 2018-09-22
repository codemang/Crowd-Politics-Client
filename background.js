chrome.runtime.onMessage.addListener(
  function(data, sender, sendResponse) {
    // var backend = 'natemango.com';
    var username = 'Nate R.'
    // var username = 'Briana G.'
    var backend = 'localhost:3000';

    if (data.type === 'post_highlight') {
      $.ajax({
        type: "POST",
        url: 'http://'+backend+'/api/highlights',
        data: Object.assign({}, data, {username: username}),
      })
      .done(function(data) {
        sendResponse({response: data.comment})
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
        data: Object.assign({}, data, {username: username}),
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
