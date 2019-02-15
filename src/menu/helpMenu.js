import path from 'path';
import openAboutWindow from 'about-window';
import checkUpdate from '../helpers/updater';

var mainWindow;

const copyrightText = `
<center>
    Copyright (c) 2018 grzego69 <hr />
    Microsoft, Microsoft Teams, Microsoft Teams logo are either registered trademarks or trademarks of Microsoft Corporation in the United States and/or other countries.<hr />
</center>
`;

const HelpMenu = {
  label: 'Help',
  submenu: [
    {
      label: 'About',
      accelerator: 'F1',
      click: () => {
        mainWindow = global.mainWindow;

        const size = mainWindow.getSize();
        const position = mainWindow.getPosition();

        var width = size[0];
        var height = size[1];
        var x = Math.round(position[0] + width / 2.7);
        var y = Math.round(position[1] + height / 6);

        openAboutWindow({
          icon_path: path.join(__dirname, 'icon-256x256.png'),
          description:
            'Whilst waiting for the official version of MS Teams for Linux, you are very free to use this app.',
          license: 'MIT',
          copyright: copyrightText,
          use_inner_html: true,
          win_options: {
            parent: mainWindow,
            alwaysOnTop: true,
            x: x,
            y: y,
            width: 400,
            height: 450,
          },
        });
      },
    },
    {
      label: 'Check for updates...',
      click: () => checkUpdate(true),
    },
  ],
};

export default HelpMenu;
