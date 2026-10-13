document.getElementById('profileSearch').addEventListener('input', filterProfiles);

function filterProfiles() {
  const query = document.getElementById('profileSearch').value.toLowerCase();
  const cards = document.querySelectorAll('.profile-card');
  
  cards.forEach(card => {
    const title = card.querySelector('h4').innerText.toLowerCase();
    const sub = card.querySelector('p').innerText.toLowerCase();
    if (title.includes(query) || sub.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Replace ONLY the executeGitSwitch() function inside your app.js: v0.0.3
function executeGitSwitch() {
  const targetDir = document.getElementById('localRepoPath').value.trim();
  if (!targetDir) {
    alert("Please enter a valid, absolute local repository folder path!");
    return;
  }

  const consoleView = document.getElementById('terminalConsole');
  consoleView.innerText = "> Initializing connection sequence down to runtime agent...\n";

  const suffix = document.getElementById('profileAlias').value.trim() || "alias";
  const name = document.getElementById('gitName').value.trim() || "Name";
  const email = document.getElementById('gitEmail').value.trim() || "email@domain.com";
  const path = document.getElementById('repoPath').value.trim() || "User/Repo";
  const protocol = document.querySelector('input[name="protocol"]:checked').value;

  let remoteUrl = protocol === 'ssh' ? `git@github.com-${suffix}:${path}.git` : `https://github.com/${path}.git`;

  const payload = {
    directory: targetDir,
    remote: remoteUrl,
    username: name,
    useremail: email
  };

  // Use Electron's native context bridge instead of Fetch API
  const { ipcRenderer } = require('electron');
    
  ipcRenderer.invoke('execute-git-macro', payload)
    .then(response => {
      consoleView.innerText = response;
    })
    .catch(err => {
      consoleView.innerText = `❌ Terminal runtime failed to dispatch invocation process.\nDetails: ${err}`;
    });
}

/*
// LIVE BASH INTERACTION EXECUTION HOOK uptil v0.0.2
function executeGitSwitch() {
    const targetDir = document.getElementById('localRepoPath').value.trim();
    if (!targetDir) {
        alert("Please enter a valid, absolute local repository folder path!");
        return;
    }

    const consoleView = document.getElementById('terminalConsole');
    consoleView.innerText = "> Initializing connection sequence down to runtime agent...\n";

    const suffix = document.getElementById('profileAlias').value.trim() || "alias";
    const name = document.getElementById('gitName').value.trim() || "Name";
    const email = document.getElementById('gitEmail').value.trim() || "email@domain.com";
    const path = document.getElementById('repoPath').value.trim() || "User/Repo";
    const protocol = document.querySelector('input[name="protocol"]:checked').value;

    let remoteUrl = protocol === 'ssh' ? `git@github.com-${suffix}:${path}.git` : `https://github.com/${path}.git`;

    // Package payload payload configuration array context
    const instructions = {
        directory: targetDir,
        remote: remoteUrl,
        username: name,
        useremail: email
    };

    // Broadcast request to the native companion loop daemon running backend
    fetch('http://localhost:8032/execute-git', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instructions)
    })
    .then(res => res.json())
    .then(data => {
        consoleView.innerText += data.output;
    })
    .catch(err => {
        consoleView.innerText += `❌ API Connection Failed. Make sure your local desktop runner is spinning up!\nError Details: ${err}`;
    });
}
*/

// Structural Fallback Seed Data
const initialSeedData = [
  { id: "p1", alias: "githubuser", name: "GithubUser", email: "githubuser@email.com", repoPath: "GithubUser/App", protocol: "ssh", sshKey: "" },
  { id: "p2", alias: "localuser", name: "LocalUser", email: "localuser@email.com", repoPath: "LocalUser/OtherApp", protocol: "ssh", sshKey: "" }
];

let globalProfiles = [];
let currentProfileId = null;

// Initialize layout configurations on layout load
function initDashboard() {
  const stored = localStorage.getItem('git_multi_profiles');
  if (stored) {
    try { globalProfiles = JSON.parse(stored); } catch(e) { globalProfiles = [...initialSeedData]; }
  } else {
    globalProfiles = [...initialSeedData];
    saveAllToStorage();
  }
  renderSidebar();
  if (globalProfiles.length > 0) {
    selectProfile(globalProfiles[0].id);
  }
}

function saveAllToStorage() {
  localStorage.setItem('git_multi_profiles', JSON.stringify(globalProfiles));
}

// Render out left sidebar selector options
function renderSidebar() {
  const container = document.getElementById('profileContainer');
  container.innerHTML = '';
  
  globalProfiles.forEach(p => {
    const card = document.createElement('div');
    card.className = `profile-card ${p.id === currentProfileId ? 'active' : ''}`;
    card.setAttribute('onclick', `selectProfile('${p.id}')`);
    
    card.innerHTML = `
      <h4>${p.alias || 'Unnamed Profile'}</h4>
      <p>${p.name || 'No Name'} (${p.email || 'No Email'})</p>
      <button class="btn-delete-profile" onclick="deleteProfile('${p.id}', event)">✕</button>
    `;
    container.appendChild(card);
  });
}

// Switch targeted active view containers
function selectProfile(id) {
  currentProfileId = id;
  const profile = globalProfiles.find(p => p.id === id);
  
  if (!profile) {
    document.getElementById('activeWorkspace').style.display = 'none';
    document.getElementById('emptyNotice').style.display = 'block';
    return;
  }

  document.getElementById('emptyNotice').style.display = 'none';
  document.getElementById('activeWorkspace').style.display = 'block';

  // Populate interface elements
  document.getElementById('profileAlias').value = profile.alias || '';
  document.getElementById('gitName').value = profile.name || '';
  document.getElementById('gitEmail').value = profile.email || '';
  document.getElementById('repoPath').value = profile.repoPath || '';
  document.getElementById('sshPublicKey').value = profile.sshKey || '';
  
  const targetRadio = document.querySelector(`input[name="protocol"][value="${profile.protocol || 'ssh'}"]`);
  if(targetRadio) targetRadio.checked = true;

  renderSidebar();
  updateOutputs();
}

function createNewProfile() {
  const newId = 'profile_' + Date.now();
  const newProfile = {
    id: newId,
    alias: "new-profile-alias",
    name: "New Identity Name",
    email: "name@example.com",
    repoPath: "Username/Repository",
    protocol: "ssh",
    sshKey: ""
  };
  globalProfiles.push(newProfile);
  saveAllToStorage();
  selectProfile(newId);
}

function deleteProfile(id, event) {
  event.stopPropagation(); // Prevent card select handler from running 
  if (confirm("Are you sure you want to drop this specific profile from memory registries?")) {
    globalProfiles = globalProfiles.filter(p => p.id !== id);
    saveAllToStorage();
    
    if (currentProfileId === id) {
      currentProfileId = globalProfiles.length > 0 ? globalProfiles[0].id : null;
    }
    
    renderSidebar();
    selectProfile(currentProfileId);
  }
}

function saveActiveStateToStorage() {
  const idx = globalProfiles.findIndex(p => p.id === currentProfileId);
  if (idx !== -1) {
    globalProfiles[idx].alias = document.getElementById('profileAlias').value.trim();
    globalProfiles[idx].name = document.getElementById('gitName').value.trim();
    globalProfiles[idx].email = document.getElementById('gitEmail').value.trim();
    globalProfiles[idx].repoPath = document.getElementById('repoPath').value.trim();
    globalProfiles[idx].sshKey = document.getElementById('sshPublicKey').value.trim();
    globalProfiles[idx].protocol = document.querySelector('input[name="protocol"]:checked').value;
    
    saveAllToStorage();
    renderSidebar();
    updateOutputs();
    alert("Success: Structural profile data updated securely across persistent storage matrices!");
  }
}

function wipeAllData() {
  if (confirm("🚨 Master Destructive Reset: Clear ALL saved pipelines and settings from memory storage?")) {
    localStorage.removeItem('git_multi_profiles');
    window.location.reload();
  }
}

// Set up tracking on all elements for real-time text calculation output engines
['profileAlias', 'gitName', 'gitEmail', 'repoPath', 'sshPublicKey'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateOutputs);
});
document.getElementsByName('protocol').forEach(r => r.addEventListener('change', updateOutputs));

function updateOutputs() {
  if (!currentProfileId) return;

  const suffix = document.getElementById('profileAlias').value.trim() || "alias";
  const name = document.getElementById('gitName').value.trim() || "Name";
  const email = document.getElementById('gitEmail').value.trim() || "email@domain.com";
  const path = document.getElementById('repoPath').value.trim() || "User/Repo";
  const protocol = document.querySelector('input[name="protocol"]:checked').value;

  let remoteUrl = `https://github.com/${path}.git`;
  if (protocol === 'ssh') {
      remoteUrl = `git@github.com-${suffix}:${path}.git`;
  }

  document.getElementById('outputBlock').innerHTML = 
    `<span class="comment"># 1. Update project remote pointer</span>
    <span class="cmd">git remote set-url origin</span> <span class="string">${remoteUrl}</span>

    <span class="comment"># 2. Localize contextual profile commit credentials</span>
    <span class="cmd">git config user.name</span> <span class="string">"${name}"</span>
    <span class="cmd">git config user.email</span> <span class="string">"${email}"</span>`;

  document.getElementById('shellBlock').innerHTML = 
    `<span class="comment">#!/bin/bash</span>
    <span class="comment"># Run this inside your target Git repository folder</span>
    <span class="cmd">echo</span> <span class="string">"Applying Git Multi-Account environment modifications..."</span>
    <span class="cmd">git remote set-url origin</span> <span class="string">"${remoteUrl}"</span>
    <span class="cmd">git config user.name</span> <span class="string">"${name}"</span>
    <span class="cmd">git config user.email</span> <span class="string">"${email}"</span>
    <span class="cmd">echo</span> <span class="string">"Completed! Active workspace profiles matched to identity metadata successfully."</span>`;
}

function copyInlineBlock() {
  const text = document.getElementById('outputBlock').innerText;
  navigator.clipboard.writeText(text).then(() => {
      const b = document.querySelector('.output-header .btn-success');
      b.innerText = "Copied!";
      setTimeout(() => b.innerText = "Copy Snippet", 1500);
  });
}

function downloadBashMacro() {
  const contents = document.getElementById('shellBlock').innerText;
  const blob = new Blob([contents], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gitswitch.sh';
  link.click();
  URL.revokeObjectURL(link.href);
}

// Fire initial build thread loop
initDashboard();
