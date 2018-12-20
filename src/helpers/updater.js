import fetch from 'node-fetch';

import { app, dialog, BrowserWindow, shell } from 'electron';

import compareVersions from 'compare-versions';

const path = require('path');

const spawn = require('child_process').spawn;

var wget = require('node-wget');

var mainWindow;

var messageWindow;

function applyUpdate(oldAppPath, newAppPath) {
  dialog.showMessageBox(
    messageWindow,
    {
      type: 'question',
      buttons: ['Yes, please', 'No!!!'],
      defaultId: 1,
      cancelId: 1,
      title: 'Update',
      message: 'Do you want to do update now?',
      detail: 'Update is downloaded.\nThe application will also be restarted.',
    },
    response => {
      if (response == 0) {
        var cmd = `rm -f '${oldAppPath}';
                   chmod +x '${newAppPath}';
                   rm /usr/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;
                   rm /usr/local/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;
                   rm ~/.local/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;
                   ( exec '${newAppPath}' ) & disown $!`;

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
      } else if (response == 1) {
        spawn('/bin/bash', ['-c', `rm -f ${newAppPath}`], {
          detached: true,
        });
      }
    }
  );
}

function downloadUpdate(jsonResponse, modal) {
  var oldAppPath;
  var newAppPath;
  var newAppURL;
  var appFolder;

  var i;
  for (i = 0; i < jsonResponse.assets.length; i++) {
    if (
      jsonResponse.assets[i].content_type &&
      jsonResponse.assets[i].content_type.includes('appimage')
    ) {
      appFolder = path.dirname(process.env.APPIMAGE) + '/';
      oldAppPath = process.env.APPIMAGE.replace(/'/g, "'\\''");
      newAppPath = (appFolder + jsonResponse.assets[i].name).replace(
        /'/g,
        "'\\''"
      );
      newAppURL = jsonResponse.assets[i].browser_download_url;

      wget(
        {
          url: newAppURL,
          dest: appFolder, // destination path or path with filenname, default is ./
          timeout: 60000, // duration to wait for request fulfillment in milliseconds, default is 2 seconds
        },
        function(error) {
          if (error) {
            spawn('/bin/bash', ['-c', `rm -f ${newAppPath}`], {
              detached: true,
            });

            dialog.showMessageBox(
              messageWindow,
              {
                type: 'question',
                buttons: ['Yes, please', 'No!!!'],
                defaultId: 1,
                cancelId: 1,
                title: 'ERROR',
                message: 'Unexpected error while downloading Update',
                detail: 'Do you want to open website and update manually?',
              },
              response => {
                if (response == 0) {
                  shell.openExternal(modal.url);
                }
              }
            );
          } else {
            applyUpdate(oldAppPath, newAppPath);
          }
        }
      );
    }
  }
}

export default function checkUpdate(showModal = false) {
  messageWindow = new BrowserWindow({
    show: false,
  });

  messageWindow.setAlwaysOnTop(true);

  fetch(
    'https://api.github.com/repos/grzego69/ms-teams-linux-next/releases/latest'
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(jsonResponse) {
      mainWindow = BrowserWindow.getFocusedWindow();

      const modal = {
        buttons: ['Ok'],
        message: 'You are using the latest version (' + app.getVersion() + ')',
        url: '',
        new: false,
      };

      if (compareVersions(jsonResponse.tag_name, app.getVersion()) === 0) {
        modal.buttons = ['Prepare update', 'Not now'];
        modal.message = 'New version is available: ' + jsonResponse.tag_name;
        modal.url = jsonResponse.html_url;
        modal.new = true;
      }

      if (modal.new || showModal) {
        dialog.showMessageBox(
          messageWindow,
          {
            title: 'UPDATE',
            type: 'info',
            buttons: modal.buttons,
            message: modal.message,
            alwaysOnTop: true,
            focusable: false,
          },
          function(buttonIndex) {
            if (modal.new && buttonIndex === 0) {
              downloadUpdate(jsonResponse, modal);
            }
          }
        );
      }
    });
}
