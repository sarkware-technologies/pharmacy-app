import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const DoctorDeleteIcon = ({
  width = 12,
  height = 12,
  color = '#777777',
  strokeColor = 'white'
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
    >
      {/* Circle background */}
      <Circle
        cx="6"
        cy="6"
        r="6"
        fill={color}
      />

      {/* Cross (X) */}
      <Path
        d="M4.07617 4.07812L7.92233 7.92428M4.07617 7.92428L7.92233 4.07812"
        stroke={strokeColor}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default DoctorDeleteIcon;