/**

TODO
- add native (cordova) app support / dialogs, especially for facebook (message)

Known issues:

- facebook does not close properly on ios Cordova so we disable it.
- ios Cordova sms & email links bug so need to open separate window. Still
 works, but not as clean.
 https://forums.meteor.com/t/whitelisting-mailto-links-in-cordova/13671
- facebook message is not supported on mobile, so we disable it.
 https://developers.facebook.com/docs/sharing/reference/send-dialog
- hyphens in URLs prevent meta data (image) from showing up on Google Plus on web.
- gmail does not work well on mobile (it opens, but no pre-populated content).
 So we just use `email` instead. On web gmail will still show up.


NOTE: These will NOT work properly on localhost. 3rd party (social) services
 (for sharing) will complain about invalid URLs because
 localhost is not publicly accessible. Must be tested live / with publicly
 accessible, valid URLs.

TODO: add url shortening (just add a custom callback function as a parameter
 - to shorten, or do anything else).
This creates social sharing buttons. There's some complications for making
 shortened url's (currently we're using bitly) in that we want to minimize
 shorten calls by only forming the link AFTER the user has clicked a particular
 button. Otherwise on page load we'd form EVERY short link, which with the
 current 7 buttons means 7 API calls, even if they are not clicked on!
 There is a browser pop-up blocker issue that happens though if an AJAX call
 is made in-between the clicking of a button and displaying a pop-up window
 so we had to work around that too.
*/

/**
@param {String} btnId The html element to attach click (and touch) event
 handlers to.
@param {String} type One of 'email', 'facebook', 'facebookMessage', 'gmail',
 'googlePlus', 'linkedIn', 'pinterest', 'sms', 'twitter', 'url'
 Note: `facebookMessage` does not work on mobile.
 Note: `email` will be used instead of gmail on mobile platforms.
 Note: `sms` is mobile only.
@param {Object} shareData
  @param {String} url
  @param {String} description [pinterest only]
  @param {String} image [pinterest only]
  @param {String} subject [email, gmail, linkedIn only]
  @param {String} body [email, gmail, linkedIn, sms only] Url will be appended to
   the end.
  @param {String} facebookAppId [facebookMessage only]
  @param {String} redirectUrl [facebookMessage only]
  @param {String} [defaultShareText] The default tweet/fb post/etc. text to
   pre-populate (user can alter).
  @param {Object} [buttonHtml] The button html, one key per each type. If not set,
   will use defaults.
    @param {String} [email]
    @param {String} [facebook]
    @param {String} [facebookMessage]
    @param {String} [gmail]
    @param {String} [googlePlus]
    @param {String} [linkedIn]
    @param {String} [pinterest]
    @param {String} [sms]
    @param {String} [twitter]
    @param {String} [url]
*/
lmSocialShare.add =function(btnId, type, shareData, params) {
  var platform =lmSocialSharePrivate.getPlatform();
  var directLink =lmSocialSharePrivate.useDirectLink(type, platform);
  if(document.getElementById(btnId)) {
    if(directLink) {
      lmSocialShare.formLink(type, shareData, function(err, result) {
        if(result.link) {
          document.getElementById(btnId).href =result.link;
          document.getElementById(btnId).target =result.target;
        }
        else {
          console.error('lm-social-share no link');
        }
      });
    }
    else {
      document.getElementById(btnId).onclick =function(evt) {
        lmSocialSharePrivate.triggerShare(type, shareData, { btnId: btnId });
      };
    }
  }
};

lmSocialSharePrivate.useDirectLink =function(type, platform) {
  if(type === 'email' ) {
    return ( platform.cordova && platform.ios ) ? false :
     ( platform.mobile || platform.cordova ) ? true : false;
  }
  else if(type === 'sms' ) {
    return ( platform.cordova && platform.ios ) ? false : true;
  }
  return false;
};

lmSocialSharePrivate.getPlatform =function() {
  var platform ={
    cordova: Meteor.isCordova,
    ios: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    android: /Android/i.test(navigator.userAgent),
    blackberry: /BlackBerry/i.test(navigator.userAgent),
    windows: /IEMobile/i.test(navigator.userAgent)
  };
  platform.mobile = ( platform.ios || platform.android || platform.blackberry
   || platform.windows ) ? true : false;

  return platform;
};

lmSocialShare.formLink =function(type, shareData, callback) {
  var ret ={
    link: null,
    target: '_blank'
  }
  var platform =lmSocialSharePrivate.getPlatform();
  var body = shareData.body ? ( shareData.body + "\n\n" + shareData.url)
   : shareData.url;
  if( type === 'email' ) {
    ret.link ='mailto:?subject='+encodeURIComponent(shareData.subject) +
     '&body='+encodeURIComponent(body);
    return callback(null, ret);
  }
  else if( type === 'sms' ) {
    // ios does not allow pre-populating body.
    // http://stackoverflow.com/questions/16165393/ios-sms-scheme-in-html-hyperlink-with-body
    ret.link = ( platform.ios ) ? 'sms:' : ( 'sms:?body=' + encodeURIComponent(body) );
    return callback(null, ret);
  }
  else if( type === 'gmail' ) {
    ret.link ='https://mail.google.com/mail/u/0/?view=cm&fs=1&su=' +
     encodeURIComponent(shareData.subject) + '&body=' +
     encodeURIComponent(body);
    return callback(null, ret);
  }
  else if( type === 'googlePlus' ) {
    ret.link ='https://plus.google.com/share?url=' +
     encodeURIComponent(shareData.url);
    return callback(null, ret);
  }
  else if( type === 'facebook' ) {
    ret.link ='https://www.facebook.com/sharer/sharer.php?u=' +
     encodeURIComponent(shareData.url);
    return callback(null, ret);
  }
  else if( type === 'facebookMessage' ) {
    ret.link ='https://www.facebook.com/dialog/send?link=' +
     encodeURIComponent(shareData.url) + '&app_id=' + shareData.facebookAppId +
     '&redirect_uri=' + encodeURIComponent(shareData.redirectUrl)
     + '&display=popup';
    return callback(null, ret);
  }
  else if( type === 'linkedIn' ) {
    ret.link ='https://www.linkedin.com/shareArticle?mini=true&url=' +
     encodeURIComponent(shareData.url) + '&title=' +
     encodeURIComponent(shareData.subject) + '&summary=' +
     encodeURIComponent(body);
    return callback(null, ret);
  }
  else if( type === 'pinterest' ) {
    ret.link ='http://pinterest.com/pin/create/button/?url=' +
     encodeURIComponent(shareData.url) + '&media=' +
     encodeURIComponent(shareData.image) + '&description=' +
     encodeURIComponent(shareData.description);
    return callback(null, ret);
  }
  else if( type === 'twitter' ) {
    ret.link ='https://twitter.com/share?url=' + encodeURIComponent(shareData.url);
    if(shareData.defaultShareText !==undefined) {
      ret.link +='&text='+encodeURIComponent(shareData.defaultShareText);
    }
    return callback(null, ret);
  }
  callback(null, null);
};

lmSocialSharePrivate.inputSelectAll =function(classname, id) {
  var ele =document.getElementById(id);
  // get input
  ele =ele.getElementsByClassName(classname)[0];
  if(ele) {
    ele.setSelectionRange(0, ele.value.length);
  }
};

lmSocialSharePrivate.triggerShare =function(type, shareData, params) {
  if( type === 'url' ) {
    lmSocialSharePrivate.inputSelectAll('lm-social-share-url-input', params.btnId);
    return;
  }
  if(type && shareData) {
    // Must open pop-up window immediately (before AJAX call) to prevent
    // pop-up blockers from stopping it. After it is open, then set the url.
    var windowHandle;
    if(Meteor.isCordova) {
      // Can NOT set the href after the window is open if using Cordova.
      // https://wiki.apache.org/cordova/InAppBrowser
      // windowHandle =window.open(null, "_blank", "location=yes");
      lmSocialShare.formLink(type, shareData, function(err, result) {
        if(result.link) {
          windowHandle =window.open(result.link, "_blank", "location=yes");
        }
        else {
          console.error('lm-social-share no link');
        }
      });
    }
    else {
      windowHandle =window.open(null, "", "height=440,width=640,scrollbars=yes");
      lmSocialShare.formLink(type, shareData, function(err, result) {
        if(result.link) {
          windowHandle.location.href =result.link;
        }
        else {
          windowHandle.close();
        }
      });
    }
  }
};

lmSocialSharePrivate.formButtonHtml =function(types, html, shareData) {
  html = html || {};
  types.forEach(function(key) {
    html[key] = html[key] ? html[key] : ( key === 'url' ) ? (
      "<input type='text' readonly=true value='" + shareData.url +"' class='lm-social-share-url-input' />"
    ) : (
      "<div class='lm-social-share-btn-icon'>" + lmSocialSharePrivate.svgs[key].html + "</div>"
    );
  });
  return html;
};

/**
Filters out known issues
*/
lmSocialSharePrivate.filterTypes =function(opts) {
  var platform =lmSocialSharePrivate.getPlatform();

  // Facebook does not close (freezes app) in Cordova app ios..
  // TODO - fix this
  if( opts.facebook && ( platform.ios && platform.cordova ) ) {
    opts.facebook =false;
  }

  // Facebook message does not work on mobile
  if( opts.facebookMessage && ( platform.mobile || platform.cordova ) ) {
    opts.facebookMessage =false;
  }

  // Gmail does not work well on mobile so just disable it and use email instead.
  if( opts.gmail && ( platform.mobile || platform.cordova ) ) {
    opts.gmail =false;
    opts.email =true;
  }

  // SMS only works on mobile
  if( opts.sms && ( !platform.mobile && !platform.cordova ) ) {
    opts.sms =false;
  }

  return opts;
};

Template.lmSocialShare.created =function() {
  this.instid = new ReactiveVar((Math.random() + 1).toString(36).substring(7));
};

Template.lmSocialShare.helpers({
  data: function() {
    var opts =this.opts;
    var ret ={
      eles: {},
      active: {}
    };
    var instid =Template.instance().instid.get();
    var types =['email', 'facebook', 'facebookMessage', 'gmail', 'googlePlus',
     'linkedIn', 'pinterest', 'sms', 'twitter', 'url'];
    opts =lmSocialSharePrivate.filterTypes(opts);

    var shareData =opts.shareData;
    var buttonHtml =lmSocialSharePrivate.formButtonHtml(types,
     opts.buttonHtml, shareData);
    var ii, type;
    for(ii =0; ii<types.length; ii++) {
      (function(ii) {
        type =types[ii];
        if(!opts[type]) {
          ret.active[type] =false;
        }
        else {
          ret.active[type] =true;
          ret.eles[types[ii]] ={
            id: 'socialShare'+instid+types[ii],
            buttonHtml: buttonHtml[types[ii]]
          };
          setTimeout(function() {
            lmSocialShare.add(ret.eles[types[ii]].id, types[ii], shareData, {});
          }, 500);
        }
      })(ii);
    }
    return ret;
  }
});