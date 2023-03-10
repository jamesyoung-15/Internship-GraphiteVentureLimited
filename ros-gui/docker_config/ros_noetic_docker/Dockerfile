FROM osrf/ros:noetic-desktop-full

RUN apt-get update
RUN apt-get install -y git && apt-get install -y python3-pip
RUN apt-get install -y ros-noetic-usb-cam
RUN apt-get install -y libusb-dev
RUN apt-get install -y python3-tk
RUN apt-get install -y ros-noetic-web-video-server
RUN apt-get install -y ros-noetic-rosbridge-server
RUN apt-get install -y ros-noetic-tf2-web-republisher
RUN echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc
RUN echo "export ROS_MASTER_URI=http://localhost:11311" >> ~/.bashrc
RUN echo "export ROS_HOSTNAME=localhost" >> ~/.bashrc
