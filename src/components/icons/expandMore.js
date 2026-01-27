


import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ExpandMore = ({ width = 9, height = 6 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M1.00211 0C0.111203 0 -0.334968 1.07714 0.294997 1.70711L3.59507 5.00718C3.98559 5.3977 4.61876 5.3977 5.00928 5.00718L8.30936 1.70711C8.93932 1.07714 8.49315 0 7.60225 0H1.00211Z" fill="#2B2B2B" />
        </Svg>
    );
};

export default ExpandMore;