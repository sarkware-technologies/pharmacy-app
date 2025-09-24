import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Email = ({ width = 14, height = 12, color = '#000' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M11.1667 0.833328H2.83333C1.72876 0.833328 0.833328 1.72876 0.833328 2.83333V9.16666C0.833328 10.2712 1.72876 11.1667 2.83333 11.1667H11.1667C12.2712 11.1667 13.1667 10.2712 13.1667 9.16666V2.83333C13.1667 1.72876 12.2712 0.833328 11.1667 0.833328Z" stroke="#909090" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M0.833328 3.33333L6.44333 5.91066C6.61794 5.99089 6.80783 6.03243 6.99999 6.03243C7.19216 6.03243 7.38205 5.99089 7.55666 5.91066L13.1667 3.33333" stroke="#909090" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default Email;