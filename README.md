# EthernetHotel.js
Simple UDP holepunching server which allows multiple users within a room to exchange their details.
### Commands
```
&! -> Command starter
&# -> Seperator
{} -> Placeholder
----------------------------------
Client Commands
----------------------------------
Create Room: &!CR&#{room_size}&#{external_data} -> e.g. &!CR&#2&#HEATXD
Join Room: &!JR&#{room_code}&#{external_data} -> e.g. &!JR&#2&#HEATXD
----------------------------------
Server Responses
----------------------------------
Room Joined: &!RJ&#{room_size} -> e.g. &!RJ&#4
Room Full: &!RF
No Room Found: &!NRF
Room Closed: &!RC
Room Code Response: &!RCR&#{room_code} -> e.g. &!RCR&#AAAABBBBCCCCDDDD
Room Info Exchange: &!RIE&#{full_address}&#{external_data} -> e.g. &!RIE&#127.0.0.1:4444&#HEATXD
----------------------------------
```
### Builidng
set your wanted PORT environment variable and run!
```
npm run app
```
### Support
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S1BV6TH)
