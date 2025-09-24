import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Details = ({ width = 14, height = 16, color = '#F7941E' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M1 6.66668C1 4.15268 1 2.89534 1.78133 2.11468C2.56267 1.33401 3.81933 1.33334 6.33333 1.33334H7.66667C10.1807 1.33334 11.438 1.33334 12.2187 2.11468C12.9993 2.89601 13 4.15268 13 6.66668V9.33334C13 11.8473 13 13.1047 12.2187 13.8853C11.4373 14.666 10.1807 14.6667 7.66667 14.6667H6.33333C3.81933 14.6667 2.562 14.6667 1.78133 13.8853C1.00067 13.104 1 11.8473 1 9.33334V6.66668Z" stroke={color} strokeWidth="1.2"/>
        <Path d="M4.33301 6.66672H9.66634M4.33301 9.33338H7.66634" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </Svg>
);

export default Details;