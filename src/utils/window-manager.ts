import { BrowserWindow } from 'electron';
import {
  LOADING_SCREEN_CONFIG,
  MAIN_SCREEN_CONFIG,
  withPreload,
} from '../shared/config/screen-config';
import AutoUpdater from './auto-updater';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;
declare const LOADING_WEBPACK_ENTRY: string;
declare const LOADING_PRELOAD_WEBPACK_ENTRY: string;

class WindowManager {
  private autoUpdater: AutoUpdater;
  loadingWindow: BrowserWindow | null;
  mainWindow: BrowserWindow | null;

  constructor() {
    this.loadingWindow = null;
    this.mainWindow = null;
    this.autoUpdater = new AutoUpdater(this.loadingWindow);
  }

  public async showLoadingWindow(): Promise<void> {
    const screenConfig = withPreload(LOADING_SCREEN_CONFIG, LOADING_PRELOAD_WEBPACK_ENTRY);
    this.loadingWindow = new BrowserWindow(screenConfig);
    await this.loadingWindow.loadURL(LOADING_WEBPACK_ENTRY);
    await this.autoUpdater.checkForUpdates();

    this.showMainWindow();
  }

  public async showMainWindow(): Promise<void> {
    if (this.loadingWindow) {
      this.loadingWindow.close();
      this.loadingWindow = null;
    }

    const screenConfig = withPreload(MAIN_SCREEN_CONFIG, MAIN_PRELOAD_WEBPACK_ENTRY);
    this.mainWindow = new BrowserWindow(screenConfig);
    await this.mainWindow.loadURL(MAIN_WEBPACK_ENTRY);
  }
}

export default WindowManager;
