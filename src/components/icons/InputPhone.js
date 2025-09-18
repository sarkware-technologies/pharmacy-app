import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const InputPhone = ({ width = 14, height = 20, color = colors.textSecondary }) => (

    <Svg width={width} height={height} viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M5.5 4H8.5M11.286 1H2.714C1.768 1 1 1.806 1 2.8V17.2C1 18.194 1.768 19 2.714 19H11.286C12.233 19 13 18.194 13 17.2V2.8C13 1.806 12.233 1 11.286 1Z" stroke="#2B2B2B" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>

);

export default InputPhone;