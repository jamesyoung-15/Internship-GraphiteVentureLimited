var ipaddr = null;
var ros = null;
var cameraTopicCreated = "none";
var joystickCreated = "none";

//check if input IP is an valid IP address
function validateIP(input)
{
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if(input.match(ipformat)){
    return true;
    }
    else{
    return false;
    }
}

//Check and store IP
function inputIP() 
{
    let text;
    ipaddr = prompt("Please enter robot's IP:", "");
    if (ipaddr == null || ipaddr == "") {
    text = "No IP entered.";
    alert(text);
    ipaddr =null;
    }
    else if(validateIP(ipaddr)!=true){
    text = "Invalid IP.";
    ipaddr=null;
    alert(text);
    }
    else {
    text = "Entered IP: " + ipaddr + ".";
    createROS();
    }
    // document.getElementById("printip").innerHTML = text;
    //alert(text);
    }

    //disconnect ROS bridge function
    function disconnectROS()
    {
    if(ros != null)
    {
      ros.close();
      ipaddr=null;
      document.getElementById("controller_header").innerHTML = "";
      joystickControl("off");
      document.getElementById('controller_area').style.visibility = 'hidden';
      document.getElementById("camera_source").style.visibility = "hidden";
      document.getElementById("camera_stream").style.visibility = "hidden";
      document.getElementById("pointCloud").style.visibility="hidden";
      document.getElementById("pointCloudButton").style.visibility="hidden";
    }
    else
    {
    alert("Error. Either not connected or detected any device.");
    }
}

//create ROS bridge function
function createROS()
{
    // create ros object
    ros = new ROSLIB.Ros({
        url : "ws://" + ipaddr + ":9090"
    });

    //test ros connection section
    ros.on('connection', function() {
        document.getElementById("status").innerHTML = "Connected at " + ipaddr;
        document.getElementById("controller_header").innerHTML = "Controller";
        document.getElementById("camera_source").style.visibility = "visible";
        document.getElementById("camera_stream").style.visibility = "visible";
        joystickControl("on");
        document.getElementById("controller_area").style.visibility="visible";
        document.getElementById("pointCloud").style.visibility="visible";
        document.getElementById("pointCloudButton").style.visibility="visible";
    });

    ros.on('error', function(error) {
        document.getElementById("status").innerHTML = "Error";
        ipaddr = null;
    });

    ros.on('close', function() {
        document.getElementById("status").innerHTML = "Closed";
    });

    //create robot velocity topic
    cmd_vel_listener = new ROSLIB.Topic({
        ros : ros,
        name : "/cmd_vel",
        messageType : 'geometry_msgs/Twist'
    });

    rosCamera();
}

//list ros topics
function listRosTopics()
{
    var topicTypeClient = new ROSLIB.Service({
        ros : ros,
        name : '/rosapi/topics',
        serviceType : 'rosapi/Topics',
    });
    var request = new ROSLIB.ServiceRequest();
    topicTypeClient.callService(request, function(result) {
        console.log('Topics: ', result.topics); //topic names
        console.log('Topic Types: ', result.types); //topic types 
        result.types.forEach((item,index)=>{
            if(result.types[index]=="sensor_msgs/CompressedImage")
            {
                console.log(item, index, result.topics[index]);
            }
        });
    });
}

//ros camera topic
function rosCamera()
{
  getSource = document.querySelector('#cameraSource')
  source = getSource.value;
  var streamImg = document.createElement('img');
  if(ros!=null)
  {
    if(source==1)
    {
      var imageListener = new ROSLIB.Topic({
        ros : ros,
        // name : '/camera/image/compressed',
          name : '/usb_cam/image_raw/compressed', //for usb camera
        messageType : 'sensor_msgs/CompressedImage'
      });
      imageListener.subscribe(function(message) {
        streamImg.width = 640;
        streamImg.height = 480;
        streamImg.src = "data:image/jpg;base64," + message.data;
      })
      if(cameraTopicCreated == "stream_cam")
      {
        document.getElementById("stream_cam").remove();
        streamImg.setAttribute("id","ros_cam");
        document.getElementById('camera_stream').appendChild(streamImg);
        cameraTopicCreated = "ros_cam";
      }
      else if(cameraTopicCreated == "none")
      {
        streamImg.setAttribute("id","ros_cam");
        document.getElementById('camera_stream').appendChild(streamImg);
        cameraTopicCreated = "ros_cam";
      }
    }
    else if(source==2)
    {
      if(cameraTopicCreated == "ros_cam")
      {
        document.getElementById("ros_cam").remove();
        streamImg = document.createElement('img');
        streamImg.width = 640;
        streamImg.height = 480;
        streamImg.setAttribute("id","stream_cam");
        streamImg.src= "http://"+ ipaddr + ":8080/stream?topic=/usb_cam/image_raw";
        document.getElementById('camera_stream').appendChild(streamImg);
        cameraTopicCreated = "stream_cam";
      }
      else if(cameraTopicCreated == "none")
      {
        streamImg = document.createElement('img');
        streamImg.setAttribute("id","stream_cam");
        streamImg.src= "http://"+ ipaddr + ":8080/stream?topic=/usb_cam/image_raw";
        document.getElementById('camera_stream').appendChild(streamImg);
        cameraTopicCreated = "stream_cam";
      }
    }
  }
}

//point cloud
function pointCloud(){
  // Create the main viewer.
  var viewer = new ROS3D.Viewer({
      divID : 'pointCloud',
      width : 800,
      height : 600,
      antialias : true
    });

    // Setup a client to listen to TFs.
    var tfClient = new ROSLIB.TFClient({
      ros : ros,
      angularThres : 0.1,
      transThres : 0.1,
      rate : 10.0,
      fiexedFrame: '/camera_link'
    });

    var cloudClient = new ROS3D.PointCloud2({
        ros: ros,
        tfClient: tfClient,
        rootObject: viewer.scene,
        topic: '/sensor_scan',
        material: {size:0.2, color: 0xff00ff }
    });
}


//joystick movement function
function move (linear, angular) 
{
  var twist = new ROSLIB.Message({
    linear: 
    {
      x: linear,
      y: 0,
      z: 0
    },
    angular: 
    {
      x: 0,
      y: 0,
      z: angular
    }
  });
  cmd_vel_listener.publish(twist);
}


function joystickRecalibrate(){
    joystickControl("off");
    joystickControl("on");
}

//create joystick object
function joystickControl(toggle)
{
    var options = 
    {
        zone: document.getElementById('static'),
        mode: 'static',
        size: 100,
        position: {left:"50%"},
        color: 'blue'
    }
    if(toggle=="on" && joystickCreated == "none")
    {
        manager = nipplejs.create(options);

        linear_speed = 0;
        angular_speed = 0;
        self.manager.on('start', function (event, nipple) 
        {
            //console.log("Movement start");
            timer = setInterval(function () {
            move(linear_speed, angular_speed);
            }, 25);
        });

        self.manager.on('move', function (event, nipple) 
        {
            //console.log("Moving");
            max_linear = 1.0; // m/s
            max_angular = 1.0; // rad/s
            max_distance = 75.0; // pixels;
            linear_speed = Math.sin(nipple.angle.radian) * max_linear * nipple.distance/max_distance;
            angular_speed = -Math.cos(nipple.angle.radian) * max_angular * nipple.distance/max_distance;
        });

        self.manager.on('end', function () 
        {
            //console.log("Movement end");
            if (timer) 
            {
            clearInterval(timer);
            }
            self.move(0, 0);
        });
        joystickCreated = "created";
    }
    else if(toggle=="off" && joystickCreated!="none")
    {
        self.manager.destroy();
        joystickCreated = "none";
    }
    // console.log(joystickCreated);
}
// IAQ Sensor Fetch and Display
var year, month, day, minutes, seconds;
//returns api url based on GMT time
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
      let showTime = document.getElementById("showTime");
      time = new Date().toUTCString();
      showTime.innerHTML= time;
      //sensorData = data;
      let placeholder = document.getElementById('data-output');
      //output data to table format
      let out="";
      out+=`<tr>
              <td>${data['data'].TEMP[0]}\u00B0C</td>
              <td>${data['data'].HUMI[0]}%</td>
              <td>${data['data'].CO2[0]} ppm</td>
              <td>${data['data'].PM10[0]} µg/m³</td>
              <td>${data['data'].PM25[0]} µg/m³</td>
              <td>${data['data'].TVOC[0]} µg/m³</td>
      `;
      placeholder.innerHTML=out;
    });
}
//run fetchData every minute
fetchData();
interval = setInterval(fetchData, 60000);