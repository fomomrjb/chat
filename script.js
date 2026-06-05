const usernameInput = document.getElementById('username');
const saveNameButton = document.getElementById('saveName');
const createOfferButton = document.getElementById('createOffer');
const localSignal = document.getElementById('localSignal');
const remoteSignal = document.getElementById('remoteSignal');
const copyLocalButton = document.getElementById('copyLocal');
const setRemoteOfferButton = document.getElementById('setRemoteOffer');
const setRemoteAnswerButton = document.getElementById('setRemoteAnswer');
const statusText = document.getElementById('connectionStatus');
const peerNameText = document.getElementById('peerName');
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessage');

let localConnection;
let dataChannel;
let isOfferer = false;
let peerName = '---';
let username = localStorage.getItem('p2p-chat-name') || '';

usernameInput.value = username;

function updateStatus(status) {
  statusText.textContent = status;
}

function updatePeerName(name) {
  peerName = name || '---';
  peerNameText.textContent = peerName;
}

function appendMessage(text, type, author) {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.innerHTML = `<span class="meta">${author}</span><span>${text}</span>`;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function ensureName() {
  username = usernameInput.value.trim() || 'Visitor';
  localStorage.setItem('p2p-chat-name', username);
  usernameInput.value = username;
}

function ensureConnection() {
  if (localConnection) return;

  localConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  localConnection.onicecandidate = (event) => {
    if (event.candidate) return;
    localSignal.value = JSON.stringify(localConnection.localDescription);
  };

  localConnection.onconnectionstatechange = () => {
    updateStatus(localConnection.connectionState);
  };

  localConnection.ondatachannel = (event) => {
    dataChannel = event.channel;
    bindDataChannel();
    updateStatus('connecting');
  };
}

function createOffer() {
  ensureName();
  ensureConnection();
  isOfferer = true;
  dataChannel = localConnection.createDataChannel('p2p-chat');
  bindDataChannel();

  localConnection.createOffer()
    .then((offer) => localConnection.setLocalDescription(offer))
    .catch((error) => alert('Offer failed: ' + error.message));
}

function bindDataChannel() {
  if (!dataChannel) return;

  dataChannel.onopen = () => {
    updateStatus('connected');
    if (username) {
      dataChannel.send(JSON.stringify({ type: 'username', text: username }));
    }
  };

  dataChannel.onmessage = (event) => {
    try {
      const packet = JSON.parse(event.data);
      if (packet.type === 'username') {
        updatePeerName(packet.text);
        return;
      }
    } catch {
      // not a JSON system packet
    }
    appendMessage(event.data, 'them', peerName || 'Friend');
  };

  dataChannel.onclose = () => {
    updateStatus('closed');
  };

  dataChannel.onerror = () => {
    updateStatus('error');
  };
}

function handleRemoteOffer() {
  ensureName();
  ensureConnection();
  const remote = remoteSignal.value.trim();
  if (!remote) return alert('Paste an offer first.');

  let remoteDesc;
  try {
    remoteDesc = JSON.parse(remote);
  } catch {
    return alert('Invalid offer JSON.');
  }

  localConnection.setRemoteDescription(remoteDesc)
    .then(() => localConnection.createAnswer())
    .then((answer) => localConnection.setLocalDescription(answer))
    .catch((error) => alert('Failed to handle offer: ' + error.message));
}

function handleRemoteAnswer() {
  const remote = remoteSignal.value.trim();
  if (!remote) return alert('Paste an answer first.');

  let remoteDesc;
  try {
    remoteDesc = JSON.parse(remote);
  } catch {
    return alert('Invalid answer JSON.');
  }

  localConnection.setRemoteDescription(remoteDesc)
    .catch((error) => alert('Failed to set answer: ' + error.message));
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !dataChannel || dataChannel.readyState !== 'open') return;
  dataChannel.send(text);
  appendMessage(text, 'you', 'You');
  messageInput.value = '';
}

function copyText(element) {
  element.select();
  element.setSelectionRange(0, 99999);
  document.execCommand('copy');
}

saveNameButton.addEventListener('click', () => {
  ensureName();
  updateStatus('name saved');
});
createOfferButton.addEventListener('click', () => createOffer());
copyLocalButton.addEventListener('click', () => copyText(localSignal));
setRemoteOfferButton.addEventListener('click', () => handleRemoteOffer());
setRemoteAnswerButton.addEventListener('click', () => handleRemoteAnswer());
sendMessageButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

updateStatus('ready');
updatePeerName('---');

window.addEventListener('beforeunload', () => {
  if (dataChannel) dataChannel.close();
  if (localConnection) localConnection.close();
});
