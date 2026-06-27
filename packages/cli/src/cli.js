/**
 * CLI — main entry point for uploop-video commands.
 */

import { commands } from './commands.js'

/**
 * Parse flags from CLI arguments.
 * Returns { args, opts } where opts has --key values.
 *
 * @param {string[]} argv
 * @returns {{ args: string[], opts: Record<string, string> }}
 */
function parseFlags(argv) {
  const args = []
  const opts = {}

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        opts[key] = next
        i++
      } else {
        opts[key] = 'true'
      }
    } else {
      args.push(argv[i])
    }
  }

  return { args, opts }
}

/**
 * Run the CLI with the given args.
 *
 * @param {string[]} argv
 */
export async function run(argv) {
  const { args, opts } = parseFlags(argv)
  const [cmd, ...cmdArgs] = args

  if (!cmd || cmd === 'help') {
    showHelp()
    return
  }

  const handler = commands[cmd]
  if (!handler) {
    console.error(`Unknown command: ${cmd}`)
    showHelp()
    process.exit(1)
  }

  try {
    await handler(cmdArgs, opts)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
uploop-video — Generative AI-driven composition & VFX engine

Commands:
  init <name>          Create a new project
  dev [dir]            Start the editor for a project
  render <output>      Render project to MP4
  serve                Start MCP server for AI tools
  info [dir]           Show project info
  list                 List all projects

Options:
  --port <n>           Port for dev/server (default: 3004)
  --width <n>          Project width (default: 1920)
  --height <n>         Project height (default: 1080)
  --fps <n>            Project FPS (default: 30)
  --output <path>      Output path for render
`)
}
