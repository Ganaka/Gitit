const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: "Git Multi-Profile Dashboard",
        backgroundColor: "#0d1117",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Remove the default web menu bar layout for a clean app feel
    mainWindow.setMenuBarVisibility(false);

    // Mount your structural layout engine
    mainWindow.loadFile('index.html');
}

// Native Bash execution channel context handler
ipcMain.handle('execute-git-macro', async (event, payload) => {
    const { directory, remote, username, useremail } = payload;
    
    // Safety chaining execution macro strings targeting target subdirectories safely
    const command = `cd "${directory}" && git remote set-url origin "${remote}" && git config user.name "${username}" && git config user.email "${useremail}" && git remote -v && git config --local --list`;

    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            let output = "";
            if (error) {
                output += `❌ Operational Error: ${error.message}\n`;
            }
            if (stderr) {
                output += `⚠️ Stderr Pipe logs:\n${stderr}\n`;
            }
            output += `🚀 Execution complete:\n${stdout || 'Done with no standard console logs backflowing.'}`;
            resolve(output);
        });
    });
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


/*
//server.js uptil v0.0.2

const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve up the app structure automatically
app.use(express.static(__dirname));

app.post('/execute-git', (req, res) => {
    const { directory, remote, username, useremail } = req.body;
    
    // Safety chaining execution macro strings safely targeting subdirectories
    const command = `cd "${directory}" && git remote set-url origin "${remote}" && git config user.name "${username}" && git config user.email "${useremail}" && git remote -v && git config --local --list | grep user`;

    exec(command, (error, stdout, stderr) => {
        let output = "";
        if (error) {
            output += `Error: ${error.message}\n`;
        }
        if (stderr) {
            output += `Stderr context:\n${stderr}\n`;
        }
        output += `Stdout log:\n${stdout || 'Execution array complete with no standard buffer backflows.'}`;
        
        res.json({ output });
    });
});

app.listen(8032, () => {
    console.log("🚀 Live Git Engine Switcher Desktop Daemon bound successfully onto http://localhost:8032");
    console.log("👉 Open your browser to http://localhost:8032 to see your single-window app running!");
});

/*
// v0.0.1
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static front-end files from a folder named 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint to get Git status of a local directory
app.post('/api/git-status', (req, res) => {
    const { repoPath } = req.body;

    if (!repoPath) {
        return res.status(400).json({ error: 'Repository path is required' });
    }

    // Execute the git status command in the specified directory
    exec('git status', { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr || error.message });
        }
        res.json({ output: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Git Web GUI running at http://localhost:${PORT}`);
});
*/