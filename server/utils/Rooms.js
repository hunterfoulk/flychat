const { uniqBy, remove, isEmpty, uniq } = require('lodash')

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

    removeRoom(roomID) {

        this.rooms = remove(this.rooms, r => r.roomID !== roomID)
        console.log("new rooms", this.rooms)

    }

    removeUser(User) {
        // console.log("REMOVE FIREDDD", User)
        let roomID = User.roomID
        // console.log("filtered room id", roomID)
        let userFiltered = this.rooms[roomID].users.filter(user => user.userId !== User.userId);
        this.rooms[roomID].users = userFiltered
        // console.log("FILTERED USERS IN CLASS", userFiltered)


    }



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
        console.log("GET USERS TABS", user)
        const usersTabs = this.tabs.filter(t => t.localSocket.userId === user)
        console.log("USERS TABS", usersTabs)
        return usersTabs
    }

    getUsersTabsForeign(user) {
        console.log("GET USERS TABS", user)
        const usersTabs = this.tabs.filter(t => t.foreignSocket.userId === user)
        console.log("USERS TABS", usersTabs)
        return usersTabs
    }

    removeTabs(userId) {
        // console.log("find tab fired", this.tabs)
        console.log("this the the user id for tab", userId)
        let tabs = this.tabs.filter(i => i.localSocket.userId !== userId)
        console.log("tabs", tabs)
        this.tabs = tabs

    }

    findTab(tabId) {


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