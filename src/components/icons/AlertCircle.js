import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const AlertCircle = ({ width = 24, height = 24, fill = '#EF4444' }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Circle cx="12" cy="12" r="10" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M12 8V12" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M12 16H12.01" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default AlertCircle;