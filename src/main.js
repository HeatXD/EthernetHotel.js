/*
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
Room Full: &!RF
No Room Found: &!NRF
Room Closed: &!RC
Room Code Response: &!RCR&#{room_code} -> e.g. &!RCR&#AAAABBBBCCCCDDDD
Room Info Exchange: &!RIE&#{full_address}&#{external_data} -> e.g. &!RIE&#127.0.0.1:4444&#HEATXD
----------------------------------
*/
// acquire env vars
require('dotenv').config();
const env = process.env;
// identifiers
const nanoid = require("nanoid").nanoid;
// hotel
const ROOM_CODE_LEN = 16;
const cache = require('ttl');
const hotel = new cache({
    ttl: 300 * 1000 // give the people 5 minutes to setup their session otherwise close it.
});
// close room on when ttl has been reached
hotel.on("del", (_, room) => closeRoom(room));
// setup socket and only support ipv4 for now.
const udp = require("dgram");
const socket = udp.createSocket('udp4');
// bind socket to env vars or defaults.
socket.bind(env.PORT | 4420);
// setup events
socket.on('listening', () => {
    console.log('EthernetHotel listening on ' + socket.address().address + ":" + socket.address().port);
});
// setup message command events
socket.on('message', (msg, remote) => {
    const cmd = msg.toString().trim();
    if (!cmd.startsWith("&!") || cmd.endsWith("&#") || cmd.endsWith("&!")) return;
    const args = cmd.split("&#");
    // console.log(args);
    if (args.length < 2) return;
    if (args[0] === "&!CR") { 
        const num = Number(args[1]);
        if (num == NaN) return;
        //console.log(args[2] + " wants to create room for " + num + " players");
        // create the room.
        const roomId = nanoid(ROOM_CODE_LEN);
        const room = {};
        room.size = num;
        room.users = new Map();
        // add host to the room
        const fullAddr = remote.address + ":" + remote.port;
        const value = args[3] | 0;
        room.users.set(fullAddr, value);
        // add room to the hotel
        hotel.put(roomId, room);
        // return room code as respone
        sendMessage("&!RCR&#" + roomId, fullAddr);
        // console.table(hotel.size());
    }
    else if (args[0] === "&!JR") { 
        if (args[1].length != ROOM_CODE_LEN) return;
        //console.log("Join Room! : " + args[1]);
        const fullAddr = remote.address + ":" + remote.port;
        const info = args[2] | 0;
        const room = hotel.get(args[1]);
        if (room === undefined) {
            sendMessage("&!NRF", fullAddr);
            return;
        }
        roomAddUser(fullAddr, info, args[1], room);
    }
    else {
        console.log("command: " + args[0] + " not found!");
    }
});

function sendMessage(msg, address) {
    const addr = address.split(":");
    socket.send(msg, 0, msg.length, addr[1], addr[0], function (err, _) {
        if (err) return console.log(err);
    });
}

function closeRoom(room) {
    room.users.forEach((_, addr) => sendMessage("&!RC", addr));
}

function roomAddUser(fullAddr, info, roomId, room) {
    if (room.users.size < room.size) {
        // add user to the room
        room.users.set(fullAddr, info);
        if (room.users.size === room.size) {
            // start exchanging information
            room.users.forEach((info, address) => {
                room.users.forEach((_, addr) => { 
                    if (address === addr) return;
                    // console.log(info);
                    // console.log(address);
                    sendMessage("&!RIE&#" + address + "&#" + info, addr);
                });
            });
            // close the room
            hotel.del(roomId);
        }
    } else {
        // notify user that the room is full even tho this should rarely happen.
        sendMessage("&!RF", fullAddr);
    }
}
