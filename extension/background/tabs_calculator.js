const PIN_TIME = 5000;

function detectTabs(){
  chrome.tabs.query({}, function(tabs) {
    openTabs = [];

    _.forEach(tabs, function(tab){
      var splittedUrl = splitUrl(tab.url);

      if (splittedUrl) {
        openTabs.push({
          name: splittedUrl.domain,
          isActive: tab.active,
          url: splittedUrl.url,
          icon: tab.favIconUrl
        })
      }
    });

    getDataForToday(openTabs)
  });
};

function getDataForToday(openTabs) {
  chrome.storage.sync.get(null, function(store) {
    var todaysDate = formatDB(Date.now());
    // var todaysDate = formatDB(Date.now() - (86400000 * 3));

    if (store.currentDate && store.currentDate === todaysDate) {
      var sites = store.sites || {};

      sites = updateAllSites(openTabs, sites);

      let jsonObject = { sites: sites, overdueData: {} }

      updateFirebaseStore(store.overdueData);
      updateStore(jsonObject);
    } else {
      let jsonObject = { sites: {}, currentDate: todaysDate, overdueData: {} }

      if (store.currentDate) {
        let overdueJsonObject = {
          overdueData: {
            [store.currentDate]: {
              currentDate: store.currentDate,
              sites: store.sites
            }
          }
        }

        jsonObject = _.merge(jsonObject, overdueJsonObject);
      }

      updateStore(jsonObject);
    }

  });
};

function updateAllSites(openTabs, sites){
  var uniqOpenTabs = removeCollision(openTabs);

  uniqOpenTabs.forEach(function(tab) {
    updateSite(tab, sites);
  });

  return sites
};

function removeCollision(tabs){
  uniqTabs = _.uniqBy(tabs, function(tab) {
    return JSON.stringify( _.pick(tab, ['isActive', 'name']) )
  });

  return uniqTabs;
}

function updateSite(tab, sites) {
  var domain = tab.name

  if ( sites[domain] ) {
    if ( tab.isActive ){
      sites[domain]['activeTime'] += PIN_TIME
    } else {
      sites[domain]['passiveTime'] += PIN_TIME
    }

    if ( !sites[domain]['icon'] ) {
      sites[domain]['icon'] = tab.icon
    }
  } else {
    sites[domain] = {
      'name': domain,
      'url': tab.url,
      'icon': tab.icon || '', // Trick, because chrome.set clean empty values.
      'activeTime': 0,
      'passiveTime': 0
    };
  }
};

function updateStore(newStore){
  chrome.storage.sync.set(newStore, function () {

    if (chrome.runtime.lastError) {
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError.message);
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError);
    }
  });
};

function updateFirebaseStore(overdueData){
  if (_.isEmpty(overdueData)){
    return false;
  }

  let dbRef = firebase.database().ref('overdueData')

  _.forOwn(overdueData, function(value, key) {
    let sites = _.values(value.sites)
    let currentDate = value.currentDate

    if ( _.some(sites) ) {
      dbRef.child(key).set({
        currentDate: currentDate,
        sites: sites
      })
    }
  })

};

setInterval(function(){
  detectTabs();
}, PIN_TIME)


// Implementation with events + throttle does not work for all cases.
// var fn = _.throttle(function() {
//   if ( isWorkHour() ){
//     detectTabs();
//   }
// }, 3000);

// function detectTabsThrottling(){
//   fn();
// };

// chrome.tabs.onActivated.addListener(function(activeInfo) {
//   detectTabsThrottling();
// });

// chrome.tabs.onRemoved.addListener(function(activeInfo) {
//   detectTabsThrottling();
// });

// chrome.tabs.onUpdated.addListener(function() {
//   detectTabsThrottling();
// });
