import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const RemoveHospitalCloseIcon = ({ width = 8, height = 8, color = '#777777' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Circle cx="6" cy="6" r="6" fill={color}/>
        <Path d="M4.07617 4.07812L7.92233 7.92428M4.07617 7.92428L7.92233 4.07812" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default RemoveHospitalCloseIcon;