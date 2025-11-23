import React from 'react';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

const MapLocator = ({ width = 20, height = 20, color = '#F7941E' }) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
    >
      <G clipPath="url(#clip0_3108_4359)">
        <Path
          d="M1.66602 9.99935H4.16602M15.8327 9.99935H18.3327M9.99935 1.66602V4.16602M9.99935 15.8327V18.3327"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9.99935 15.8327C13.221 15.8327 15.8327 13.221 15.8327 9.99935C15.8327 6.77769 13.221 4.16602 9.99935 4.16602C6.77769 4.16602 4.16602 6.77769 4.16602 9.99935C4.16602 13.221 6.77769 15.8327 9.99935 15.8327Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3108_4359">
          <Rect width="20" height="20" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default MapLocator;
