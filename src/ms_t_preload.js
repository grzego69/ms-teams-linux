import { remote } from 'electron';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    //todo: check if loaded once and refactor
    var foo = document.getElementsByTagName('body')[0];
    var mainWindow = remote.getGlobal('mainWindow');
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (var i = 0; i < mutation.addedNodes.length; i++) {
          var node = mutation.addedNodes[i];

          if (node.nodeType != 1) {
            // not Node.ELEMENT_NODE
            continue;
          }

          if (node.classList !== undefined) {
            if (
              (' ' + node.className + ' ').indexOf(
                ' ' + 'ts-toast-default toast-wrapper' + ' '
              ) > -1
            ) {
              var person = node.getElementsByClassName(
                'title app-max-2-lines-base'
              )[0].innerHTML;

              var message = node.getElementsByClassName(
                'toast-channel message'
              )[0].innerHTML;

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
