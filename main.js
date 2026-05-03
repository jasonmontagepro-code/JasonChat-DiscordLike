const { app, BrowserWindow } = require('electron');
const path = require('path');
function createWindow () {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  win.loadFile('resources/app/wwwroot/index.html');
}
app.whenReady().then(createWindow);
app.on('window-all-closed', function () { if (process.platform !== 'darwin') app.quit(); });
