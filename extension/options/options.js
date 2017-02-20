function displayCountOfChartRows(rows) {
  document.getElementById('rows_count').value = rows || '15';
}

function displayCurrentDate(date) {
  var historyDateTitle = document.getElementById('history').getElementsByClassName('date')[0];
  historyDateTitle.textContent = date;
}

function displayCountOfSites(number) {
  var sitesCount = document.getElementById('history').getElementsByClassName('sites-count')[0];
  sitesCount.textContent = '# ' + number;
}

function displayTableWithSites(sites) {
  var sortedSitesArray = _.orderBy(sites, ['activeTime', 'desc'])

  sortedSitesArray.forEach(addRow);
}

function addRow(item) {
  var historyItemContainer = document.getElementsByClassName('history-item-container')[0];

  var row = document.createElement('div');
  row.className = 'history-item';
  row.innerHTML = `
    <div class='website-icon'>
      <img src="`+ item.icon +`">
    </div>
    <div class='website-title'>
      <a href='`+ item.url +`'>`+ item.name +`</a>
    </div>
    <div class='website-time'>
      <div class='active'>
        `+ convertMS(item.activeTime) +`
      </div>
      <div class='passive'>
        `+ convertMS(item.passiveTime) +`
      </div>
    </div>
    `;

  historyItemContainer.appendChild(row);
}


function showFlashMessage() {
  var form = document.getElementById('form');

  var flash = document.createElement('div')
  flash.className = 'status';
  flash.innerHTML = 'Option saved.';

  document.body.insertBefore(flash, form);

  setTimeout(function() {
    document.body.removeChild(flash)
  }, 750);
}

function saveOptions() {
  var rowsCount = document.getElementById('rows_count').value

  chrome.storage.local.set({ countOfRowsToShow: rowsCount }, function() {
    showFlashMessage();
  });
}

function displayOptions() {
  chrome.storage.local.get(null, function(items) {
    displayCountOfChartRows(items.countOfRowsToShow);
    displayCurrentDate(items.currentDate);
    displayTableWithSites(items.sites);
    displayCountOfSites(_.size(items.sites));
  });
}

function clearData() {
  chrome.storage.local.clear(function() {
    showFlashMessage();
  });
}

document.addEventListener('DOMContentLoaded', displayOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('clear').addEventListener('click', clearData);
