import { app, BrowserWindow, dialog } from 'electron';

const spawn = require('child_process').spawn;

const deleteCacheAndConfig = function() {
  var mainWindow = BrowserWindow.fromId(1);
  mainWindow.webContents.session.clearStorageData();
  mainWindow.webContents.session.clearCache(function() {});
  var currentFile = process.env.APPIMAGE;
  var currentFileEsc = currentFile.replace(/'/g, "'\\''");
  var cmd = `( exec '${currentFileEsc}' ) & disown $!`;
  mainWindow.hide();
  app.quit();
  spawn(
    '/bin/bash',
    [
      '-c',
      `while ps ${process.pid} >/dev/null 2>&1; do kill -9 ${
        process.pid
      }; sleep 0.1; done; ${cmd}`,
    ],
    {
      detached: true,
    }
  );
};

const FileMenu = {
  label: 'Menu',
  submenu: [
    {
      label: 'Reload App',
      accelerator: 'CmdOrCtrl+R',
      click: () => {
        BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
      },
    },
    {
      label: 'Delete cache and config',
      accelerator: 'CmdOrCtrl+D',
      click: () => {
        var mainWindow = BrowserWindow.getFocusedWindow();

        dialog.showMessageBox(
          mainWindow,
          {
            type: 'question',
            buttons: ['Yes, please', 'No!!!'],
            defaultId: 1,
            cancelId: 1,
            title: 'Delete cache and config',
            message: 'Do you want to do this?',
            detail:
              'Your configuration data and cache will be deleted.\nThe application will also be restarted.',
          },
          response => {
            if (response == 0) {
              deleteCacheAndConfig();
            }
          }
        );
      },
    },
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        BrowserWindow.getFocusedWindow().hide();
        app.quit();
      },
    },
  ],
};

export default FileMenu;
export { deleteCacheAndConfig };
