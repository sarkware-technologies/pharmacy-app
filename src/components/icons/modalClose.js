


import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const ModalClose = ({ width = 22, height = 22, stroke = "#909090", fill = "white" }) => (

    <Svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Circle cx="11" cy="11" r="10.5" fill={fill} stroke={stroke} />
        <Path d="M7.7948 7.79492L14.2051 14.2052M7.7948 14.2052L14.2051 7.79492" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default ModalClose;

