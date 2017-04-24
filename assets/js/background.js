var loadedTabs = {};

/**
 * Setup Firebase
 */
firebase.initializeApp({
  apiKey: "AIzaSyC2I8AgT9yXSH_rzekVgazSkgqBpJx4FaY",
  authDomain: "emoteli-64d88.firebaseapp.com",
  databaseURL: "https://emoteli-64d88.firebaseio.com",
  projectId: "emoteli-64d88",
  storageBucket: "emoteli-64d88.appspot.com",
  messagingSenderId: "409048912521"
});

/**
 * Setup event listeners
 */
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onActivated.addListener(onActivated);
chrome.extension.onMessage.addListener(onMessage);
firebase.auth().onAuthStateChanged(onAuthChange, onAuthError);

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
 * Called when we receive a message
 */
function onMessage (message) {
  switch (message.action) {
    case 'emote' : emote (message); break;
    case 'auth' : authWithFacebook(); break;
  }
}

/**
 * Auth with Facebook
 */
function authWithFacebook () {
  firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider())
    .then(function () {
      chrome.tabs.query({active : true, currentWindow : false}, function (tabs) {
        updateEmoteli(tabs[0].id);
      });
    })
    .catch(function (err) {
      alert(err.message);
    });
}

/**
 * Called when a user emotes
 *
 * @param {Object} data The emote object
 */
function emote (data) {
  if (data.emote !== 'logout') {
    loadedTabs[data.tab.id] = {
      icon : data.emote
    }
    updateEmoteli(data.tab.id);
  } else {
    logout();
  }
}

/**
 * Updates the active tab
 */
function updateEmoteli (tabId) {
  if (getUser()) {
    if (!loadedTabs[tabId]) {
      loadedTabs[tabId] = {
        icon : 'new'
      };
    }
    chrome.browserAction.setIcon({path : '/assets/img/emoteli/' + loadedTabs[tabId].icon + '.png'});
  }
}

/**
 * Called when there is an error with Authentication
 */
function onAuthError () {
  chrome.browserAction.setIcon({path : '/assets/img/emoteli/error.png'});
}

/**
 * Called when the users auth changes
 *
 * @param {Object} user The user object or null
 */
function onAuthChange (user) {
  if (user) {
    chrome.browserAction.setPopup({popup : '/assets/html/popup.html'});
  } else {
    chrome.browserAction.setPopup({popup : '/assets/html/auth.html'});
    chrome.browserAction.setIcon({path : '/assets/img/emoteli/sleeping.png'});
  }
}

/**
 * Logs the user out
 */
function logout () {
  firebase.auth().signOut();
}

/**
 * Gets the current user (or null)
 *
 * @return {Boolean} The
 */
function getUser () {
  return firebase.auth().currentUser;
}
