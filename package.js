Package.describe({
  name: 'lukemadera:social-share',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('templating@1.0.0');
  api.use('blaze@2.0.0');
  api.use('reactive-var@1.0.5');

  Cordova.depends({
    'org.apache.cordova.inappbrowser': '0.6.0'
  });

  api.addFiles([
    'social-share.html',
    'social-share.css',
    'social-share.js'
  ], 'client');

  api.export('lmSocialShare');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('lukemadera:social-share');
  api.addFiles('social-share-tests.js');
});
