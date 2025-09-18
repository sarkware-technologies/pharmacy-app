import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../styles/colors';

const InputLock = ({ width = 20, height = 20, color = colors.primary }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M1.66667 13.3334C1.66667 10.9767 1.66667 9.79754 2.39917 9.06587C3.13083 8.33337 4.31 8.33337 6.66667 8.33337H13.3333C15.69 8.33337 16.8692 8.33337 17.6008 9.06587C18.3333 9.79754 18.3333 10.9767 18.3333 13.3334C18.3333 15.69 18.3333 16.8692 17.6008 17.6009C16.8692 18.3334 15.69 18.3334 13.3333 18.3334H6.66667C4.31 18.3334 3.13083 18.3334 2.39917 17.6009C1.66667 16.8692 1.66667 15.69 1.66667 13.3334Z" stroke="#909090"/>
            <Path d="M5 8.33335V6.66669C5 5.3406 5.52678 4.06883 6.46447 3.13115C7.40215 2.19347 8.67392 1.66669 10 1.66669C11.3261 1.66669 12.5979 2.19347 13.5355 3.13115C14.4732 4.06883 15 5.3406 15 6.66669V8.33335" stroke="#909090" strokeLinecap="round"/>
            <Path d="M6.66667 13.3334H6.67417M9.9925 13.3334H10M13.3258 13.3334H13.3333" stroke="#909090" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
    );
};

export default InputLock;