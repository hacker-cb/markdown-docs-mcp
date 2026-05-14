// Error helper for tool stubs in PR-02. Real handlers in PR-04 onward replace
// these returns with actual results.

export class NotImplementedError extends Error {
  readonly toolName: string;

  constructor(toolName: string) {
    super(
      `Tool "${toolName}" is registered but not yet implemented in this build. ` +
        `It will be available in a later release.`
    );
    this.name = "NotImplementedError";
    this.toolName = toolName;
  }
}
