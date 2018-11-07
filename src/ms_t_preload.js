import { remote, ipcRenderer } from 'electron';

var personClassName = 'title app-max-2-lines-base';
var messageClassName = 'toast-channel message';
var mainWindow = remote.getGlobal('mainWindow');

function displayToast(person, message) {
  //Notification
  var title = person;

  var options = {
    body: message,
    icon: document.querySelector('link[rel="icon"]').href,
    requireInteraction: true,
  };

  var notification = new Notification(title, options);
  notification.onclick = function() {
    mainWindow.show();
  };
}

function getElementValue(node, className) {
  var value = node.getElementsByClassName(className)[0].innerHTML;

  return value;
}

function isMessageElement(node) {
  var result =
    (' ' + node.className + ' ').indexOf(
      ' ' + 'ts-toast-default toast-wrapper' + ' '
    ) > -1;

  return result;
}

function isTypingElement(node) {
  var result =
    (' ' + node.className + ' ').indexOf(' ' + 'ts-typing-indicator' + ' ') >
    -1;

  return result;
}

function isToastElement(node) {
  var result =
    (' ' + node.className + ' ').indexOf(' ' + 'toast-bottom-right' + ' ') > -1;

  return result;
}

ipcRenderer.on('simMouseClickTeams', function() {
  if (document !== undefined) {
    var teamButton = document.getElementById('app-bar-3');
    var evt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    // If cancelled, don't dispatch our event
    if (teamButton !== null) {
      teamButton.dispatchEvent(evt);
    }
  }
});

document.addEventListener(
  'DOMContentLoaded',
  () => {
    var bodyElement = document.getElementsByTagName('body')[0];

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (var i = 0; i < mutation.addedNodes.length; i++) {
          var node = mutation.addedNodes[i];

          if (node.className !== undefined) {
            //process.stdout.write("added_node_class: " + node.className + "\n");

            if (isTypingElement(node) || isToastElement(node)) {
              if (!mainWindow.isVisible()) {
                mainWindow.show();
                mainWindow.minimize();
              }
            }

            if (isMessageElement(node)) {
              var person = getElementValue(node, personClassName);
              var message = getElementValue(node, messageClassName);

              displayToast(person, message);
            }
          }
        }
      });
    });

    observer.observe(bodyElement, {
      childList: true,
      subtree: true,
    });
  },
  false
);
