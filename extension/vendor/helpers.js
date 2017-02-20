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
