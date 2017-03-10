// MAIN STORE:
function updateStore(newStore, callback){
  chrome.storage.sync.set(newStore, function () {
    if (callback){
      callback()
    }

    if (chrome.runtime.lastError) {
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError.message);
      console.log('************************** STORE **************************');
      console.log(newStore);
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError);
      // Attempt to save data to permanent store...
      saveLocalDataToFirebase()
    }
  });
};

function clearAll() {
  chrome.storage.sync.clear();
}

function getStoreKey(key, callback){
  chrome.storage.sync.get(key, function(object){
    if (callback){
      callback(object)
    }
  });
};

function getStoreFull(callback){
  getStoreKey(null, callback);
};

function showStoreFull(){
  getStoreFull(function(items) {
    console.log('--------------------------------------------');
    console.log(items);
    console.log('--------------------------------------------');
  });
}



// FIREBASE STORE:
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
    let fb_snapshot = snapshot.val() || {}

    callback(fb_snapshot)
  });
};

function getFirebaseDataDay(dateInt, callback) {
  if ( isFirebaseNotInit() ) {
    callback([])
    return
  }

  firebaseDBRef().child(dateInt).once('value', function(snapshot) {
    let fb_snapshot = snapshot.val() || { currentDate: null, sites: [] }

    callback(fb_snapshot)
  });
};

function updateFirebaseData(date, sites, successCallback){
  if ( _.isEmpty(sites) ){
    return
  }
  if ( isFirebaseNotInit() ) {
    return
  }

  firebaseDBRef().child(date).set({
    currentDate: date,
    sites: sites
  }, function(error) {
    if (error) {
      console.log('Save to firebase failed' + error);
    } else {
      if (successCallback){
        successCallback()
      }
    }
  });
};

function isFirebaseNotInit(){
  return !firebase.apps.length
};

function firebaseDBRef(){
  return firebase.database().ref('overdueData')
};

function saveLocalDataToFirebase(successCallback){
  getStoreFull(function(store){
    getFirebaseDataDay(store.currentDate, function(firebaseData) {

      _.forEach(firebaseData.sites, function(site){
        let siteMatch = _.find(store.sites, { 'name': site.name });

        if (siteMatch){
          siteMatch.activeTime += site.activeTime
          siteMatch.passiveTime += site.passiveTime
        } else {
          store.sites.push(site)
        }
      })

      updateFirebaseData(store.currentDate, store.sites, function(){
        console.log('Successfully saved..')

        updateStore({ sites: [] });

        if (successCallback){
          successCallback(store)
        }
      })
    });
  });
};
