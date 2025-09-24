import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Search = ({ width = 16, height = 16, color = '#777777' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M12.0775 12.1L14.6442 14.6667M13.8333 7.58333C13.8333 9.24093 13.1749 10.8306 12.0027 12.0027C10.8306 13.1748 9.24093 13.8333 7.58333 13.8333C5.92573 13.8333 4.33602 13.1748 3.16391 12.0027C1.99181 10.8306 1.33333 9.24093 1.33333 7.58333C1.33333 5.92572 1.99181 4.33601 3.16391 3.16391C4.33602 1.99181 5.92573 1.33333 7.58333 1.33333C9.24093 1.33333 10.8306 1.99181 12.0027 3.16391C13.1749 4.33601 13.8333 5.92572 13.8333 7.58333Z" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
);

export default Search;