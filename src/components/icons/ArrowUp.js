import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ArrowUp = ({ width = 14, height = 7, color = '#fff' }) => (
    <Svg width={width} height={height} viewBox="0 0 14 7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M12.7929 7C13.2383 7 13.4614 6.46143 13.1464 6.14645L7.35355 0.353553C7.15829 0.158291 6.84171 0.158291 6.64645 0.353554L0.853552 6.14645C0.53857 6.46143 0.761654 7 1.20711 7H12.7929Z" fill={color}/>
    </Svg>
);

export default ArrowUp;