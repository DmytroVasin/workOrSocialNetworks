function displayDayInfo(object, isToday=false) {
  let history = document.getElementById('history');
  let templateScript = document.getElementById('history-container-template');

  let templateContainer = _.template(  templateScript.innerHTML );

  let localVariables = _.merge(object, { isToday: isToday });
  var rendered = templateContainer(localVariables);


  // Trick to use appendChild.
  let container = document.createElement('div');
  container.className = 'history-container';
  container.innerHTML = rendered;

  history.appendChild(container);
}

function displayCountOfChartRows(rows) {
  document.getElementById('rows_count').value = rows || '15';
}

function displayFirebaseOptions(options) {
  if (options && options.key) {
    document.getElementById('api-key').value = options.key
  }

  if (options && options.domain) {
    document.getElementById('auth-domain').value = options.domain
  }
}

function displayAllTimeInfo(){
  let dbRef = firebase.database().ref('overdueData')

  dbRef.once('value', function(snapshot) {
    let fb_snapshot = snapshot.val()

    if (_.some(fb_snapshot)) {
      let fb_snapshot_sorted = sortByKeys(fb_snapshot)

      _.forEach(fb_snapshot_sorted, function(dayItems) {
        displayDayInfo(dayItems)
      });
    }

    hideSpinner();
  });
}

function showFlashMessage() {
  let flipFlopContainer = document.getElementById('flip-flop-container');

  let flash = document.createElement('div')
  flash.className = 'status';
  flash.innerHTML = 'Option saved.';

  document.body.insertBefore(flash, flipFlopContainer);

  setTimeout(function() {
    document.body.removeChild(flash)
  }, 750);
}

function saveOptions() {
  let rowsCount = document.getElementById('rows_count').value

  chrome.storage.sync.set({ countOfRowsToShow: rowsCount }, function() {
    showFlashMessage();
  });
}

function onLoad() {
  initFlipperEvents();

  chrome.storage.sync.get(null, function(object) {
    displayCountOfChartRows(object.countOfRowsToShow);
    displayFirebaseOptions(object.firebase);
    displayDayInfo(object, true);
    displayAllTimeInfo();
  });
}

function clearData() {
  chrome.storage.sync.clear(function() {
    showFlashMessage();
  });
}

function saveFirebaseOptions() {
  let key = document.getElementById('api-key').value
  let domain = document.getElementById('auth-domain').value

  chrome.storage.sync.set({ firebase: { key: key, domain: domain }}, function() {
    showFlashMessage();
  });
}

function initFlipperEvents(){
  let flippers = document.getElementsByClassName('settings')

  for(let i=0; i<flippers.length; i++){
    flippers[i].addEventListener('click', function(){
      document.getElementsByClassName('flip-flop-card')[0].classList.toggle('flipped');
    });
  }
}

document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('clear').addEventListener('click', clearData);
document.getElementById('save-firebase').addEventListener('click', saveFirebaseOptions);

document.addEventListener('DOMContentLoaded', onLoad);
