import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const Downarrow = ({ width = 16, height = 18, color = '#2B2B2B' }) => (
    <Svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M1.0021 0C0.111199 0 -0.334967 1.07714 0.294997 1.70711L2.88078 4.29289C3.27131 4.68342 3.90447 4.68342 4.295 4.29289L6.88079 1.70711C7.51075 1.07714 7.06458 0 6.17368 0H1.0021Z" fill={color} />
    </Svg>

);

export default Downarrow;