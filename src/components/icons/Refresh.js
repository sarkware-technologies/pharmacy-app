import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Refresh = ({ width = 24, height = 24, fill = '#fff' }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path 
            d="M21 2V8H15" 
            stroke={fill} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <Path 
            d="M3 12C3 10.8181 3.23279 9.64778 3.68508 8.55585C4.13738 7.46392 4.80031 6.47177 5.63604 5.63604C6.47177 4.80031 7.46392 4.13738 8.55585 3.68508C9.64778 3.23279 10.8181 3 12 3C13.5445 3 15.0506 3.46919 16.3124 4.34824C17.5743 5.22729 18.5313 6.47672 19.0503 7.92172L21 12" 
            stroke={fill} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <Path 
            d="M3 22V16H9" 
            stroke={fill} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <Path 
            d="M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.4555 21 8.94937 20.5308 7.68756 19.6518C6.42575 18.7727 5.46873 17.5233 4.94969 16.0783L3 12" 
            stroke={fill} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </Svg>
);

export default Refresh;