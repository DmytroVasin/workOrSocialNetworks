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
  var sortedSitesArray = _.orderBy(data, 'activeTime', 'desc')
  return _.slice(sortedSitesArray, 0, number);
}


function drawChart(){
  chrome.storage.sync.get(null, function(data) {
    var date = (new Date).toLocaleDateString();
    var sites = data.sites || {};
    var rows = data.countOfRowsToShow || 15;

    var mostPopular = filterMostActiveLinks(sites, rows)

    if( mostPopular.length ) {
      initChart(mostPopular, date);
    }
  });
}

function initChart(data, currentDate) {
  var categories = _.map(data, 'name');
  var activeArray = _.map(data, 'activeTime' );
  var passiveArray = _.map(data, 'passiveTime');

  Highcharts.chart('container', {
    chart: {
      type: 'bar',
      width: 780,
      height: 480,
      renderTo : 'container',
      inverted: true,
    },
    title: {
      text: 'Data for: ' + currentDate
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

window.addEventListener('load', drawChart);
