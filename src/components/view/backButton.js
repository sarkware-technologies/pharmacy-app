import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import BackArrow from '../icons/BackArrow';

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 10 }}>
      <BackArrow />
    </TouchableOpacity>
  );
};

export default BackButton;
