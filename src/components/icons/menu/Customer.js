import React from 'react';
import Svg, { Path, Mask, G } from 'react-native-svg';

const Customer = ({ width = 22, height = 20, color = '#B8B8B8' }) => ( 
    <Svg width={width} height={height} viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Mask id="mask0_1200_4188" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
            <Path d="M1.00002 1.99999C1.00002 1.73477 1.10537 1.48042 1.2929 1.29289C1.48044 1.10536 1.73479 1 2 1H11.9999C12.2651 1 12.5194 1.10536 12.707 1.29289C12.8945 1.48042 12.9999 1.73477 12.9999 1.99999V18.9998H2C1.73479 18.9998 1.48044 18.8944 1.2929 18.7069C1.10537 18.5193 1.00002 18.265 1.00002 17.9998V1.99999Z" fill="white" stroke="white" strokeLinejoin="round"/>
            <Path d="M9.50005 19V14.5001C9.50005 14.1023 9.34201 13.7208 9.06071 13.4395C8.77941 13.1582 8.39789 13.0001 8.00007 13.0001H6.00009C5.60227 13.0001 5.22075 13.1582 4.93945 13.4395C4.65815 13.7208 4.50011 14.1023 4.50011 14.5001V19" stroke="black" strokeLinejoin="round"/>
            <Path d="M13 10.0002H19.9999C20.2651 10.0002 20.5195 10.1055 20.707 10.2931C20.8945 10.4806 20.9999 10.735 20.9999 11.0002V18.0001C20.9999 18.2653 20.8945 18.5196 20.707 18.7072C20.5195 18.8947 20.2651 19.0001 19.9999 19.0001H13V10.0002Z" fill="white" stroke="white" strokeLinejoin="round"/>
            <Path d="M5.00012 7.00028H9.00007M16 13.0002H17.9999M16 16.0002H17.9999M7.00009 5.00031V9.00025" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
            <Path d="M2.50018 19.0001H11.5001" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
        </Mask>
        <G mask="url(#mask0_1200_4188)">
            <Path d="M-0.999786 -1.99985H22.9999V21.9998H-0.999786V-1.99985Z" fill={color}/>
        </G>
    </Svg>
);

export default Customer;