chrome.runtime.onUpdateAvailable.addListener(function(details){
  console.log('************************** UPDATE DETAILS **************************')
  console.log(details)
  console.log('************************** UPDATE DETAILS **************************')

  chrome.storage.sync.set({ sites: [] }, function () {
    chrome.runtime.reload()
  })
})
