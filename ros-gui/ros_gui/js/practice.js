// create ros object
ros = new ROSLIB.Ros({
    url : "ws://localhost:9090"
});

var topics =[];
var topicTypes = [];
var createdTopics = [];

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
        topics = result.topics;
        topicTypes = result.types;
        // result.types.forEach((item,index)=>{
        //     if(result.types[index]=="sensor_msgs/CompressedImage")
        //     {
        //         console.log(item, index, result.topics[index]);
        //     }
        // });
    });
}

function addTopic(){
    document.getElementById("selectTopic").innerHTML="";
    topicTypes.forEach((item,index)=>{
        if(topicTypes[index]=="sensor_msgs/CompressedImage")
        {
            console.log(item, index, topics[index]);
            let createOption = document.createElement('option');
            createOption.value = topics[index];
            createOption.innerHTML = topics[index];
            document.getElementById("selectTopic").appendChild(createOption);
        }
    });
}

function map3d(){
    // Create the main viewer.
    var viewer = new ROS3D.Viewer({
        divID : 'map',
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
          material: { color: 0xff00ff }
      });
}