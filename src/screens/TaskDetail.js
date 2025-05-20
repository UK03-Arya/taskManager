import React from 'react';
import { View, Text, Button, StyleSheet, Dimensions, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { deleteTask, toggleStatus } from '../redux/tasksSlice';

const { width, height } = Dimensions.get('window');

const TaskDetail = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { task } = route.params;

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTask(task.id));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleToggle = () => {
    dispatch(toggleStatus(task.id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.status}>
        Status: {task.completed ? '✅ Completed' : '❌ Incomplete'}
      </Text>
      <View style={styles.buttons}>
        <Button
          title={task.completed ? 'Mark Incomplete' : 'Mark Complete'}
          onPress={handleToggle}
        />
        <Button title="Edit" onPress={() => navigation.navigate('TaskForm', { task })} />
        <Button title="Delete" onPress={handleDelete} color="red" />
      </View>
    </View>
  );
};

export default TaskDetail;

const styles = StyleSheet.create({
  container: { flex: 1, padding: width * 0.05 },
  title: { fontSize: width * 0.06, fontWeight: 'bold', marginBottom: height * 0.02 },
  status: { fontSize: width * 0.045, marginBottom: height * 0.03 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
