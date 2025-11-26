import React from 'react';
import Svg, { Path } from 'react-native-svg';

const PhamacySearchNotFound = ({ width = 37, height = 37, color = '#777777' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path 
            d="M14.5417 14.5417L21.0417 21.0417M21.0417 14.5417L14.5417 21.0417M28.9348 28.9933L35.6082 35.6667M33.5 17.25C33.5 21.5598 31.788 25.693 28.7405 28.7405C25.693 31.788 21.5598 33.5 17.25 33.5C12.9402 33.5 8.80698 31.788 5.75951 28.7405C2.71205 25.693 1 21.5598 1 17.25C1 12.9402 2.71205 8.80698 5.75951 5.75951C8.80698 2.71205 12.9402 1 17.25 1C21.5598 1 25.693 2.71205 28.7405 5.75951C31.788 8.80698 33.5 12.9402 33.5 17.25Z" 
            stroke={color} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </Svg>
);

export default PhamacySearchNotFound;