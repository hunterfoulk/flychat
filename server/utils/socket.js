const Rooms = require("./Rooms")

const generateServerMessage = (type, payload = {}) => {
    return {
        type,
        payload,
    };
};

class UserClass {

    constructor(userId, username, roomID, peer) {
        this.userId = userId
        this.username = username
        this.roomID = roomID
        this.peer = peer
    }

}


exports.setupIO = (io) => {


    io.on('connection', socket => {
        let User;


        console.log("SOCKET", socket.id)
        socket.on("join room", (data) => {
            const { roomID, username, videoId, stream } = data;
            console.log("STREAM FOR PERSON", stream)
            console.log("ROOM ID", roomID)
            console.log("username", username)
            User = new UserClass(socket.id, username, roomID)


            if (!videoId) {
                console.log("IF FIRED")
                Rooms.addUser({ roomID, User });

                const room = Rooms.getRoom(roomID)
                console.log("this is the room yo", room)
                socket.emit("newMessage", generateServerMessage("changeVideo", {
                    videoId: room.videoId
                })
                )


            } else {

                console.log("ELSE FIRED")
                Rooms.addRoom(roomID, videoId);
                Rooms.addUser({ roomID, User });
                Rooms.setVideoId(roomID, videoId);

            }

            let users = Rooms.getUserList(roomID)
            let filteredUsers = users.filter(user => user.userId !== socket.id)
            console.log("USERS", users)
            console.log("filteredUsers", filteredUsers)

            socket.emit("all users", filteredUsers);
        });

        // socket.on("attach peer", payload => {
        //     console.log("payload", payload.callerID)
        //     let userId = payload.callerID
        //     User[userId].peer = payload.peer
        //     console.log("USER", User)

        // })

        socket.on("sending signal", payload => {
            console.log("sending signal", payload.usersToSignal.username)

            io.to(payload.usersToSignal.userId).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
        });

        socket.on("returning signal", payload => {
            console.log("RETURNING", payload.id)
            socket.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
        });


        socket.on('disconnect', () => {
            console.log("disconnect fired")

            let users = Rooms.getUserList(User.roomID)
            let newUsers = users.filter(user => user.userId !== User.userId)
            let userToRemove = users.find(user => user.userId === User.userId)

            // console.log("NEW USERS", newUsers)
            newUsers.forEach((user) => {
                console.log("FOR EACH USER", user)
                io.to(user.userId).emit('removeUser', userToRemove)


            })

        });

    });
}
