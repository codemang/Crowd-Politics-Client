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
    console.log('Component mounted');

    const reactRef = this;

    chrome.storage.sync.get(['apiToken'], function(storage) {
      reactRef.trackApiTokenLoaded(storage);
    });

    var link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css?family=Open+Sans';
    link.rel = 'stylesheet';
    document.getElementsByTagName('head')[0].appendChild(link);

    var message = {
      type: 'load_highlights',
      url: window.location.host + window.location.pathname,
    };
    chrome.runtime.sendMessage(message, function(response) {
      console.log(response);
      let highlights = {};
      if (response.highlights) {
        response.highlights.forEach(function(highlight) {
          highlights[highlight.id] = highlight;
          reactRef.highlightText(highlight.body, highlight.id);
        });
      }
      reactRef.setState({ highlights: highlights });
    });

    $(document).bind('keypress', function(event) {
      if (event.which === 11) {
        reactRef.handleHotkey();
      }
    });
  }

  handleHotkey() {
    var highlightedText = window.getSelection(0).toString();
    let newState = { panelVisible: true };
    if (highlightedText) {
      newState.highlightedData = { highlightedText };
    }
    this.appendToState(newState);
  }

  highlightText(text, highlightId) {
    var instance = new Mark(document.querySelector('body'));
    var highlightClass = 'cpe_highlight_' + highlightId;
    const reactRef = this;

    $('body').mark(text, {
      separateWordSearch: false,
      acrossElements: true,
      className: 'cpe_highlight ' + highlightClass,
      exclude: ['#cpe-highlighted-text'],
      done: function() {
        $('.' + highlightClass).on('click', function(elm) {
          reactRef.renderHighlight(highlightId);
        });
      },
    });
  }

  renderHighlight(highlightId) {
    this.setState(
      Object.assign({}, this.state, {
        highlightedData: { highlightId },
        panelVisible: true,
      }),
    );
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

  logout() {
    const reactRef = this;
    chrome.runtime.sendMessage({type: 'logout'}, function(storage) {
      reactRef.trackApiTokenLoaded(storage);
    });
  }

  trackApiTokenLoaded(storage) {
    this.setState(
      Object.assign({}, this.state, { loadedApiToken: true }, storage),
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const reactRef = this;
    if (this.state.errorMessage) {
      $('input').keypress(function() {
        reactRef.appendToState({ errorMessage: null });
      });
    }

    const newLogin = prevState.apiToken === null && prevState.apiToken !== this.state.apiToken;
    const highlightsInitialLoad = this.state.highlights && !prevState.highlights;
    const panelClosed = !this.state.panelVisible && this.state.panelVisible !== prevState.panelVisible;

    // Showing all highlights on the page
    if (highlightsInitialLoad || panelClosed) {
      $(`.${style['multi-cpe-panel-highlighted-text']}`).each(function(index, elm) {
        $(elm).on("click", function() {
          const highlightId = $(elm).attr('id').split("-")[1];
          reactRef.renderHighlight(highlightId);
        });
      });
    }

    if (this.state.highlightedData != prevState.highlightedData || newLogin) {
      $('#comments-container').comments({
        enablePinging: false,
        profilePictureURL:
          'https://viima-app.s3.amazonaws.com/media/public/defaults/user-icon.png',
        getComments: function(success, error) {
          if (
            !reactRef.state.highlightedData ||
            !reactRef.state.highlightedData.highlightId
          ) {
            success([]);
          } else {
            const comments =
              reactRef.state.highlights[
                reactRef.state.highlightedData.highlightId
              ].comments;
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

          chrome.runtime.sendMessage(data, response => {
            const highlights = jQuery.extend(
              true,
              {},
              reactRef.state.highlights,
            );
            highlights[response.highlight.id] = response.highlight;
            if (!reactRef.state.highlights[response.highlight.id]) {
              reactRef.highlightText(
                response.highlight.body,
                response.highlight.id,
              );
            }
            reactRef.appendToState({ highlights: highlights });
            success(response.comment);
          });
        },
        upvoteComment: function(commentJSON, success, error) {
          const data = {
            comment_id: commentJSON['id'],
            type: 'upvote',
          };

          const chromeRef = this;
          chrome.runtime.sendMessage(data, response => {
            console.log(response.comment)
            success(response.comment);
          })
        }
      });
    }
  }

  closePanel() {
    this.setState(
      Object.assign({}, this.state, {
        panelVisible: false,
        highlightedData: null,
      }),
    );
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
        email: $('#email-input').val(),
        password: $('#password-input').val(),
      },
    };

    chrome.runtime.sendMessage(message, function(response) {
      if (response.apiToken) {
        reactRef.appendToState({ apiToken: response.apiToken });
      } else if (response.status === 401) {
        reactRef.appendToState({
          errorMessage: 'Your email or password was incorrect.',
        });
      } else {
        reactRef.appendToState({
          errorMessage:
            'A problem occurred while logging you in. Please try again later.',
        });
      }
    });
  }

  renderSignup() {
    if (this.state.apiToken) {
      return (
        <div className={style['panel-header-shared']}>
          <h3>You are logged in!</h3>
        </div>
      );
    }
    return (
      <div
        className={`${style['panel-header-shared']} ${style['signup-form']}`}
      >
        <h3>You have to login to view this page.</h3>
        <form>
          <div className={style['form-group']}>
            <label for="exampleInputEmail1">Email address</label>
            <input
              type="email"
              class="form-control"
              id="email-input"
              aria-describedby="emailHelp"
              placeholder="Enter email"
            />
            <small id="emailHelp" className={style['text-muted']}>
              We'll never share your email with anyone else.
            </small>
          </div>
          <div className={style['form-group']}>
            <label for="exampleInputPassword1">Password</label>
            <input
              type="password"
              class="form-control"
              id="password-input"
              placeholder="Password"
            />
          </div>
          {this.state.errorMessage && (
            <div className={style['alert']}>{this.state.errorMessage}</div>
          )}
          <button
            type="submit"
            class="btn btn-primary signup-btn"
            onClick={this.signupClick.bind(this)}
          >
            Submit
          </button>
        </form>
        <p className={style['signup-p']}>
          If you don't have an account,{' '}
          <a target="_blank" href="http://crowdchecked.test:3002/users/sign_up">
            Signup
          </a>{' '}
          here.
        </p>
      </div>
    );
  }

  renderComments() {
    let highlightedText;
    if (this.state.highlightedData) {
      highlightedText =
        this.state.highlightedData.highlightedText ||
        this.state.highlights[this.state.highlightedData.highlightId].body;
    }

    return (
      <div>
        <div
          className={`${style['panel-highlight']} ${
            style['panel-header-shared']
          }`}
        >
          <h3 className={style['cpe-panel-highlighted-header']}>
            HIGHLIGHTED TEXT
          </h3>
          <p
            id="cpe-highlighted-text"
            className={style['cpe-panel-highlighted-text']}
          >
            {highlightedText}
          </p>
        </div>
        <div className={`${style['panel-comments']} ${style['panel-header-shared']}`} >
          <div className={style['panel-comments']}>
            <h3 className={style['cpe-panel-highlighted-header']}>
              COMMENT SECTION
            </h3>
            <div id="comments-container" />
          </div>
        </div>
        <div className={style['comments-footer-offset']}></div>
      </div>
    );
  }

  renderHighlightsOverview() {
    let content = []

    // on page load before highlights have loaded
    if (!this.state.highlights) {
      return null;
    }
    for (const key in this.state.highlights) {
      const highlight = this.state.highlights[key];
      content.push(
        <div id={`highlight-${highlight.id}`} className={`${style['multi-cpe-panel-highlighted-text']} ${style['cpe-panel-highlighted-text']}`}>
          {highlight.body}
        </div>
      )
    };
    return (
      <div className={style['multi-highlight-container']}>
        <h3 className={style['cpe-panel-highlighted-header']}>
          HIGHLIGHTS ON THIS PAGE
        </h3>
        {content}
      </div>
      );
  }

  render() {
    let containerClasses = style['cpe-sidebar'];
    let footerClasses = style['sticky-footer'];
    if (this.state.panelVisible) {
      containerClasses += ' ' + style['cpe-sidebar-visible'];
      footerClasses += ' ' + style['cpe-sidebar-visible'];
    }


    let content;
    if (!this.state.apiToken) {
      content = this.renderSignup();
      footerClasses += ' ' + style['sticky-footer-invisible'];
    } else if (this.state.highlightedData) {
      content = this.renderComments();
    } else {
      content = this.renderHighlightsOverview();
    }

    return (
      <div id={style['cpe-modal-container']} className={containerClasses}>
        <div
          className={`${style['panel-header']} ${style['panel-header-shared']}`}
        >
          <p className={style['panel-header-brand']}>CrowdChecked</p>
          <a
            className={style['panel-header-close']}
            onClick={this.closePanel.bind(this)}
          >
            Close
          </a>
        </div>
        {content}
        <div className={footerClasses}>
          <div className={style['logout-btn']} onClick={this.logout.bind(this)}>
            Logout
          </div>
        </div>
      </div>
    );
  }
}

export default hot(module)(App);
