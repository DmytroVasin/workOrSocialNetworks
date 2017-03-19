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

  getFirebaseDataDay(dateInt, function(data){
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
  chrome.tabs.create({
    'url': 'http://' + this.textContent,
    'selected': true
  });
}

function filterMostActiveLinks(data, number) {
  var sortedSitesArray = _.orderBy(data, ['activeTime', 'passiveTime'], ['desc', 'desc']);
  return _.slice(sortedSitesArray, 0, number);
}

function showTodaysChart(){
  showSpinner();

  saveLocalDataToFirebase(function(todaysStore) {
    drawChart(todaysStore);
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
        day: '%H:%M',
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
      data: passiveArray,
      visible: false
    }, {
      name: 'Active',
      color: 'green',
      data: activeArray
    }]
  });

  initLabelListeners();
}

function initDatepicker(){
  let fb_element = document.getElementById('installFirebase')
  let datepicker = document.getElementById('datepicker')

  getStoreKey('firebase', function(object) {
    let opts = object.firebase

    if (opts && opts.key && opts.domain){
      datepicker.className = '';
      fb_element.className = 'hidden';

      datepicker.DatePickerX.init({
        clearButton: false,
        format: 'm/d/yyyy'
      })
      datepicker.value = (new Date).toLocaleDateString()

      datepicker.addEventListener('change', loadDataForDate);
    }
  })
}

function clearChart(){
  document.getElementById('chart').innerHTML = ''
}

window.addEventListener('load', function(){
  initDatepicker()
  showTodaysChart()
});
