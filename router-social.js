if(Meteor.isServer) {

/**
  //Social (Facebook, Twitter) meta tag dynamic page serving
  Facebook:
  - http://stackoverflow.com/questions/7656151/multiple-facebook-opengraph-objects-on-the-same-page
  - https://developers.facebook.com/docs/opengraph/howtos/maximizing-distribution-media-content
  - https://developers.facebook.com/tools/debug/og/object/
  - https://developers.facebook.com/docs/plugins/checklist
  Twitter:
  - https://dev.twitter.com/docs/cards/types/photo-card
  - https://dev.twitter.com/docs/cards/getting-started
  - https://dev.twitter.com/docs/cards/validation/validator
  NOTE: apparently Twitter Cards have to have EACH domain "approved" for cards to be used, AND it says a "few weeks" time until approval! So until the domain is approved, the cards won't show up/work!
*/
Router.route('metatags', {
  where: 'server',
  path: /.*/,   //match all routes / any route
  action: function() {
    var req =this.request;
    var res =this.response;
    var userAgent =req.headers['user-agent'];
    var socialScraper =false;
    if(userAgent !==undefined && (userAgent.indexOf('facebookexternalhit') >-1 || userAgent.indexOf('Facebot') >-1)) {
      socialScraper ='facebook';
    }
    else if(userAgent !==undefined && (userAgent.indexOf('Twitterbot') >-1)) {
      socialScraper ='twitter';
    }
    // socialScraper ='twitter';    //TESTING
    // socialScraper = true;
    

    if(socialScraper) {
      var reqUrl =req.url;
      if(reqUrl[0] =='/') {
        reqUrl =reqUrl.slice(1, reqUrl.length);
      }
      var reqUrlRaw =reqUrl;    //save any URL params
      //slice off any url params
      if(reqUrl.indexOf('?') >-1) {
        reqUrl =reqUrl.slice(0, reqUrl.indexOf('?'));
      }
      if(reqUrl.indexOf('&') >-1) {
        reqUrl =reqUrl.slice(0, reqUrl.indexOf('&'));
      }
      if(reqUrl[(reqUrl.length-1)] ==='/') {
        reqUrl =reqUrl.slice(0, (reqUrl.length-1));
      }
     
      //form site url base
      var cfgAppInfo =Config.appInfo({});
      var url1 =cfgAppInfo.rootUrl;
      // url1 +='/';

      var twitterHandle =cfgAppInfo.twitter.handle ? '@'+cfgAppInfo.twitter.handle : '';
      var facebookAppId =cfgAppInfo.facebook.appId || '';

      var meta ={
        title: 'title',
        url: url1+'/'+reqUrlRaw,
        desc: 'desc',
        image: url1+'/img/here.jpg',
        // hack to get image to show up first time:
        // http://stackoverflow.com/a/27424085/5551755
        imageWidth: 500,
        imageHeight: 500
      };

      // Get metadata from url info.
      // console.log(reqUrl, url1);
      // TODO

      var html ='';
      html ="<!DOCTYPE html>"+
      "<html lang='en'>"+
      "<head>";
        
      if(socialScraper =='facebook') {
        html +="<meta property='og:title' content='"+meta.title+"' />"+
        "<meta property='og:site_name' content='"+cfgAppInfo.name+"' />"+
        "<meta property='og:url' content='"+meta.url+"' />"+
        "<meta property='og:description' content='"+meta.desc+"' />"+
        "<meta property='og:image' content='"+meta.image+"' />"+
        "<meta property='og:image:width' content='"+meta.imageWidth+"' />"+
        "<meta property='og:image:height' content='"+meta.imageHeight+"' />"+
        "<meta property='fb:app_id' content='"+facebookAppId+"' />";
      }
      else if(socialScraper =='twitter') {
        // TODO - twitter card validator sucks and has no useful debugging info
        // but these are the ONLY 2 descriptions I have gotten to work thus far.
        // Otherwise the validator just says "WARN: No metatags found"
        meta.desc =meta.desc + " NEWARK - The guest list and parade of limousines with celebrities emerging from them seemed more suited to a red carpet event in Hollywood or New York than than a gritty stretch of Sussex Avenue near the former site of the James M. Baxter Terrace public housing project here.";
        html +="<meta name='twitter:card' content='summary' />"+
        "<meta name='twitter:site' content='"+twitterHandle+"' />"+
        "<meta name='twitter:creator' content='"+twitterHandle+"' />"+
        "<meta name='twitter:url' content='"+meta.url+"' />"+
        "<meta name='twitter:title' content='"+meta.title+"' />"+
        "<meta name='twitter:description' content='"+meta.desc+"' />"+
        "<meta name='twitter:image' content='"+meta.image+"' />";
      }
      html +="</head>"+
      "<body>"+
      "</body>"+
      "</html>";
      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      res.end();
    }
    else {
      this.next();
    }
  }
});

}