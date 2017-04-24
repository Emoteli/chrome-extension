App = {
  init : function () {
    var buttons = document.getElementsByClassName('emoteli'),
      i;

    for (i = 0; i < buttons.length; i++) {
      buttons[i].onclick = function () {
        App.emote.call(App, this);
      }
    }
  },

  /**
   * Emotes the page, changing the icon
   *
   * @param {Element} button The clicked button
   */
  emote : function (button) {
    var img = button.children[0];

    chrome.browserAction.setIcon({path : img.src});
    window.close();
  }
}

App.init();
