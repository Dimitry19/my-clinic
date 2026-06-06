import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const TrinityPrimeTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E6F1FB',
      100: '#B5D4F4',
      200: '#85B7EB',
      300: '#5899E1',
      400: '#378ADD',
      500: '#185FA5',
      600: '#0C447C',
      700: '#083361',
      800: '#052247',
      900: '#02102E',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#185FA5',
          contrastColor: '#ffffff',
          hoverColor: '#0C447C',
          activeColor: '#083361',
        },
        surface: {
          0: '#ffffff',
          50: '#F1EFE8',
          100: '#D3D1C7',
          200: '#B4B2A9',
          900: '#2C2C2A',
        },
        highlight: {
          background: '#E6F1FB',
          focusBackground: '#B5D4F4',
          color: '#185FA5',
          focusColor: '#0C447C',
        },
      },
      dark: {
        primary: {
          color: '#85B7EB',
          contrastColor: '#02102E',
          hoverColor: '#B5D4F4',
          activeColor: '#E6F1FB',
        },
        surface: {
          0: '#1a1a1a',
          50: '#2C2C2A',
          100: '#444441',
          900: '#F1EFE8',
        },
        highlight: {
          background: '#0C447C',
          focusBackground: '#185FA5',
          color: '#E6F1FB',
          focusColor: '#ffffff',
        },
      },
    },
  },
});
