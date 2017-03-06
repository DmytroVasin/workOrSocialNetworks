function loadDataForDate(e){
  let dateValue = e.target.value
  let dateTodayValue = (new Date).toLocaleDateString()

  hideNoData();
  clearChart();

  if ( dateValue === dateTodayValue ){
    showTodaysChart()
  } else {
    showFirebaseForDateChart(dateValue)
  }
}

function showFirebaseForDateChart(date){
  let dateInt = formatDB(date)
  showSpinner();

  let dbRef = firebase.database().ref('overdueData')
  dbRef.child(dateInt).once('value', function(snapshot) {
    let data = snapshot.val()
    drawChart(data)
    hideSpinner();
  });
}

function initLabelListeners(){
  xAxisLabels = document.querySelectorAll('.highcharts-xaxis-labels text');

  _.map(xAxisLabels, function(label) {
    label.addEventListener('click', openNewPage);
  });
}

function openNewPage(){
  var labelName = this.textContent;

  chrome.storage.sync.get('sites', function(data) {
    chrome.tabs.create({
      'url': data.sites[labelName].url,
      'selected': true
    });
  });
}

function filterMostActiveLinks(data, number) {
  var sortedSitesArray = _.orderBy(data, ['activeTime', 'passiveTime'], ['desc', 'desc']);
  return _.slice(sortedSitesArray, 0, number);
}

function showTodaysChart(){
  showSpinner();

  chrome.storage.sync.get(null, function(data) {
    drawChart(data);
    hideSpinner();
  });
}

function drawChart(data) {
  if (_.isEmpty(data && data.sites)){
    showNoData()
    return false
  }

  var date = data.currentDate;
  var sites = data.sites
  var rows = data.countOfRowsToShow || 25;

  var mostPopular = filterMostActiveLinks(sites, rows)

  if( mostPopular.length ) {
    initChart(mostPopular, date);
  }
}

function initChart(data, currentDate) {
  var categories = _.map(data, 'name');
  var activeArray = _.map(data, 'activeTime' );
  var passiveArray = _.map(data, 'passiveTime');

  new Highcharts.chart({
    chart: {
      type: 'bar',
      width: 780,
      height: 480,
      renderTo : 'chart',
      inverted: true,
    },
    title: {
      text: formatHuman(currentDate)
    },

    credits: {
      enabled: false
    },
    xAxis: {
      categories: categories
    },

    yAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        day: '%H:%M'
      },
      title: {
        text: null
      },
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    tooltip: {
      formatter: function () {
        return this.series.name + ' time: <b>' + Highcharts.dateFormat('%H:%M:%S', this.point.y) + '<b>'
      }
    },
    series: [{
      name: 'Passive',
      color: 'grey',
      data: passiveArray
    }, {
      name: 'Active',
      color: 'green',
      data: activeArray
    }]
  });

  initLabelListeners();
}

function initDatepicker(){
  let datepicker = document.getElementById('datepicker')

  datepicker.DatePickerX.init({
    clearButton: false,
    format: 'm/d/yyyy'
  })
  datepicker.value = (new Date).toLocaleDateString()

  datepicker.addEventListener('change', loadDataForDate);
}

function clearChart(){
  document.getElementById('chart').innerHTML = ''
}

window.addEventListener('load', function(){
  initDatepicker()
  showTodaysChart()
});
