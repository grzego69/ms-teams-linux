import fetch from 'node-fetch';

import { app, dialog, BrowserWindow, shell } from 'electron';

import compareVersions from 'compare-versions';

const path = require('path');

const spawn = require('child_process').spawn;

var wget = require('node-wget');

const fs = require('fs');

var rimraf = require('rimraf');

var mainWindow;

function applyUpdate(oldAppPath, newAppPath, updateFolder, appFolder) {
  var newAppPathAfterMove = appFolder + path.basename(newAppPath);
  dialog.showMessageBox(
    mainWindow,
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
                   mv '${newAppPath}' '${newAppPathAfterMove}';
                   chmod +x '${newAppPathAfterMove}';
                   rm /usr/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;
                   rm /usr/local/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;
                   rm ~/.local/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;
                   rm -rf ${updateFolder};
                   ( exec '${newAppPathAfterMove}' ) & disown $!`;

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
        spawn('/bin/bash', ['-c', `rm -rf ${updateFolder}`], {
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
  var updateFolder;

  var i;
  for (i = 0; i < jsonResponse.assets.length; i++) {
    if (
      jsonResponse.assets[i].content_type &&
      jsonResponse.assets[i].content_type.includes('appimage')
    ) {
      appFolder = path.dirname(process.env.APPIMAGE) + '/';
      updateFolder = appFolder + 'update/';
      oldAppPath = process.env.APPIMAGE.replace(/'/g, "'\\''");
      newAppPath = (updateFolder + jsonResponse.assets[i].name).replace(
        /'/g,
        "'\\''"
      );
      newAppURL = jsonResponse.assets[i].browser_download_url;

      rimraf(updateFolder, () => {
        fs.mkdir(
          updateFolder,
          {
            recursive: true,
          },
          () => {
            wget(
              {
                url: newAppURL,
                dest: updateFolder, // destination path or path with filenname, default is ./
                timeout: 60000, // duration to wait for request fulfillment in milliseconds, default is 2 seconds
              },
              function(error) {
                if (error) {
                  spawn('/bin/bash', ['-c', `rm -f ${newAppPath}`], {
                    detached: true,
                  });

                  dialog.showMessageBox(
                    mainWindow,
                    {
                      type: 'question',
                      buttons: ['Yes, please', 'No!!!'],
                      defaultId: 1,
                      cancelId: 1,
                      title: 'ERROR',
                      message: 'Unexpected error while downloading Update',
                      detail:
                        'Do you want to open website and update manually?',
                    },
                    response => {
                      if (response == 0) {
                        shell.openExternal(modal.url);
                      }
                    }
                  );
                } else {
                  applyUpdate(oldAppPath, newAppPath, updateFolder, appFolder);
                }
              }
            );
          }
        );
      });
    }
  }
}

export default function checkUpdate(showModal = false) {
  mainWindow = BrowserWindow.getFocusedWindow();

  fetch(
    'https://api.github.com/repos/grzego69/ms-teams-linux-next/releases/latest'
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(jsonResponse) {
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
          mainWindow,
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
