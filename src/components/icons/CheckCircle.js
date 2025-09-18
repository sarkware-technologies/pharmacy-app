import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const CheckCircle = ({ width = 24, height = 24, color = colors.success }) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={color} />
        <Path
            d="M8 12l2 2 4-4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default CheckCircle;