import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentVideoPath, setCurrentVideoPath] = useState(null);

  const getLocalFilePath = title => {
    const safeFileName = title.replace(/\s+/g, '_').toLowerCase() + '.mp4';
    return Platform.OS === 'ios'
      ? `${RNFS.DocumentDirectoryPath}/${safeFileName}`
      : `${RNFS.ExternalDirectoryPath}/${safeFileName}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products');
        const json = await response.json();
        const firstFew = json.products.slice(0, 5); 

        const formatted = await Promise.all(
          firstFew.map(async product => {
            const title = product.title;
            const description = product.description;
            const thumbnail = product.thumbnail;
            const url = 'https://www.w3schools.com/html/mov_bbb.mp4'; 
            const localPath = getLocalFilePath(title);
            const downloaded = await RNFS.exists(localPath);
            return {
              id: product.id.toString(),
              title,
              description,
              thumbnail,
              url,
              localPath,
              downloaded,
            };
          })
        );

        setVideos(formatted);
      } catch (error) {
        Alert.alert('Error', 'Failed to load videos from API.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateVideoStatus = useCallback((id, downloaded) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === id ? { ...video, downloaded } : video
      )
    );
  }, []);

  const downloadVideo = useCallback(
    async video => {
      if (video.downloaded) {
        try {
          await RNFS.unlink(video.localPath);
          updateVideoStatus(video.id, false);
          Alert.alert('Removed', `${video.title} has been removed.`);
        } catch (err) {
          Alert.alert('Error', 'Could not remove the video.');
        }
        return;
      }

      setProgress(prev => ({ ...prev, [video.id]: 0 }));

      const options = {
        fromUrl: video.url,
        toFile: video.localPath,
        background: true,
        progressDivider: 5,
        progress: res => {
          const percent = Math.floor((res.bytesWritten / res.contentLength) * 100);
          setProgress(prev => ({ ...prev, [video.id]: percent }));
        },
      };

      try {
        const downloadResult = RNFS.downloadFile(options);
        await downloadResult.promise;
        updateVideoStatus(video.id, true);
        Alert.alert('Downloaded', `${video.title} downloaded.`);
      } catch (err) {
        Alert.alert('Error', 'Download failed.');
      } finally {
        setProgress(prev => ({ ...prev, [video.id]: 0 }));
      }
    },
    [updateVideoStatus]
  );

  const playVideo = useCallback(path => {
    setCurrentVideoPath(path);
    setModalVisible(true);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  const renderVideoItem = ({ item }) => {
    const isDownloading = progress[item.id] > 0 && progress[item.id] < 100;

    return (
      <View style={styles.videoCard}>
        <TouchableOpacity
          onPress={() =>
            item.downloaded
              ? playVideo(item.localPath)
              : Alert.alert('Offline video', 'Please download first.')
          }
          style={styles.thumbnailContainer}
        >
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

          {isDownloading && (
            <Text style={styles.progressText}>Downloading: {progress[item.id]}%</Text>
          )}

          <TouchableOpacity
            onPress={() => downloadVideo(item)}
            style={[
              styles.downloadButton,
              item.downloaded && styles.downloadedButton,
              isDownloading && { opacity: 0.6 },
            ]}
            disabled={isDownloading}
          >
            <Text style={styles.buttonText}>{item.downloaded ? 'Remove' : 'Download'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}> Videos</Text>

      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        renderItem={renderVideoItem}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

          {currentVideoPath && (
            <Video
              source={{ uri: 'file://' + currentVideoPath }}
              style={styles.video}
              controls
              resizeMode="contain"
              paused={false}
              onError={() => Alert.alert('Video Error', 'Cannot play video')}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default Videos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: width * 0.065,
    fontWeight: '700',
    marginVertical: height * 0.02,
    color: '#111',
  },
  listContent: {
    paddingBottom: height * 0.05,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    padding: width * 0.03,
    marginBottom: height * 0.015,
    borderRadius: 10,
    elevation: 2,
  },
  thumbnailContainer: {
    marginRight: width * 0.03,
  },
  thumbnail: {
    width: width * 0.3,
    height: height * 0.18,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  description: {
    fontSize: width * 0.038,
    color: '#666',
    marginBottom: 6,
  },
  progressText: {
    fontSize: width * 0.035,
    color: '#555',
    marginBottom: 4,
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
    borderRadius: 7,
    minWidth: width * 0.22,
    alignItems: 'center',
  },
  downloadedButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: width * 0.038,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    padding: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  closeText: {
    fontSize: width * 0.045,
    color: 'white',
    fontWeight: '600',
  },
  video: {
    flex: 1,
    width,
  },
});
