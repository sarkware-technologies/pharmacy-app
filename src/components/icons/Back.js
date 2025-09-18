import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../styles/colors';

const Back = ({ width=34, height=34, color = colors.primary }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Circle cx="17" cy="17" r="16.5" stroke="#2B2B2B"/>
            <Path d="M16.5383 22.5385L10.9999 17L16.5383 11.4615M11.7691 17H22.9999" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
    );
};

export default Back;