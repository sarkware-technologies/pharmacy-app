import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ChevronLeft = ({ width = 10, height = 16, color = '#2B2B2B' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M8.375 1.25L1.625 8L8.375 14.75" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
);

export default ChevronLeft;