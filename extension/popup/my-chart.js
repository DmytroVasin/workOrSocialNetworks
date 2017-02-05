function initLabelListeners(){
  xAxisLabels = document.querySelectorAll('.highcharts-xaxis-labels text');

  for (var i = 0; i < xAxisLabels.length; i++) {
    xAxisLabels[i].addEventListener('click', openNewPage);
  }
}

function openNewPage(){
  console.log('>>>>>>>>>>>>>>>>>>>>>');
  console.log(this.textContent);
  console.log(this.innerText);
  console.log('>>>>>>>>>>>>>>>>>>>>>');

  chrome.tabs.create({
    'url': 'http://' + this.textContent,
    'selected': true
  });
}



function sortObjectByDelta(obj){
  obj.sort(function(a,b){
    if (a.deltaActive == b.deltaActive)
      return 0;
    return (a.deltaActive > b.deltaActive) ? -1 : 1;
  });

  return obj;
};

function limitSeries(size = 10, data) {

}

function getMostActiveLinks(number, data) {
  var sortedArray = sortObjectByDelta(data).slice(0, number);
  var mostPopular = [];

  sortedArray.forEach( function(element, index, array) {
    mostPopular.push(element['sitename']);
  })

  return mostPopular;
}


function drawChart(){
  chrome.storage.local.get(null, function(data) {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    // console.log(data)
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')

    var mostPopular;
    var groupedDeltaData = [];
    var dataSeries = [];
    var splicedDataSeries = [];

    for( var siteName in data.sites ) {
      var deltaObject = { sitename: siteName, 'deltaActive': 0, 'deltaPassive': 0 };

      data.sites[siteName].time.forEach(function(item) {
        var item_delta = item.close_at - item.start_at;

        dataSeries.push({
          name: siteName,
          high: item.close_at,
          low: item.start_at,
          color: item.isActive ? 'green' : 'grey'
        });

        if (item.isActive){
          deltaObject['deltaActive'] += item_delta;
        } else {
          deltaObject['deltaPassive'] += item_delta;
        }

      });

      groupedDeltaData.push(deltaObject);
    }


    mostPopular = getMostActiveLinks(data.countOfRowsToShow, groupedDeltaData)


    dataSeries.forEach(function(item, i, array) {
      if (mostPopular.indexOf(item.name) >= 0) {
        splicedDataSeries.push(dataSeries[i])
      }
    });

    initChart(splicedDataSeries);
  });
}

function initChart(dataSeries) {
  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  new Highcharts.Chart({
    global: {
        useUTC: false
    },
    chart: {
      renderTo : 'container',
      type: 'columnrange',
      inverted: true
    },
    title: {
      text: "My Chart"
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    tooltip: {
      formatter: function () {
          return Highcharts.dateFormat('%H:%M:%S', this.point.low) +' - '+Highcharts.dateFormat('%H:%M:%S', this.point.high);
      }
    },
    xAxis: {
      type: 'category',
      labels: {
        style: {
          cursor: 'pointer'
        }
      }
    },
    yAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        second: '%H:%M'
      },
      title: {
        text: null
      },
    },

    plotOptions: {
      columnrange: {
        borderWidth: 0
      }
    },

    series: [{
      data: dataSeries
    }]
  });

  initLabelListeners();
}

window.addEventListener('load', drawChart);
