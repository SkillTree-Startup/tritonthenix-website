// This file is largely deprecated as Tamagui components are being replaced.
// Values from themes (light/dark) can be used as a reference for CSS variables in index.css.

// Create dialog scope - This might not be needed if Dialogs are custom HTML/CSS
// export const DialogScope = createDialogScope() // Potentially remove

const config = { // Simplified, as createTamagui is not the core anymore
  defaultTheme: 'dark',
  themes: {
    light: {
      // ... (keep for reference for CSS variables)
      background: '#FFFFFF',
      color: '#000000',
      borderColor: '#e2e8f0',
      green10: '#22c55e',
      textPrimary: '#000000',
      textSecondary: '#4A5568',
      cardBackground: '#FFFFFF',
      headerBackground: 'rgba(255,255,255,0.9)',
    },
    dark: {
      // ... (keep for reference for CSS variables)
      background: '#000000',
      color: '#FFFFFF',
      borderColor: '#2d3748',
      green10: '#22c55e',
      textPrimary: '#FFFFFF',
      textSecondary: '#A0AEC0',
      cardBackground: '#1A202C',
      headerBackground: 'rgba(0,0,0,0.9)',
    }
  },
  // tokens, shorthands, media can be kept for reference or removed
  // dialogScope, defaultProps for Dialog are no longer applicable
};

// export type AppConfig = typeof config // Potentially remove
// declare module '@tamagui/core' { // Remove
//   interface TamaguiCustomConfig extends AppConfig {}
// }

export default config // Exporting this might still be useful for theme value access, or remove