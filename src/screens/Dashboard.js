import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import TaskFormScreen from './TaskForm';

const colorOptions = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD'];

const priorityOptions = ['Low', 'Medium', 'High'];

const Dashboard = () => {
  const navigation = useNavigation();
  const [showTaskModal, setShowTaskModal] = useState(false); 
  const [tasks, setTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [dateList, setDateList] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [editingTask, setEditingTask] = useState(null);
  const [buttonText, setButtonText] = useState(
    previewTask?.completed ? 'Done' : 'Mark as Done'
  );
  
  const [previewTask, setPreviewTask] = useState(null); 
  const [showPreviewModal, setShowPreviewModal] = useState(false); 
  useEffect(() => {
    setButtonText(previewTask?.completed ? 'Done' : 'Mark as Done');
  }, [previewTask]);
  
  useEffect(() => {
    generateDates();
    loadTasks();
  }, []);

  const generateDates = () => {
    const today = moment();
    const dates = Array.from({ length: 14 }).map((_, i) => {
      const date = moment(today).add(i - 3, 'days');
      return {
        dateString: date.format('YYYY-MM-DD'),
        dayShort: date.format('ddd'),
        dateNum: date.format('DD'),
        isToday: date.isSame(today, 'day'),
      };
    });
    setDateList(dates);
  };

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem('TASKS_BY_DATE');
      if (data) setTasks(JSON.parse(data));
      else setTasks({});
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('TASKS_BY_DATE', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const toggleTask = (taskId) => {
    if (!tasks[selectedDate]) return;
  
    const updated = tasks[selectedDate].map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks({ ...tasks, [selectedDate]: updated });
  };
  

  const deleteTask = (taskId) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!tasks[selectedDate]) return;
          const filtered = tasks[selectedDate].filter(task => task.id !== taskId);
          saveTasks({ ...tasks, [selectedDate]: filtered });
          setShowPreviewModal(false);
        },
      },
    ]);
  };

  const openPreview = (task) => {
    setPreviewTask(task);
    setShowPreviewModal(true);
  };

  const onEditFromPreview = () => {
    setEditingTask(previewTask);
    setShowPreviewModal(false);
    setShowTaskModal(true);
  };

  const updateTask = (updatedTask) => {
    if (!tasks[selectedDate]) return;

    const updated = tasks[selectedDate].map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    saveTasks({ ...tasks, [selectedDate]: updated });
    setEditingTask(null);
    setShowTaskModal(false);
  };

  const filteredTasks = (tasks[selectedDate] || []).filter(task => {
    if (filter === 'all') return true;
    if (filter === 'complete') return task.completed;
    if (filter === 'noncomplete') return !task.completed;
  });

  const renderDateItem = ({ item }) => {
    const isSelected = item.dateString === selectedDate;

    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.dateString)}
        style={[styles.dateCircle, isSelected && styles.selectedDateCircle]}
      >
        <Text style={styles.dayText}>{item.dayShort}</Text>

        <View style={[styles.dateNumberContainer, isSelected && styles.selectedDateNumberContainer]}>
          <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
            {item.dateNum}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const formattedDate = moment(selectedDate).format('dddd, MMMM D, YYYY');

  return (
    <View style={styles.container}>
      <Text style={styles.heading1}>{moment(selectedDate).format('MMMM YYYY')}</Text>
      <Text style={styles.heading}>{formattedDate}</Text>

     
      <View style={styles.dateFilterSection}>
  <FlatList
    data={dateList}
    keyExtractor={item => item.dateString}
    horizontal
    showsHorizontalScrollIndicator={false}
    renderItem={renderDateItem}
    contentContainerStyle={styles.dateListContainer}
  />

  <View style={styles.filterContainer}>
    <TouchableOpacity
      onPress={() => setFilter('all')}
      style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
    >
      <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>All</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setFilter('complete')}
      style={[styles.filterButton, filter === 'complete' && styles.filterButtonActive]}
    >
      <Text style={[styles.filterButtonText, filter === 'complete' && styles.filterButtonTextActive]}>Complete</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setFilter('noncomplete')}
      style={[styles.filterButton, filter === 'noncomplete' && styles.filterButtonActive]}
    >
      <Text style={[styles.filterButtonText, filter === 'noncomplete' && styles.filterButtonTextActive]}>Non Complete</Text>
    </TouchableOpacity>
  </View>
</View>



<FlatList
  data={filteredTasks}
  keyExtractor={item => item.id}
  style={{ flex: 1 }}
  renderItem={({ item, index }) => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 8 }}>
      <View style={{ width: 30, alignItems: 'center' }}>
        <View style={{
          width: 12,
          height: 12,
          borderRadius: 12,
          backgroundColor: '#f28b82',
          marginTop: 5,
        }} />

        {index !== filteredTasks.length - 1 && (
          <View style={{
            flex: 1,
            width: 2,
            backgroundColor: 'gray',
            marginTop: 2,
          }} />
        )}
      </View>

      <TouchableOpacity
        onPress={() => openPreview(item)}
        style={[
          styles.taskItemContainer,
          { 
            backgroundColor: item.color || '#eee', 
            flex: 1,
            padding: 12,
            borderRadius: 8,
          }
        ]}
      >
        <Text
          style={[
            styles.taskItem,
            { textDecorationLine: item.completed ? 'line-through' : 'none' },
          ]}
        >
          {item.text}
        </Text>
      </TouchableOpacity>
    </View>
  )}
  ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet</Text>}
/>


      <View style={styles.inputRow}>
        <TouchableOpacity
          onPress={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}
          style={styles.plusCircleButton}
        >
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {showTaskModal && (
        <TaskFormScreen
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onAddTask={(newTask) => {
            if (editingTask) {
              updateTask(newTask);
            } else {
              const updated = [...(tasks[selectedDate] || []), newTask];
              saveTasks({ ...tasks, [selectedDate]: updated });
              setShowTaskModal(false);
            }
          }}
          selectedDate={selectedDate}
          taskToEdit={editingTask}
        />
      )}

      <Modal
  visible={showPreviewModal}
  animationType="fade"
  transparent
  onRequestClose={() => setShowPreviewModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.previewModalContainer}>
      <Text style={styles.previewTitle}>📋 Task Details</Text>

      {previewTask && (
        <>
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>📝 Title:</Text>
            <Text style={styles.previewValue}>{previewTask.text}</Text>
          </View>

          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>🧾 Description:</Text>
            <Text style={styles.previewValue}>
              {previewTask.description || 'N/A'}
            </Text>
          </View>

          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>📅 Due Date:</Text>
<Text style={styles.previewValue}>
  {moment(previewTask.date).format('DD MMM YYYY')} 
</Text>

          </View>

          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>⚡ Priority:</Text>
            <Text style={styles.previewValue}>{previewTask.priority || 'N/A'}</Text>
          </View>

          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>✅ Completed:</Text>
            <Text style={styles.previewValue}>
              {previewTask.completed ? 'Yes' : 'No'}
            </Text>
          </View>

         

          <View style={styles.previewButtonsContainer}>
          <TouchableOpacity
  style={styles.doneButton}
  onPress={() => {
    toggleTask(previewTask.id);   
    setButtonText('Done');        
  }}
>
  <Text style={styles.buttonText}>{buttonText}</Text>
</TouchableOpacity>



            <TouchableOpacity style={styles.editButton} onPress={onEditFromPreview}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTask(previewTask.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPreviewModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>

    </View>
  );
};


export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  heading1: {
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateListContainer: {
    paddingVertical: 5,
    marginVertical: 5,
    height: 70,
  },
  dateCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 4,
    backgroundColor: 'white',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  dayText: {
    fontSize: 13,
    color: '#555',
  },
  dateNumberContainer: {
    marginTop: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateNumberContainer: {
    backgroundColor: '#5F25FF',
    borderRadius: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
  taskItemContainer: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 5,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskItem: {
    fontSize: 18,
    flexShrink: 1,
  
    

    marginVertical: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 10,
  },
  plusCircleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5F25FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 30,
    color: 'white',
  },
  filterContainer: {
    flexDirection: 'row',
    position:'relative',

    marginBottom: 10,
    
  },

  
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5F25FF',
  },

  
  filterButtonActive: {
    backgroundColor: '#5F25FF',
  },
  filterButtonText: {
    color: '#5F25FF',
  },
  filterButtonTextActive: {
    color: '#fff',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 12,
    alignItems: 'center',
    
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  
  previewLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  
  previewValue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    flex: 2,
  },
  previewLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
 
  
  colorBox: {
    width: 50,
    height: 20,
    marginVertical: 8,
    borderRadius: 4,
  },
  previewButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    padding: 8,
  },
  closeButtonText: {
    color: '#5F25FF',
    fontWeight: 'bold',
  },
});

