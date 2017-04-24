var facebookBtn = document.getElementById('button-facebook-login');

/**
 * Login with Facebook
 */
facebookBtn.onclick = function () {
  chrome.extension.sendMessage({
    action : 'auth'
  });
  window.close();
}
