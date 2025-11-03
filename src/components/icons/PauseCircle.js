import React from 'react';
import Svg, { Path } from 'react-native-svg';

const PauseCircle = ({ width = 13, height = 13, color = '#2B2B2B' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M5.16667 4.5V8.5M7.83333 4.5V8.5M12.5 6.5C12.5 7.28793 12.3448 8.06815 12.0433 8.7961C11.7417 9.52405 11.2998 10.1855 10.7426 10.7426C10.1855 11.2998 9.52405 11.7417 8.7961 12.0433C8.06815 12.3448 7.28793 12.5 6.5 12.5C5.71207 12.5 4.93185 12.3448 4.2039 12.0433C3.47595 11.7417 2.81451 11.2998 2.25736 10.7426C1.70021 10.1855 1.25825 9.52405 0.956723 8.7961C0.655195 8.06815 0.5 7.28793 0.5 6.5C0.5 4.9087 1.13214 3.38258 2.25736 2.25736C3.38258 1.13214 4.9087 0.5 6.5 0.5C8.0913 0.5 9.61742 1.13214 10.7426 2.25736C11.8679 3.38258 12.5 4.9087 12.5 6.5Z" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default PauseCircle;