function display_count_of_chart_rows(rows) {
  document.getElementById('rows_count').value = rows || '15';
}

function display_current_date(date) {
  var history_date_title = document.getElementById('history').getElementsByClassName('date')[0];
  history_date_title.textContent = date;
}

function display_count_of_sites(number) {
  var sites_count = document.getElementById('history').getElementsByClassName('sites-count')[0];
  sites_count.textContent = '# ' + number;
}

function display_table_with_sites(sites) {
  var sortedSitesArray = _.orderBy(sites, 'activeTime', 'desc')

  _.map(sortedSitesArray, function(item) {
    add_row(item);
  })
}

function add_row(item) {
  var history_block = document.getElementById('history');
  var history_item_container = document.getElementsByClassName('history-item-container')[0];

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

  history_item_container.appendChild(row);
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

  chrome.storage.sync.set({ countOfRowsToShow: rows_count }, function() {
    show_flash_message();
  });
}

function display_options() {
  chrome.storage.sync.get(null, function(items) {
    display_count_of_chart_rows(items.countOfRowsToShow);
    display_current_date(items.currentDate);
    display_table_with_sites(items.sites);
    display_count_of_sites(_.size(items.sites));
  });
}

function clear_data() {
  chrome.storage.sync.set({ sites: {} }, function() {
    show_flash_message();
  });
}

document.addEventListener('DOMContentLoaded', display_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear').addEventListener('click', clear_data);
