import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import style from './app.scss';
import HelloWorld from './components/hello-world';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { loadedApiToken: false };
  }

  componentDidMount() {

    const reactRef = this;

    chrome.storage.sync.get(['apiToken'], function(storage) {
      reactRef.setState(Object.assign({}, this.state, {loadedApiToken: true}, storage));
    });

    var link = document.createElement("link");
    link.href = 'https://fonts.googleapis.com/css?family=Open+Sans';
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    link = document.createElement("link");
    link.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.cs://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css';
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    var message = {
      type: 'load_highlights',
      url: window.location.host + window.location.pathname
    }
    chrome.runtime.sendMessage(message, function(response) {
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
        reactRef.handleHotkey();
      }
    });
  }

  handleHotkey() {
    var highlightedText = window.getSelection(0).toString();
    let newState = {panelVisible: true};
    if (highlightedText) {
      newState.highlightedData = {highlightedText}
    }
    this.appendToState(newState);
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

  componentDidUpdate(prevProps, prevState, snapshot) {

    const reactRef = this;
    if (this.state.errorMessage) {
      $("input").keypress(function() {
        reactRef.appendToState({errorMessage: null});
      })
    }

    if (this.state.highlightedData != prevState.highlightedData) {
      $('#comments-container').comments({
        enablePinging: false,
        profilePictureURL: 'https://viima-app.s3.amazonaws.com/media/public/defaults/user-icon.png',
        getComments: function(success, error) {
          if (!reactRef.state.highlightedData || !reactRef.state.highlightedData.highlightId) {
            success([]);
          } else {
            const comments = reactRef.state.highlights[reactRef.state.highlightedData.highlightId].comments;
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

          const chromeRef = this;

          chrome.runtime.sendMessage(data, comment => {
            success(comment.response)
            // TODO: Where is this response key coming from?
            // highlight = highlight.response;
            // globalHighlights[highlight.id] = highlight;
            // highlightText(highlightedText, highlight.id);
            // $('.cpe_overlay').remove();
          });

          // $.ajax({
          //   type: 'post',
          //   url: '/api/comments/',
          //   data: commentJSON,
          //   success: function(comment) {
          //     success(comment)
          //   },
          //   error: error
          // });
        }
      });
    }
  }

  closePanel() {
    this.setState(Object.assign({}, this.state, {panelVisible: false, highlightedData: null}))
  }

  appendToState(obj) {
    this.setState(Object.assign({}, this.state, obj));
  }

  signupClick(e) {
    const reactRef = this;
    e.preventDefault();

    var message = {
      type: 'login',
      user: {
        email: $("#email-input").val(),
        password: $("#password-input").val(),
      },
    };

    chrome.runtime.sendMessage(message, function(response) {
      if (response.apiToken) {
        reactRef.appendToState({apiToken: response.apiToken});
      } else if (response.status === 401) {
        reactRef.appendToState({errorMessage: 'Your email or password was incorrect.'});
      } else {
        reactRef.appendToState({errorMessage: 'A problem occurred while logging you in. Please try again later.'});
      }
    });
  }

  renderSignup() {
    if (this.state.apiToken) {
      return (
        <div className={style['panel-header-shared']}>
          <h3>You are logged in!</h3>
        </div>
      )
    }
    return (
      <div class='signup-form' className={style['panel-header-shared']}>
        <h3>You have to login to view this page.</h3>
        <form>
          <div class="form-group">
            <label for="exampleInputEmail1">Email address</label>
            <input type="email" class="form-control" id="email-input" aria-describedby="emailHelp" placeholder="Enter email" />
            <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
          </div>
          <div class="form-group">
            <label for="exampleInputPassword1">Password</label>
            <input type="password" class="form-control" id="password-input" placeholder="Password" />
          </div>
          {this.state.errorMessage && <div class="alert alert-danger incorrect-cred-alert">{this.state.errorMessage}</div>}
          <button type="submit" class="btn btn-primary signup-btn" onClick={this.signupClick.bind(this)}>Submit</button>
        </form>
        <p>If you don't have an account, <a target="_blank" href='http://localhost:3000/users/sign_up'>Signup</a> here.</p>
      </div>
    );
  }

  renderComments() {
    let highlightedText;
    if (this.state.highlightedData) {
      highlightedText = this.state.highlightedData.highlightedText || this.state.highlights[this.state.highlightedData.highlightId].body;
    }

    return (
      <div>
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

  renderTips() {
    return <div>Tips</div>
  }

  render() {

    let classes = style['cpe-sidebar'];
    if (this.state.panelVisible) {
      classes += " " + style['cpe-sidebar-visible'];
    }

    let content;
    if (!this.state.apiToken) {
      content = this.renderSignup();
    } else if (this.state.highlightedData) {
      content = this.renderComments();
    } else {
      content = this.renderTips();
    }

    return (
      <div id={style['cpe-modal-container']} className={classes}>
        <div className={`${style['panel-header']} ${style['panel-header-shared']}`}>
          <p className={style['panel-header-brand']}>PolitiCrew</p>
          <a className={style['panel-header-close']} onClick={this.closePanel.bind(this)}>Close</a>
        </div>
        {content}
      </div>
    );
  }
}


export default hot(module)(App);
