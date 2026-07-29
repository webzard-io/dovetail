interface Window {
  MonacoEnvironment: {
    getWorker: (moduleId: unknown, label: string) => unknown;
  }
  _MonacoSchemaMap: Map<string, {
    uri: string;
    fileMatch: string[];
    schema: JSONSchema7;
  }>;
}
