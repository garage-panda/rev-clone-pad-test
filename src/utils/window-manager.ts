import { app, BrowserWindow } from 'electron';
import log from 'electron-log';
import AutoUpdater from './auto-updater';
import { LOADING_SCREEN_CONFIG, MAIN_SCREEN_CONFIG, withPreload } from '../shared/config/screen-config';
import { Channel } from '../shared/enums';

declare const MAIN_WEBPACK_ENTRY: string;
declare const MAIN_PRELOAD_WEBPACK_ENTRY: string;
declare const LOADING_WEBPACK_ENTRY: string;
declare const LOADING_PRELOAD_WEBPACK_ENTRY: string;

class WindowManager {
  loadingWindow: BrowserWindow | null;
  mainWindow: BrowserWindow | null;

  constructor() {
    this.loadingWindow = null;
    this.mainWindow = null;
  }

  public async showLoadingWindow(): Promise<void> {
    log.info('Attempting to show loading window...');
    const screenConfig = withPreload(LOADING_SCREEN_CONFIG, LOADING_PRELOAD_WEBPACK_ENTRY);
    this.loadingWindow = new BrowserWindow(screenConfig);
    await this.loadingWindow.loadURL(LOADING_WEBPACK_ENTRY);
    this.loadingWindow.webContents.send(Channel.Version, app.getVersion());

    if (app.isPackaged) {
      const autoUpdater = new AutoUpdater(this.loadingWindow);
      await autoUpdater.checkForUpdates();
    }

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
    this.mainWindow.webContents.send(Channel.Version, app.getVersion());
  }
}

export default WindowManager;
