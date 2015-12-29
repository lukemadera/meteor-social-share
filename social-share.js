/**
NOTE: These will NOT work properly on localhost. 3rd party (social) services
 (for sharing) will complain about invalid URLs because
 localhost is not publicly accessible. Must be tested live / with publicly
 accessible, valid URLs.

TODO: add url shortening:
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
 'linkedIn', 'pinterest', 'twitter', 'url'   // TODO - add google+?, sms? support
@param {Object} shareData
  @param {String} url
  @param {String} description [pinterest only]
  @param {String} image [pinterest only]
  @param {String} subject [email, gmail, linkedIn only]
  @param {String} body [email, gmail only] Url will be appended to
   the end.
  @param {String} facebookAppId [facebookMessage only]
  @param {String} redirectUrl [facebookMessage only]
  @param {String} [defaultShareText] The default tweet/fb post/etc. text to
   pre-populate (user can alter).
  @param {Object} [buttoHtml] The button html, one key per each type. If not set,
   will use defaults.
    @param {String} [email]
    @param {String} [facebook]
    @param {String} [facebookMessage]
    @param {String} [gmail]
    @param {String} [linkedIn]
    @param {String} [pinterest]
    @param {String} [twitter]
    @param {String} [url]
*/
lmSocialShare.add =function(btnId, type, shareData, params) {
  if(document.getElementById(btnId)) {
    document.getElementById(btnId).onclick =function(evt) {
      lmSocialSharePrivate.triggerShare(type, shareData, { btnId: btnId });
    };
  }
};

lmSocialShare.formLink =function(type, shareData, callback) {
  var link = null;
  var body = shareData.body ? ( shareData.body + "\n\n" + shareData.url)
   : shareData.url;
  if( type === 'email' ) {
    link ='mailto:?subject='+encodeURIComponent(shareData.subject) +
     '&body='+encodeURIComponent(body);
    return callback(null, { link: link });
  }
  if( type === 'gmail' ) {
    link ='https://mail.google.com/mail/u/0/?view=cm&fs=1&su=' +
     encodeURIComponent(shareData.subject) + '&body=' +
     encodeURIComponent(body);
    return callback(null, { link: link });
  }
  else if( type === 'facebook' ) {
    link ='https://www.facebook.com/sharer/sharer.php?u=' +
     encodeURIComponent(shareData.url);
    return callback(null, { link: link });
  }
  else if( type === 'facebookMessage' ) {
    link ='https://www.facebook.com/dialog/send?link=' +
     encodeURIComponent(shareData.url) + '&app_id=' + shareData.facebookAppId +
     '&redirect_uri=' + encodeURIComponent(shareData.redirectUrl) +
     '&display=popup';
    return callback(null, { link: link });
  }
  else if( type === 'linkedIn' ) {
    link ='https://www.linkedin.com/shareArticle?mini=true&url=' +
     encodeURIComponent(shareData.url) + '&title=' +
     encodeURIComponent(shareData.subject);
    return callback(null, { link: link });
  }
  else if( type === 'pinterest' ) {
    link ='http://pinterest.com/pin/create/button/?url=' +
     encodeURIComponent(shareData.url) + '&media=' +
     encodeURIComponent(shareData.image) + '&description=' +
     encodeURIComponent(shareData.description);
    return callback(null, { link: link });
  }
  else if( type === 'twitter' ) {
    link ='https://twitter.com/share?url=' + encodeURIComponent(shareData.url);
    if(shareData.defaultShareText !==undefined) {
      link +='&text='+encodeURIComponent(shareData.defaultShareText);
    }
    return callback(null, { link: link });
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
    console.log('url', params);
    lmSocialSharePrivate.inputSelectAll('lm-social-share-url-input', params.btnId);
    return;
  }
  if(type && shareData) {
    // Must open pop-up window immediately (before AJAX call) to prevent
    // pop-up blockers from stopping it. After it is open, then set the url.
    var windowHandle;
    if(Meteor.isCordova) {
      windowHandle =window.open(null, "_blank", "location=yes");
    }
    else {
      windowHandle =window.open(null, "", "height=440,width=640,scrollbars=yes");
    }
    lmSocialShare.formLink(type, shareData, function(err, result) {
      if(result.link) {
        windowHandle.location.href =result.link;
      }
      else {
        windowHandle.close();
      }
    });
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
    console.log(key, html[key]);
  });
  return html;
};

Template.lmSocialShare.created =function() {
  this.instid = new ReactiveVar((Math.random() + 1).toString(36).substring(7));
};

Template.lmSocialShare.helpers({
  eles: function() {
    var instid =Template.instance().instid.get();
    var types =['email', 'facebook', 'facebookMessage', 'gmail', 'linkedIn',
     'pinterest', 'twitter', 'url'];
    var shareData =this.opts.shareData;
    var buttonHtml =lmSocialSharePrivate.formButtonHtml(types,
     this.opts.buttonHtml, shareData);
    var eles ={};
    var ii;
    for(ii =0; ii<types.length; ii++) {
      (function(ii) {
        eles[types[ii]] ={
          id: 'socialShare'+instid+types[ii],
          buttonHtml: buttonHtml[types[ii]]
        };
        setTimeout(function() {
          lmSocialShare.add(eles[types[ii]].id, types[ii], shareData, {});
        }, 500);
      })(ii);
    }
    return eles;
  }
});