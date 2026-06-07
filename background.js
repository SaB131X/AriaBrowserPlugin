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

    //Controller used to abort request if no response in 5s 
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Fetch the Payload
    const response = await fetch(rpcConfig.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Response Body Extraction
      let errorDetail = '';
      try {
        const errorBody = await response.text();
        errorDetail = errorBody.substring(0, 100);
      } catch(e) {
        errorDetail = 'No additional details';
      }
      
      // Wrong Secret
      if (response.status === 400) {
        throw new Error('HTTP_400_UNAUTHORIZED');
      } else {
        throw new Error(`HTTP_${response.status}`);
      }
    }

    const data = await response.json();
    
    if (data.error) {
      // code 1 in aria2 = Unauthorized
      if (data.error.code === 1) {
        throw new Error('RPC_UNAUTHORIZED');
      } else {
        throw new Error(`RPC_ERROR_${data.error.code}: ${data.error.message}`);
      }
    }

    // Success Notif
    const shortUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
    showNotification(
      '✅ Aria2 Browser Plugin', 
      `Download started. \nURL: ${shortUrl} \nGID: ${data.result}`,
      false,
      5000
    );

    console.log(`Download started with GID: ${data.result}`);

  } catch (error) {
    // Error Notifs
    console.error('Failed to send to aria2:', error);

    const errorMessage = error.message || String(error);
    
    // Wrong Secret
    if (errorMessage.includes('UNAUTHORIZED') || 
        errorMessage.includes('HTTP_400')) {
      showNotification(
        '🔐 Aria2: Wrong Password',
        'The RPC Secret in extension settings does not match the one in aria2.conf',
        true,
        15000
      );
    }
    // No RPC Server
    else if (errorMessage.includes('Failed to fetch') ||
             errorMessage.includes('NetworkError') ||
             errorMessage.includes('aborted') ||
             errorMessage.includes('TypeError') ||
             errorMessage.includes('HTTP_500') ||
             errorMessage.includes('HTTP_502') ||
             errorMessage.includes('HTTP_503') ||
             errorMessage.includes('HTTP_504')) {
      showNotification(
        '🔌 Aria2: Server Unreachable',
        `Cannot connect to aria2 RPC server at:\n${rpcConfig.baseUrl}`,
        true,
        15000
      );
    }
    // CORS Error
    else if (errorMessage.includes('CORS')) {
      showNotification(
        '🌐 Aria2: CORS Error',
        'Add "rpc-allow-origin-all=true" to your aria2.conf file and restart aria2',
        true,
        15000
      );
    }
    // General Error
    else {
      showNotification(
        '⚠️ Aria2: Unknown Error',
        `Something went wrong:\n${errorMessage}`,
        true,
        15000
      );
    }
  }
}

function showNotification(title, message, isError = false) {
  const notificationId = `aria2-${Date.now()}`;
  const notificationsAPI = chrome.notifications || browser?.notifications;
  const isFirefox = navigator.userAgent.includes('Firefox') || typeof InstallTrigger !== 'undefined';

  // Custom Browser Engine
  if (!notificationsAPI) {
    console.log(`${title}: ${message}`);
    return;
  }

  // General MSG (checks for firefox notif API)
  if (isFirefox) {
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icon48.png',
      title: title,
      message: message.substring(0, 200)
    });
  }
  else{
    notificationsAPI.create(notificationId, {
      type: 'basic',
      iconUrl: 'icon48.png',
      title: title,
      message: message.substring(0, 200),
      buttons: isError ? [{ title: 'Open Settings' }] : undefined,
      requireInteraction: true
    });
  }

  // Set MSG life timeout
  setTimeout(() => {
    try {
      notificationsAPI.clear(notificationId, () => {
        if (chrome.runtime.lastError) {
          console.log('Cannot clear notification in Chrome MV3, will auto-expire naturally');
        }
      });
    } catch(e) {
    }
  }, isError ? 15000 : 5000);

  // Click on button
  notificationsAPI.onButtonClicked?.addListener((clickedId, buttonIndex) => {
    if (clickedId === notificationId && buttonIndex === 0) {
      chrome.runtime.openOptionsPage();
    }
  });
  
  // Click on notification(itself), useful for firefox
  notificationsAPI.onClicked?.addListener((clickedId) => {
    if (clickedId === notificationId) {
      chrome.runtime.openOptionsPage();
    }
  });
  
  return notificationId;
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