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
    openTabs = {};

    _.forEach(tabs, function(tab){
      var splittedUrl = splitUrl(tab.url);

      if (splittedUrl) {
        openTabs[splittedUrl.domain] = {
          name: splittedUrl.domain,
          isActive: tab.active,
          url: splittedUrl.url,
          icon: tab.favIconUrl
        }
      }
    });

    get_data_for_today(openTabs)
  });
};

function get_data_for_today(openTabs) {
  chrome.storage.sync.get(null, function(store) {
    var todaysDate = (new Date).toLocaleDateString();

    if (store.currentDate && store.currentDate === todaysDate) {
      var oldTabs = store.old_tabs || {}
      var sites = store.sites || {}

      compareOldTabsAndNewTabs(openTabs, oldTabs, sites);
    } else {
      var new_store = { currentDate: todaysDate, sites: {}, old_tabs: {}  }

      chrome.storage.sync.set(new_store, function() {
        compareOldTabsAndNewTabs(openTabs, new_store.old_tabs, new_store.sites);
      });
    }

  });
};

function compareOldTabsAndNewTabs(openTabs, oldTabs, sites){
  var currentTime = +Date.now();

  // Смотрим на все вкладки которые были открыты
  _.forOwn(oldTabs, function(object, siteName) {
    // Если вкладка была закрыта то ее не будет в новом массиве.
    if ( openTabs[siteName] ) {
      // Она все еще отрыта
    } else {
      // Ее уже нет среди отрытых
      // Проставляем ее даты закрытия
      object['close_at'] = currentTime;
      // Сохраняем ее в "storage"
      createOrUpdateByKey(object, sites);

      delete(oldTabs[siteName])
      updateStore({ 'old_tabs': oldTabs })
    }
  });

  // Если вкладка сейчас открыта то она есть в новом массиве
  _.forOwn(openTabs, function(object, siteName) {
    // Была ли она уже в открытых
    if ( oldTabs[siteName] ) {
      // Да она была открыта
      // Тогда мы должны проверить ее статус ( Вкладка может перейти из активной в пассивную и наоборот )
      // Если статусы не совпадают то:
      if (oldTabs[siteName]['isActive'] != object['isActive']){
        // Проставляем время смены статуса
        oldTabs[siteName]['close_at'] = currentTime;
        // Сохраняем
        createOrUpdateByKey(oldTabs[siteName], sites);
        // Удаляем из старого массива
        delete(oldTabs[siteName])
        updateStore({ 'old_tabs': oldTabs })
        // Добавляем в старый массив новую вкладку

        oldTabs[siteName] = object;
        oldTabs[siteName]['start_at'] = currentTime;
        updateStore({ 'old_tabs': oldTabs })
      } else {
        // вкладка не меняла свой статус
      }
    } else {
      // Нет ее только что открыли
      // Добавим ее в уже открытые дополнительно проставим время отрытия
      oldTabs[siteName] = object;
      oldTabs[siteName]['start_at'] = currentTime;
      updateStore({ 'old_tabs': oldTabs })
    }
  });
};

function createOrUpdateByKey(tabObject, sites) {
  var domain = tabObject.name

  // Есть ли у нас уже такой сайт
  if ( sites[domain] ) {
    // Trick to update icon.
    if (!sites[domain]['icon'].length) {
      sites[domain]['icon'] = tabObject.icon
    }
  } else {
    sites[domain] = {
      'name': domain,
      'url': tabObject.url,
      'icon': tabObject.icon || '', // Trick, because chrome.set clean empty values.
      'activeTime': 0,
      'passiveTime': 0
    };
  }

  _timeMSeconds = tabObject.close_at - tabObject.start_at
  if (tabObject.isActive) {
    sites[domain]['activeTime'] += _timeMSeconds
  } else {
    sites[domain]['passiveTime'] += _timeMSeconds
  }

  updateStore({ 'sites': sites })
};

function updateStore(newStore){
  chrome.storage.sync.set(newStore, function () {
    if (chrome.runtime.lastError) {
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError.message);
      console.log('************************* WARNING *************************');
      console.log(chrome.runtime.lastError);
    }
    console.log(newStore)
  });
};

var fn = _.throttle(function() {
  if ( isWorkHour() ){
    detectTabs();
  }
}, 3000);

function detectTabsThrottling(){
  fn();
};

chrome.tabs.onActivated.addListener(function(activeInfo) {
  detectTabsThrottling();
});

chrome.tabs.onRemoved.addListener(function(activeInfo) {
  detectTabsThrottling();
});

chrome.tabs.onUpdated.addListener(function() {
  detectTabsThrottling();
});
