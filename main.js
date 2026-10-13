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

