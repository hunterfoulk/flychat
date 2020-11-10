const Rooms = require("./Rooms")

const generateServerMessage = (type, payload = {}) => {
    return {
        type,
        payload,
    };
};


class RoomClass {
    constructor(roomID, videoId) {
        this.roomID = roomID
        this.videoId = videoId
        this.users = []
    }
}

class UserClass {

    constructor(userId, username, peer, signal) {
        this.username = username
        this.userId = userId
        this.peer = peer
        this.signal = signal
    }

    getPeer() {
        return this.signal
    }
    setPeer(signal) {
        console.log("taking in signal")
        this.signal = signal
    }
}

exports.setupIO = (io) => {

    io.on('connection', socket => {

        let Room;
        let User;

        console.log("SOCKET", socket.id)
        socket.on("join room", (data) => {
            const { roomID, username, videoId, signal, peer } = data;

            // console.log("stream", stream)
            Room = new RoomClass(roomID, videoId)
            User = new UserClass(socket.id, username, peer, signal)

            // console.log("ROOM ID", roomID)
            // console.log("username", username)
            // console.log("peer", peer)


            if (!videoId) {
                console.log("IF FIRED")
                Rooms.addUser({ roomID: Room.roomID, User });

                const room = Rooms.getRoom(Room.roomID)
                // console.log("this is the room yo", room)
                socket.emit("newMessage", generateServerMessage("changeVideo", {
                    videoId: room.videoId
                })
                )

            } else {

                console.log("ELSE FIRED")
                Rooms.addRoom({ roomID: Room.roomID, videoId });
                Rooms.setVideoId({ roomID: Room.roomID, videoId });
                Rooms.addUser({ roomID: Room.roomID, User });



            }

            let users = Rooms.getUserList(Room.roomID)
            let filteredUsers = users.filter(user => user.userId !== socket.id)

            socket.emit("all users", users);

        });

        socket.on("sending signal", payload => {
            console.log("sending signal")
            User.setSignal(payload)
            io.to(payload.userToSignal.userId).emit('user joined', { signal: payload.signal, callerID: payload.callerID, stream: payload.stream });
        });

        socket.on("returning signal", payload => {
            console.log("payload caller ids", payload.callerID)
            socket.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id, stream: payload.stream });
        });

        // socket.on('disconnect', () => {
        //     console.log("disconnect fired")


        //     let users = Rooms.getUserList(User.roomId)
        //     console.log("first users", users)
        //     let newUsers = users.filter(user => user.userId !== User.userId)
        //     console.log("NEW USERS", newUsers)
        //     io.to(User.roomId).emit('all users', newUsers)

        // });

    });
}


