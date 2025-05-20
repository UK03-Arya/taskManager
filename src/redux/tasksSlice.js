import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=20');
  return await response.json();
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    addTask: (state, action) => {
      state.items.push(action.payload);
    },
    editTask: (state, action) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    deleteTask: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    toggleStatus: (state, action) => {
      const task = state.items.find(t => t.id === action.payload);
      if (task) task.completed = !task.completed;
    },
    setTasks: (state, action) => {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addTask, editTask, deleteTask, toggleStatus, setTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
