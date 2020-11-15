// const { uniqBy, remove, isEmpty, uniq } = require('lodash')

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
        // console.log("REMOVE FIREDDD", User)
        let roomID = User.roomID
        // console.log("filtered room id", roomID)
        let userFiltered = this.rooms[roomID].users.filter(user => user.userId !== User.userId);
        this.rooms[roomID].users = userFiltered
        console.log("FILTERED USERS IN CLASS", userFiltered)


    }

    // removeUser(roomID) {
    //     console.log("FIREDDD")

    //     const room = this.rooms[roomID]

    //     if (room) {
    //         return room.users.filter(user => user.userId !== userId)
    //     }

    // }


}

class TabsClass {
    constructor() {
        this.tabs = []
    }
    addTab({ tabId, local, foreign }) {
        this.tabs.push(new TabClass(tabId, local, foreign))
    }
    getAllTabs(user) {
        return this.tabs
    }
    getTab(tabId) {
        return this.tabs.find(t => t.tabId === tabId)
    }
    getUsersTabs(user) {
        const usersTabs = this.tabs.filter(t => t.localSocket.userId !== user.userId)
        return usersTabs
    }
}

class TabClass {
    constructor(tabId, local, foreign) {
        this.tabId = tabId
        this.localSocket = local
        this.foreignSocket = foreign
        this.messages = []
    }

    setMessages(message) {
        console.log("message sent", message)
        this.messages.push(message)
    }

}

module.exports = {
    Rooms: new Rooms(),
    Tabs: new TabsClass(),
    TabClass
}