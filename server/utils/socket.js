const Rooms = require("./Rooms")

const generateServerMessage = (type, payload = {}) => {
    return {
        type,
        payload,
    };
};




exports.setupIO = (io) => {
    io.on('connection', socket => {
        console.log("SOCKET", socket.id)
        socket.on("join room", (data) => {
            const { roomID, username, videoId } = data;
            console.log("ROOM ID", roomID)
            console.log("username", username)


            if (!videoId) {
                console.log("IF FIRED")
                let testusername = "jimmy"
                Rooms.addUser(roomID, testusername, socket.id);

                const room = Rooms.getRoom(roomID)
                console.log("this is the room yo", room)
                socket.emit("newMessage", generateServerMessage("changeVideo", {
                    videoId: room.videoId
                })
                )


            } else {

                console.log("ELSE FIRED")
                Rooms.addRoom(roomID, videoId);
                Rooms.addUser(roomID, username, socket.id);
                Rooms.setVideoId(roomID, videoId);

            }


            let users = Rooms.getUserList(roomID)
            let filteredUsers = users.filter(user => user.userId !== socket.id)
            console.log("USERS", users)
            console.log("filteredUsers", filteredUsers)

            socket.emit("all users", filteredUsers);
        });

        socket.on("sending signal", payload => {
            console.log("sending signal", payload.userToSignal.username)

            io.to(payload.userToSignal.userId).emit('user joined', { signal: payload.signal, callerID: payload.callerID, username: payload.userToSignal.username });
        });

        socket.on("returning signal", payload => {
            console.log("RETURNING", payload.id)
            socket.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
        });

        socket.on('disconnect', () => {

        });

    });
}


