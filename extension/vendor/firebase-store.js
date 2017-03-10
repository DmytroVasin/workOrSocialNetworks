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

function updateFirebaseData(date, sites){
  if ( _.isEmpty(sites) ){
    return
  }
  if ( isFirebaseNotInit() ) {
    return
  }

  firebaseDBRef().child(date).set({
    currentDate: date,
    sites: _.values(sites)
  })
};

function isFirebaseNotInit(){
  return !firebase.apps.length
};

function firebaseDBRef(){
  return firebase.database().ref('overdueData')
};
