// Storage for tokens
var VungleHelper = {};







VungleHelper.setSKPresentation = function (eventType, presentationType, presentationOptions = null) {
  var creativeEventTypes = {
    skPresentationASOIInteraction: 'asoi-interaction',
    skPresentationASOIComplete: 'asoi-complete',
    skPresentationCTAClick: 'cta-click',
  };

  //Check if creative event matches supported events
  var objectKey = Object.keys(creativeEventTypes).find((key) => creativeEventTypes[key] === eventType);

  if (objectKey) {
    var skPresentationSettings = {};
    skPresentationSettings[objectKey] = { presentationType: presentationType, presentationOptions: presentationOptions };
    window.sendMessage('ad-event-sk-presentation', skPresentationSettings);
  }
};

VungleHelper.dismissSKOverlay = function () {
  window.sendMessage('ad-event-sk-dismiss');
};

var clickEvent = (function () {
  if ('ontouchstart' in document.documentElement === true) {
    return 'touchstart';
  }
  return 'click';
}());

// Legacy IEC v1 Event
window.callSDK = function (action) {
  parent.postMessage(action, '*');
};

// Legacy IEC v2 Event
window.actionClicked = function (action) {
  parent.postMessage(action, '*');
};

// Adwords Open Event
window.open = function () {
  //Open should always redirect to CTA Download
  parent.postMessage('download', '*');
};

window.addEventListener(clickEvent, function () {
  parent.postMessage('interacted', '*');
});

window.addEventListener(clickEvent, function (e) {
  // Since the click event is on ad.html, we need to pass the click coordinates to the parent page outside the iframe.
  let clientX = 0;
  let clientY = 0;
  clientX = e.touches ? e.touches[0].clientX : e.clientX;
  clientY = e.touches ? e.touches[0].clientY : e.clientY;
  parent.postMessage('clickEvent|' + clientX + '|' + clientY, '*');
});

document.addEventListener('DOMContentLoaded', function () {
  window.sendMessage('ad-event-loaded');
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    e.preventDefault();
  }
});

function sendEvent(name, obj) {
  if (typeof obj === 'undefined') {
    obj = {};
  }
  var event = new CustomEvent(name, { 'detail': obj });
  window.dispatchEvent(event);
}

Event.prototype.stopPropagation = function () {
  // Disable Event Propagation for touchstart event listeners
};

window.sendMessage = function (title, obj) {
  // Make sure you are sending a string, and to stringify JSON
  var data = {
    title: title,
    content: obj,
  };

  window.parent.postMessage(data, '*');
};

window.receiveMessage = function (e) {
  if (e.data.length === 0 || typeof e.data.title === 'undefined') {
    return;
  }

  window.processMessage(e.data.title, e.data.content || {});
  sendEvent(e.data.title, e.data.content || {});
};

window.processMessage = function (title, content) {
  if (title === 'ad-event-init') {
    VungleHelper.tokens = content.tokens;
    VungleHelper.closeDelay = content.closeDelay;
    VungleHelper.rewardedAd = content.rewardedAd;
  }
};

window.addEventListener('message', window.receiveMessage);

window.sendInstructions = function () {
  window.sendMessage('ad-event-child-instructions', window.vungleSettings);
};

if (typeof window.vungleSettings !== 'undefined') {
  window.sendInstructions();
}
