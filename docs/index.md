## Goals

- Simple
- Expressive
- "Fast"
- Sandbox - no access to the native runtime environment (ex. Browser, NodeJS, etc.) APIs
- Zero dependencies

## Try it!

- In your browser:
  [Pocket-lisp sandbox](https://maxinteger.github.io/pocket-lisp-page/sandbox.html)
- In your terminal: 
  - install `npm install pocket-lisp-page`
  - start REPL: `npm start`

# Usage

The following example shows how you can init Pocket lisp with the stdlib:

```js
import { PocketLisp } from 'index.es.js'
import { literals, runtime, utils } from 'stdlib.es.js'
const pocketLisp = new PocketLisp(
  {
    globals: runtime,
    stdout: value => writeOutput(value, false),
    utils
  },
  literals
)

const run = async sourceCode => {
  try {
    await pocketLisp.execute(src)
  } catch (e) {
    for (let err of e.errors) {
      const msg = e.type === 'Parser' ? `line: ${err.line} - ${err.message}` : err.message
      writeOutput(msg, true)
    }
  }
}

run('(print (+ 1 2))')
```

## API

- `new(options?: Partial<InterpreterOptions>, literals?: PLLiterals)` - create a new Pocket lisp interpreter instance.
- `execute(source: string)` - execute the Pocket lisp source code
- `evalFn(fn: PLCallable, args: anyp[])` - evaluate `fn` with the passed arguments in the current execution environment.

## Package

On NPM: [https://www.npmjs.com/package/pocket-lisp](https://www.npmjs.com/package/pocket-lisp)

It contains both **ES5** and **ES6** packages with typescript type definitions

- Pocket lisp interpreter: `index.js` and `index.es.js`
- Pocket lisp standard library: `stdlib.js` and `stdlib.es.js`

# Syntax

The syntax very similar to the closure script language

## Basics

- Space like (space, newline, comma, etc.) characters ignored.
  For example: `[ 1 2 3 ]` equivalent with: `[ 1, 2, 3 ]`
- Single line comment star with: `;`
- Multiline comment between `;#` and `#;`

### Identifiers

The identifier

- Must start with latin alphabetic character or the fallowing symbols `=+-*\&%$_!<>?`
- Can continue with latin alphabetic or numeric characters or the fallowing symbols `=+-*\&%$_!<>?`

### Keywords

Keywords are identifiers without value (symbols). They are very useful when you need a map key or other identifier without care about the actual value.

- Must start with a colon (`:`) and
- Must continue with at least 1 latin alphabetic or numeric characters or the fallowing symbols `=+-*\&%$_!<>?`

```clojure
:keyword
:t1
:x
```

### List / Function calls

List a special structure which is very similar to an array,
except the first item must be callable (lambda function, or function reference).
The rest of the list will be the parameters of the function.

- List: `(print 1 2 3)`

## Literals

### Boolean

- `true` and `false`

### Number

- Integer: `42`
- float: `42.5`
- fraction: `1/2` _numerator and denominator must be integer_

### String

- string `"Hello world"`

### Vector

Array like structure

- vector `[ 1 2 3 ]`

### HashMap

HashMap is set of key value pairs where the key must be unique.
For example:`{ key1 value1 key2 value2 }`

_Note:_ Hashmap must have even number of paramaters

## Functions

### Print - `print`

Print value to the standard output. It accepts any amount of parameters.

```clojure
(print "Hello world")
(print 42 1/2 1.5)
```

### Const - `const`

Wrap a constant value into a function

```clojure
(print (map (const 1) [1 2 3]))     ; [1 1 1]

(def _42 (const 42))
(print (_42))                       ; 42
```

### define variable - `def`

`def` function can create a new variable in the current scope.
The function has 2 parameters:

- The variable name, it must be an identifier
- The initial value of the variable, it can be anything, and it is mandatory

Define the `x` variable

```clojure
(def x 42)
(print x)                           ; print 42
```

### Lambda function - `fn`

`fn` define a lambda function. It has 2 parameters:

- Arguments vector, where the items must be identifiers, empty vector allowed
- Function body, can be anything

```clojure
(fn [] 42)                          ; 0 parameter lamda function, returns with 42
(fn [] (+ 1 2))                     ; 0 parameter lamda function, returns with 3
(fn [a b] (+ a b))                  ;  
                                    ; function closure
(def add (fn [a] ( fn [b] (+ a b) )))
(def addTo10 (add 10))              ; create reference for the function
(print (addTo10 1))                 ; print 11
```

#### Function shortcut - `#()`

```clojure
(def add #(+ %1 %2))
(def addTo10 (add 10))
(print (addTo10 1))                 ; print 11
```

### Define function - `defn`

`defn` function is a shortcut for the often used `def` and `fn` combination.

The fallowing two definitions are equivalent:

```clojure
(def add (fn [a b] (+ a b)))

(defn add [a b] (+ a b)
```

### If function - `if`

`if` function has 3 parameters and if the first expression value is `true` then evaluate and return with the second parameter otherwise does the same with the third parameter

- Boolean expression
- true branch
- false branch

```clojure
(print (if true 1 2))               ; print 1
```

### Case function - `case`

`case` function fist parameter is the condition value the rest of the parameters are the case branches. 
Each breach is a list of two items:
- predicate function which must accept 1 parameter and return with bool value, 
  OR you can use `:else` keyword as default branch
- the result of the branch

```clojure
(case 42
  ((<= 10)                       (print "Ok"))
  ((#(and (>= %1 11) (< 50 %1))) (print "Warning"))
  (:else                         (print "Error"))
)
                                   ; print "Warning"
```

*Note*:
- Branches are checked sequentially, the first branch with `true` (even if it is `:else`) will return
- `case` must have at least one branch with `true` predicate

### Do function - `do`

`do` run sequentially all the passed parameters and return with the values of the last expression. It must be called with at least 1 parameter.

```clojure
(print (do 1 2 42))                 ; print 42
(defn x [] (do (+ 1 2) 10))
```

### Eff function - `eff`

Wrap a non-pure function into another function

```clojure
(print (map (eff random) [1 2 3]))  ; print [0.321, 0.987, 0.451]
```

It also accepts additional parameters which are passed to the function

```clojure
(def effect (eff print "hello"))
(effect)                            ; print "hello 
```
