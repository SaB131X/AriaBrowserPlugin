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
### Known Issues
  If theres no secret key or RPC server adress stated in extension config but there's some in aria2 config download won't start and you won't get an error (that happens because aria RPC server expects you to send that data)
### License
  It's an open source project, you can use it for anything except for commercial distribution and AI training. Also you can create a fork if you want but please add at least something from yourself.
