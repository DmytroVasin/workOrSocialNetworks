function displayDayInfo(dayItem) {

  let history = document.getElementById('history');
  let templateScript = document.getElementById('history-container-template');

  let templateContainer = _.template(  templateScript.innerHTML );

  let localVariables = Object.assign({}, dayItem, { isToday: isToday(dayItem.currentDate) });

  var rendered = templateContainer(localVariables);


  // Trick to use appendChild.
  let container = document.createElement('div');
  container.className = 'history-container';
  container.innerHTML = rendered;

  history.appendChild(container);
}

function isToday(dayInt){
  return (new Date(dayInt)).toDateString() === (new Date()).toDateString()
}

function displayCountOfChartRows(rows) {
  document.getElementById('rows_count').value = rows || '15';
}

function displayFirebaseOptions(options) {
  let opts = options || {}

  if (opts.key && opts.domain){
    let fb_element = document.getElementById('installFirebase')
    fb_element.className = 'hidden';
  }

  if (opts.key) {
    document.getElementById('api-key').value = options.key
  }

  if (opts.domain) {
    document.getElementById('auth-domain').value = options.domain
  }
}

function displayAllTimeInfo(){
  getFirebaseDataAll(function(data){

    if (_.some(data)) {
      let sortedData = sortByKeys(data)

      _.forEach(sortedData, function(dayItem) {
        displayDayInfo(dayItem)
      });
    }

    hideSpinner();
  });
}

function showFlashMessage(message, status) {
  let flipFlopContainer = document.getElementById('flip-flop-container');

  let flash = document.createElement('div')
  flash.className = 'status ' + status;
  flash.innerHTML = message;

  document.body.insertBefore(flash, flipFlopContainer);

  setTimeout(function() {
    document.body.removeChild(flash)
  }, 750);
}

function saveOptions() {
  let rowsCount = document.getElementById('rows_count').value
  let newStore = { countOfRowsToShow: rowsCount }

  updateStore(newStore, function(){
    showFlashMessage('Option saved.', 'success');
  });
}

function saveClearDay() {
  let newStore = { sites: [], currentDate: null }

  updateStore(newStore, function(){
    showFlashMessage('Option saved.', 'success');
  });
}

function saveFirebaseOptions() {
  let key = document.getElementById('api-key').value
  let domain = document.getElementById('auth-domain').value

  let newStore = { firebase: { key: key, domain: domain }}

  updateStore(newStore, function(){
    showFlashMessage('Option saved.', 'success');
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

function onLoad() {
  initFlipperEvents();

  getStoreFull(function(object) {
    displayCountOfChartRows(object.countOfRowsToShow);
    displayFirebaseOptions(object.firebase);
  });

  saveLocalDataToFirebase(displayAllTimeInfo)
}


document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('clear').addEventListener('click', saveClearDay);
document.getElementById('save-firebase').addEventListener('click', saveFirebaseOptions);

document.addEventListener('DOMContentLoaded', onLoad);
