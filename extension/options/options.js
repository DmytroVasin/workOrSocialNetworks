function display_count_of_rows(rows) {
  document.getElementById('rows_count').value = rows || '15';
}

function display_current_date(date) {
  var history_date_title = document.getElementById('history').getElementsByClassName('date')[0];
  history_date_title.textContent = date;
}

function display_table_with_sites(sites) {
  for( var siteName in sites ) {

    var url = sites[siteName].url
    var iconPath = sites[siteName].icon

    add_row(iconPath, url);
  }
}

function add_row(iconPath, url) {
  var history_block = document.getElementById('history');
  var history_item_container = document.getElementsByClassName('history-item-container')[0];

  var item = document.createElement('div');
  item.className = 'history-item';
  item.innerHTML = `
    <div class='website-icon'>
      <img src="`+ iconPath +`">
    </div>
    <div class='website-title'>
      <a href='`+ url +`'>`+ url +`</a>
    </div>
    <div class='website-time'>
      <div class='active'>
        0:02:37
      </div>
      <div class='passive'>
        5:02:37
      </div>
    </div>
    `;

  history_item_container.appendChild(item);
}


function show_flash_message() {
  var form = document.getElementById('form');

  var flash = document.createElement('div')
  flash.className = 'status';
  flash.innerHTML = 'Option saved.';

  document.body.insertBefore(flash, form);

  setTimeout(function() {
    document.body.removeChild(flash)
  }, 750);
}

function save_options() {
  var rows_count = document.getElementById('rows_count').value

  chrome.storage.local.set({ countOfRowsToShow: rows_count }, function() {
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
