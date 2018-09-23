import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import style from './app.scss';
import HelloWorld from './components/hello-world';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    var message = {
      type: 'load_highlights',
      url: window.location.host + window.location.pathname
    }
    const reactRef = this;
    chrome.runtime.sendMessage(message, function(response) {
      console.log(response);
      if (response.response.highlights) {
        let highlights = {};
        response.response.highlights.forEach(function(highlight) {
          highlights[highlight.id] = highlight;
          reactRef.highlightText(highlight.body, highlight.id)
        });
        reactRef.setState({highlights: highlights});
      }
    });

    $(document).bind('keypress', function(event) {
      if (event.which === 11 ) {
        var highlightedText = window.getSelection(0).toString();
        reactRef.setState(Object.assign({}, this.state, {highlightedData: {highlightedText}, panelVisible: true}))
      }
    });
  }

  highlightText(text, highlightId) {
    var instance = new Mark(document.querySelector("body"));
    var highlightClass = 'cpe_highlight_' + highlightId;
    const reactRef = this;

    $("body").mark(text, {
      separateWordSearch: false,
      acrossElements: true,
      className: "cpe_highlight " + highlightClass,
      done: function() {
        $("."+highlightClass).on("click", function(elm) {
          console.log("Clicked")
          reactRef.setState(Object.assign({}, this.state, {highlightedData: {highlightId}, panelVisible: true}))
        });
      }
    });
  }

  getArticleTitle() {
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

  componentWillUpdate(nextProps, nextState) {
    const reactRef = this;
    if (!this.state.panelVisible && this.state.panelVisible != nextState.panelVisible) {
      $('#comments-container').comments({
        enablePinging: false,
        profilePictureURL: 'https://viima-app.s3.amazonaws.com/media/public/defaults/user-icon.png',
        getComments: function(success, error) {
          if (!nextState.highlightedData || !nextState.highlightedData.highlightId) {
            success([]);
          } else {
            const comments = nextState.highlights[nextState.highlightedData.highlightId].comments;
            success(comments);
          }
        },
        postComment: function(commentJSON, success, error) {
          const data = {
            articleTitle: reactRef.getArticleTitle(),
            highlightedData: reactRef.state.highlightedData,
            commentData: commentJSON,
            url: window.location.host + window.location.pathname,
            type: 'post_highlight',
          };
          console.log(data);

          const chromeRef = this;

          chrome.runtime.sendMessage(data, comment => {
            success(comment.response)
            // TODO: Where is this response key coming from?
            // highlight = highlight.response;
            // globalHighlights[highlight.id] = highlight;
            // highlightText(highlightedText, highlight.id);
            // $('.cpe_overlay').remove();
          });

          $.ajax({
            type: 'post',
            url: '/api/comments/',
            data: commentJSON,
            success: function(comment) {
              success(comment)
            },
            error: error
          });
        }
      });
    }
  }

  renderModal(highlightedObj) {
  }

  closePanel() {
    this.setState(Object.assign({}, this.state, {panelVisible: false}))
  }

  render() {
    let classes = style['cpe-sidebar'];
    if (this.state.panelVisible) {
      classes += " " + style['cpe-sidebar-visible'];
    }

    let highlightedText;
    if (this.state.highlightedData) {
      highlightedText = this.state.highlightedData.highlightedText || this.state.highlights[this.state.highlightedData.highlightId].body;
    }

    return (
      <div id={style['cpe-modal-container']} className={classes}>
        <div className={`${style['panel-header']} ${style['panel-header-shared']}`}>
          <p className={style['panel-header-brand']}>PolitiCrew</p>
          <a className={style['panel-header-close']} onClick={this.closePanel.bind(this)}>Close</a>
        </div>
        <div className={`${style['panel-highlight']} ${style['panel-header-shared']}`}>
          <h3 className={style['cpe-panel-highlighted-header']}>HIGHLIGHTED TEXT</h3>
          <p className={style['cpe-panel-highlighted-text']}>{highlightedText}</p>
        </div>
        <div className={`${style['panel-comments']} ${style['panel-header-shared']}`}>
          <div className={style['panel-comments']}>
            <h3 className={style['cpe-panel-highlighted-header']}>COMMENT SECTION</h3>
            <div id='comments-container'></div>
          </div>
        </div>
      </div>
    );
  }
}


export default hot(module)(App);
