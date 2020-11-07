import React, { createContext, useReducer } from 'react';
import { videoReducer } from '../reducers/videoReducer';

export const VideoContext = createContext();



export const VideoContextProvider = ({ children }) => {
    const initialState = {
        playVideo: null, // hold video play time
        pauseVideo: null, // hold command timestamp

        // when transition is true, no player related socket event will
        // be emitted to the server. This prevents unintentional back and forth
        // event passing and provides consistency in video seek/pause.
        transition: false,
        videoChanging: false,
    };

    const [videoData, dispatch] = useReducer(videoReducer, initialState);

    return (
        <VideoContext.Provider value={{ videoData, dispatch }}>
            {children}
        </VideoContext.Provider>
    );
};