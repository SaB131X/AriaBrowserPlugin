// Default RPC server config
let rpcConfig = {
  baseUrl: 'http://localhost:6800/jsonrpc',
  secret: ''
};

// Load settings on startup
chrome.storage.local.get(['rpcBaseUrl', 'rpcSecret'], (result) => {
  if (result.rpcBaseUrl) rpcConfig.baseUrl = result.rpcBaseUrl;
  if (result.rpcSecret) rpcConfig.secret = result.rpcSecret;
});

// Create context menu on install
chrome.contextMenus.create({
    id: 'download-with-aria2',
    title: 'Download with aria2',
    contexts: ['link']
});

// Get Data from Settings
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'config-updated') {
    rpcConfig.baseUrl = message.baseUrl;
    rpcConfig.secret = message.secret;
    sendResponse({ success: true });
  }
  return true;
});

// OnClick Event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'download-with-aria2' && info.linkUrl) {
    sendToAria2(info.linkUrl);
  }
});

async function sendToAria2(url) {
  try {
    // Creating JSON-RPC payload
    const payload = {
      jsonrpc: '2.0',
      id: Date.now().toString(),
      method: 'aria2.addUri',
      params: []
    };

    // Adding Secret if Any
    if (rpcConfig.secret) {
      payload.params.push(`token:${rpcConfig.secret}`);
      payload.params.push([url]);
    } else {
      payload.params.push([url]);
    }
    // Fetch the Payload
    const response = await fetch(rpcConfig.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC error ${data.error.code}: ${data.error.message}`);
    }

    // Success Notif
    chrome.notifications?.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Aria2 Downloader',
      message: `Task Created: ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`
    });

    console.log(`Download started with GID: ${data.result}`);

  } catch (error) {
    // Error Notifs
    console.error('Failed to send to aria2:', error);

    let userMessage = '';
    if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
      userMessage = 'CORS Error: Launch aria2 with --rpc-allow-origin-all (or add rpc-allow-origin-all=true in aria2.conf)';
    } else {
      userMessage = `Error: ${error.message}`;
    }

    chrome.notifications?.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Aria2 Error',
      message: userMessage
    });
    
  }
}
// Config Update Event
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'config-updated') {
    rpcConfig.baseUrl = message.baseUrl;
    rpcConfig.secret = message.secret;
    sendResponse({ success: true });
  }
  return true;
});