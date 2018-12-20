import fetch from 'node-fetch';

import { app, dialog, BrowserWindow, shell } from 'electron';

import compareVersions from 'compare-versions';

const path = require('path');

const spawn = require('child_process').spawn;

const options = {
  type: 'question',
  buttons: ['Yes, please', 'No!!!'],
  defaultId: 1,
  cancelId: 1,
  title: 'Update',
  message: 'Do you want to do update now?',
  detail: 'Update is downloaded.\nThe application will also be restarted.',
};

const options1 = {
  type: 'question',
  buttons: ['Yes, please', 'No!!!'],
  defaultId: 1,
  cancelId: 1,
  title: 'ERROR',
  message: 'Unexpected error while downloading Update',
  detail: 'Do you want to open website and update manually?',
};

var wget = require('node-wget');

var mainWindow;

//function downloadUpdate() {};

function applyUpdate(oldAppPathEsc, newAppPathEsc) {
  dialog.showMessageBox(
    new BrowserWindow({
      show: false,
      alwaysOnTop: true,
    }),
    options,
    response => {
      if (response == 0) {
        var cmd = `rm -f '${oldAppPathEsc}'; chmod +x '${newAppPathEsc}';rm /usr/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;rm /usr/local/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;rm ~/.local/share/applications/appimagekit-ms-teams*.desktop &> /dev/null;( exec '${newAppPathEsc}' ) & disown $!`;
        console.log('cmd: ' + cmd);

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
        spawn('/bin/bash', ['-c', `rm -f ${newAppPathEsc}`], {
          detached: true,
        });
      }
    }
  );
}

export default function checkUpdate(showModal = false) {
  fetch(
    'https://api.github.com/repos/grzego69/ms-teams-linux-next/releases/latest'
  )
    .then(function(response) {
      return response.json();
    })
    .then(function(j) {
      mainWindow = BrowserWindow.getFocusedWindow();
      const modal = {
        buttons: ['Ok'],
        message: 'You are using the latest version (' + app.getVersion() + ')',
        url: '',
        new: false,
      };
      if (compareVersions(j.tag_name, app.getVersion()) === 0) {
        modal.buttons = ['Prepare update', 'Not now'];
        modal.message = 'New version is available: ' + j.tag_name;
        modal.url = j.html_url;
        modal.new = true;
      }

      if (modal.new || showModal) {
        dialog.showMessageBox(
          {
            type: 'info',
            buttons: modal.buttons,
            message: modal.message,
          },
          function(buttonIndex) {
            var oldAppPath;
            var newAppPath;
            var newAppURL;
            var appFolder;

            if (modal.new && buttonIndex === 0) {
              //console.log(j.assets[1].browser_download_url);

              var i;
              for (i = 0; i < j.assets.length; i++) {
                if (
                  j.assets[i].content_type &&
                  j.assets[i].content_type.includes('appimage')
                ) {
                  oldAppPath = process.env.APPIMAGE;
                  appFolder = path.dirname(process.env.APPIMAGE) + '/';
                  newAppPath = appFolder + j.assets[i].name;
                  newAppURL = j.assets[i].browser_download_url;

                  var newAppPathEsc = newAppPath.replace(/'/g, "'\\''");
                  var oldAppPathEsc = oldAppPath.replace(/'/g, "'\\''");

                  //var directories = path.dirname('/Users/Refsnes/demo_path.js');
                  wget(
                    {
                      url: newAppURL,
                      dest: appFolder, // destination path or path with filenname, default is ./
                      timeout: 15000, // duration to wait for request fulfillment in milliseconds, default is 2 seconds
                    },
                    function(error) {
                      if (error) {
                        spawn('/bin/bash', ['-c', `rm -f ${newAppPathEsc}`], {
                          detached: true,
                        });

                        dialog.showMessageBox(
                          new BrowserWindow({
                            show: false,
                            alwaysOnTop: true,
                          }),
                          options1,
                          response => {
                            if (response == 0) {
                              shell.openExternal(modal.url);
                            }
                          }
                        );
                      } else {
                        applyUpdate(oldAppPathEsc, newAppPathEsc);
                      }
                    }
                  );
                }
              }
            }
          }
        );
      }
    });
}
