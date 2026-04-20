import { contextBridge, ipcRenderer } from 'electron';

import {
  IPC_CHANNELS,
  type AiDecisionStudioBridge,
  type BusinessCasePreviewInput,
  type DecisionMatrixOptionInput,
  type RoadmapPhaseInput,
} from '../shared/ipc';

const bridge: AiDecisionStudioBridge = {
  appName: 'AI Decision Studio',
  appAuthor: 'Menoko OG',
  version: '0.1.0',
  listTemplates: () => ipcRenderer.invoke(IPC_CHANNELS.listTemplates),
  previewBusinessCase: (input: BusinessCasePreviewInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.previewBusinessCase, input),
  createInitiativeFromTemplate: (templateSlug: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.createInitiativeFromTemplate, templateSlug),
  listInitiatives: () => ipcRenderer.invoke(IPC_CHANNELS.listInitiatives),
  getInitiativeWorkspace: (initiativeId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.getInitiativeWorkspace, initiativeId),
  saveBusinessCase: (initiativeId: string, input: BusinessCasePreviewInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveBusinessCase, initiativeId, input),
  getDecisionMatrix: (initiativeId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.getDecisionMatrix, initiativeId),
  saveDecisionMatrix: (initiativeId: string, options: DecisionMatrixOptionInput[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveDecisionMatrix, initiativeId, options),
  getRoadmap: (initiativeId: string) => ipcRenderer.invoke(IPC_CHANNELS.getRoadmap, initiativeId),
  saveRoadmap: (initiativeId: string, phases: RoadmapPhaseInput[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveRoadmap, initiativeId, phases),
  exportInitiativeMarkdown: (initiativeId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.exportInitiativeMarkdown, initiativeId),
};

contextBridge.exposeInMainWorld('aiDecisionStudio', bridge);
