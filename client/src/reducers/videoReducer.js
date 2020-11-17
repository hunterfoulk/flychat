export const videoReducer = (state, action) => {
    console.log("reducer action", action)
    switch (action.type) {
        case 'UPDATE_TRANSITION':
            return {
                ...state,
                transition: action.transition,
            };
        case 'PLAY_VIDEO':
            return {
                ...state,
                playVideo: action.currentTime,
            };
        case 'PAUSE_VIDEO':
            return {
                ...state,
                pauseVideo: action.timestamp,
            };
        case 'CHANGE_VIDEO':
            return {
                ...state,
                videoChanging: action.videoChanging,
            };
        case 'RESET_VIDEO_STATE':
            return {
                ...state,
                playVideo: null,
                pauseVideo: null,
            };
        default:
            break;
    }
};