function save_options() {
  var rowsCount = document.getElementById('rowsCount').value

  chrome.storage.local.set({ countOfRowsToShow: rowsCount }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';

    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.local.get('countOfRowsToShow', function(items) {
    document.getElementById('rowsCount').value = items.countOfRowsToShow || '15';
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
