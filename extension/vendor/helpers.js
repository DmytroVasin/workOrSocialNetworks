function cleardata() {
  chrome.storage.sync.clear();
}

function getdata() {
  chrome.storage.sync.get(null, function(items) {
    console.log('--------------------------------------------');
    console.log(items);
    console.log('--------------------------------------------');
  });
}

function convertMS(ms) {
  var seconds = Math.floor((ms / 1000) % 60);
  var minutes = Math.floor((ms / (60 * 1000)) % 60);
  var hours = Math.floor((ms / (60 * 60 * 1000)) % 60);

  if(seconds<10){
    sec='0'+seconds;
  } else {
    sec= ''+seconds;
  }

  if(minutes<10) {
    min='0'+minutes;
  } else {
    min= ''+minutes;
  }

  if(hours<10) {
    hrs='0'+hours;
  } else {
    hrs= ''+hours;
  }

  if(hours == 0){
    return min+':'+sec;
  } else {
    return hrs+':'+min+':'+sec;
  }
}


function splitUrl(url) {
  var domain;
  var protocol;

  protocol = url.split('://')[0]

  if (url.indexOf('://') > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }

  domain = domain.split(':')[0];

  if (protocol === 'http' || protocol === 'https') {
    return {
      domain: domain,
      url: protocol + '://' + domain
    }
  }

  return false; // Inconvenient URL in browser.
}

function formatHuman(date) {
  d = new Date(+date)

  let monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  let weekdays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  let week_day = d.getDay();
  let curr_date = d.getDate();
  let curr_month = d.getMonth();
  let curr_year = d.getFullYear();

  // 'Saturday, March 4, 2017'
  return weekdays[week_day]+ ', '+ monthNames[curr_month] +' '+ curr_date +', '+ curr_year
}


function formatDB(date) {
  let dateString = new Date(date).toLocaleDateString();
  let dateInteger = Date.parse(dateString)

  return dateInteger
}

function isToday(dateInt) {
  date = (new Date(dateInt)).toLocaleDateString()
  todayDate = (new Date).toLocaleDateString()

  return date === todayDate
}

function sortByKeys(object) {
  let keys = _.keys(object)
  let sortedKeys = _.sortBy(keys).reverse()

  return _.fromPairs(
    _.map(sortedKeys, function(key){
      return [key, object[key]]
    })
  )
}

function hideSpinner() {
  document.getElementById('spinner').className = 'hidden';
}
function showSpinner() {
  document.getElementById('spinner').className = '';
}
function hideNoData() {
  document.getElementById('no-data').className = 'hidden';
}
function showNoData() {
  document.getElementById('no-data').className = '';
}
