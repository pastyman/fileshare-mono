import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      folderItem: {
        light: {
          background: string;
          border: string;
        };
        dark: {
          background: string;
          border: string;
        };
      };
      userItem: {
        light: {
          activeBackground: string;
          inactiveBackground: string;
          border: string;
        };
        dark: {
          activeBackground: string;
          inactiveBackground: string;
          border: string;
        };
      };
    };
  }

  interface ThemeOptions {
    custom?: {
      folderItem?: {
        light?: {
          background?: string;
          border?: string;
        };
        dark?: {
          background?: string;
          border?: string;
        };
      };
      userItem?: {
        light?: {
          activeBackground?: string;
          inactiveBackground?: string;
          border?: string;
        };
        dark?: {
          activeBackground?: string;
          inactiveBackground?: string;
          border?: string;
        };
      };
    };
  }
}
