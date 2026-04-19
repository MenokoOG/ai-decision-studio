import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('aiDecisionStudio', {
  appName: 'AI Decision Studio',
  appAuthor: 'Menoko OG',
  version: '0.1.0',
});
