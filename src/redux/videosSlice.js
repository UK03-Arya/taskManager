import { createSlice } from '@reduxjs/toolkit';

const videosSlice = createSlice({
  name: 'videos',
  initialState: {
    list: [],
    downloaded: [],
  },
  reducers: {
    setVideoList: (state, action) => {
      state.list = action.payload;
    },
    addDownloaded: (state, action) => {
      state.downloaded.push(action.payload);
    }
  }
});

export const { setVideoList, addDownloaded } = videosSlice.actions;
export default videosSlice.reducer;
