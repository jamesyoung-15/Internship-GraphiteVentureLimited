

import requests
import json
import datetime
from datetime import datetime, date, time, timezone
     



# Extract current time information 
time_now = datetime.now(timezone.utc)
# Assign current date in yyyy-mm-dd format
cur_dt = time_now.strftime("%F")
# Assign current hour in hh format
cur_hr = time_now.strftime("%H")
# Assign current minute in mm format, converted to integer for ease of subtraction
cur_min = int(time_now.strftime("%M"))
# Assign current second in ss format
cur_sec = time_now.strftime("%S")
# Assign current microsecond in ffffff format
cur_msc = time_now.strftime("%f")
# Assign current time to the sensor api url
url = f"https://1v2kgpsm3a.execute-api.ap-northeast-2.amazonaws.com/innoair/I01A002F001B?interval=0&from_time={cur_dt}T{cur_hr}%3A{cur_min-1}%3A{cur_sec}.{cur_msc}Z&to_time={cur_dt}T{cur_hr}%3A{cur_min}%3A{cur_sec}.{cur_msc}Z"
# Get the sensor data by REST API 
requests.get (url)
# Use Json module to convert the scrapped bypes to dictionary 
content = json.loads(requests.get(url).content)
#display the scrapped dictionary of sensor data
print(content)
     
     
