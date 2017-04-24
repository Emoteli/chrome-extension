var loadedTabs = {};

/**
 * Setup event listeners
 */
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onActivated.addListener(onActivated);
chrome.extension.onMessage.addListener(emote);

/**
 * Called when the current tab is updated
 *
 * @param {Integer} tabId The tabs ID
 * @param {String} changeInfo The tab change information
 * @param {Object} tab The tab data
 */
function onTabUpdated (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.active) {
    updateEmoteli(tabId);
  }
}

/**
 * Called when the active tab is changed
 *
 * @param {Object} tabInfo The active tab info object
 */
function onActivated (tabInfo) {
  updateEmoteli(tabInfo.tabId);
}

/**
 * Called when a user emotes
 *
 * @param {Object} data The emote object
 */
function emote (data) {
  loadedTabs[data.tab.id] = {
    icon : data.emote
  }
  updateEmoteli(data.tab.id);
}

/**
 * Updates the active tab
 */
function updateEmoteli (tabId) {
  if (!loadedTabs[tabId]) {
    loadedTabs[tabId] = {
      icon : 'new'
    };
  }
  chrome.browserAction.setIcon({path : '/assets/img/emoteli/' + loadedTabs[tabId].icon + '.png'});
}
