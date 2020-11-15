export const userReducer = (state, action) => {


    switch (action.type) {
        case 'UPDATE_USERNAME':
            return {
                ...state,
                username: action.username,
            };
        case 'UPDATE_VIDEO_ID':
            return {
                ...state,
                videoId: action.videoId,
            };
        case 'UPDATE_USER_LIST':
            return {
                ...state,
                userList: action.userList,
            };
        case 'UPDATE_MESSAGES':
            const username = action.username;
            const message = action.message;
            const time = action.time;
            console.log("TIME", time)

            return { ...state, messages: [...state.messages, { username, message, time, },], };
        default:
            return state;
    }
};