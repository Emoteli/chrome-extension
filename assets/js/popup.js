var buttons = document.getElementsByClassName('emoteli'),
    currentTab,
    i;

for (i = 0; i < buttons.length; i++) {
  buttons[i].onclick = emote;
}

/**
 * Gets the current tabs ID
 */
chrome.tabs.query({active : true, currentWindow : true}, function (tabs) {
  currentTab = tabs[0];
});

/**
 * Emotes the page, changing the icon
 */
function emote () {
  chrome.extension.sendMessage({
    action : 'emote',
    emote : this.getAttribute('data-emote'),
    tab : currentTab
  });
  window.close();
}
