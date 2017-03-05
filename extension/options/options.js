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

function displayAllTimeInfo(){
  let dbRef = firebase.database().ref('overdueData')

  dbRef.limitToLast(30).once('value', function(snapshot) {
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
  let form = document.getElementById('form');

  let flash = document.createElement('div')
  flash.className = 'status';
  flash.innerHTML = 'Option saved.';

  document.body.insertBefore(flash, form);

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

function displayOptions() {
  chrome.storage.sync.get(null, function(object) {
    displayCountOfChartRows(object.countOfRowsToShow);
    displayDayInfo(object, true);
    displayAllTimeInfo();
  });
}

function clearData() {
  chrome.storage.sync.clear(function() {
    showFlashMessage();
  });
}

document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('clear').addEventListener('click', clearData);

document.addEventListener('DOMContentLoaded', displayOptions);
