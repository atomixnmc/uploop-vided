/**
 * @uploop/toolset — AI-Callable Tool Registry
 *
 * Exposes uploop-vided engine capabilities as AI-callable tools with JSON
 * Schema definitions. AI acts as the director — it plans composition, calls
 * tools to build timelines/effects, and renders output.
 *
 * Includes an OpenAI-compatible advisor resource that can suggest tool calls
 * based on natural language requests. Toolset is a HyperGraph node —
 * inspectable, traceable.
 */

export { createToolset } from './toolset.js'
export { SchemaRegistry } from './schema.js'
export { Advisor } from './advisor.js'
export { ToolResource } from './resource.js'
