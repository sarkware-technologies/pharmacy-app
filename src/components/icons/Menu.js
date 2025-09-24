import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Menu = ({ width = 32, height = 32, color = '#000' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M7 8H20.5M7 16H25M7 24H16" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default Menu;