if(Meteor.isServer) {

/**
  Social meta tag dynamic page serving.

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

  Google Plus:
  - https://developers.google.com/+/web/snippet/
  - https://developers.google.com/structured-data/testing-tool/
  - http://webmasters.stackexchange.com/questions/25581/how-does-google-plus-select-an-image-from-a-shared-link
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
    else if(userAgent !==undefined && (userAgent.indexOf('Google') >-1 || userAgent.indexOf('Googlebot') >-1)) {
      socialScraper ='google';
    }
    else if(userAgent !==undefined && (userAgent.indexOf('LinkedInBot') >-1)) {
      socialScraper ='linkedIn';
    }
    

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

      var twitterHandle =cfgAppInfo.twitter.handle ? '@'+cfgAppInfo.twitter.handle : '';
      var facebookAppId =cfgAppInfo.facebook.appId || '';

      var meta ={
        url: url1+'/'+reqUrlRaw,
        title: 'title',
        desc: 'desc',
        image: url1+'/img/here.jpg',
        // hack to get image to show up first time:
        // http://stackoverflow.com/a/27424085/5551755
        imageWidth: 500,
        imageHeight: 500
      };

      // Get metadata from url info.

      // TODO

      var html ='';
      html ="<!DOCTYPE html>"+
      "<html lang='en'>"+
      "<head>";
        
      if(socialScraper ==='facebook' || socialScraper ==='linkedIn') {
        html +="<meta property='og:title' content='"+meta.title+"' />"+
        "<meta property='og:site_name' content='"+cfgAppInfo.name+"' />"+
        "<meta property='og:url' content='"+meta.url+"' />"+
        "<meta property='og:description' content='"+meta.desc+"' />"+
        "<meta property='og:image' content='"+meta.image+"' />"+
        "<meta property='og:image:width' content='"+meta.imageWidth+"' />"+
        "<meta property='og:image:height' content='"+meta.imageHeight+"' />"+
        "<meta property='fb:app_id' content='"+facebookAppId+"' />";
      }
      else if(socialScraper ==='google') {
        html ="<!doctype html>"+
        "<html itemscope='' itemtype='http://schema.org/WebPage' lang='en'>"+
        "<head>";
        html +="<meta itemprop='name' property='og:title' name='title' content='"+meta.title+"' />"+
        "<meta itemprop='description' property='og:description' name='description' content='"+meta.desc+"' />"+
        "<meta itemprop='image' property='og:image' name='image' content='"+meta.image+"' />";
        // Fall backs / helpers..
        html +="<link rel='image_src' href='"+meta.image+"' />";
        html +="<title>"+meta.title+"</title>";
      }
      else if(socialScraper ==='twitter') {
        // Twitter card validator sucks and has no useful debugging info
        // but it seems many descriptions do NOT work unless we include certain
        // other descriptions. So we hack it by adding our
        // description in front of the one that makes it work..
        // Otherwise the validator just says "WARN: No metatags found".
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