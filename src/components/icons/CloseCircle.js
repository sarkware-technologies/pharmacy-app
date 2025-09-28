import React from 'react';
import Svg, { Path } from 'react-native-svg';

const CloseCircle = ({ width = 28, height = 28, color = '#909090' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M17.6875 17.75L10.1875 10.25M10.1875 17.75L17.6875 10.25M26.4375 14C26.4375 7.09625 20.8412 1.5 13.9375 1.5C7.03375 1.5 1.4375 7.09625 1.4375 14C1.4375 20.9037 7.03375 26.5 13.9375 26.5C20.8412 26.5 26.4375 20.9037 26.4375 14Z" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
);

export default CloseCircle;