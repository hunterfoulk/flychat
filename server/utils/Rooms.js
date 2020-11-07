class Rooms {

    constructor() {
        this.rooms = {}; // { users: [...{name, id, roomId}], videoURL: ''}
        this.userMap = {}; // maps socket id to rooms
    }

    addRoom(roomID, videoId) {
        if (!this.rooms[roomID]) this.rooms[roomID] = { users: [], videoId };

    }

    addUser(roomID, username, userId) {
        this.rooms[roomID].users.push({ username, userId });
        // console.log(this.rooms[roomID].users)
        console.log("ROOMS", this.rooms)

    }


    setVideoId(roomId, videoId) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].videoId = videoId
        }
        console.log("video is set!")
    }


    getUserList(roomId) {
        const room = this.rooms[roomId]

        if (room) {
            return room.users
        }
    }

    getRoom(roomId) {
        return this.rooms[roomId]

    }

    getUser(userId) {

        const users = this.getUserList(userId)
        return users.find((user) => user.id === userId)

    }


}

module.exports = new Rooms(); 