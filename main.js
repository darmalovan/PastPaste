const electron = require('electron');

const {app} = electron;
const {BrowserWindow, globalShortcut, Tray, Menu} = electron;
const path = require('path');

const iconPath = path.join(__dirname, 'icon.png');

let win;
let appIcon;

function createWindow() {
  appIcon = new Tray(iconPath);

  win = new BrowserWindow({
    width: 400,
    height: 600,
    type: 'textured'
  });
  win.loadURL(`file://${__dirname}/index.html`);

  globalShortcut.register('Control+A', () => {
    if (win.isFocused()) {
      win.blur();
    } else {
      win.show();
    }
  });

  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Item1',
      type: 'radio',
      icon: iconPath
    },
    {
      label: 'Item2',
      submenu: [
        { label: 'submenu1' },
        { label: 'submenu2' }
      ]
    },
    {
      label: 'Item3',
      type: 'radio',
      checked: true
    },
    {
      label: 'Toggle DevTools',
      accelerator: 'Alt+Command+I',
      click: function() {
        win.show();
      }
    },
    { label: 'Quit',
      accelerator: 'Command+Q',
      selector: 'terminate:'  
    }
  ]);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  globalShortcut.unregisterAll();
});

app.on('will-quit', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});



