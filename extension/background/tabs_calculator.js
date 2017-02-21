var PIN_TIME = 5000;

function isWorkHour(){
  var now = new Date();
  var hours = now.getHours();

  if (hours >= 8 && hours <= 20) {
    return true
  }

  return false
};

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
  chrome.storage.local.get(null, function(store) {
    var todaysDate = (new Date).toLocaleDateString();

    if (store.currentDate && store.currentDate === todaysDate) {
      var sites = store.sites || {};

      var newSites = updateAllSites(openTabs, sites);
      updateStore({ sites: newSites });
    } else {
      updateStore({ sites: {}, currentDate: todaysDate })
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
  chrome.storage.local.set(newStore, function () {

    if (chrome.runtime.lastError) {
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError.message);
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError);
    }
  });
};

setInterval(function(){
  if ( isWorkHour() ){
    detectTabs();
  }
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
