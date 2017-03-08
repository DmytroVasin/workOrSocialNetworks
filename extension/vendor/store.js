function updateStore(newStore, callback){
  chrome.storage.sync.set(newStore, function () {
    if (callback){
      callback()
    }

    if (chrome.runtime.lastError) {
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError.message);
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError);
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
