import type { Feature, CliCommand, McpTool } from './spec-types';

function escapeMdx(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\{/g, '&#123;');
}

function cliUsage(cmd: CliCommand): string {
  const args = cmd.arguments.map(a => (a.required ? `<${a.name}>` : `[${a.name}]`));
  const opts = cmd.options.map(o => (o.valueName ? `${o.name} <${o.valueName}>` : o.name));
  return ['vibrai', cmd.name, ...args, ...opts].join(' ');
}

function mcpCall(tool: McpTool): string {
  const args: Record<string, string> = {};
  for (const p of tool.parameters) args[p.name] = `<${p.type}>`;
  return JSON.stringify({ tool: tool.name, arguments: args }, null, 2);
}

function cliParams(cmd: CliCommand): string {
  const lines: string[] = [];
  for (const a of cmd.arguments)
    lines.push(`<ParamField path="${a.name}"${a.required ? ' required' : ''}>\n  ${escapeMdx(a.description)}\n</ParamField>`);
  for (const o of cmd.options) {
    const def = o.default ? ` default="${o.default}"` : '';
    lines.push(`<ParamField path="${o.name}"${def}>\n  ${escapeMdx(o.description)}\n</ParamField>`);
  }
  return lines.join('\n');
}

function mcpParams(tool: McpTool): string {
  return tool.parameters.map(p =>
    `<ParamField path="${p.name}" type="${p.type}"${p.required ? ' required' : ''}>\n  ${escapeMdx(p.description)}\n</ParamField>`
  ).join('\n');
}

function cliSection(feature: Feature): string {
  if (feature.cli.commands.length === 0) return '';
  const blocks = feature.cli.commands.map(cmd =>
    `### \`${cmd.name}\`\n\n${escapeMdx(cmd.description)}\n\n\`\`\`bash\n${cliUsage(cmd)}\n\`\`\`\n\n${cliParams(cmd)}`
  ).join('\n\n');
  return `## Command line\n\n${blocks}`;
}

function mcpSection(feature: Feature): string {
  if (feature.mcp.tools.length === 0) return '';
  const blocks = feature.mcp.tools.map(tool =>
    `### \`${tool.name}\`\n\n${escapeMdx(tool.description)}\n\n\`\`\`json\n${mcpCall(tool)}\n\`\`\`\n\n${mcpParams(tool)}`
  ).join('\n\n');
  return `## MCP tools\n\n${blocks}`;
}

export function renderFeature(feature: Feature): string {
  const body = [cliSection(feature), mcpSection(feature)].filter(Boolean).join('\n\n');
  return [
    '---',
    `title: "${feature.title}"`,
    `description: "${feature.description.replace(/"/g, '\\"')}"`,
    '---',
    '',
    '{/* GENERATED — do not edit by hand. Regenerate with `npm run generate:reference`. */}',
    '',
    escapeMdx(feature.description),
    '',
    body,
    '',
  ].join('\n');
}
