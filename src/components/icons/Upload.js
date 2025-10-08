import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Upload = ({ width = 18, height = 18, color = '#F7941E' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M12.7494 6.75195C14.3806 6.76095 15.2641 6.8337 15.8401 7.4097C16.4994 8.06895 16.4994 9.12945 16.4994 11.2505V12.0005C16.4994 14.1222 16.4994 15.1827 15.8401 15.842C15.1816 16.5005 14.1204 16.5005 11.9994 16.5005H5.99939C3.87839 16.5005 2.81714 16.5005 2.15864 15.842C1.49939 15.182 1.49939 14.1222 1.49939 12.0005V11.2505C1.49939 9.12945 1.49939 8.06895 2.15864 7.4097C2.73464 6.8337 3.61814 6.76095 5.24939 6.75195" stroke={color} stroke-width="1.5" stroke-linecap="round"/>
        <Path d="M9 11.2505V1.50049M9 1.50049L11.25 4.12549M9 1.50049L6.75 4.12549" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
);

export default Upload;