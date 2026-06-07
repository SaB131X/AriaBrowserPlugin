### How to install aria2 (list of Packet Managers commands)
  winget install -e --id aria2.aria2<br>
  sudo pacman -S aria2<br>
  sudo apt update && sudo apt install aria2<br>
  sudo dnf install aria2<br>
  sudo zypper install aria2<br>
  sudo apk add aria2<br>
### How to launch aria2 with RPC
  aria2c --enable-rpc --rpc-listen-port=6800 --rpc-secret=YourSecretToken -D
### How to launch aria2 with your config (watch the slashes, MSYS2 syntax)
  aria2c --conf-path="C:/Users/User1/.aria2/aria2.conf" -D
### Recomended aria2 config
```
  enable-rpc=true
  rpc-allow-origin-all=true
  rpc-listen-all=false
  rpc-listen-port=6800
  rpc-secret=YourKey # change it
  continue=true # continues downloading if lost internet access
  max-concurrent-downloads=3
  split=8 # cpu threads, use 8 to avoid ip bans, max is 16
  max-connection-per-server=8
  dir=E:\aria2 # Where you want download to
  input-file=E:\aria2\sesFiles\aria2.session # system input file location
  save-session=E:\aria2\sesFiles\aria2.session # system session file location
  save-session-interval=60
```
### How to Use
  Make sure that you setted up everything in the plugin settings and started Aria2 RPC server.<br>
  Then just right click on desired link and press "Download with Aria2".<br>
  After that you'll get a system notification (from windows or linux).<br>
  If everythings right you'll get a notification with short URL and GID.<br>
  If there's an error (server unreachable or wrong password) and:<br>
  1. You're using Chrome based browser (Chrome, Opera, etc) you'll get an option to click on the button that opens plugin settings or use the second option<br>
  2. You're using Firefox or Edge you should click on the notification itself instead (because these two browsers don't support buttons).<br>That option is supported by all the browsers so you can use it instead of buttons on Chrome.
### Known Issues
  If theres no secret key or RPC server adress stated in extension config but there's some in aria2 config download won't start (that happens because aria RPC server expects you to send that data)
### License
  It's an open source project, you can use it for anything except for commercial distribution and AI training. Also you can create a fork if you want but please add at least something from yourself.
