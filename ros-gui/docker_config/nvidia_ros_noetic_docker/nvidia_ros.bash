xhost +local:`docker inspect --format='{{ .Config.Hostname }}' $containerId`

docker run -it --gpus all --privileged --net=host \
	-e DISPLAY=$DISPLAY \
	-e QT_X11_NO_MITSHM=1 \
	-e TERM=xterm-256color \
	--device /dev/video0 \
	--volume="/dev/bus/usb:/dev/bus/usb" \
	--volume="$HOME/Documents/Personal_Projects/programming/ros_work_project/ros_ws:/home/ros_ws" \
	--volume="$HOME/Downloads/autonomous_exploration_development_environment:/home/autonomous_exploration_development_environment" \
	--volume="$HOME/Downloads/tare_planner:/home/tare_planner" \
	--volume="$HOME/Tools/rosboard:/home/rosboard" \
	nvidia_ros_noetic
