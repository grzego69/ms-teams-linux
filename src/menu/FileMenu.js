import { app, BrowserWindow, dialog } from 'electron';

const options = {
  type: 'question',
  buttons: ['Yes, please', 'No!!!'],
  defaultId: 1,
  cancelId: 1,
  title: 'Delete cache and config',
  message: 'Do you want to do this?',
  detail:
    'Your configuration data and cache will be deleted.\nThe application will also be closed.',
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
          new BrowserWindow({
            show: false,
            alwaysOnTop: true,
          }),
          options,
          response => {
            if (response == 0) {
              mainWindow.webContents.session.clearStorageData();
              mainWindow.webContents.session.clearCache(function() {});
              //app.relaunch(); // TODO: not work
              app.exit(0);
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
