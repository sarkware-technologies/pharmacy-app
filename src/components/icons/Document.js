import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const Document = ({ width = 16, height = 18, color = '#777777' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M0.5 7.33333C0.5 4.19083 0.5 2.61916 1.47667 1.64333C2.45333 0.667497 4.02417 0.666664 7.16667 0.666664H8.83333C11.9758 0.666664 13.5475 0.666664 14.5233 1.64333C15.4992 2.62 15.5 4.19083 15.5 7.33333V10.6667C15.5 13.8092 15.5 15.3808 14.5233 16.3567C13.5467 17.3325 11.9758 17.3333 8.83333 17.3333H7.16667C4.02417 17.3333 2.4525 17.3333 1.47667 16.3567C0.500833 15.38 0.5 13.8092 0.5 10.6667V7.33333Z" stroke={color}/>
        <Path d="M4.66675 7.33333H11.3334M4.66675 10.6667H8.83341" stroke={color} stroke-linecap="round"/>
    </Svg>
);

export default Document;