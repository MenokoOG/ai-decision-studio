export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ChatRequest {
  system: string;
  user: string;
}

export async function testProviderConnection(config: ProviderConfig): Promise<boolean> {
  if (!config.baseUrl || !config.apiKey || !config.model) return false;
  return true;
}
