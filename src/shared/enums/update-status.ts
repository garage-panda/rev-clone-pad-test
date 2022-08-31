export enum UpdateStatus {
  Checking = 'checking',
  NoUpdates = 'no_updates',
  Downloading = 'downloading',
  Installing = 'installing',
  Complete = 'complete',
  Error = 'error',
}

export const UPDATE_STATUS_MESSAGES: Record<UpdateStatus, string> = {
  [UpdateStatus.Checking]: 'Checking for updates...',
  [UpdateStatus.NoUpdates]: 'No updates found!',
  [UpdateStatus.Downloading]: 'Downloading latest update...',
  [UpdateStatus.Installing]: 'Installing latest update...',
  [UpdateStatus.Complete]: 'Latest update installed successfully!',
  [UpdateStatus.Error]: 'Oops! Something went wrong while installing latest update.'
}