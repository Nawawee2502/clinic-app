const { app, BrowserWindow } = require('electron');
const path = require('path');

// ใช้ process.env แทน electron-is-dev
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false,
    titleBarStyle: 'default'
  });

  // โหลด React app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  console.log('Loading URL:', startUrl);
  console.log('Is Dev Mode:', isDev);
  console.log('__dirname:', __dirname);
  console.log('Build path:', path.join(__dirname, '../build/index.html'));

  mainWindow.loadURL(startUrl);

  // เพิ่ม error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Window is ready to show');
  });

  // เปิด DevTools เสมอเพื่อ debug (ชั่วคราว)
  mainWindow.webContents.openDevTools();

  mainWindow.setMenuBarVisibility(false);

  // เพิ่ม event listener สำหรับ debug
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log('Console:', message);
  });
}

app.whenReady().then(() => {
  console.log('Electron app is ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// เพิ่ม error handling สำหรับ app
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});