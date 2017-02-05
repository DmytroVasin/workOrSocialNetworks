var compactCounter = 0;
var oldTabs = {};

// chrome.storage.local.clear();

function cleardata() {
  chrome.storage.local.clear();
}

function getdata() {
  chrome.storage.local.get(null, function(items) {
    console.log('--------------------------------------------');
    console.log(items);
    console.log('--------------------------------------------');
  });
}


// chrome.storage.onChanged.addListener(function (changes,areaName) {
//     console.log("New item in storage", changes);
// });

function compressor(data){
  for( var domain in data ) {
    // возьми текущую и следующую за ним группу ( если следующая не undefined )
    // Если время закрытия текущей и время открытия следюющей менее 30 секунд ( 30000 милисекунд ) то мы будем считать что вкладка не закрывалась.
    // Осталось вычислить какой статус проставиьть этой вкладке

    newDomainTimeArray = [];
    data[domain]['time'].forEach(function(timeGroup, index, array) {

      var currentTimeGroup = timeGroup
      var nextTimeGroup = array[index + 1]

      if ( !nextTimeGroup ){
        newDomainTimeArray.push(currentTimeGroup)
        return
      }

      if ( nextTimeGroup['start_at'] - currentTimeGroup['close_at'] <= 30000 ) {
        // Время старта следующей грыппы мы присваеваем времени старта текущей группы.
        nextTimeGroup['start_at'] = currentTimeGroup['start_at']

        // Если у групп статусы разные то мы высчитываем дельта и берем статус большей группы
        if ( currentTimeGroup['isActive'] != nextTimeGroup['isActive'] ){
          var currentTimeGroupDelta = currentTimeGroup['close_at'] - currentTimeGroup['start_at']
          var nextTimeGroupDelta = nextTimeGroup['close_at'] - nextTimeGroup['start_at']

          if ( currentTimeGroupDelta > nextTimeGroupDelta ) {
            nextTimeGroup['isActive'] = currentTimeGroup['isActive']
          }
        }
      } else {
        newDomainTimeArray.push(currentTimeGroup)
      }
    })

    data[domain]['time'] = newDomainTimeArray;
  }

  return data
}

function compactData(data) {
  if (compactCounter === 50) {
    compactCounter = 0;

    return compressor(data);
  } else {
    compactCounter += 1;
    return data;
  }
}


function compareOldTabsAndNewTabs(newTabs){
  var currentTime = +Date.now();

  // Смотрим на все вкладки которые были открыты
  for( var key in oldTabs ) {
    // Если вкладка была закрыта то ее не будет в новом массиве.
    if ( newTabs[key] ) {
      // Она все еще отрыта
    } else {
      // Ее уже нет среди отрытых
      // Проставляем ее даты закрытия
      oldTabs[key]['close_at'] = currentTime;
      // Сохраняем ее в "storage"

      createOrUpdateByKey(key, oldTabs[key]);
      delete(oldTabs[key])
    }
  }

  // Если вкладка сейчас открыта то она есть в новом массиве
  for( var key in newTabs ) {
    // Была ли она уже в открытых
    if ( oldTabs[key] ) {
      // Да она была открыта
      // Тогда мы должны проверить ее статус ( Вкладка может перейти из активной в пассивную и наоборот )
      // Если статусы не совпадают то:
      if (oldTabs[key]['isActive'] != newTabs[key]['isActive']){
        // Проставляем время смены статуса
        oldTabs[key]['close_at'] = currentTime;
        // Сохраняем
        createOrUpdateByKey(key, oldTabs[key]);
        // Удаляем из старого массива
        delete(oldTabs[key])
        // Добавляем в старый массив новую вкладку
        oldTabs[key] = newTabs[key];
        oldTabs[key]['start_at'] = currentTime;
      } else {
        // вкладка не меняла свой статус
      }
    } else {
      // Нет ее только что открыли
      // Добавим ее в уже открытые дополнительно проставим время отрытия
      oldTabs[key] = newTabs[key];
      oldTabs[key]['start_at'] = currentTime;
    }
  }
};


function createOrUpdateByKey(domain, opts) {
  chrome.storage.local.get('sites', function(results) {
    var jsonObj = results.sites || {};

    jsonObj = compactData(jsonObj);

    // Есть ли у нас уже такой сайт
    if ( jsonObj[domain] ) {
      jsonObj[domain] = results.sites[domain]
      jsonObj[domain]['time'] = jsonObj[domain]['time'].concat({
        'start_at': opts.start_at,
        'close_at': opts.close_at,
        'isActive': opts.isActive
      })
    } else {
      jsonObj[domain] = {};
      jsonObj[domain]['url'] = opts.url;
      jsonObj[domain]['icon'] = opts.icon;
      jsonObj[domain]['time'] = [{
        'start_at': opts.start_at,
        'close_at': opts.close_at,
        'isActive': opts.isActive
      }];
    }

    // console.log(jsonObj);
    // console.log(JSON.stringify(jsonObj));

    chrome.storage.local.set({ 'sites': jsonObj }, function () {
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




function getDomain(url) {
  if (url.indexOf('://') > -1) {
    var protocol = url.split('://')[0]
    var domain = url.split('://')[1].split('/')[0]

    if (protocol === 'http' || protocol === 'https') {
      return domain;
    }
  }

  return false; // Incorrect URL in browser.
}


function detectTabs(){
  objectWithTabs = {};

  chrome.tabs.query({}, function(tabs) {

    for (var i = 0; i < tabs.length; ++i) {
      var currentTab = tabs[i];
      var domain = getDomain(currentTab.url);

      if (domain) {
        objectWithTabs[domain] = { isActive: currentTab.active, url: currentTab.url, icon: currentTab.favIconUrl }
      }
    }

    compareOldTabsAndNewTabs(objectWithTabs);
  });
}


// WHY IN SUCH WAY!?
var fn = _.throttle(function() {
  // console.log('Start tabs detection!');
  detectTabs();
}, 3000);

function detectTabsThrottling(){
  // console.log('EVENT WAS FIRED!');
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
