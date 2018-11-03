import { remote } from 'electron';

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

document.addEventListener(
  'DOMContentLoaded',
  () => {
    var foo = document.getElementsByTagName('body')[0];

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (var i = 0; i < mutation.addedNodes.length; i++) {
          var node = mutation.addedNodes[i];

          if (node.classList !== undefined) {
            if (isMessageElement(node)) {
              var person = getElementValue(node, personClassName);
              var message = getElementValue(node, messageClassName);

              displayToast(person, message);
            }
          }
        }
      });
    });

    observer.observe(foo, {
      childList: true,
      subtree: true,
    });
  },
  false
);
