import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ArrowDown = ({ width = 14, height = 7, color = '#fff' }) => (
    <Svg width={width} height={height} viewBox="0 0 14 7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M12.7929 0C13.2383 0 13.4614 0.538571 13.1464 0.853553L7.35355 6.64645C7.15829 6.84171 6.84171 6.84171 6.64645 6.64645L0.853552 0.853552C0.53857 0.53857 0.761654 0 1.20711 0H12.7929Z" fill={color}/>
    </Svg>
);

export default ArrowDown;