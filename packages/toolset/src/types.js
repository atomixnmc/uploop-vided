/**
 * @typedef {Object} ToolDefinition
 * @property {string} name — unique tool identifier (e.g. 'timeline.addTrack')
 * @property {string} description — what the tool does
 * @property {Object} parameters — JSON Schema for parameters
 *
 * @typedef {Object} Toolset
 * @property {Function} register — register a tool
 * @property {Function} call — call a tool by name with params → result
 * @property {Function} describe — get all tool schemas (for AI context)
 * @property {Function} ask — ask advisor for suggestions (natural language → tool calls)
 * @property {Object} advisor — OpenAI-compatible advisor resource
 * @property {Function} dispose
 *
 * @typedef {Object} AdvisorConfig
 * @property {string} endpoint — OpenAI-compatible API endpoint
 * @property {string} model — model name (e.g. 'gpt-4o')
 * @property {string} [system] — system prompt
 * @property {string} [apiKey] — API key (or env var)
 * @property {Object} [cache] — { ttl, swr } for advisor responses
 *
 * @typedef {Object} ToolResource
 * @property {string} name
 * @property {ToolDefinition} schema
 * @property {Function} handler — actual implementation
 * @property {'hot'|'cold'|'stable'} [temperature]
 * @property {Object} [cache] — cache config for tool results
 */

export default {}
