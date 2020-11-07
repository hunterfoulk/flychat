import io from 'socket.io-client';

// export const createConnection = (username, roomId = null, videoId = null, stream = null) => {
//     // create the socket connection with socket server
//     return new Promise((resolve) => {
//         const socket = io("http://localhost:8000", { path: '/socket' });
//         socket.on('connect', () => {
//             socket.emit('join', {
//                 roomId: roomId || socket.id,
//                 username,
//                 userId: socket.id,

//                 videoId,
//                 stream
//             });

//             resolve(socket);

//         });
//     });
// };






export const bindSocketEvents = (socket, dispatchFunc) => {
    if (!socket) return;

    const { userDispatch, videoDispatch } = dispatchFunc;


    socket.on('newMessage', (data) => {

        console.log("FIRED", data)

        switch (data.type) {
            case 'userJoin':
                console.log(data.payload.username)
                break;

            case 'changeVideo':
                console.log("FIRED")
                userDispatch({ type: 'UPDATE_VIDEO_ID', videoId: data.payload.videoId });
                break;

            case 'userMessage':
                console.log("FIREDDDDD")

                userDispatch({ type: 'UPDATE_MESSAGES', data });
                break;

            default:
                break;
        }
    });

    socket.on('updateUserList', (userList) => {
        console.log('new user list', userList);
        userDispatch({ type: 'UPDATE_USER_LIST', users: userList });
    });
};