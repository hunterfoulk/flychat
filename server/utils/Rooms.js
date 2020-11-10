class Rooms {

    constructor() {
        this.rooms = {}; // { users: [...{name, id}], videoURL: ''}
        this.userMap = {}; // maps socket id to rooms
    }

    addRoom(roomID, videoId) {
        if (!this.rooms[roomID]) this.rooms[roomID] = { users: [], videoId };

    }

    addUser({ roomID, User }) {

        console.log("room ID", roomID)
        this.rooms[roomID].users.push(User);
        console.log("roooooom", this.rooms[roomID].users)
        // console.log("ROOMS", this.rooms[roomID].users)

    }


    setVideoId(roomId, videoId) {
        if (this.rooms[roomId]) {
            this.rooms[roomId].videoId = videoId
        }
        console.log("video is set!")
    }


    getUserList(roomID) {
        console.log("room id for get", roomID)
        const room = this.rooms[roomID]

        if (room) {
            return room.users
        }
    }

    getRoom(roomId) {
        return this.rooms[roomId]

    }

    removeUser(User) {
        console.log("the user", User)
        let roomID = User.roomId
        console.log("filtered room id", roomID)
        let room = this.rooms[roomID];

        // let filtered = room.users.filter(user => user.userId !== User.userId)
        // console.log("filtered",filtered)
        return (
            room.users.filter(user => user.userId !== User.userId)
            // console.log("filtered", filtered)


        )


    }

    removeUser(roomID, userId) {
        console.log("FIREDDD")

        const room = this.rooms[roomID]

        if (room) {
            return room.users.filter(user => user.userId !== userId)
        }

    }


}

module.exports = new Rooms(); 