/* eslint-disable */
const path = require('path');

const iconPath = path.resolve(__dirname, './assets/icon-white-bg.ico');

module.exports = {
  packagerConfig: {
    arch: 'x64',
    platform: 'win32',
    dir: '.',
    out: 'out',
    icon: iconPath,
    overwrite: true,
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        authToken: process.env.FORGE_TOKEN,
        repository: {
          owner: 'Accedia',
          name: 'force-import-technology',
        },
        draft: false,
      },
    },
  ],
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        authors: 'Full Impact Technologies',
        name: 'REVClonePad',
        exe: 'Rev Clone Pad.exe',
        iconUrl: iconPath,
        setupIcon: iconPath,
        setupExe: 'Install REV Clone Pad.exe',
        loadingGif: path.resolve(__dirname, './assets/logo_spinning_white.gif'),
        noMsi: true,
      },
    },
  ],
};
