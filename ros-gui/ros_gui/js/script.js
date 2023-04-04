var ros = null;
var ipaddr = null;
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
};

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
}

// connect to ROS server
function createROS(){
    ros = new ROSLIB.Ros({
        url : "ws://" + ipaddr + ":9090"
    });
    ros.on('connection', function() {
        console.log('Connected to websocket server.');
        alert("Connected!");
        document.getElementById("connect-status").innerHTML="Connected";
      });
    
    ros.on('error', function(error) {
        console.log('Error connecting to websocket server: ', error);
        alert("Error!");
        document.getElementById("connect-status").innerHTML="Error";
    });
    
    //create robot velocity topic
    cmd_vel_listener = new ROSLIB.Topic({
        ros : ros,
        name : "/cmd_vel",
        messageType : 'geometry_msgs/Twist'
    });
    cameraStream();
    joystickControl("on");
};

function disconnectROS()
{
    if(ros!=null)
    {
        ros.close();
        ipaddr=null;
        ros=null;
        console.log("ROS disconnected");
        alert("Device disconnected.")
        document.getElementById("connect-status").innerHTML="Disconnected";
        document.getElementById("cam-stream").remove();
        joystickControl("off");
        document.getElementById("calibrate-button").remove();
    }
    else{
        console.log("ROS is null");
    }
}

//function for displaying ros camera topic
function rosCamera()
{
    var streamImg = document.createElement('img');
    var imageListener = new ROSLIB.Topic({
        ros:ros,
        // name : '/camera/image/compressed',
        name : '/usb_cam/image_raw/compressed', //for usb camera
        messageType : 'sensor_msgs/CompressedImage'

    });
    imageListener.subscribe(function(message) {
        streamImg.width = 640;
        streamImg.height = 480;
        streamImg.src = "data:image/jpg;base64," + message.data;
    });
    streamImg.setAttribute("id", "cam-stream");
    document.getElementById('create-stream').appendChild(streamImg);
};

//function for displaying http camera stream
function cameraStream()
{
    streamImg = document.createElement('img');
    streamImg.src= "http://"+ ipaddr + ":8080/stream?topic=/usb_cam/image_raw";
    streamImg.width = 640;
    streamImg.height = 480;
    streamImg.setAttribute("id", "cam-stream");
    document.getElementById('create-stream').appendChild(streamImg);
};

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
        zone: document.getElementById('nipple'),
        mode: 'static',
        size: 100,
        position: {left:"50%", top:"50%"},
        color: 'white'
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
        //create toggle button
        buttonCalibrate = document.createElement("button");
        buttonCalibrate.setAttribute("onclick",joystickRecalibrate);
        buttonCalibrate.setAttribute("class","button-style");
        buttonCalibrate.setAttribute("id","calibrate-button");
        buttonCalibrate.innerHTML = "Calibrate Controller";
        document.getElementById("joystick-area").appendChild(buttonCalibrate);
    }
    else if(toggle=="off" && joystickCreated!="none")
    {
        self.manager.destroy();
        joystickCreated = "none";
    }
    // console.log(joystickCreated);
}