import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const FilterCheck = ({ width = 16, height = 16, color = '#F7941E' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Rect width="16" height="16" rx="4" fill={color}/>
        <Path d="M11.5 5L6.34375 10.1562L4 7.8125" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
);

export default FilterCheck;