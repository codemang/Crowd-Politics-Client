chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
  chrome.storage.sync.get(['apiToken'], function(storage) {
    var backend = 'localhost:3000';

    if (data.type === 'post_highlight') {
      $.ajax({
        type: 'POST',
        url: 'http://' + backend + '/api/highlights',
        data: data,
        headers: {
          Authorization: 'Token token=' + storage.apiToken,
        },
      })
      .done(function(data) {
        sendResponse(data);
      })
      .fail(function() {
        console.log('error!!!');
      })
      .always(function() {
        console.log('complete');
      });
    } else if (data.type === 'load_highlights') {
      console.log('Loading highlights');
      $.ajax({
        type: 'GET',
        url: 'http://' + backend + '/api/highlights',
        data: data,
        headers: {
          Authorization: 'Token token=' + storage.apiToken,
        },
      })
      .done(function(data) {
        sendResponse(data.response);
      })
      .fail(function() {
        console.log('error!!!');
      })
      .always(function() {
        console.log('complete');
      });
    } else if (data.type === 'login') {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/users/extension_login',
        data: data,
      })
      .done(function(data) {
        if (data.token) {
          chrome.storage.sync.set({ apiToken: data.token });
          sendResponse({ apiToken: data.token });
          // reactRef.appendToState({apiToken: data.token});
        }
      })
      .fail(function(data) {
        sendResponse(data);
      });
    } else if (data.type === 'logout') {
      chrome.storage.sync.set({ apiToken: null });
      sendResponse({ apiToken: null});
    } else if (data.type === 'upvote') {
      $.ajax({
        type: 'POST',
        url: 'http://' + backend + '/api/comment_votes',
        data: data,
        headers: {
          Authorization: 'Token token=' + storage.apiToken,
        },
      })
      .done(function(data) {
        sendResponse(data);
      })
      .fail(function() {
        console.log('error!!!');
      })
      .always(function() {
        console.log('complete');
      });
    }
  });
  return true;
});
