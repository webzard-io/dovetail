interface Window {
  MonacoEnvironment: {
    getWorker: (moduleId: unknown, label: string)=> unknown;
  }
}
