# lukemadera:social-share

Cross platform (inc. Cordova) social sharing for facebook, twitter, pinterest


## Demo

[Demo](http://lukemadera-packages.meteor.com/social-share-basic)

[Source](https://github.com/lukemadera/meteor-packages/tree/master/social-share/basic)


## Dependencies

[none]


## Installation

In a Meteor app directory:
```bash
meteor add lukemadera:social-share
```


## Usage

```html
{{> lmSocialShare opts=opts}}
```

```js
if(Meteor.isClient) {
  Template.socialShareBasic.helpers({
    opts: function() {
      var opts ={
        facebook: true,
        twitter: true,
        pinterest: false,
        shareData: {
          url: 'http://google.com'
        },
        buttonHtml: {
          twitter: 'Twitter'
        }
      };
      return opts;
    }
  });
}
```

Then create your meta tags as needed. An example Iron.router meta tag script is in `router-social.js`.
You can test your meta tags with the Chrome Inspector by spoofing the User Agent to `Facebot` or `Twitterbot`.

For Cordova, add access rules to allow the links:

```js
// Social sharing
App.accessRule('*://*.facebook.com/*');
App.accessRule('*://*.fbcdn.net/*');
App.accessRule('*://*.gmail.com/*');
App.accessRule('*://*.google.com/*');
App.accessRule('*://*.linkedin.com/*');
App.accessRule('*://*.pinterest.com/*');
App.accessRule('*://*.twitter.com/*');

//App.accessRule('mailto:*', true);
//App.accessRule('sms:*', true);
```
