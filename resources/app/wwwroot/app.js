// ------ DATA/STATE ------
const state = {
  servers: [],
  currentServer: null,
  channels: [],
  currentChannel: null,
  roles: [],
  currentUser: { status: "online", profile: {} },
  members: [],
  threads: [],
  inThread: false
};

// ====== UI SURFACES =====
window.addEventListener("DOMContentLoaded", async ()=>{
  await loadServers();
  bindComposer();
  document.getElementById('user-status').value = state.currentUser.status;
});

// ----------- SERVERS (guildes) DISCORD -------
async function loadServers() {
  // fake/placeholder
  state.servers = await api("/api/servers");
  renderServers();
  if(state.servers.length) switchServer(state.servers[0].id);
}
function renderServers() {
  const zone = document.getElementById('server-list');
  zone.innerHTML = state.servers.map(s=>
    `<div class="server-icon" title="${s.name}" onclick="switchServer('${s.id}')">${s.icon || s.name[0]}</div>`
  ).join('');
}
function switchServer(id) {
  state.currentServer = state.servers.find(s=>s.id==id);
  document.getElementById('server-name').textContent = state.currentServer.name;
  loadChannels(id);
}
function openCreateServerModal() {
  // TODO: modal UX. Prompt for now.
  const name = prompt('Nom du serveur ?');
  if (!name) return;
  api("/api/servers", {method:"POST", body:JSON.stringify({name}), headers: {"Content-Type":"application/json"}})
    .then(loadServers);
}

// ------ CHANNELS ------
async function loadChannels(serverId) {
  state.channels = await api(`/api/servers/${serverId}/channels`);
  renderChannels();
}
function renderChannels() {
  document.getElementById('channels-list').innerHTML = state.channels.map(
    c => `<div class="channel-item" onclick="switchChannel('${c.id}')"><i data-lucide="${c.type == 'voice' ? 'volume-2':'hash'}"></i>${c.name}</div>`
  ).join('');
}
function switchChannel(id) {
  state.currentChannel = state.channels.find(c=>c.id==id);
  document.getElementById('channel-title').textContent = state.currentChannel.name;
  // Load messages
  loadMessages();
}

// ------ ROLES/PERMISSIONS -------
function renderRoles() {
  if(!state.currentServer || !state.currentServer.roles) return;
  document.getElementById('roles-list').innerHTML = state.currentServer.roles.map(
    r=>`<div class="role-item" style="color:${r.color}">${r.name}</div>`
  ).join('');
}

// ------ MESSAGES / THREADS / REACTIONS -----
async function loadMessages() {
  const msgs = await api(`/api/channels/${state.currentChannel.id}/messages`);
  renderMessages(msgs);
}
function renderMessages(msgs=[]) {
  const zone = document.getElementById('messageList');
  zone.innerHTML = msgs.map(renderMessage).join('');
}
function renderMessage(m) {
  return `<div class="message">
    <span class="avatar" style="background:${m.color||'#ccc'}">${m.user[0]}</span>
    <span class="body">
      <b>${m.user}</b>
      <span class="meta">${new Date(m.date).toLocaleTimeString()}</span>
      <span class="text" onclick="openThread('${m.id}')">${m.text.replace(/@([a-z]+)/g,'<span class="mention">@$1</span>')}</span>
      ${m.attachments.map(renderAttachment).join('')}
      <span class="reactions">${Object.entries(m.reactions||{}).map(([e,n])=>`<button onclick="react('${m.id}','${e}')">${e} ${n}</button>`).join(' ')}</span>
      <button onclick="openThread('${m.id}')">Thread</button>
    </span>
  </div>`;
}
function renderAttachment(att) {
  return `<div class="file-attachment"><a href="${att.url}" download="${att.name}">${att.name}</a> (${formatBytes(att.size)})</div>`;
}
function react(msgId, emoji) {
  // POST to /api/messages/:id/react
  api(`/api/messages/${msgId}/react`, {method:"POST", body:JSON.stringify({emoji}), headers: {"Content-Type":"application/json"}}).then(()=>loadMessages());
}
function openThread(msgId) {
  // Charger thread + switch
  state.inThread = true;
  document.getElementById('thread-section').innerHTML = `<button onclick="closeThread()">← Retour</button><div id="thread-messages"></div>`;
  // charger thread:
  api(`/api/messages/${msgId}/threads`).then(msgs => {
    document.getElementById('thread-messages').innerHTML = msgs.map(renderMessage).join('');
  });
}
function closeThread() {
  state.inThread = false;
  document.getElementById('thread-section').innerHTML = '';
}

// ------- ENVOI MESSAGE / ATTAHCMENT ----------
function bindComposer() {
  document.getElementById('composerForm').onsubmit = async function(e){
    e.preventDefault();
    const text = document.getElementById('messageInput').value;
    const files = document.getElementById('fileInput').files;
    const form = new FormData();
    form.append("text", text);
    for(let f of files) form.append("files",f);
    await api(`/api/channels/${state.currentChannel.id}/messages`, {method:"POST", body: form});
    document.getElementById('messageInput').value = '';
    renderMessages(await api(`/api/channels/${state.currentChannel.id}/messages`));
  };
}

// ------- STATUS, PROFIL ---------
function changeStatus(status) {
  state.currentUser.status = status;
  api("/api/me/status", {method:"POST", body: JSON.stringify({status}), headers:{"Content-Type":"application/json"}});
}
function openUserProfile(userId) {
  // modal/affiche profil avancé
  api(`/api/users/${userId}`).then(u => {
    alert(u.username + "\n" + u.bio);
  });
}

// ----- APPEL (Voix/Vidéo/Écran) -----
function startCall(type){
  showToast("Appel "+type+" (simulation — nécessite backend WebRTC)");
  // Intégrer socket.io/WebRTC ici côté prod
}

// ------- FICHIERS & TELECHARGEMENT ------------
function renderAttachment(att) {
  return `<div class="file-attachment"><a href="${att.url}" download="${att.name}"><i data-lucide="download"></i>${att.name}</a> (${formatBytes(att.size)})</div>`;
}

// ------ UTILS "API"/FETCH -----
function api(url,opt={}){
  // "Fake" pour dev, à remplacer par ta logique à toi ou fetch classique si backend prêt
  // return fetch(url,opt).then(r=>r.json());
  return new Promise(res=>setTimeout(()=>res([]),200)); // DEV: simule vide
}
function showToast(msg,err){ alert(msg); }
function formatBytes(bytes){ if(!bytes) return "";const si=['B','KB','MB','GB'];let i=Math.floor(Math.log(bytes)/Math.log(1024));return (bytes/Math.pow(1024,i)).toFixed(1)+" "+si[i]; }
window.switchServer = switchServer;
window.switchChannel = switchChannel;
window.react = react;
window.openThread = openThread;
window.closeThread = closeThread;
window.changeStatus = changeStatus;
window.startCall = startCall;
window.openUserProfile = openUserProfile;
