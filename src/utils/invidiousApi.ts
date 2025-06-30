
const INVIDIOUS_INSTANCES = [
  'https://invidious.privacydev.net',
  'https://invidious.lunar.icu',
  'https://inv.riverside.rocks',
  'https://invidious.slipfox.xyz',
  'https://invidious.io'
];

export const fetchWithFallback = async (endpoint: string, maxRetries = 3): Promise<any> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < Math.min(maxRetries, INVIDIOUS_INSTANCES.length); i++) {
    const instance = INVIDIOUS_INSTANCES[i];
    const url = `${instance}/api/v1/${endpoint}`;
    
    try {
      console.log(`Trying instance: ${instance}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Success with instance: ${instance}`);
      return data;
    } catch (error) {
      console.error(`Failed with instance ${instance}:`, error);
      lastError = error as Error;
      continue;
    }
  }
  
  throw lastError || new Error('All Invidious instances failed');
};
