import * as repl from 'repl'
import { REPLServer } from 'repl'
import { Context } from 'vm'
import { StdoutManager } from './StdoutManager'
import { Parser, Scanner, Interpreter } from 'pocket-lisp'
import { literals, runtime, utils } from 'pocket-lisp-stdlib'

function createEval() {
  const output = new StdoutManager()
  const interpreter = new Interpreter(
    {
      globals: runtime,
      stdout: (value) => output.cb(value.toString()),
      utils
    },
    literals
  )

  return function pocketLispEval(
    this: REPLServer,
    evalCmd: string,
    _context: Context,
    _file: string,
    callback: (err: Error | null, result: any) => void
  ) {
    if (evalCmd.startsWith('?')) {
      switch (evalCmd.trim()) {
        case '??':
          return callback(null, ['?? - show this help', '?globals - print global variables'])
        case '?globals':
          return callback(null, interpreter.getGlobalNames().sort())
        default:
          return callback(new Error('Invalid ? command'), null)
      }
    }
    const parserResult = new Parser(new Scanner(evalCmd), literals).parse()
    if (!parserResult.hasError) {
      try {
        const res: any = interpreter.interpret(parserResult.program)
        const stdOut = output.read()

        if (stdOut) callback(null, stdOut)
        callback(null, res && (res.toJS ? res.toJS() : res.toString()))
      } catch (e) {
        callback(e, null)
      }
    } else {
      callback(new Error(parserResult.errors[0].message), null)
    }
  }
}

repl.start({ prompt: 'pl> ', eval: createEval() })
