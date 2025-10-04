import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const Pricing = ({ width = 20, height = 20, color = '#B8B8B8' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Circle cx="9.99999" cy="9.99999" r="9.33333" fill={color}/>
        <Path d="M12.8718 5.69229H7.1282M12.8718 8.56409H7.1282M10 14.3077L7.1282 11.4359H8.5641C9.32575 11.4359 10.0562 11.1333 10.5948 10.5948C11.1333 10.0562 11.4359 9.32573 11.4359 8.56409C11.4359 7.80244 11.1333 7.07199 10.5948 6.53342C10.0562 5.99485 9.32575 5.69229 8.5641 5.69229" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default Pricing;