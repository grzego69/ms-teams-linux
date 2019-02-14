import { app, BrowserWindow, Menu } from 'electron';

const TrayMenu = Menu.buildFromTemplate([
  {
    label: 'Open',
    click: () => {
      BrowserWindow.fromId(1).show();
    },
  },
  {
    label: 'Reload',
    click: () => {
      BrowserWindow.fromId(1).show();
      BrowserWindow.fromId(1).webContents.reloadIgnoringCache();
    },
  },
  {
    label: 'Quit',
    click: () => {
      BrowserWindow.fromId(1).hide();
      app.quit();
    },
  },
]);

export default TrayMenu;
