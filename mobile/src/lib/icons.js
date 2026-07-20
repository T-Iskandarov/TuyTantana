import React from 'react';
import { Bank, Camera, Microphone, Scissors, Car, ClipboardText, SquaresFour, Star, MapPin, CheckCircle, WarningCircle, XCircle } from 'phosphor-react-native';
import { COLORS } from './theme';

export const getPhosphorIcon = (value, isActive = false, size = 28, customColor = null) => {
  const color = customColor || (isActive ? COLORS.primary : COLORS.textLight);
  const weight = isActive ? "fill" : "regular";
  
  switch(value) {
    case 'TUYXONA': return <Bank size={size} color={color} weight={weight} />;
    case 'FOTO_VIDEO': return <Camera size={size} color={color} weight={weight} />;
    case 'XONANDA': return <Microphone size={size} color={color} weight={weight} />;
    case 'SALON': return <Scissors size={size} color={color} weight={weight} />;
    case 'KORTEJ': return <Car size={size} color={color} weight={weight} />;
    case 'TASHKILOTCHI': return <ClipboardText size={size} color={color} weight={weight} />;
    case 'ALL': return <SquaresFour size={size} color={color} weight={weight} />;
    default: return <SquaresFour size={size} color={color} />;
  }
};
