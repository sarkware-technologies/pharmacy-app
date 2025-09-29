import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ChargebackIcon = ({ width = 24, height = 24, color = '#fff' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M12 3C11.0235 3.50906 2.17992 9.76247 1.71429 10.3769V13.7622C2.35961 13.774 10.9371 7.03317 12 6.71302C13.0629 7.03317 21.6404 13.774 22.2857 13.7622V10.3769C21.82 9.76247 12.9765 3.50902 12 3ZM12 10.2378C11.0235 10.7468 2.17992 17.0002 1.71429 17.6147V21C2.35961 21.0119 10.9371 14.271 12 13.9508C13.0629 14.271 21.6404 21.0119 22.2857 21V17.6146C21.82 17.0002 12.9765 10.7468 12 10.2378Z" fill={color}/>
    </Svg>
);

export default ChargebackIcon;