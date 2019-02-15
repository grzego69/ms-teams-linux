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
