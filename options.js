// Load Settings
chrome.storage.local.get(['rpcBaseUrl', 'rpcSecret'], (result) => {
  if (result.rpcBaseUrl) {
    document.getElementById('rpcUrl').value = result.rpcBaseUrl;
  } else {
    document.getElementById('rpcUrl').value = 'http://localhost:6800/jsonrpc';
  }

  if (result.rpcSecret) {
    document.getElementById('rpcSecret').value = result.rpcSecret;
  }
});

// Save Settings
document.getElementById('saveBtn').addEventListener('click', () => {
  const rpcUrl = document.getElementById('rpcUrl').value.trim();
  const rpcSecret = document.getElementById('rpcSecret').value.trim();
  const statusDiv = document.getElementById('status');

  chrome.storage.local.set({
    rpcBaseUrl: rpcUrl,
    rpcSecret: rpcSecret
  }, () => {
    statusDiv.textContent = 'Settings Updated!';
    statusDiv.className = 'status success';

    // Config Update Event (for Service Worker)
    chrome.runtime.sendMessage({
        type: 'config-updated',
        baseUrl: rpcUrl,
        secret: rpcSecret
    }).catch(err => console.log('Service worker not ready:', err));

    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 2000);
  });
});