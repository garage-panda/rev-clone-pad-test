import { app, BrowserWindow } from 'electron';
import WindowManager from './utils/window-manager';

if (require('electron-squirrel-startup')) {
  app.quit();
}

class Main {
  windowManager = new WindowManager();

  constructor() {
    app.on('ready', this.windowManager.showLoadingWindow);

    this.registerListeners();
  }

  private registerListeners(): void {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }
}

const main = new Main();
export const windowManager = main.windowManager;
export const appInstance = app;