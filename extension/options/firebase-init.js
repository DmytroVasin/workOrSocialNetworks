chrome.storage.sync.get(null, function(object) {
  if (object.firebase) {
    initFirebase(object.firebase);
  }
});

function initFirebase(options) {
  let key = options.key
  let domain = options.domain

  let config = {
    apiKey: key,
    authDomain: domain + '.firebaseapp.com',
    databaseURL: 'https://' + domain + '.firebaseio.com',
    storageBucket: domain + '.appspot.com'
  };

  firebase.initializeApp(config);
}
