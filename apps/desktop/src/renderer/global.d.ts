import type { AiDecisionStudioBridge } from '../shared/ipc';

declare global {
    interface Window {
        aiDecisionStudio: AiDecisionStudioBridge;
    }
}

export { };
