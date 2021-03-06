# WorkOrSocialNetworks Chrome Extension

*Please NOTE: Do not forget to setup firebase store. Without firebase store it would not work.*

Extension that analyzes your internet activity.
It will store time that you spend on the tab. And will show graph that will display `sites` to `time` activity during the day.

BTW:
Data is stored locally and does not sending to anybody except you.

Link on Extension:
[Extension](https://chrome.google.com/webstore/detail/workorsocialnetworks/glmjefbehbpjijhdoplgenffgleknbdm?hl=en-US)

## Video: *Click to play*

[![Preview](https://raw.githubusercontent.com/DmytroVasin/workOrSocialNetworks/master/_readme/_preview.png)](https://player.vimeo.com/video/204693730?autoplay=1)


## Screenshots:
![Main Window](/chrome_store/1200x800%20screenshot.png)
![Main Window](/chrome_store/440x280%20screenshot.png)

## Firebase:
You can add firebase as a permanent data-store.

- Todays data will be loaded from `chrome.sync.store`.
- Old data will be loaded from firebase-store.

![Firebase](https://raw.githubusercontent.com/DmytroVasin/workOrSocialNetworks/master/_readme/_firebase.png)

#### How to add:
1. Create account.
2. Add credentials from firebase to extention:
```
apiKey: "API-KEY"
authDomain: "AUTH-DOMAIN" - without '.firebaseapp.com'
```

3. Set Rules: ( Free access )
```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```


## License

MIT. See `LICENSE` included in this repo.
