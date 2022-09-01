import { app, BrowserWindow } from 'electron';
import AutoUpdater from './auto-updater';
import { LOADING_SCREEN_CONFIG, MAIN_SCREEN_CONFIG, withPreload } from '../shared/config/screen-config';

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
    const screenConfig = withPreload(LOADING_SCREEN_CONFIG, LOADING_PRELOAD_WEBPACK_ENTRY);
    this.loadingWindow = new BrowserWindow(screenConfig);
    await this.loadingWindow.loadURL(LOADING_WEBPACK_ENTRY);

    this.loadingWindow.once('ready-to-show', async () => {
      this.showAndFocus(this.loadingWindow);

      if (app.isPackaged) {
        const autoUpdater = new AutoUpdater(this.loadingWindow);
        await autoUpdater.checkForUpdates();
      }

      this.loadingWindow.close();
      this.showMainWindow();
    });
  }

  public async showMainWindow(): Promise<void> {
    const screenConfig = withPreload(MAIN_SCREEN_CONFIG, MAIN_PRELOAD_WEBPACK_ENTRY);
    this.mainWindow = new BrowserWindow(screenConfig);
    await this.mainWindow.loadURL(MAIN_WEBPACK_ENTRY);

    this.mainWindow.once('ready-to-show', async () => {
      this.showAndFocus(this.mainWindow);
    });
  }

  private showAndFocus(window: BrowserWindow): void {
    window.show();
    window.focus();
  }
}

export default WindowManager;
