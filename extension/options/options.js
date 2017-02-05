function display_count_of_rows(rows) {
  document.getElementById('rowsCount').value = rows || '15';
}

function display_current_date(date) {
  document.getElementById('currentDate').textContent = date;
}

function display_table_with_sites(sites) {
  for( var siteName in sites ) {

    var url = sites[siteName].url
    var iconPath = sites[siteName].icon

    addRow(iconPath, url);
  }
}


function addRow(iconPath, url) {
  var tableRef = document.getElementById('table');

  var newRow = tableRef.insertRow();

  var cellIcon = newRow.insertCell(0);
  var cellUrl = newRow.insertCell(1);

  var textUrl = document.createTextNode(url);
  var imgIcon = document.createElement('img');
  imgIcon.height = 32;
  imgIcon.width = 32;
  imgIcon.src = iconPath;


  cellUrl.appendChild(textUrl);
  cellIcon.appendChild(imgIcon);
}





function show_flash_message() {
  var status = document.getElementById('status');
  status.textContent = 'Options saved.';

  setTimeout(function() {
    status.textContent = '';
  }, 750);
}

function save_options() {
  var rowsCount = document.getElementById('rowsCount').value

  chrome.storage.local.set({ countOfRowsToShow: rowsCount }, function() {
    show_flash_message();
  });
}

function display_options() {
  chrome.storage.local.get(null, function(items) {
    display_count_of_rows(items.countOfRowsToShow);
    display_current_date(items.currentDate);
    display_table_with_sites(items.sites);
  });
}

function clear_data() {
  chrome.storage.local.set({ sites: {} }, function() {
    show_flash_message();
  });
}

document.addEventListener('DOMContentLoaded', display_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear').addEventListener('click', clear_data);
