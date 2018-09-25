chrome.runtime.onMessage.addListener(
  function(data, sender, sendResponse) {
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
    } else if (data.type === 'login') {
      $.ajax({
        type: "POST",
        url: 'http://localhost:3000/users/extension_login',
        data: data
      })
      .done(function(data) {
        if (data.token) {
          chrome.storage.sync.set({apiToken: data.token});
          sendResponse({apiToken: data.token})
          // reactRef.appendToState({apiToken: data.token});
        }
      })
      .fail(function(data) {
        sendResponse(data)
      })

    }

    return true;
  }
);
