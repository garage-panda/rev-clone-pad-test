import { app } from 'electron';
import log from 'electron-log';
import WindowManager from './utils/window-manager';

if (require('electron-squirrel-startup')) {
  app.quit();
}

class Main {
  windowManager: WindowManager;

  constructor() {
    this.windowManager = new WindowManager();
    app.on('ready', () => {
      log.info('App ready! Starting...');
      this.windowManager.showLoadingWindow();
    });
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