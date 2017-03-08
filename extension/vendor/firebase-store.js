getStoreKey('firebase', function(object) {
  if (object.firebase && object.firebase.key && object.firebase.domain) {
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

  firebase.initializeApp(config)
};

function getFirebaseDataAll(callback) {
  if ( isFirebaseNotInit() ) {
    callback([])
    return
  }

  firebaseDBRef().once('value', function(snapshot) {
    let fb_snapshot = snapshot.val()

    callback(fb_snapshot)
  });
};

function getFirebaseDataDay(dateInt, callback) {
  if ( isFirebaseNotInit() ) {
    callback([])
    return
  }

  firebaseDBRef().child(dateInt).once('value', function(snapshot) {
    let fb_snapshot = snapshot.val()

    callback(fb_snapshot)
  });
};

function updateFirebaseData(data){
  if (_.isEmpty(data)){
    return
  }
  if ( isFirebaseNotInit() ) {
    return
  }

  _.forOwn(data, function(value, key) {
    let sites = _.values(value.sites)
    let currentDate = value.currentDate

    if ( _.some(sites) ) {
      firebaseDBRef().child(key).set({
        currentDate: currentDate,
        sites: sites
      })
    }
  })
};

function isFirebaseNotInit(){
  return !firebase.apps.length
};

function firebaseDBRef(){
  return firebase.database().ref('overdueData')
};
