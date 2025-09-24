import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Download = ({ width = 20, height = 20, color = '#909090' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M1 14.0689V15.1484C1 16.0108 1.34258 16.8378 1.95238 17.4476C2.56217 18.0574 3.38923 18.4 4.25161 18.4H15.0903C15.9527 18.4 16.7798 18.0574 17.3896 17.4476C17.9994 16.8378 18.3419 16.0108 18.3419 15.1484V14.0645M9.67097 1.60001V13.5226M9.67097 13.5226L13.4645 9.72904M9.67097 13.5226L5.87742 9.72904" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default Download;


