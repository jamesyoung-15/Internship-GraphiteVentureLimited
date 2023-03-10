FROM nvidia/cudagl:11.4.1-devel-ubuntu20.04
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y locales lsb-release
RUN sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'
RUN apt install -y curl
RUN curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | apt-key add -
RUN apt update
RUN apt install -y --no-install-recommends ros-noetic-desktop-full
RUN apt-get install -y --no-install-recommends python3-rosdep
RUN apt-get install -y git && apt-get install -y python3-pip
RUN apt-get install -y ros-noetic-usb-cam
RUN apt-get install -y ros-noetic-web-video-server
RUN apt-get install -y libusb-dev
RUN apt-get install -y python3-tk
RUN apt-get install -y git
RUN apt-get install -y ros-noetic-rosbridge-server
RUN apt-get install -y ros-noetic-tf2-web-republisher
RUN echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc
RUN echo "export ROS_MASTER_URI=http://localhost:11311" >> ~/.bashrc
RUN echo "export ROS_HOSTNAME=localhost" >> ~/.bashrc
