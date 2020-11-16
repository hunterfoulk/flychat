import React, { createContext, useReducer } from 'react';
import { videoReducer } from '../reducers/videoReducer';
export const VideoContext = createContext();



export const VideoContextProvider = ({ children }) => {
    const initialState = {
        playVideo: null,
        pauseVideo: null,
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