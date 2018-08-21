$(document).ready(function() {
  $(document).bind('keypress', function(event) {
    if (event.which === 11 ) {
      var range = window.getSelection().getRangeAt(0),
        span = document.createElement('blah');
      $(span).css("background-color", "red")
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
  });
});
