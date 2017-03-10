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
  getStoreFull(function(store) {
    var todaysDate = formatDB(Date.now());

    if (store.currentDate && store.currentDate === todaysDate) {
      var sites = store.sites || [];

      sites = updateAllSites(openTabs, sites);

      let jsonObject = { sites: sites, firebase: store.firebase }

      updateStore(jsonObject);
    } else {
      let jsonObject = { sites: [], currentDate: todaysDate, firebase: store.firebase }

      if (store.currentDate) {
        updateFirebaseData(store.currentDate, store.sites);
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

  let site = _.find(sites, { 'name': domain })

  if (site) {
    if ( tab.isActive ){
      site.activeTime += PIN_TIME
    } else {
      site.passiveTime += PIN_TIME
    }

    // Trick to save icon.
    if ( !site.icon ) {
      site.icon = tab.icon
    }
  } else {
    sites.push({
      'name': domain,
      'url': tab.url,
      'icon': tab.icon || '', // Trick, because chrome.set clean empty values.
      'activeTime': 0,
      'passiveTime': 0
    })
  }
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
