xhost local:root

docker run -it \
    --env="DISPLAY" \
    --env="QT_X11_NO_MITSHM=1" \
    	--volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
	--volume="/dev/bus/usb:/dev/bus/usb" \
	--device="/dev/dri" \
	--device /dev/video0 \
	--volume="$HOME/Documents/Personal_Projects/programming/ros_work_project/ros_ws:/home/ros_ws" \
	--volume="$HOME/Downloads/autonomous_exploration_development_environment:/home/autonomous_exploration_development_environment" \
	--volume="$HOME/Downloads/tare_planner:/home/tare_planner" \
	--volume="$HOME/Tools/rosboard:/home/rosboard" \
	--net=host \
	ros-noetic-build
