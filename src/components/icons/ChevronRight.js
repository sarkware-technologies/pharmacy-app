import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ChevronRight = ({ width = 10, height = 16, color = '#2B2B2B' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M1.625 1.25L8.375 8L1.625 14.75" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default ChevronRight;