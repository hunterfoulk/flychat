const short = require('short-uuid');
const { Rooms, Tabs, TabClass } = require("./Rooms")

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
                console.log(User)


            }

            let users = Rooms.getUserList(roomID)
            console.log("USERS", users)
            let newUsers = users.filter(user => user.userId !== User.userId)
            newUsers.forEach((user) => {
                io.to(user.userId).emit("newMessage", generateServerMessage("userJoined", {
                    username: User.username
                })
                )

            })

            users.forEach((user) => {

                io.to(user.userId).emit("all users", users);
            })

        });



        socket.on("createMessage", (message) => {
            console.log("new message data", message)
            let roomID = User.roomID

            let users = Rooms.getUserList(roomID)
            // console.log("USERS FOR MESSAGE", users)
            users.forEach((user) => {
                console.log("for each fired")
                io.to(user.userId).emit("newMessageCreated", { User, message })

            })
        })


        socket.on("createPrivateMessage", ({ userId, message }) => {
            console.log("new message data", message)
            console.log("USER that sent pm", User)
            console.log("USERS id ", userId)



            // io.to(user.userId).emit("emitPrivateMessage", { User, message })


        })




        socket.on("typing", (payload) => {
            let username = payload.username
            let users = Rooms.getUserList(User.roomID)
            console.log(username + "is typing")
            users.forEach((user) => {
                io.to(user.userId).emit("typing", username);
            })

        })

        socket.on("notTyping", (payload) => {
            let username = payload.username
            let users = Rooms.getUserList(User.roomID)
            console.log(username, "stopped typing");
            users.forEach((user) => {
                io.to(user.userId).emit("notTyping", username);
            })
        })



        socket.on("createNewTab", (payload) => {
            const tabId = short.generate()
            console.log("payload", payload)
            Tabs.addTab({ tabId: tabId, local: User, foreign: payload })

            console.log(Tabs.getAllTabs())
            tabs = Tabs.getUsersTabs(User.userId)
            console.log("TABS", tabs)

            io.to(User.userId).emit("send tabs", { tabs: tabs, tab: "ROOM" })
        })

        socket.on("newTabMessage", (payload) => {
            console.log("MESSAGE", payload.message)
            const currentTab = Tabs.getTab(payload.tab.tabId)

            currentTab.setMessages({ user: User, message: payload.message })

            const localUserTabs = Tabs.getUsersTabs(payload.tab.localSocket.userId)
            const foreignUserTabs = Tabs.getUsersTabs(payload.tab.foreignSocket.userId)
            console.log("tabsss", foreignUserTabs)
            io.to(payload.tab.localSocket.userId).emit("send tabs", { tabs: localUserTabs, tab: currentTab })
            io.to(payload.tab.foreignSocket.userId).emit("send tabs", { tabs: foreignUserTabs, tab: currentTab })

        })

        socket.on('disconnect', async () => {

            if (User === undefined) return

            console.log("disconnect fired", User)
            Rooms.removeUser(User)

            let users = Rooms.getUserList(User.roomID)

            console.log("new users", users)


            // console.log("NEW USERS", newUsers)
            users.forEach((user) => {
                console.log("FOR EACH USER", user)
                io.to(user.userId).emit('userLeft', User.username)

                io.to(user.userId).emit('updateUserList', users)


            })

        });

    });
}
