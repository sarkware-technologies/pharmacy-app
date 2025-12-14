import React from 'react';
import Svg, { Path, Circle, G, Mask } from 'react-native-svg';
import { colors } from '../../styles/colors';

const SwappingIcon = ({ width = 62, height = 62 }) => {
    return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Circle cx="12" cy="12" r="12" transform="rotate(90 12 12)" fill="#F7941E" />
            <Path d="M10.9998 13.668L9.33317 15.168L10.9998 13.668ZM9.33317 15.168L7.6665 13.668L9.33317 15.168ZM9.33317 15.168V9.16797V15.168Z" fill="#D9D9D9" />
            <Path d="M10.9998 13.668L9.33317 15.168M9.33317 15.168L7.6665 13.668M9.33317 15.168V9.16797" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
            <Path d="M16.3333 13.668L14.6667 15.168L16.3333 13.668ZM14.6667 15.168L13 13.668L14.6667 15.168ZM14.6667 15.168V9.16797V15.168Z" fill="#D9D9D9" />
            <Path d="M16.3333 13.668L14.6667 15.168M14.6667 15.168L13 13.668M14.6667 15.168V9.16797" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
        </Svg>
    );
};

export default SwappingIcon;



