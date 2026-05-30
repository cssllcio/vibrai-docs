export interface DocsExport {
  engineVersion: string;
  generatedAt: string;
  features: Feature[];
  unpaired: { cliOnly: string[]; mcpOnly: string[] };
}
export interface Feature {
  id: string;
  title: string;
  description: string;
  cli: { branch: string; commands: CliCommand[] };
  mcp: { tools: McpTool[] };
}
export interface CliCommand {
  name: string;
  description: string;
  arguments: { name: string; required: boolean; description: string }[];
  options: { name: string; valueName?: string; default?: string; description: string }[];
}
export interface McpTool {
  name: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
}
