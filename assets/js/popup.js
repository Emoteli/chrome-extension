var buttons = document.getElementsByClassName('emoteli'),
    currentTab,
    i;

for (i = 0; i < buttons.length; i++) {
  buttons[i].onclick = emote;
}

/**
 * Gets the current tabs ID
 */
chrome.tabs.query({active : true}, function (tab) {
  currentTab = tab[0];
});

/**
 * Emotes the page, changing the icon
 */
function emote () {
  chrome.extension.sendMessage({
    emote : this.getAttribute('data-emote'),
    tab : currentTab
  });
  window.close();
}
