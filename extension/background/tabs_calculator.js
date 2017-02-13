var oldTabs = {};

function compare_current_date(full_store) {
  var todaysDate = (new Date).toLocaleDateString();

  if (full_store.currentDate && full_store.currentDate === todaysDate) {

  } else {
    var values_for_store = {
      sites: {},
      currentDate: todaysDate
    }

    chrome.storage.sync.set(values_for_store, function () {
      console.log('Day changed!')
    });
  }
}

function compareOldTabsAndNewTabs(newTabs){
  var currentTime = +Date.now();

  // Смотрим на все вкладки которые были открыты
  _.forOwn(oldTabs, function(object, siteName) {
    // Если вкладка была закрыта то ее не будет в новом массиве.
    if ( newTabs[siteName] ) {
      // Она все еще отрыта
    } else {
      // Ее уже нет среди отрытых
      // Проставляем ее даты закрытия
      object['close_at'] = currentTime;
      // Сохраняем ее в "storage"
      createOrUpdateByKey(siteName, object);
      delete(oldTabs[siteName])
    }
  });

  // Если вкладка сейчас открыта то она есть в новом массиве
  _.forOwn(newTabs, function(object, siteName) {
    // Была ли она уже в открытых
    if ( oldTabs[siteName] ) {
      // Да она была открыта
      // Тогда мы должны проверить ее статус ( Вкладка может перейти из активной в пассивную и наоборот )
      // Если статусы не совпадают то:
      if (oldTabs[siteName]['isActive'] != object['isActive']){
        // Проставляем время смены статуса
        oldTabs[siteName]['close_at'] = currentTime;
        // Сохраняем
        createOrUpdateByKey(siteName, oldTabs[siteName]);
        // Удаляем из старого массива
        delete(oldTabs[siteName])
        // Добавляем в старый массив новую вкладку
        oldTabs[siteName] = object;
        oldTabs[siteName]['start_at'] = currentTime;
      } else {
        // вкладка не меняла свой статус
      }
    } else {
      // Нет ее только что открыли
      // Добавим ее в уже открытые дополнительно проставим время отрытия
      oldTabs[siteName] = object;
      oldTabs[siteName]['start_at'] = currentTime;
    }
  });
};


function createOrUpdateByKey(domain, opts) {
  chrome.storage.sync.get(null, function(results) {
    compare_current_date(results);

    var jsonObj = results.sites || {};

    // Есть ли у нас уже такой сайт
    if ( jsonObj[domain] ) {
      jsonObj[domain] = results.sites[domain]
      // Trick to update icon.
      if (!jsonObj[domain]['icon'].length) {
        jsonObj[domain]['icon'] = opts.icon
      }
    } else {
      jsonObj[domain] = {
        'name': domain,
        'url': opts.url || '',
        'icon': opts.icon || '',
        'activeTime': 0,
        'passiveTime': 0
      };
    }

    _timeMSeconds = opts.close_at - opts.start_at
    if (opts.isActive) {
      jsonObj[domain]['activeTime'] += _timeMSeconds
    } else {
      jsonObj[domain]['passiveTime'] += _timeMSeconds
    }

    chrome.storage.sync.set({ 'sites': jsonObj }, function () {
      if (chrome.runtime.lastError) {
        console.log('************************* WARNING *************************');
        console.log(chrome.runtime.lastError.message);
        console.log('************************* WARNING *************************');
        console.log(chrome.runtime.lastError);
      }

      console.log(domain + ' was SAVED!');
    });

  });
}


function detectTabs(){
  objectWithTabs = {};

  chrome.tabs.query({}, function(tabs) {
    _.forEach(tabs, function(tab){
      var splittedUrl = splitUrl(tab.url);

      if (splittedUrl) {
        objectWithTabs[splittedUrl.domain] = {
          isActive: tab.active,
          url: splittedUrl.url,
          icon: tab.favIconUrl
        }
      }
    });

    compareOldTabsAndNewTabs(objectWithTabs);
  });
}


function isWorkHour(){
  var now = new Date();
  var hours = now.getHours();

  if (hours >= 8 && hours <= 20) {
    return true
  }

  return false
}

var fn = _.throttle(function() {
  if ( isWorkHour() ){
    detectTabs();
  }
}, 3000);

function detectTabsThrottling(){
  fn();
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
  detectTabsThrottling();
});

chrome.tabs.onRemoved.addListener(function(activeInfo) {
  detectTabsThrottling();
});

chrome.tabs.onUpdated.addListener(function() {
  detectTabsThrottling();
});
