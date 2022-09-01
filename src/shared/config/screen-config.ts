import path from 'path';
import { BrowserWindowConstructorOptions } from 'electron';

const BASE_SCREEN_CONFIG: BrowserWindowConstructorOptions = {
  title: 'REV Clone Pad',
  icon: path.resolve(__dirname, '../../assets/icon-white-bg.ico'),
  autoHideMenuBar: true,
  closable: true,
  resizable: false,
  webPreferences: {
    nodeIntegration: true,
  },
};

export const LOADING_SCREEN_CONFIG: BrowserWindowConstructorOptions = {
  ...BASE_SCREEN_CONFIG,
  height: 175,
  width: 350,
};

export const MAIN_SCREEN_CONFIG: BrowserWindowConstructorOptions = {
  ...BASE_SCREEN_CONFIG,
  height: 500,
  width: 500,
};

export const withPreload = (
  options: BrowserWindowConstructorOptions,
  preloadPath: string
): BrowserWindowConstructorOptions => {
  return {
    ...options,
    webPreferences: {
      ...options.webPreferences,
      preload: preloadPath
    }
  }
};
