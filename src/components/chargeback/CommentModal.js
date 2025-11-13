import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from "../AppText"

const CommentModal = ({ visible, onClose }) => {
  const [comment, setComment] = useState('');
  
  const comments = [
    {
      id: '1',
      author: 'Abhishek123',
      text: 'lorem isum comment',
      time: '2 days ago',
    },
    {
      id: '2',
      author: 'Pratheesh123',
      text: 'lorem isum comment',
      time: '4 days ago',
    },
  ];

  const renderComment = ({ item }) => {
    const initial = item.author.charAt(0).toUpperCase();
    
    return (
      <View style={styles.commentItem}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{initial}</AppText>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <AppText style={styles.authorName}>{item.author}</AppText>
            <AppText style={styles.timeText}>{item.time}</AppText>
          </View>
          <AppText style={styles.commentText}>{item.text}</AppText>
        </View>
      </View>
    );
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      // Handle adding comment
      setComment('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Comment</AppText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add Comment"
              value={comment}
              onChangeText={setComment}
              multiline
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <AppText style={styles.doneButtonText}>Done</AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  commentsList: {
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    minHeight: 40,
  },
  doneButton: {
    backgroundColor: '#FFA500',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CommentModal;