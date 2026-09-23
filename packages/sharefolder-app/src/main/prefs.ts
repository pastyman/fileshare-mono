import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export type AppPrefs = {
  openAtLogin: boolean;
};

const DEFAULT_PREFS: AppPrefs = {
  openAtLogin: true,
};

function prefsPath(): string {
  return path.join(app.getPath('userData'), 'prefs.json');
}

export function loadPrefs(): AppPrefs {
  try {
    const raw = fs.readFileSync(prefsPath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<AppPrefs>;
    return {
      openAtLogin:
        typeof parsed.openAtLogin === 'boolean'
          ? parsed.openAtLogin
          : DEFAULT_PREFS.openAtLogin,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(updates: Partial<AppPrefs>): AppPrefs {
  const next = { ...loadPrefs(), ...updates };
  fs.writeFileSync(prefsPath(), JSON.stringify(next, null, 2), 'utf8');
  return next;
}

/** Enable/disable launch at user login (Windows Startup, macOS Login Items, Linux XDG). */
export function applyOpenAtLogin(enabled: boolean): void {
  // Avoid registering the Electron/forge binary during local development.
  if (!app.isPackaged) {
    return;
  }

  if (process.platform === 'win32') {
    const appFolder = path.dirname(process.execPath);
    const updateExe = path.resolve(appFolder, '..', 'Update.exe');
    const exeName = path.basename(process.execPath);
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: updateExe,
      args: ['--processStart', exeName],
    });
    return;
  }

  app.setLoginItemSettings({
    openAtLogin: enabled,
  });
}

export function resolveAppIconPath(): string | undefined {
  const candidates = [
    path.join(process.resourcesPath, 'icons', 'icon.png'),
    path.join(process.resourcesPath, 'icon.png'),
    path.join(app.getAppPath(), 'assets/icons/icon.png'),
    path.join(__dirname, '../../assets/icons/icon.png'),
    path.join(__dirname, '../../../assets/icons/icon.png'),
  ];
  return candidates.find((p) => fs.existsSync(p));
}
