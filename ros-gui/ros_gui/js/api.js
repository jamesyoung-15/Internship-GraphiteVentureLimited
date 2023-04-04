// IAQ Sensor Fetch and Display
var year, month, day, minutes, seconds;
var temperature, humidity, co2, pm10, pm25;
//returns api url based on GMT time

//bars
var tempBar = new ProgressBar.Circle('#temp-container', {
  strokeWidth: 6,
  color: '#FFEA82',
  trailColor: '#eee',
  trailWidth: 1,
  easing: 'easeInOut',
  duration: 500,
  svgStyle: null,
  text: {
    value: '',
    alignToBottom: false
  },
  from: {color: '#3aff18'},
  to: {color: '#fa1201'},
  // Set default step function for all animate calls
  step: (state, bar) => {
    
    bar.text.style.color = '#3aff18';
    bar.path.setAttribute('stroke', '#3aff18');
  }
});

function getUrl()
{
  //get current time in UTC
  let year = new Date().getUTCFullYear();
  let month = new Date().getUTCMonth()+1;
  let day = new Date().getUTCDate()-1;
  let minutes = new Date().getUTCMinutes();
  let prevMin = new Date().getUTCMinutes()-1;
  let hour = new Date().getUTCHours();
  let seconds = new Date().getUTCSeconds();
  let milliseconds = new Date().getUTCMilliseconds();
  console.log(year, month, day, minutes);
  //make sure single digit month, hour, min show up as like 01 instead of 1
  let str1 = '0';
  if(prevMin<0){
    prevMin = 0;
  }
  if(month<10){
    // month = month.toString();
    month = str1.concat(month);
  }
  if(minutes<10){
    minutes = str1.concat(minutes);
  }
  if(prevMin<10){
    prevMin = str1.concat(prevMin);
  }
  if(hour<10){
    hour=str1.concat(hour);
  }
  if(seconds<10)
  {
    seconds=str1.concat(seconds);
  }
  return url = `https://1v2kgpsm3a.execute-api.ap-northeast-2.amazonaws.com/innoair/I01A002F001B?interval=0&from_time=${year}-${month}-${day}T${hour}%3A${prevMin}%3A${seconds}.${milliseconds}Z&to_time=${year}-${month}-${day}T${hour}%3A${minutes}%3A${seconds}.${milliseconds}Z`;
}
//get IAQ data from API
// var sensorData;
function fetchData()
{
  //get url from function
  let url = getUrl();
  //fetch api
  fetch(url)
    .then((response) => response.json())
    .then(function(data){
      console.log(data);
      console.log(new Date().toUTCString())
      let showTime = document.getElementById("show-time");
      // time = new Date().toUTCString();
      // showTime.innerHTML= time;
      // sensorData = data;
      let placeholder = document.getElementById('data-output');
      //output data to table format
      let out="";
      temperature = (Math.round(data['data'].TEMP[0] * 100) / 100).toFixed(1);
      out+=`<tr>
              <td>${temperature}\u00B0C</td>
              <td>${data['data'].HUMI[0]}%</td>
              <td>${data['data'].CO2[0]} ppm</td>
              <td>${data['data'].PM10[0]} µg/m³</td>
              <td>${data['data'].PM25[0]} µg/m³</td>
              <td>${data['data'].TVOC[0]} µg/m³</td>
      `;
      placeholder.innerHTML=out;
      tempBar.animate(1.0);
    });
}
function updateTime()
{
  time = new Date().toUTCString();
  document.getElementById("show-time").innerHTML = time;
}
//run fetchData every minute
window.onload = function()
{
    updateTime();
    fetchData();
    setInterval(fetchData, 60000);
    setInterval(updateTime,1000);
};

