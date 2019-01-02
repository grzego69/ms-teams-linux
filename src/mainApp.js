import path from 'path';
import { app, Menu, Tray, shell } from 'electron';
import DevelopmentMenuTemplateMenu from './menu/DevelopmentMenuTemplateMenu';
import FileMenu from './menu/FileMenu';
import HelpMenu from './menu/HelpMenu';
import TrayMenu from './menu/TrayMenu';
import HandleRightClick from './menu/RightClick';
import createWindow from './helpers/window';
import checkUpdate from './helpers/updater';
// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var prevTitle = '';
var deleteDotOnFocus = false;
let appIcon = null;

// Regex pattern for notifications title
const notifRegex = '^\\([0-9]+\\).*?';

const ipcMain = require('electron').ipcMain;

const iconPath = {
  default: path.join(__dirname, 'icon-32x32.png'),
  unread: path.join(__dirname, 'icon-32x32-unread.png'),
  appDefault: path.join(__dirname, 'icon-256x256.png'),
  appUnread: path.join(__dirname, 'icon-256x256-unread.png'),
};

const setApplicationMenu = function() {
  const menus = [FileMenu, HelpMenu];
  if (env.name !== 'production') {
    menus.push(DevelopmentMenuTemplateMenu);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
}

app.on('ready', () => {
  setApplicationMenu();
  appIcon = new Tray(iconPath.default);
  appIcon.setContextMenu(TrayMenu);

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      partition: 'persist:teams',
      nodeIntegration: false,
      preload: path.join(__dirname, 'ms_t_preload.js'),
    },
    icon: iconPath.appDefault,
  });

  global.mainWindow = mainWindow;

  // Listen for notification events.
  ipcMain.on('notification-shim', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('errorInWindow', function() {
    mainWindow.webContents.reloadIgnoringCache();
  });

  mainWindow.webContents.setUserAgent(
    'Mozilla/5.0 (X11, Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240'
  );

  mainWindow.loadURL('https://teams.microsoft.com/');

  //minimize window to tray on click
  appIcon.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('focus', () => {
    if (deleteDotOnFocus) {
      appIcon.setImage(iconPath.default);
      deleteDotOnFocus = false;
    }
  });
  mainWindow.on('page-title-updated', (event, title) => {
    if (title !== '' && prevTitle !== title) {
      if (title.match(notifRegex)) {
        appIcon.setImage(iconPath.unread);
        if (!prevTitle.match(notifRegex)) {
          mainWindow.flashFrame(true);
        }
      } else if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
        appIcon.setImage(iconPath.default);
      } else {
        deleteDotOnFocus = true;
      }
      prevTitle = title;
    }
  });

  if (env.name === 'development') {
    mainWindow.openDevTools();
  }

  const ignoreOpenInNewWindow = ['teams.microsoft', 'microsoftonline'];

  const handleRedirect = (e, url) => {
    let ignoreOpen = false;

    ignoreOpenInNewWindow.forEach(ignoreUrl => {
      if (url.toLowerCase().indexOf(ignoreUrl) > -1) {
        ignoreOpen = true;
      }
    });

    if (!ignoreOpen) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);
  mainWindow.webContents.on('context-menu', (event, props) =>
    HandleRightClick(event, props, mainWindow)
  );
  checkUpdate();
});

app.on('window-all-closed', () => {
  app.quit();
});
