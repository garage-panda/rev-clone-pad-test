import { autoUpdater, BrowserWindow, dialog, MessageBoxOptions, shell } from "electron";
import log from "electron-log";
import { Endpoints } from "@octokit/types";
import fs from "fs";
import path from "path";
import * as stream from "stream";
import { promisify } from "util";
import axios, { AxiosRequestConfig } from "axios";
import { createDir, getFileExtension } from "./fs-helper";
import { appInstance } from "../main";
import { Channel, UpdateStatus } from "../shared/enums";

type LatestReleaseResponse = Endpoints["GET /repos/{owner}/{repo}/releases/latest"]["response"]["data"];

type Asset = {
  url: string;
  name: string;
  type: string;
  download_url: string;
  size: number;
};
type LatestRelease = {
  version: string;
  assets: Asset[];
};

class AutoUpdater {
  public tempDirPath: string;
  public currentVersion: string;
  public latestVersion: string;

  constructor(private window: BrowserWindow) {
    this.tempDirPath = path.join(appInstance.getPath("temp"), "NTWRK");
    createDir(this.tempDirPath);
  }

  public async checkForUpdates(): Promise<void> {
    this.sendUpdateStatus(UpdateStatus.Checking);
    const { version, assets } = await this.getLatestRelease();
    const shouldUpdate = this.isUpdateAvailable(appInstance.getVersion(), version);
    if (!shouldUpdate) {
      this.sendUpdateStatus(UpdateStatus.NoUpdates);
      return;
    }

    this.sendUpdateStatus(UpdateStatus.Downloading);
    await this.downloadAssets(assets);

    this.sendUpdateStatus(UpdateStatus.Installing);
    try {
      await this.installUpdates();
    } catch (e) {
      log.error("Error applying the updates", e);
      this.handleError(e);
      appInstance.quit();
    }
  }

  private async getLatestRelease(): Promise<LatestRelease> {
    const response = await axios.get<LatestReleaseResponse>(
      "https://api.github.com/repos/Accedia/rev-clone-pad/releases/latest"
    );

    const assets = response.data.assets.map((asset) => ({
      url: asset.url,
      name: asset.name,
      type: getFileExtension(asset.name),
      download_url: asset.browser_download_url,
      size: asset.size,
    }));

    const latestRelease = {
      version: response.data.tag_name.replace(/v/, ""),
      assets,
    };

    return latestRelease;
  }

  private async downloadAssets(assets: Asset[]): Promise<void> {
    const releases = assets.find((asset) => asset.type === null);
    const nupkg = assets.find((asset) => asset.type === "nupkg");

    await Promise.all([
      this.download(releases.name, releases.download_url, false),
      this.download(nupkg.name, nupkg.download_url),
    ]);
  }

  private async installUpdates(): Promise<void> {
    return new Promise((resolve, reject) => {
      autoUpdater.on("error", (error: Error) => reject(error));
      autoUpdater.on("update-downloaded", () => {
        this.sendUpdateStatus(UpdateStatus.Complete);
        shell.beep();

        setTimeout(() => {
          autoUpdater.quitAndInstall();
          resolve();
        }, 3000);
      });

      autoUpdater.setFeedURL({ url: this.tempDirPath });
      autoUpdater.checkForUpdates();
    });
  }

  private async download(name: string, url: string, showProgress = true): Promise<void> {
    const finished = promisify(stream.finished);
    const filePath = `${this.tempDirPath}/${name}`;
    const writer = fs.createWriteStream(filePath, { flags: "w+" });
    const requestOptions: AxiosRequestConfig = {
      responseType: "stream",
    };

    if (showProgress) {
      requestOptions.onDownloadProgress = (progress: ProgressEvent) => {
        const { loaded, total } = progress;
        const percentCompleted = Math.floor((loaded / total) * 100);
        this.sendProgressPercent(percentCompleted);
      };
    }

    const response = await axios.get(url, requestOptions);
    response.data.pipe(writer);

    return finished(writer);
  }

  private handleError(error: Error): void {
    this.sendUpdateStatus(UpdateStatus.Error);
    this.window.show();

    shell.beep();
    const dialogOpts: MessageBoxOptions = {
      type: "error",
      buttons: ["Close"],
      title: "Application Update",
      message: "Error updating the application",
      detail: `Please report this issue to FIT. \n\n ${error.message}`,
    };

    dialog.showMessageBox(dialogOpts);
  }

  private isUpdateAvailable(currentVersion: string, latestVersion: string): boolean {
    const [appMajor, appMinor, appPatch] = currentVersion.split(".").map((v) => parseInt(v));
    const [latestMajor, latestMinor, latestPatch] = latestVersion.split(".").map((v) => parseInt(v));

    if (appMajor < latestMajor) return true;
    if (appMajor === latestMajor && appMinor < latestMinor) return true;
    if (appMajor === latestMajor && appMinor === latestMinor && appPatch < latestPatch) return true;
    return false;
  }

  private sendUpdateStatus(status: UpdateStatus): void {
    this.window.webContents.send(Channel.UpdateStatusChanged, status);
  }

  private sendProgressPercent(value: number): void {
    this.window.webContents.send(Channel.DownloadPercentChanged, value);
  }
}

export default AutoUpdater;
