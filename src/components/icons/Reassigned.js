import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Reassigned = ({ width = 12, height = 12, color = '#FFFFFF' }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 12 12"
    fill="none"
  >
    <Path
      d="M3.25 2L1.5 3.5L3.25 5.25"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.5 3.5H7.2485C8.96925 3.5 10.4305 4.905 10.4975 6.625C10.5685 8.4425 9.06675 10 7.2485 10H2.9995"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Reassigned;
