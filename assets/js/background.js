var loadedTabs = {}
    emoteIds = {
      entertaining : 1,
      'thought-provoking' : 2,
      bad : 3,

      1 : 'entertaining',
      2 : 'thought-provoking',
      3 : 'bad'
    };

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
    watchEmoteli(tab);
  }
}

/**
 * Called when the active tab is changed
 *
 * @param {Object} activeInfo The active tab info object
 */
function onActivated (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    watchEmoteli(tab);
  });
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
        watchEmoteli(tabs[0]);
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

    saveEmoteli(data);
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

    chrome.browserAction.setIcon({path : '/assets/img/emoteli/' + (loadedTabs[tabId].icon || 'new') + '.png'});
  }
}

/**
 * Saves the emoteli to the database
 *
 * @param {Object} data The emoteli payload
 */
function saveEmoteli (data) {
  var user = getUser(),
      updates = {};

  updates['/user/' + user.uid + '/url/' + encodeRef(data.tab.url)] = emoteIds[data.emote];
  updates['/url/' + encodeRef(data.tab.url) + '/emote/' + user.uid] = emoteIds[data.emote];

  firebase.database().ref().update(updates)
    .catch(function (err) {
      alert(err.message);
    });
}

/**
 * Watches the page for emoteli changes
 *
 * @param  {Object} tab The tab being watched
 */
function watchEmoteli (tab) {
  var ref,
      user = getUser();

  if (user) {
    ref = '/user/' + user.uid + '/url/' + encodeRef(tab.url);
    if (loadedTabs[tab.id] && loadedTabs[tab.id].ref) {
      loadedTabs[tab.id].ref.off('value');
      loadedTabs[tab.id].ref = null;
    }

    if (!loadedTabs[tab.id]) {
      loadedTabs[tab.id] = {};
    }

    loadedTabs[tab.id].ref = firebase.database().ref(ref);
    loadedTabs[tab.id].ref.on('value', function (snap) {
      if (snap) {
        loadedTabs[tab.id].icon = emoteIds[snap.val()];

        chrome.tabs.query({active : true, currentWindow : true}, function (newTab) {
          if (newTab[0].id === tab.id) {
            updateEmoteli(tab.id);
          }
        });
      }
    });
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

/**
 * Encodes refs for firebase
 *
 * @param  {String} ref The ref to encode
 * @return {String}     Encoded ref
 */
function encodeRef (ref) {
  return ref.replace(/\./g, '||dot||').replace(/\$/g, '||dollar||').replace(/\#/g, '||pound||').replace(/\[/g, '||open||').replace(/\]/g, '||close||').replace(/\//g, '||slash||');
}

/**
 * Decodes refs for firebase
 *
 * @param  {String} ref The ref to decode
 * @return {String}     Decoded ref
 */
function decodeRef (ref) {
  return ref.replace('||dot||', '.').replace('||dollar||', '$').replace('||pound||', '#').replace('||open||', '[').replace('||close||', ']').replace('||slash||', '/');
}
