import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';
import videosReducer from './videosSlice';

export default configureStore({
  reducer: {
    tasks: tasksReducer,
    videos: videosReducer,
  },
});