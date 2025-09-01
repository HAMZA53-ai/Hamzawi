
// FIX: The API key must be handled via environment variables (`process.env.API_KEY`)
// and not through a user-facing settings UI, as per the coding guidelines.
// This hook's functionality is therefore removed. A stub is provided for compatibility.

export const useSettings = () => {
  return {
    apiKeys: [],
    activeApiKey: null,
    activeApiKeyId: null,
    addApiKey: () => {},
    deleteApiKey: () => {},
    setActiveApiKey: () => {},
    updateApiKey: () => {},
  };
};
