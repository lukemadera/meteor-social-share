lmSocialShare ={};

lmSocialSharePrivate ={};

/**
@param {String} btnId The html element to attach click (and touch) event handlers to
@param {String} type One of 'facebook', 'twitter', 'pinterest'
@param {Object} shareData
  @param {String} url
  @param {String} description [Pinterest only]
  @param {String} image [Pinterest only]
  //@param {String} title [Email only]
  @param {String} [defaultShareText] The default tweet/fb post/etc. text to pre-populate (user can alter)
*/
lmSocialShare.add =function(btnId, type, shareData, params) {
  if(document.getElementById(btnId)) {
    var link =this.formUrl(type, shareData, {});
    document.getElementById(btnId).onclick =function(evt) {
      lmSocialSharePrivate.triggerLink({link: link});
    };
    document.getElementById(btnId).ontouchend =function(evt) {
      lmSocialSharePrivate.triggerLink({link: link});
    };
  }
};

lmSocialShare.formUrl =function(type, shareData, params) {
  var link;
  if(type ==='facebook') {
    link ='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(shareData.url);
  }
  else if(type ==='twitter') {
    link ='https://twitter.com/share?url='+encodeURIComponent(shareData.url);
    if(shareData.defaultShareText !==undefined) {
      link +='&text='+encodeURIComponent(shareData.defaultShareText);
    }
  }
  else if(type ==='pinterest') {
    link ='http://pinterest.com/pin/create/button/?url='+encodeURIComponent(shareData.url)+'&media='+encodeURIComponent(shareData.image)+'&description='+encodeURIComponent(shareData.description);
  }
  return link;
};

lmSocialSharePrivate.triggerLink =function(params) {
  if(params.link) {
    window.open(params.link, "", "height=440,width=640,scrollbars=yes");
  }
};

Template.lmSocialShare.created =function() {
  this.instid = new ReactiveVar((Math.random() + 1).toString(36).substring(7));
};

Template.lmSocialShare.helpers({
  eles: function() {
    var instid =Template.instance().instid.get();
    var types =['facebook', 'twitter', 'pinterest'];
    var shareData =this.opts.shareData;
    var eles ={
      ids: []
    };
    var ii;
    for(ii =0; ii<types.length; ii++) {
      (function(ii) {
        eles.ids[types[ii]] ='socialShare'+instid+types[ii];
        setTimeout(function() {
          lmSocialShare.add(eles.ids[types[ii]], types[ii], shareData, {});
        }, 500);
      })(ii);
    }
    return eles;
  }
});