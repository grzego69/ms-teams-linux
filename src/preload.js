import {
  ipcRenderer,
  remote
} from 'electron';

const blockingError1 = "TypeError: Cannot read property 'send' of undefined";
const blockingError2 = "TypeError: Cannot read property 'on' of undefined";
const blockingError3 = "Uncaught IPC object is null";

require('electron-notification-shim')();

// TODO: fix screenshare issues
//require('./desktopShare/chromeApi');

// define a new console
var console = (function(oldCons) {
  return {
    log: function(text) {
      oldCons.log(text);
    },
    info: function(text) {
      oldCons.info(text);
    },
    warn: function(text) {
      oldCons.warn(text);
    },
    error: function(text) {
      if (text) {
        oldCons.error(text);
        if (
          text &&
          (text.includes(blockingError1) || text.includes(blockingError2) || text.includes(blockingError3))
        ) {
          ipcRenderer.send('errorInWindow');
        }
      }
    },
  };
})(window.console);

//Then redefine the old console
window.console = console;

function enableChromeVideoAudioMeetings(injector) {
  injector.get('callingSupportService').oneOnOneCallingEnabled = true;
  injector.get('callingSupportService').isChromeMeetingSingleVideoEnabled = true;
  injector.get('callingSupportService').isChromeVideoOneOnOneEnabled = true;
  injector.get('callingSupportService').isChromeVideoMultipartyEnabled = true;
  injector.get('settingsService').appConfig.enableCallingChromeOneOnOne = true;
  injector.get('settingsService').appConfig.callingEnableChromeMeetingSingleVideo = true;
  injector.get('settingsService').appConfig.callingEnableChromeMultipartyVideo = true;
  //Screen sharing isn't implemented yet
  //injector.get('settingsService').appConfig.enableChromeScreenSharing = true;
  injector.get('settingsService').appConfig.enableAddToChatButtonForMeetings = true;
  injector.get('settingsService').appConfig.enableSharingOnlyCallChrome = true;
  injector.get('settingsService').appConfig.enableScreenSharingToolbar = true;
  injector.get('settingsService').appConfig.enableCallingScreenPreviewLabel = true;
  injector.get('settingsService').appConfig.callingEnableChromeOneToOneVideo = true;
}

function disablePromoteStuff(injector) {
  injector.get('settingsService').appConfig.promoteMobile = false;
  injector.get('settingsService').appConfig.promoteDesktop = false;
  injector.get('settingsService').appConfig.hideGetAppButton = true;
  injector.get('settingsService').appConfig.enableMobileDownloadMailDialog = false;
}

function runCallingObserver() {

  var foo = document.getElementsByTagName('body')[0];
  var mainWindow = remote.getGlobal('mainWindow');

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {


      for (var i = 0; i < mutation.addedNodes.length; i++) {

        var node = mutation.addedNodes[i];

        if (node.nodeType != 1) {
          continue;
        }

        if (node.classList !== undefined) {
          if (
            (' ' + node.className + ' ').indexOf(
              ' ' + 'toast-bottom-right' + ' '
            ) > -1
          ) {

            if (!mainWindow.isVisible()) {
              mainWindow.show();
            }
            if (!mainWindow.isFocused()) {
              mainWindow.focus();
            }
          }
        }
      }
    });
  });
  observer.observe(foo, {
    childList: true,
    subtree: true,
  });
}

document.addEventListener(
  'DOMContentLoaded',
  () => {

    if (angular !== undefined) {

      runCallingObserver();

      setTimeout(() => {
        let injector = angular.element(document).injector();

        if (injector) {
          enableChromeVideoAudioMeetings(injector);
          disablePromoteStuff(injector);

          injector.get('settingsService').settingsService.refreshSettings();

        }
        // Future tests can be done in here...
        // angular.element(document).injector().get('settingsService').appConfig.replyBoxFocusAfterNewMessage = true;
        //last I look is enableIncomingVideoUnsupportedUfd groing from down to up.
      }, 3000);
    }
  }
);