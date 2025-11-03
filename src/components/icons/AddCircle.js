import React from 'react';
import Svg, { Path } from 'react-native-svg';

const AddCircle = ({ width = 13, height = 13, color = '#2B2B2B' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M6.5 12.5C9.81371 12.5 12.5 9.81371 12.5 6.5C12.5 3.18629 9.81371 0.5 6.5 0.5C3.18629 0.5 0.5 3.18629 0.5 6.5C0.5 9.81371 3.18629 12.5 6.5 12.5Z" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M3.5 6.5H9.50001" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M6.5 3.5V9.50001" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default AddCircle;