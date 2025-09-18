import React from 'react';
import { Image, View } from 'react-native';

const LoginPic = ({ width = 241, height = 195 }) => {
    return (
        <Image 
            source={require('../../assets/images/login-pic.png')}
            style={{ width, height }}
            resizeMode="contain"
        />
    );
};

export default LoginPic;