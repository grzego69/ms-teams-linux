import { ipcRenderer } from 'electron';

const blockingError1 = "TypeError: Cannot read property 'send' of undefined";
const blockingError2 = "TypeError: Cannot read property 'on' of undefined";

require('electron-notification-shim')();

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
          (text.includes(blockingError1) || text.includes(blockingError2))
        ) {
          ipcRenderer.send('errorInWindow');
        }
      }
    },
  };
})(window.console);

//Then redefine the old console
window.console = console;

document.addEventListener(
  'DOMContentLoaded',
  () => {

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
  },
);

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