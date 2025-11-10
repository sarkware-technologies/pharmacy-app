import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Note = ({ width = 20, height = 22, color = 'black' }) => (
    <Svg width={width} height={height} viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M0.75 8.75C0.75 4.979 0.75 3.093 1.922 1.922C3.094 0.751 4.979 0.75 8.75 0.75H10.75C14.521 0.75 16.407 0.75 17.578 1.922C18.749 3.094 18.75 4.979 18.75 8.75V12.75C18.75 16.521 18.75 18.407 17.578 19.578C16.406 20.749 14.521 20.75 10.75 20.75H8.75C4.979 20.75 3.093 20.75 1.922 19.578C0.751 18.406 0.75 16.521 0.75 12.75V8.75Z" stroke="black" strokeWidth="1.5" />
        <Path d="M5.75 8.75H13.75M5.75 12.75H10.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

export default Note;