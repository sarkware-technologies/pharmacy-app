import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const EyeOpen = ({ width = 24, height = 24, color = '#000' }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle
            cx="12"
            cy="12"
            r="3"
            stroke={color}
            strokeWidth="2"
        />
    </Svg>
);

export default EyeOpen;