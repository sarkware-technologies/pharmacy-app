import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const XCircle = ({ width = 24, height = 24, color = colors.gray }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <Path
            d="M15 9L9 15M9 9l6 6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default XCircle;