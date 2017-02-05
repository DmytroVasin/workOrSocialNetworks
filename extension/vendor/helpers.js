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
