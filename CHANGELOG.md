# 1.2.0

## Features

- add `sms` and `googlePlus` type
- test and handle issues on platforms (web, Android web, Android Cordova, iOS web, iOS Cordova)
  - facebook iOS Cordova freezes so disabled.
  - sms & email iOS Cordova direct links bug so used window popup.
  - facebookMessage not supported on mobile so disabled.
  - gmail does not work well on mobile so use email instead.
- update README for meta tags example and Cordova access rules.

## Bug Fixes

- Get Cordova app links working.


# 1.1.1 (2015-12-29)

## Features

- add `url` new type
- add support for `body` shareData (for email, gmail pre-populating of body)
- remove React from Readme as no longer supported


# 1.1.0 (2015-12-28)

## Features

- add in 4 new types: facebookMessage, gmail, email, linkedIn
- add in default svg's and styling
- refactor to support custom HTML for buttons
- refactor to prepare for url shortening on click (asynchronous)

## Breaking Changes

- remove React support (did not maintain it with the updates above and do not want to bloat this package with extra dependencies).