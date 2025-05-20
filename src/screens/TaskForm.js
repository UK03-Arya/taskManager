import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Alert,
} from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

const colorOptions = ['#FEE440', '#FF6EC7', '#8EF6E4', '#7DE2D1', '#B79CED'];
const priorityOptions = ['Low', 'Medium', 'High'];

const TaskForm = ({ visible, onClose, onAddTask, selectedDate, taskToEdit }) => {
  const [taskText, setTaskText] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState('12:00 PM');
  const [color, setColor] = useState(colorOptions[0]);
  const [priority, setPriority] = useState('Medium');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTaskText(taskToEdit.text || '');
      setDescription(taskToEdit.description || '');
      setDate(taskToEdit.date || selectedDate);
      setTime(taskToEdit.time || '12:00 PM');
      setColor(taskToEdit.color || colorOptions[0]);
      setPriority(taskToEdit.priority || 'Medium');
    } else {
      setTaskText('');
      setDescription('');
      setDate(selectedDate);
      setTime('12:00 PM');
      setColor(colorOptions[0]);
      setPriority('Medium');
    }
  }, [taskToEdit, selectedDate, visible]);

  const onSubmit = () => {
    if (!taskText.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    if (!date || !moment(date, 'YYYY-MM-DD', true).isValid()) {
      Alert.alert('Error', 'Enter a valid due date (YYYY-MM-DD)');
      return;
    }
    if (time && !moment(time, ['h:mm A', 'H:mm'], true).isValid()) {
      Alert.alert('Error', 'Enter a valid time (e.g., 12:00 PM)');
      return;
    }

    const newTask = {
      id: taskToEdit ? taskToEdit.id : Date.now().toString(),
      text: taskText.trim(),
      description: description.trim(),
      date,
      time,
      color,
      priority,
      completed: taskToEdit ? taskToEdit.completed : false,
    };
    onAddTask(newTask);
  };

  const onChangeDate = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setDate(moment(selected).format('YYYY-MM-DD'));
    }
  };

  const displayDate = date ? moment(date).format('YYYY-MM-DD') : '';
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>{taskToEdit ? 'Edit Task' : 'Add New Task'}</Text>

             <TextInput
              placeholder="Title *"
              placeholderTextColor={'#999'}
              style={styles.input}
              value={taskText}
              onChangeText={setTaskText}
            />

            <TextInput
              placeholder="Description"
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <TextInput
                  placeholder="Due Date (YYYY-MM-DD) *"
                  style={styles.input}
                  value={displayDate}
                  editable={false}
                />
              </View>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date ? new Date(date) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeDate}
                minimumDate={new Date()} 
              />
            )}

            <TextInput
              placeholder="Time (e.g., 12:00 PM)"
              style={styles.input}
              value={time}
              onChangeText={setTime}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Priority:</Text>
              <View style={styles.priorityOptions}>
                {priorityOptions.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.priorityOption,
                      priority === item && styles.prioritySelected,
                    ]}
                    onPress={() => setPriority(item)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        priority === item && styles.priorityTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Color:</Text>
              <View style={styles.colorOptions}>
                {colorOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      color === c && styles.colorSelected,
                    ]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={onSubmit}>
                <Text style={styles.buttonText}>{taskToEdit ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={[styles.buttonText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default TaskForm;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  selectorContainer: {
    marginBottom: 15,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  prioritySelected: {
    backgroundColor: '#7DE2D1',
  },
  priorityText: {
    color: '#333',
    fontWeight: '600',
  },
  priorityTextSelected: {
    color: '#fff',
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#7DE2D1',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
