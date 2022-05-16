(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object-assign":8,"util/":4}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"_process":9,"inherits":2}],5:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],6:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":5,"buffer":6,"ieee754":7}],7:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],8:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
var bigInt = (function (undefined) {
    "use strict";

    var BASE = 1e7,
        LOG_BASE = 7,
        MAX_INT = 9007199254740992,
        MAX_INT_ARR = smallToArray(MAX_INT),
        DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

    var supportsNativeBigInt = typeof BigInt === "function";

    function Integer(v, radix, alphabet, caseSensitive) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        return parseValue(v);
    }

    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);

    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);

    function NativeBigInt(value) {
        this.value = value;
    }
    NativeBigInt.prototype = Object.create(Integer.prototype);

    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
        if (n < 1e7)
            return [n];
        if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }

    function arrayToSmall(arr) { // If BASE changes this function may need to change
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0: return 0;
                case 1: return arr[0];
                case 2: return arr[0] + arr[1] * BASE;
                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }

    function trim(v) {
        var i = v.length;
        while (v[--i] === 0);
        v.length = i + 1;
    }

    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }

    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }

    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }

    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;
        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    BigInteger.prototype.add = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;

    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    NativeBigInt.prototype.add = function (v) {
        return new NativeBigInt(this.value + parseValue(v).value);
    }
    NativeBigInt.prototype.plus = NativeBigInt.prototype.add;

    function subtract(a, b) { // assumes a and b are arrays with a >= b
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for (; i < a_l; i++) {
            r[i] = a[i];
        }
        trim(r);
        return r;
    }

    function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
        var l = a.length,
            r = new Array(l),
            carry = -b,
            base = BASE,
            i, difference;
        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        } return new BigInteger(r, sign);
    }

    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    NativeBigInt.prototype.subtract = function (v) {
        return new NativeBigInt(this.value - parseValue(v).value);
    }
    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;

    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };
    NativeBigInt.prototype.negate = function () {
        return new NativeBigInt(-this.value);
    }

    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };
    NativeBigInt.prototype.abs = function () {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
    }


    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l),
            base = BASE,
            product, carry, i, a_i, b_j;
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;
        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
    }

    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);

        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }

    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }

    BigInteger.prototype.multiply = function (v) {
        var n = parseValue(v),
            a = this.value, b = n.value,
            sign = this.sign !== n.sign,
            abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };

    BigInteger.prototype.times = BigInteger.prototype.multiply;

    function multiplySmallAndArray(a, b, sign) { // a >= 0
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function (a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function (a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function (v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    NativeBigInt.prototype.multiply = function (v) {
        return new NativeBigInt(this.value * parseValue(v).value);
    }
    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;

    function square(a) {
        //console.assert(2 * BASE * BASE < MAX_INT);
        var l = a.length,
            r = createArray(l + l),
            base = BASE,
            product, carry, i, a_i, a_j;
        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i;
            for (var j = i; j < l; j++) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry;
        }
        trim(r);
        return r;
    }

    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false);
    };

    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    NativeBigInt.prototype.square = function (v) {
        return new NativeBigInt(this.value * this.value);
    }

    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            // normalization
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;
        while (a_l) {
            part.unshift(a[--a_l]);
            trim(part);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;
        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [quotient, remainder | 0];
    }

    function divModAny(self, v) {
        var value, n = parseValue(v);
        if (supportsNativeBigInt) {
            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
        }
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self];
        }
        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self];
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200)
            value = divMod1(a, b);
        else value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [quotient, mod];
    }

    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0];
    };
    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
        return new NativeBigInt(this.value / parseValue(v).value);
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1];
    };
    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
        return new NativeBigInt(this.value % parseValue(v).value);
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    NativeBigInt.prototype.pow = function (v) {
        var n = parseValue(v);
        var a = this.value, b = n.value;
        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
        if (b === _0) return Integer[1];
        if (a === _0) return Integer[0];
        if (a === _1) return Integer[1];
        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.isNegative()) return new NativeBigInt(_0);
        var x = this;
        var y = Integer[1];
        while (true) {
            if ((b & _1) === _1) {
                y = y.times(x);
                --b;
            }
            if (b === _0) break;
            b /= _2;
            x = x.square();
        }
        return y;
    }

    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1],
            base = this.mod(mod);
        if (exp.isNegative()) {
            exp = exp.multiply(Integer[-1]);
            base = base.modInv(mod);
        }
        while (exp.isPositive()) {
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }

    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };
    NativeBigInt.prototype.compareAbs = function (v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a;
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
    }

    BigInteger.prototype.compare = function (v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    NativeBigInt.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1;
    }
    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;

    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };
    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };
    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };
    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };
    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };
    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };
    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };
    NativeBigInt.prototype.isEven = function () {
        return (this.value & BigInt(1)) === BigInt(0);
    }

    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };
    NativeBigInt.prototype.isOdd = function () {
        return (this.value & BigInt(1)) === BigInt(1);
    }

    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };
    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;

    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };
    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;

    BigInteger.prototype.isUnit = function () {
        return false;
    };
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };
    NativeBigInt.prototype.isUnit = function () {
        return this.abs().value === BigInt(1);
    }

    BigInteger.prototype.isZero = function () {
        return false;
    };
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };
    NativeBigInt.prototype.isZero = function () {
        return this.value === BigInt(0);
    }

    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        if (n.isZero()) return false;
        if (n.isUnit()) return true;
        if (n.compareAbs(2) === 0) return this.isEven();
        return this.mod(n).isZero();
    };
    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(49)) return true;
        // we don't know if it's prime: let the other functions figure it out
    }

    function millerRabinTest(n, a) {
        var nPrev = n.prev(),
            b = nPrev,
            r = 0,
            d, t, i, x;
        while (b.isEven()) b = b.divide(2), r++;
        next: for (i = 0; i < a.length; i++) {
            if (n.lesser(a[i])) continue;
            x = bigInt(a[i]).modPow(b, n);
            if (x.isUnit() || x.equals(nPrev)) continue;
            for (d = r - 1; d != 0; d--) {
                x = x.square().mod(n);
                if (x.isUnit()) return false;
                if (x.equals(nPrev)) continue next;
            }
            return false;
        }
        return true;
    }

    // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
    BigInteger.prototype.isPrime = function (strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var bits = n.bitLength();
        if (bits <= 64)
            return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logN = Math.log(2) * bits.toJSNumber();
        var t = Math.ceil((strict === true) ? (2 * Math.pow(logN, 2)) : logN);
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt(i + 2));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    BigInteger.prototype.isProbablePrime = function (iterations, rng) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt.randBetween(2, n.minus(2), rng));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.isZero()) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t.compare(0) === -1) {
            t = t.add(n);
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };

    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    BigInteger.prototype.next = function () {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };
    NativeBigInt.prototype.next = function () {
        return new NativeBigInt(this.value + BigInt(1));
    }

    BigInteger.prototype.prev = function () {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };
    NativeBigInt.prototype.prev = function () {
        return new NativeBigInt(this.value - BigInt(1));
    }

    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

    function shift_isSmall(n) {
        return Math.abs(n) <= BASE;
    }

    BigInteger.prototype.shiftLeft = function (v) {
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        if (result.isZero()) return result;
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    BigInteger.prototype.shiftRight = function (v) {
        var remQuo;
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
            if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    BigInteger.prototype.not = function () {
        return this.negate().prev();
    };
    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) { return a & b; });
    };
    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) { return a | b; });
    };
    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) { return a ^ b; });
    };
    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) { // get lowestOneBit (rough)
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I :
                typeof v === "bigint" ? v | BigInt(LOBMASK_I) :
                    v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt(1), e: 0 };
    }

    BigInteger.prototype.bitLength = function () {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    }
    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while (a.isEven() && b.isEven()) {
            d = min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b; b = a; a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b, rng) {
        a = parseValue(a);
        b = parseValue(b);
        var usedRNG = rng || Math.random;
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
        var digits = toBase(range, BASE).value;
        var result = [], restricted = true;
        for (var i = 0; i < digits.length; i++) {
            var top = restricted ? digits[i] + (i + 1 < digits.length ? digits[i + 1] / BASE : 0) : BASE;
            var digit = truncate(usedRNG() * top);
            result.push(digit);
            if (digit < digits[i]) restricted = false;
        }
        return low.add(Integer.fromArray(result, BASE, false));
    }

    var parseBase = function (text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);
        if (!caseSensitive) {
            text = text.toLowerCase();
            alphabet = alphabet.toLowerCase();
        }
        var length = text.length;
        var i;
        var absBase = Math.abs(base);
        var alphabetValues = {};
        for (i = 0; i < alphabet.length; i++) {
            alphabetValues[alphabet[i]] = i;
        }
        for (i = 0; i < length; i++) {
            var c = text[i];
            if (c === "-") continue;
            if (c in alphabetValues) {
                if (alphabetValues[c] >= absBase) {
                    if (c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i];
            if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
            else if (c === "<") {
                var start = i;
                do { i++; } while (text[i] !== ">" && i < text.length);
                digits.push(parseValue(text.slice(start + 1, i)));
            }
            else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
    };

    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i;
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }

    function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
            return alphabet[digit];
        }
        return "<" + digit + ">";
    }

    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return { value: [0], isNegative: false };
            if (n.isNegative())
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber()))
                        .map(Array.prototype.valueOf, [1, 0])
                    ),
                    isNegative: false
                };

            var arr = Array.apply(null, Array(n.toJSNumber() - 1))
                .map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }
        if (base.isUnit()) {
            if (n.isZero()) return { value: [0], isNegative: false };

            return {
                value: Array.apply(null, Array(n.toJSNumber()))
                    .map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return { value: out.reverse(), isNegative: neg };
    }

    function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
            return stringify(x, alphabet);
        }).join('');
    }

    BigInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    SmallInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    NativeBigInt.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    BigInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBaseString(this, radix, alphabet);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    SmallInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBaseString(this, radix, alphabet);
        return String(this.value);
    };

    NativeBigInt.prototype.toString = SmallInteger.prototype.toString;

    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () { return this.toString(); }

    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
        return parseInt(this.toString(), 10);
    }

    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x))
                return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
            throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
            text += (new Array(exp + 1)).join("0");
            v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(sign ? "-" + v : v));
        }
        var r = [], max = v.length, l = LOG_BASE, min = max - l;
        while (max > 0) {
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
    }

    function parseNumberValue(v) {
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(v));
        }
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }

    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        if (typeof v === "bigint") {
            return new NativeBigInt(v);
        }
        return v;
    }
    // Pre-define numbers in range [-999,999]
    for (var i = 0; i < 1000; i++) {
        Integer[i] = parseValue(i);
        if (i > 0) Integer[-i] = parseValue(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt; };
    Integer.randBetween = randBetween;

    Integer.fromArray = function (digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer;
})();

// Node.js check
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}

//amd check
if (typeof define === "function" && define.amd) {
    define( function () {
        return bigInt;
    });
}

},{}],11:[function(require,module,exports){
(function (Buffer){(function (){
/*
    Copyright 2018 0kims association.

    This file is part of snarkjs.

    snarkjs is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    snarkjs is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    snarkjs. If not, see <https://www.gnu.org/licenses/>.
*/

/* global BigInt */
const bigInt = require("big-integer");

let wBigInt;

if (typeof(BigInt) != "undefined") {
    wBigInt  = BigInt;
    wBigInt.one = wBigInt(1);
    wBigInt.zero = wBigInt(0);

    // Affine
    wBigInt.genAffine = (q) => {
        const nq = -q;
        return (a) => {
            let aux = a;
            if (aux < 0) {
                if (aux <= nq) {
                    aux = aux % q;
                }
                if (aux < wBigInt.zero) {
                    aux = aux + q;
                }
            } else {
                if (aux >= q) {
                    aux = aux % q;
                }
            }
            return aux.valueOf();
        };
    };


    // Inverse
    wBigInt.genInverse = (q) => {
        return (a) => {
            let t = wBigInt.zero;
            let r = q;
            let newt = wBigInt.one;
            let newr = wBigInt.affine(a, q);
            while (newr!=wBigInt.zero) {
                let q = r/newr;
                [t, newt] = [newt, t-q*newt];
                [r, newr] = [newr, r-q*newr];
            }
            if (t<wBigInt.zero) t += q;
            return t;
        };
    };


    // Add
    wBigInt.genAdd = (q) => {
        if (q) {
            return (a,b) => (a+b) % q;
        } else {
            return (a,b) => a+b;
        }
    };

    // Sub
    wBigInt.genSub = (q) => {
        if (q) {
            return (a,b) => (a-b) % q;
        } else {
            return (a,b) => a-b;
        }
    };


    // Neg
    wBigInt.genNeg = (q) => {
        if (q) {
            return (a) => (-a) % q;
        } else {
            return (a) => -a;
        }
    };

    // Mul
    wBigInt.genMul = (q) => {
        if (q) {
            return (a,b) => (a*b) % q;
        } else {
            return (a,b) => a*b;
        }
    };

    // Shr
    wBigInt.genShr = () => {
        return (a,b) => a >> wBigInt(b);
    };

    // Shl
    wBigInt.genShl = (q) => {
        if (q) {
            return (a,b) => (a << wBigInt(b)) % q;
        } else {
            return (a,b) => a << wBigInt(b);
        }
    };

    // Equals
    wBigInt.genEquals = (q) => {
        if (q) {
            return (a,b) => (a.affine(q) == b.affine(q));
        } else {
            return (a,b) => a == b;
        }
    };

    // Square
    wBigInt.genSquare = (q) => {
        if (q) {
            return (a) => (a*a) %q;
        } else {
            return (a) => a*a;
        }
    };


    // Double
    wBigInt.genDouble = (q) => {
        if (q) {
            return (a) => (a+a) %q;
        } else {
            return (a) => a+a;
        }
    };

    // IsZero
    wBigInt.genIsZero = (q) => {
        if (q) {
            return (a) => (a.affine(q) == wBigInt.zero);
        } else {
            return (a) =>  a == wBigInt.zero;
        }
    };


    // Other minor functions
    wBigInt.prototype.isOdd = function() {
        return (this & wBigInt.one) == wBigInt(1);
    };

    wBigInt.prototype.isNegative = function() {
        return this < wBigInt.zero;
    };

    wBigInt.prototype.and = function(m) {
        return this & m;
    };

    wBigInt.prototype.div = function(c) {
        return this / c;
    };

    wBigInt.prototype.mod = function(c) {
        return this % c;
    };

    wBigInt.prototype.pow = function(c) {
        return this ** c;
    };

    wBigInt.prototype.abs = function() {
        return (this > wBigInt.zero) ? this : -this;
    };

    wBigInt.prototype.modPow = function(e, m) {
        let acc = wBigInt.one;
        let exp = this;
        let rem = e;
        while (rem) {
            if (rem & wBigInt.one) {
                acc = (acc * exp) %m;
            }
            exp = (exp * exp) % m;
            rem = rem >> wBigInt.one;
        }
        return acc;
    };

    wBigInt.prototype.greaterOrEquals = function(b) {
        return this >= b;
    };

    wBigInt.prototype.greater = function(b) {
        return this > b;
    };
    wBigInt.prototype.gt = wBigInt.prototype.greater;

    wBigInt.prototype.lesserOrEquals = function(b) {
        return this <= b;
    };

    wBigInt.prototype.lesser = function(b) {
        return this < b;
    };
    wBigInt.prototype.lt = wBigInt.prototype.lesser;

    wBigInt.prototype.equals = function(b) {
        return this == b;
    };
    wBigInt.prototype.eq = wBigInt.prototype.equals;

    wBigInt.prototype.neq = function(b) {
        return this != b;
    };

    wBigInt.prototype.toJSNumber = function() {
        return Number(this);
    };


} else {

    var oldProto = bigInt.prototype;
    wBigInt = function(a) {
        if ((typeof a == "string") && (a.slice(0,2) == "0x")) {
            return bigInt(a.slice(2), 16);
        } else {
            return bigInt(a);
        }
    };
    wBigInt.one = bigInt.one;
    wBigInt.zero = bigInt.zero;
    wBigInt.prototype = oldProto;

    wBigInt.prototype.div = function(c) {
        return this.divide(c);
    };

    // Affine
    wBigInt.genAffine = (q) => {
        const nq = wBigInt.zero.minus(q);
        return (a) => {
            let aux = a;
            if (aux.isNegative()) {
                if (aux.lesserOrEquals(nq)) {
                    aux = aux.mod(q);
                }
                if (aux.isNegative()) {
                    aux = aux.add(q);
                }
            } else {
                if (aux.greaterOrEquals(q)) {
                    aux = aux.mod(q);
                }
            }
            return aux;
        };
    };


    // Inverse
    wBigInt.genInverse = (q) => {
        return (a) => a.affine(q).modInv(q);
    };

    // Add
    wBigInt.genAdd = (q) => {
        if (q) {
            return (a,b) => {
                const r = a.add(b);
                return r.greaterOrEquals(q) ? r.minus(q) : r;
            };
        } else {
            return (a,b) => a.add(b);
        }
    };

    // Sub
    wBigInt.genSub = (q) => {
        if (q) {
            return (a,b) => a.greaterOrEquals(b) ? a.minus(b) : a.minus(b).add(q);
        } else {
            return (a,b) => a.minus(b);
        }
    };

    wBigInt.genNeg = (q) => {
        if (q) {
            return (a) => a.isZero() ? a : q.minus(a);
        } else {
            return (a) => wBigInt.zero.minus(a);
        }
    };

    // Mul
    wBigInt.genMul = (q) => {
        if (q) {
            return (a,b) => a.times(b).mod(q);
        } else {
            return (a,b) => a.times(b);
        }
    };

    // Shr
    wBigInt.genShr = () => {
        return (a,b) => a.shiftRight(wBigInt(b).value);
    };

    // Shr
    wBigInt.genShl = (q) => {
        if (q) {
            return (a,b) => a.shiftLeft(wBigInt(b).value).mod(q);
        } else {
            return (a,b) => a.shiftLeft(wBigInt(b).value);
        }
    };

    // Square
    wBigInt.genSquare = (q) => {
        if (q) {
            return (a) => a.square().mod(q);
        } else {
            return (a) => a.square();
        }
    };

    // Double
    wBigInt.genDouble = (q) => {
        if (q) {
            return (a) => a.add(a).mod(q);
        } else {
            return (a) => a.add(a);
        }
    };

    // Equals
    wBigInt.genEquals = (q) => {
        if (q) {
            return (a,b) => a.affine(q).equals(b.affine(q));
        } else {
            return (a,b) => a.equals(b);
        }
    };

    // IsZero
    wBigInt.genIsZero = (q) => {
        if (q) {
            return (a) => (a.affine(q).isZero());
        } else {
            return (a) =>  a.isZero();
        }
    };
}



wBigInt.affine = function(a, q) {
    return wBigInt.genAffine(q)(a);
};

wBigInt.prototype.affine = function (q) {
    return wBigInt.affine(this, q);
};

wBigInt.inverse = function(a, q) {
    return wBigInt.genInverse(q)(a);
};

wBigInt.prototype.inverse = function (q) {
    return wBigInt.genInverse(q)(this);
};

wBigInt.add = function(a, b, q) {
    return wBigInt.genAdd(q)(a,b);
};

wBigInt.prototype.add = function (a, q) {
    return wBigInt.genAdd(q)(this, a);
};

wBigInt.sub = function(a, b, q) {
    return wBigInt.genSub(q)(a,b);
};

wBigInt.prototype.sub = function (a, q) {
    return wBigInt.genSub(q)(this, a);
};

wBigInt.neg = function(a, q) {
    return wBigInt.genNeg(q)(a);
};

wBigInt.prototype.neg = function (q) {
    return wBigInt.genNeg(q)(this);
};

wBigInt.mul = function(a, b, q) {
    return wBigInt.genMul(q)(a,b);
};

wBigInt.prototype.mul = function (a, q) {
    return wBigInt.genMul(q)(this, a);
};

wBigInt.shr = function(a, b, q) {
    return wBigInt.genShr(q)(a,b);
};

wBigInt.prototype.shr = function (a, q) {
    return wBigInt.genShr(q)(this, a);
};

wBigInt.shl = function(a, b, q) {
    return wBigInt.genShl(q)(a,b);
};

wBigInt.prototype.shl = function (a, q) {
    return wBigInt.genShl(q)(this, a);
};

wBigInt.equals = function(a, b, q) {
    return wBigInt.genEquals(q)(a,b);
};

wBigInt.prototype.equals = function (a, q) {
    return wBigInt.genEquals(q)(this, a);
};

wBigInt.square = function(a, q) {
    return wBigInt.genSquare(q)(a);
};

wBigInt.prototype.square = function (q) {
    return wBigInt.genSquare(q)(this);
};

wBigInt.double = function(a, q) {
    return wBigInt.genDouble(q)(a);
};

wBigInt.prototype.double = function (q) {
    return wBigInt.genDouble(q)(this);
};

wBigInt.isZero = function(a, q) {
    return wBigInt.genIsZero(q)(a);
};

wBigInt.prototype.isZero = function (q) {
    return wBigInt.genIsZero(q)(this);
};

wBigInt.leBuff2int = function(buff) {
    let res = wBigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = wBigInt(buff[i]);
        res = res.add(n.shl(i*8));
    }
    return res;
};

wBigInt.leInt2Buff = function(n, len) {
    let r = n;
    let o =0;
    const buff = Buffer.alloc(len);
    while ((r.greater(wBigInt.zero))&&(o<buff.length)) {
        let c = Number(r.and(wBigInt("255")));
        buff[o] = c;
        o++;
        r = r.shr(8);
    }
    if (r.greater(wBigInt.zero)) throw new Error("Number does not feed in buffer");
    return buff;
};

wBigInt.prototype.leInt2Buff = function (len) {
    return wBigInt.leInt2Buff(this,len);
};


wBigInt.beBuff2int = function(buff) {
    let res = wBigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = wBigInt(buff[buff.length - i - 1]);
        res = res.add(n.shl(i*8));
    }
    return res;
};

wBigInt.beInt2Buff = function(n, len) {
    let r = n;
    let o =len-1;
    const buff = Buffer.alloc(len);
    while ((r.greater(wBigInt.zero))&&(o>=0)) {
        let c = Number(r.and(wBigInt("255")));
        buff[o] = c;
        o--;
        r = r.shr(8);
    }
    if (r.greater(wBigInt.zero)) throw new Error("Number does not feed in buffer");
    return buff;
};

wBigInt.prototype.beInt2Buff = function (len) {
    return wBigInt.beInt2Buff(this,len);
};

module.exports = wBigInt;


}).call(this)}).call(this,require("buffer").Buffer)
},{"big-integer":10,"buffer":6}],12:[function(require,module,exports){
/*
    Copyright 2018 0kims association.

    This file is part of snarkjs.

    snarkjs is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    snarkjs is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    snarkjs. If not, see <https://www.gnu.org/licenses/>.
*/

const bigInt = require("./bigint");

module.exports = calculateWitness;

function calculateWitness(circuit, inputSignals, options) {
    options = options || {};
    if (!options.logFunction) options.logFunction = console.log;
    const ctx = new RTCtx(circuit, options);

    function iterateSelector(values, sels, cb) {
        if (!Array.isArray(values)) {
            return cb(sels, values);
        }
        for (let i=0; i<values.length; i++) {
            sels.push(i);
            iterateSelector(values[i], sels, cb);
            sels.pop(i);
        }
    }

    ctx.setSignal("one", [], bigInt(1));

    for (let c in ctx.notInitSignals) {
        if (ctx.notInitSignals[c] == 0) ctx.triggerComponent(c);
    }

    for (let s in inputSignals) {
        ctx.currentComponent = "main";
        iterateSelector(inputSignals[s], [], function(selector, value) {
            if (typeof(value) == "undefined") throw new Error("Signal not defined:" + s);
            ctx.setSignal(s, selector, bigInt(value));
        });
    }

    for (let i=0; i<circuit.nInputs; i++) {
        const idx = circuit.inputIdx(i);
        if (typeof(ctx.witness[idx]) == "undefined") {
            throw new Error("Input Signal not assigned: " + circuit.signalNames(idx));
        }
    }


    for (let i=0; i<ctx.witness.length; i++) {
        if (typeof(ctx.witness[i]) == "undefined") {
            throw new Error("Signal not assigned: " + circuit.signalNames(i));
        }
        if (options.logOutput) options.logFunction(circuit.signalNames(i) + " --> " + ctx.witness[i].toString());
    }
    return ctx.witness.slice(0, circuit.nVars);
//    return ctx.witness;
}

class RTCtx {
    constructor(circuit, options) {
        this.options = options;
        this.scopes = [];
        this.circuit = circuit;
        this.witness = new Array(circuit.nSignals);
        this.notInitSignals = {};
        for (let c in this.circuit.components) {
            this.notInitSignals[c] = this.circuit.components[c].inputSignals;
        }
    }

    _sels2str(sels) {
        let res = "";
        for (let i=0; i<sels.length; i++) {
            res += `[${sels[i]}]`;
        }
        return res;
    }

    setPin(componentName, componentSels, signalName, signalSels, value) {
        let fullName = componentName=="one" ? "one" : this.currentComponent + "." + componentName;
        fullName += this._sels2str(componentSels) +
                    "."+
                    signalName+
                    this._sels2str(signalSels);
        this.setSignalFullName(fullName, value);
    }

    setSignal(name, sels, value) {
        let fullName = this.currentComponent ? this.currentComponent + "." + name : name;
        fullName += this._sels2str(sels);
        this.setSignalFullName(fullName, value);
    }

    triggerComponent(c) {
        if (this.options.logTrigger) this.options.logFunction("Component Treiggered: " + this.circuit.components[c].name);

        // Set notInitSignals to -1 to not initialize again
        this.notInitSignals[c] --;
        const oldComponent = this.currentComponent;
        this.currentComponent = this.circuit.components[c].name;
        const template = this.circuit.components[c].template;

        const newScope = {};
        for (let p in this.circuit.components[c].params) {
            newScope[p] = this.circuit.components[c].params[p];
        }

        const oldScope = this.scopes;
        this.scopes = [ this.scopes[0], newScope ];

        // TODO set params.

        this.circuit.templates[template](this);
        this.scopes = oldScope;
        this.currentComponent = oldComponent;

        if (this.options.logTrigger)  this.options.logFunction("End Component Treiggered: " + this.circuit.components[c].name);
    }

    callFunction(functionName, params) {

        const newScope = {};
        for (let p=0; p<this.circuit.functions[functionName].params.length; p++) {
            const paramName = this.circuit.functions[functionName].params[p];
            newScope[paramName] = params[p];
        }

        const oldScope = this.scopes;
        this.scopes = [ this.scopes[0], newScope ];

        // TODO set params.

        const res = this.circuit.functions[functionName].func(this);
        this.scopes = oldScope;

        return res;
    }

    setSignalFullName(fullName, value) {
        if (this.options.logSet) this.options.logFunction("set " + fullName + " <-- " + value.toString());
        const sId = this.circuit.getSignalIdx(fullName);
        let firstInit =false;
        if (typeof(this.witness[sId]) == "undefined") {
            firstInit = true;
        }
        this.witness[sId] = bigInt(value);
        const callComponents = [];
        for (let i=0; i<this.circuit.signals[sId].triggerComponents.length; i++) {
            var idCmp = this.circuit.signals[sId].triggerComponents[i];
            if (firstInit) this.notInitSignals[idCmp] --;
            callComponents.push(idCmp);
        }
        callComponents.map( (c) => {
            if (this.notInitSignals[c] == 0) this.triggerComponent(c);
        });
        return this.witness[sId];
    }

    setVar(name, sels, value) {
        function setVarArray(a, sels2, value) {
            if (sels2.length == 1) {
                a[sels2[0]] = value;
            } else {
                if (typeof(a[sels2[0]]) == "undefined") a[sels2[0]] = [];
                setVarArray(a[sels2[0]], sels2.slice(1), value);
            }
        }
        const scope = this.scopes[this.scopes.length-1];
        if (sels.length == 0) {
            scope[name] = value;
        } else {
            if (typeof(scope[name]) == "undefined") scope[name] = [];
            setVarArray(scope[name], sels, value);
        }
        return value;
    }

    getVar(name, sels) {
        function select(a, sels2) {
            return  (sels2.length == 0) ? a : select(a[sels2[0]], sels2.slice(1));
        }
        for (let i=this.scopes.length-1; i>=0; i--) {
            if (typeof(this.scopes[i][name]) != "undefined") return select(this.scopes[i][name], sels);
        }
        throw new Error("Variable not defined: " + name);
    }

    getSignal(name, sels) {
        let fullName = name=="one" ? "one" : this.currentComponent + "." + name;
        fullName += this._sels2str(sels);
        return this.getSignalFullName(fullName);
    }


    getPin(componentName, componentSels, signalName, signalSels) {
        let fullName = componentName=="one" ? "one" : this.currentComponent + "." + componentName;
        fullName += this._sels2str(componentSels) +
                    "."+
                    signalName+
                    this._sels2str(signalSels);
        return this.getSignalFullName(fullName);
    }

    getSignalFullName(fullName) {
        const sId = this.circuit.getSignalIdx(fullName);
        if (typeof(this.witness[sId]) == "undefined") {
            throw new Error("Signal not initialized: "+fullName);
        }
        if (this.options.logGet) this.options.logFunction("get --->" + fullName + " = " + this.witness[sId].toString() );
        return this.witness[sId];
    }

    assert(a,b,errStr) {
        const ba = bigInt(a);
        const bb = bigInt(b);
        if (!ba.equals(bb)) {
            throw new Error("Constraint doesn't match "+ this.currentComponent+": "+ errStr + " -> "+ ba.toString() + " != " + bb.toString());
        }
    }
}

},{"./bigint":11}],13:[function(require,module,exports){
/*
    Copyright 2018 0kims association.

    This file is part of snarkjs.

    snarkjs is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    snarkjs is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    snarkjs. If not, see <https://www.gnu.org/licenses/>.
*/

const bigInt = require("./bigint.js");

const __P__ = bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const __MASK__ = bigInt("28948022309329048855892746252171976963317496166410141009864396001978282409983"); // 0x3FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
const calculateWitness = require("./calculateWitness.js");

module.exports = class Circuit {
    constructor(circuitDef) {
        this.nPubInputs = circuitDef.nPubInputs;
        this.nPrvInputs = circuitDef.nPrvInputs;
        this.nInputs = circuitDef.nInputs;
        this.nOutputs = circuitDef.nOutputs;
        this.nVars = circuitDef.nVars;
        this.nSignals = circuitDef.nSignals;
        this.nConstants = circuitDef.nConstants;

        this.nConstraints = circuitDef.constraints.length;

        this.signalName2Idx = circuitDef.signalName2Idx;
        this.components = circuitDef.components;
        this.componentName2Idx = circuitDef.componentName2Idx;
        this.signals = circuitDef.signals;
        this.constraints = circuitDef.constraints;

        this.templates = {};
        for (let t in circuitDef.templates) {
            this.templates[t] = eval(" const __f= " +circuitDef.templates[t] + "\n__f");
        }

        this.functions = {};
        for (let f in circuitDef.functions) {
            this.functions[f] = {
                params: circuitDef.functions[f].params,
                func: eval(" const __f= " +circuitDef.functions[f].func + "\n__f;")
            };
        }
    }

    calculateWitness(input, log) {
        return calculateWitness(this, input, log);
    }

    checkWitness(w) {
        const evalLC = (lc, w) => {
            let acc = bigInt(0);
            for (let k in lc) {
                acc=  acc.add(bigInt(w[k]).mul(bigInt(lc[k]))).mod(__P__);
            }
            return acc;
        }

        const checkConstraint = (ct, w) => {
            const a=evalLC(ct[0],w);
            const b=evalLC(ct[1],w);
            const c=evalLC(ct[2],w);
            const res = (a.mul(b).sub(c)).affine(__P__);
            if (!res.isZero()) return false;
            return true;
        }


        for (let i=0; i<this.constraints.length; i++) {
            if (!checkConstraint(this.constraints[i], w)) {
                this.printCostraint(this.constraints[i]);
                return false;
            }
        }

        return true;

    }

    printCostraint(c) {
        const lc2str = (lc) => {
            let S = "";
            for (let k in lc) {
                let name = this.signals[k].names[0];
                if (name == "one") name = "";
                let v = bigInt(lc[k]);
                let vs;
                if (!v.lesserOrEquals(__P__.shr(bigInt(1)))) {
                    v = __P__.sub(v);
                    vs = "-"+v.toString();
                } else {
                    if (S!="") {
                        vs = "+"+v.toString();
                    } else {
                        vs = "";
                    }
                    if (vs!="1") {
                        vs = vs + v.toString();;
                    }
                }

                S= S + " " + vs + name;
            }
            return S;
        };
        const S = `[ ${lc2str(c[0])} ] * [ ${lc2str(c[1])} ] - [ ${lc2str(c[2])} ] = 0`;
        console.log(S);
    }

    printConstraints() {
        for (let i=0; i<this.constraints.length; i++) {
            this.printCostraint(this.constraints[i]);
        }
    }

    getSignalIdx(name) {
        if (typeof(this.signalName2Idx[name]) != "undefined") return this.signalName2Idx[name];
        if (!isNaN(name)) return Number(name);
        throw new Error("Invalid signal identifier: "+ name);
    }

    // returns the index of the i'th output
    outputIdx(i) {
        if (i>=this.nOutputs) throw new Error("Accessing an invalid output: "+i);
        return i+1;
    }

    // returns the index of the i'th input
    inputIdx(i) {
        if (i>=this.nInputs) throw new Error("Accessing an invalid input: "+i);
        return this.nOutputs + 1 + i;
    }

    // returns the index of the i'th public input
    pubInputIdx(i) {
        if (i>=this.nPubInputs) throw new Error("Accessing an invalid pubInput: "+i);
        return this.inputIdx(i);
    }

    // returns the index of the i'th private input
    prvInputIdx(i) {
        if (i>=this.nPrvInputs) throw new Error("Accessing an invalid prvInput: "+i);
        return this.inputIdx(this.nPubInputs + i);
    }

    // returns the index of the i'th variable
    varIdx(i) {
        if (i>=this.nVars) throw new Error("Accessing an invalid variable: "+i);
        return i;
    }

    // returns the index of the i'th constant
    constantIdx(i) {
        if (i>=this.nConstants) throw new Error("Accessing an invalid constant: "+i);
        return this.nVars + i;
    }

    // returns the index of the i'th signal
    signalIdx(i) {
        if (i>=this.nSignls) throw new Error("Accessing an invalid signal: "+i);
        return i;
    }

    signalNames(i) {
        return this.signals[ this.getSignalIdx(i) ].names.join(", ");
    }

    a(constraint, signalIdx) {
        return bigInt(this.constraints[constraint][0][signalIdx] || 0 );
    }

    b(constraint, signalIdx) {
        return bigInt(this.constraints[constraint][1][signalIdx] || 0);
    }

    c(constraint, signalIdx) {
        return bigInt(this.constraints[constraint][2][signalIdx] || 0);
    }
};

},{"./bigint.js":11,"./calculateWitness.js":12}],14:[function(require,module,exports){
/*
    Copyright 2018 0kims association.

    This file is part of snarkjs.

    snarkjs is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    snarkjs is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    snarkjs. If not, see <https://www.gnu.org/licenses/>.
*/

const bigInt = require("./bigint.js");

module.exports.stringifyBigInts = stringifyBigInts;
module.exports.unstringifyBigInts = unstringifyBigInts;

function stringifyBigInts(o) {
    if ((typeof(o) == "bigint") || o.isZero !== undefined)  {
        return o.toString(10);
    } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
            res[k] = stringifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return bigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
            res[k] = unstringifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

},{"./bigint.js":11}],15:[function(require,module,exports){
(function (Buffer){(function (){

            exports.code = new Buffer("AGFzbQEAAAABPApgAn9/AGABfwBgAX8Bf2ACf38Bf2ADf39/AX9gA39/fwBgA39+fwBgAn9+AGAEf39/fwBgBX9/f39/AAIQAQNlbnYGbWVtb3J5AgDoBwNsawABAgEDAwQEBQUGBwgFBQUAAAUFAAAAAQUFAAAFBQAAAAEFAAIBAAAFAAUAAAAIAQIAAgUICQgABQkDAAUFBQUAAgUFCAAIAgEBAAUFBQAAAAMAAgEAAAUABQAAAAgBAgACBQgJCAAFCQgIB8gJYghpbnRfY29weQAACGludF96ZXJvAAEHaW50X29uZQADCmludF9pc1plcm8AAgZpbnRfZXEABAdpbnRfZ3RlAAUHaW50X2FkZAAGB2ludF9zdWIABwppbnRfbXVsT2xkAAkHaW50X211bAAIB2ludF9kaXYADA5pbnRfaW52ZXJzZU1vZAANB2YxbV9hZGQADgdmMW1fc3ViAA8HZjFtX25lZwAQC2YxbV9tUmVkdWN0ABEHZjFtX211bAASCmYxbV9tdWxPbGQAExJmMW1fZnJvbU1vbnRnb21lcnkAFRBmMW1fdG9Nb250Z29tZXJ5ABQLZjFtX2ludmVyc2UAFghmMW1fY29weQAACGYxbV96ZXJvAAEKZjFtX2lzWmVybwACBmYxbV9lcQAEB2YxbV9vbmUAFwdmcm1fYWRkABgHZnJtX3N1YgAZB2ZybV9uZWcAGgtmcm1fbVJlZHVjdAAbB2ZybV9tdWwAHApmcm1fbXVsT2xkAB0SZnJtX2Zyb21Nb250Z29tZXJ5AB8QZnJtX3RvTW9udGdvbWVyeQAeC2ZybV9pbnZlcnNlACAIZnJtX2NvcHkAAAhmcm1femVybwABCmZybV9pc1plcm8AAgZmcm1fZXEABAdmcm1fb25lACEGZnJfYWRkABgGZnJfc3ViABkGZnJfbmVnABoGZnJfbXVsACIKZnJfaW52ZXJzZQAjB2ZyX2NvcHkAAAdmcl96ZXJvAAEGZnJfb25lACEJZnJfaXNaZXJvAAIFZnJfZXEABAlnMV9pc1plcm8AJAdnMV9jb3B5ACYHZzFfemVybwAlCWcxX2RvdWJsZQAnBmcxX2FkZAAoBmcxX25lZwApBmcxX3N1YgAqEWcxX2Zyb21Nb250Z29tZXJ5ACsPZzFfdG9Nb250Z29tZXJ5ACwJZzFfYWZmaW5lAC0OZzFfdGltZXNTY2FsYXIALgtnMV9tdWx0aWV4cAA1DGcxX211bHRpZXhwMgA5B2ZmdF9mZnQAQghmZnRfaWZmdABDEWZmdF90b01vbnRnb21lcnlOAD8TZmZ0X2Zyb21Nb250Z29tZXJ5TgA+FGZmdF9jb3B5TkludGVybGVhdmVkAD0IZmZ0X211bE4ARAhwb2xfemVybwBFD3BvbF9jb25zdHJ1Y3RMQwBGCmYybV9pc1plcm8ARwhmMm1femVybwBIB2YybV9vbmUASQhmMm1fY29weQBKB2YybV9tdWwASwdmMm1fYWRkAEwHZjJtX3N1YgBNB2YybV9uZWcAThJmMm1fZnJvbU1vbnRnb21lcnkAUBBmMm1fdG9Nb250Z29tZXJ5AE8GZjJtX2VxAFELZjJtX2ludmVyc2UAUglnMl9pc1plcm8AUwdnMl9jb3B5AFUHZzJfemVybwBUCWcyX2RvdWJsZQBWBmcyX2FkZABXBmcyX25lZwBYBmcyX3N1YgBZEWcyX2Zyb21Nb250Z29tZXJ5AFoPZzJfdG9Nb250Z29tZXJ5AFsJZzJfYWZmaW5lAFwOZzJfdGltZXNTY2FsYXIAXQtnMl9tdWx0aWV4cABkDGcyX211bHRpZXhwMgBoDHRlc3RfZjFtX211bABpD3Rlc3RfZjFtX211bE9sZABqCsfEAWsqACABIAApAwA3AwAgASAAKQMINwMIIAEgACkDEDcDECABIAApAxg3AxgLHgAgAEIANwMAIABCADcDCCAAQgA3AxAgAEIANwMYCzMAIAApAxhQBEAgACkDEFAEQCAAKQMIUARAIAApAwBQDwVBAA8LBUEADwsFQQAPC0EADwseACAAQgE3AwAgAEIANwMIIABCADcDECAAQgA3AxgLRwAgACkDGCABKQMYUQRAIAApAxAgASkDEFEEQCAAKQMIIAEpAwhRBEAgACkDACABKQMAUQ8FQQAPCwVBAA8LBUEADwtBAA8LfQAgACkDGCABKQMYVARAQQAPBSAAKQMYIAEpAxhWBEBBAQ8FIAApAxAgASkDEFQEQEEADwUgACkDECABKQMQVgRAQQEPBSAAKQMIIAEpAwhUBEBBAA8FIAApAwggASkDCFYEQEEBDwUgACkDACABKQMAWg8LCwsLCwtBAA8L1AEBAX4gADUCACABNQIAfCEDIAIgAz4CACAANQIEIAE1AgR8IANCIIh8IQMgAiADPgIEIAA1AgggATUCCHwgA0IgiHwhAyACIAM+AgggADUCDCABNQIMfCADQiCIfCEDIAIgAz4CDCAANQIQIAE1AhB8IANCIIh8IQMgAiADPgIQIAA1AhQgATUCFHwgA0IgiHwhAyACIAM+AhQgADUCGCABNQIYfCADQiCIfCEDIAIgAz4CGCAANQIcIAE1Ahx8IANCIIh8IQMgAiADPgIcIANCIIinC4wCAQF+IAA1AgAgATUCAH0hAyACIANC/////w+DPgIAIAA1AgQgATUCBH0gA0Igh3whAyACIANC/////w+DPgIEIAA1AgggATUCCH0gA0Igh3whAyACIANC/////w+DPgIIIAA1AgwgATUCDH0gA0Igh3whAyACIANC/////w+DPgIMIAA1AhAgATUCEH0gA0Igh3whAyACIANC/////w+DPgIQIAA1AhQgATUCFH0gA0Igh3whAyACIANC/////w+DPgIUIAA1AhggATUCGH0gA0Igh3whAyACIANC/////w+DPgIYIAA1AhwgATUCHH0gA0Igh3whAyACIANC/////w+DPgIcIANCIIenC48QEgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfiADQv////8PgyAANQIAIgUgATUCACIGfnwhAyAEIANCIIh8IQQgAiADPgIAIARCIIghAyAEQv////8PgyAFIAE1AgQiCH58IQQgAyAEQiCIfCEDIARC/////w+DIAA1AgQiByAGfnwhBCADIARCIIh8IQMgAiAEPgIEIANCIIghBCADQv////8PgyAFIAE1AggiCn58IQMgBCADQiCIfCEEIANC/////w+DIAcgCH58IQMgBCADQiCIfCEEIANC/////w+DIAA1AggiCSAGfnwhAyAEIANCIIh8IQQgAiADPgIIIARCIIghAyAEQv////8PgyAFIAE1AgwiDH58IQQgAyAEQiCIfCEDIARC/////w+DIAcgCn58IQQgAyAEQiCIfCEDIARC/////w+DIAkgCH58IQQgAyAEQiCIfCEDIARC/////w+DIAA1AgwiCyAGfnwhBCADIARCIIh8IQMgAiAEPgIMIANCIIghBCADQv////8PgyAFIAE1AhAiDn58IQMgBCADQiCIfCEEIANC/////w+DIAcgDH58IQMgBCADQiCIfCEEIANC/////w+DIAkgCn58IQMgBCADQiCIfCEEIANC/////w+DIAsgCH58IQMgBCADQiCIfCEEIANC/////w+DIAA1AhAiDSAGfnwhAyAEIANCIIh8IQQgAiADPgIQIARCIIghAyAEQv////8PgyAFIAE1AhQiEH58IQQgAyAEQiCIfCEDIARC/////w+DIAcgDn58IQQgAyAEQiCIfCEDIARC/////w+DIAkgDH58IQQgAyAEQiCIfCEDIARC/////w+DIAsgCn58IQQgAyAEQiCIfCEDIARC/////w+DIA0gCH58IQQgAyAEQiCIfCEDIARC/////w+DIAA1AhQiDyAGfnwhBCADIARCIIh8IQMgAiAEPgIUIANCIIghBCADQv////8PgyAFIAE1AhgiEn58IQMgBCADQiCIfCEEIANC/////w+DIAcgEH58IQMgBCADQiCIfCEEIANC/////w+DIAkgDn58IQMgBCADQiCIfCEEIANC/////w+DIAsgDH58IQMgBCADQiCIfCEEIANC/////w+DIA0gCn58IQMgBCADQiCIfCEEIANC/////w+DIA8gCH58IQMgBCADQiCIfCEEIANC/////w+DIAA1AhgiESAGfnwhAyAEIANCIIh8IQQgAiADPgIYIARCIIghAyAEQv////8PgyAFIAE1AhwiFH58IQQgAyAEQiCIfCEDIARC/////w+DIAcgEn58IQQgAyAEQiCIfCEDIARC/////w+DIAkgEH58IQQgAyAEQiCIfCEDIARC/////w+DIAsgDn58IQQgAyAEQiCIfCEDIARC/////w+DIA0gDH58IQQgAyAEQiCIfCEDIARC/////w+DIA8gCn58IQQgAyAEQiCIfCEDIARC/////w+DIBEgCH58IQQgAyAEQiCIfCEDIARC/////w+DIAA1AhwiEyAGfnwhBCADIARCIIh8IQMgAiAEPgIcIANCIIghBCADQv////8PgyAHIBR+fCEDIAQgA0IgiHwhBCADQv////8PgyAJIBJ+fCEDIAQgA0IgiHwhBCADQv////8PgyALIBB+fCEDIAQgA0IgiHwhBCADQv////8PgyANIA5+fCEDIAQgA0IgiHwhBCADQv////8PgyAPIAx+fCEDIAQgA0IgiHwhBCADQv////8PgyARIAp+fCEDIAQgA0IgiHwhBCADQv////8PgyATIAh+fCEDIAQgA0IgiHwhBCACIAM+AiAgBEIgiCEDIARC/////w+DIAkgFH58IQQgAyAEQiCIfCEDIARC/////w+DIAsgEn58IQQgAyAEQiCIfCEDIARC/////w+DIA0gEH58IQQgAyAEQiCIfCEDIARC/////w+DIA8gDn58IQQgAyAEQiCIfCEDIARC/////w+DIBEgDH58IQQgAyAEQiCIfCEDIARC/////w+DIBMgCn58IQQgAyAEQiCIfCEDIAIgBD4CJCADQiCIIQQgA0L/////D4MgCyAUfnwhAyAEIANCIIh8IQQgA0L/////D4MgDSASfnwhAyAEIANCIIh8IQQgA0L/////D4MgDyAQfnwhAyAEIANCIIh8IQQgA0L/////D4MgESAOfnwhAyAEIANCIIh8IQQgA0L/////D4MgEyAMfnwhAyAEIANCIIh8IQQgAiADPgIoIARCIIghAyAEQv////8PgyANIBR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAPIBJ+fCEEIAMgBEIgiHwhAyAEQv////8PgyARIBB+fCEEIAMgBEIgiHwhAyAEQv////8PgyATIA5+fCEEIAMgBEIgiHwhAyACIAQ+AiwgA0IgiCEEIANC/////w+DIA8gFH58IQMgBCADQiCIfCEEIANC/////w+DIBEgEn58IQMgBCADQiCIfCEEIANC/////w+DIBMgEH58IQMgBCADQiCIfCEEIAIgAz4CMCAEQiCIIQMgBEL/////D4MgESAUfnwhBCADIARCIIh8IQMgBEL/////D4MgEyASfnwhBCADIARCIIh8IQMgAiAEPgI0IANCIIghBCADQv////8PgyATIBR+fCEDIAQgA0IgiHwhBCACIAM+AjggBEIgiCEDIAIgBD4CPAv0EAEBfkEoIAA1AgAgATUCAH43AwBBKCAANQIAIAE1AgR+NwMIQSggADUCACABNQIIfjcDEEEoIAA1AgAgATUCDH43AxhBKCAANQIAIAE1AhB+NwMgQSggADUCACABNQIUfjcDKEEoIAA1AgAgATUCGH43AzBBKCAANQIAIAE1Ahx+NwM4QSggADUCBCABNQIAfjcDQEEoIAA1AgQgATUCBH43A0hBKCAANQIEIAE1Agh+NwNQQSggADUCBCABNQIMfjcDWEEoIAA1AgQgATUCEH43A2BBKCAANQIEIAE1AhR+NwNoQSggADUCBCABNQIYfjcDcEEoIAA1AgQgATUCHH43A3hBKCAANQIIIAE1AgB+NwOAAUEoIAA1AgggATUCBH43A4gBQSggADUCCCABNQIIfjcDkAFBKCAANQIIIAE1Agx+NwOYAUEoIAA1AgggATUCEH43A6ABQSggADUCCCABNQIUfjcDqAFBKCAANQIIIAE1Ahh+NwOwAUEoIAA1AgggATUCHH43A7gBQSggADUCDCABNQIAfjcDwAFBKCAANQIMIAE1AgR+NwPIAUEoIAA1AgwgATUCCH43A9ABQSggADUCDCABNQIMfjcD2AFBKCAANQIMIAE1AhB+NwPgAUEoIAA1AgwgATUCFH43A+gBQSggADUCDCABNQIYfjcD8AFBKCAANQIMIAE1Ahx+NwP4AUEoIAA1AhAgATUCAH43A4ACQSggADUCECABNQIEfjcDiAJBKCAANQIQIAE1Agh+NwOQAkEoIAA1AhAgATUCDH43A5gCQSggADUCECABNQIQfjcDoAJBKCAANQIQIAE1AhR+NwOoAkEoIAA1AhAgATUCGH43A7ACQSggADUCECABNQIcfjcDuAJBKCAANQIUIAE1AgB+NwPAAkEoIAA1AhQgATUCBH43A8gCQSggADUCFCABNQIIfjcD0AJBKCAANQIUIAE1Agx+NwPYAkEoIAA1AhQgATUCEH43A+ACQSggADUCFCABNQIUfjcD6AJBKCAANQIUIAE1Ahh+NwPwAkEoIAA1AhQgATUCHH43A/gCQSggADUCGCABNQIAfjcDgANBKCAANQIYIAE1AgR+NwOIA0EoIAA1AhggATUCCH43A5ADQSggADUCGCABNQIMfjcDmANBKCAANQIYIAE1AhB+NwOgA0EoIAA1AhggATUCFH43A6gDQSggADUCGCABNQIYfjcDsANBKCAANQIYIAE1Ahx+NwO4A0EoIAA1AhwgATUCAH43A8ADQSggADUCHCABNQIEfjcDyANBKCAANQIcIAE1Agh+NwPQA0EoIAA1AhwgATUCDH43A9gDQSggADUCHCABNQIQfjcD4ANBKCAANQIcIAE1AhR+NwPoA0EoIAA1AhwgATUCGH43A/ADQSggADUC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6Ac1AhAgBH58IQMgACADPgIkIAA1AiggA0IgiHxB6Ac1AhQgBH58IQMgACADPgIoIAA1AiwgA0IgiHxB6Ac1AhggBH58IQMgACADPgIsIAA1AjAgA0IgiHxB6Ac1AhwgBH58IQMgACADPgIwQegIIANCIIg+AhRCACEDIAA1AhggAn5C/////w+DIQQgADUCGCADQiCIfEHoBzUCACAEfnwhAyAAIAM+AhggADUCHCADQiCIfEHoBzUCBCAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoBzUCCCAEfnwhAyAAIAM+AiAgADUCJCADQiCIfEHoBzUCDCAEfnwhAyAAIAM+AiQgADUCKCADQiCIfEHoBzUCECAEfnwhAyAAIAM+AiggADUCLCADQiCIfEHoBzUCFCAEfnwhAyAAIAM+AiwgADUCMCADQiCIfEHoBzUCGCAEfnwhAyAAIAM+AjAgADUCNCADQiCIfEHoBzUCHCAEfnwhAyAAIAM+AjRB6AggA0IgiD4CGEIAIQMgADUCHCACfkL/////D4MhBCAANQIcIANCIIh8QegHNQIAIAR+fCEDIAAgAz4CHCAANQIgIANCIIh8QegHNQIEIAR+fCEDIAAgAz4CICAANQIkIANCIIh8QegHNQIIIAR+fCEDIAAgAz4CJCAANQIoIANCIIh8QegHNQIMIAR+fCEDIAAgAz4CKCAANQIsIANCIIh8QegHNQIQIAR+fCEDIAAgAz4CLCAANQIwIANCIIh8QegHNQIUIAR+fCEDIAAgAz4CMCAANQI0IANCIIh8QegHNQIYIAR+fCEDIAAgAz4CNCAANQI4IANCIIh8QegHNQIcIAR+fCEDIAAgAz4COEHoCCADQiCIPgIcQegIIABBIGogARAOC74fIwF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX5CiceZpA4hBSADQv////8PgyAANQIAIgYgATUCACIHfnwhAyAEIANCIIh8IQQgA0L/////D4MgBX5C/////w+DIQggA0L/////D4NBADUC6AciCSAIfnwhAyAEIANCIIh8IQQgBEIgiCEDIARC/////w+DIAYgATUCBCILfnwhBCADIARCIIh8IQMgBEL/////D4MgADUCBCIKIAd+fCEEIAMgBEIgiHwhAyAEQv////8Pg0EANQLsByINIAh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAFfkL/////D4MhDCAEQv////8PgyAJIAx+fCEEIAMgBEIgiHwhAyADQiCIIQQgA0L/////D4MgBiABNQIIIg9+fCEDIAQgA0IgiHwhBCADQv////8PgyAKIAt+fCEDIAQgA0IgiHwhBCADQv////8PgyAANQIIIg4gB358IQMgBCADQiCIfCEEIANC/////w+DIA0gDH58IQMgBCADQiCIfCEEIANC/////w+DQQA1AvAHIhEgCH58IQMgBCADQiCIfCEEIANC/////w+DIAV+Qv////8PgyEQIANC/////w+DIAkgEH58IQMgBCADQiCIfCEEIARCIIghAyAEQv////8PgyAGIAE1AgwiE358IQQgAyAEQiCIfCEDIARC/////w+DIAogD358IQQgAyAEQiCIfCEDIARC/////w+DIA4gC358IQQgAyAEQiCIfCEDIARC/////w+DIAA1AgwiEiAHfnwhBCADIARCIIh8IQMgBEL/////D4MgDSAQfnwhBCADIARCIIh8IQMgBEL/////D4MgESAMfnwhBCADIARCIIh8IQMgBEL/////D4NBADUC9AciFSAIfnwhBCADIARCIIh8IQMgBEL/////D4MgBX5C/////w+DIRQgBEL/////D4MgCSAUfnwhBCADIARCIIh8IQMgA0IgiCEEIANC/////w+DIAYgATUCECIXfnwhAyAEIANCIIh8IQQgA0L/////D4MgCiATfnwhAyAEIANCIIh8IQQgA0L/////D4MgDiAPfnwhAyAEIANCIIh8IQQgA0L/////D4MgEiALfnwhAyAEIANCIIh8IQQgA0L/////D4MgADUCECIWIAd+fCEDIAQgA0IgiHwhBCADQv////8PgyANIBR+fCEDIAQgA0IgiHwhBCADQv////8PgyARIBB+fCEDIAQgA0IgiHwhBCADQv////8PgyAVIAx+fCEDIAQgA0IgiHwhBCADQv////8Pg0EANQL4ByIZIAh+fCEDIAQgA0IgiHwhBCADQv////8PgyAFfkL/////D4MhGCADQv////8PgyAJIBh+fCEDIAQgA0IgiHwhBCAEQiCIIQMgBEL/////D4MgBiABNQIUIht+fCEEIAMgBEIgiHwhAyAEQv////8PgyAKIBd+fCEEIAMgBEIgiHwhAyAEQv////8PgyAOIBN+fCEEIAMgBEIgiHwhAyAEQv////8PgyASIA9+fCEEIAMgBEIgiHwhAyAEQv////8PgyAWIAt+fCEEIAMgBEIgiHwhAyAEQv////8PgyAANQIUIhogB358IQQgAyAEQiCIfCEDIARC/////w+DIA0gGH58IQQgAyAEQiCIfCEDIARC/////w+DIBEgFH58IQQgAyAEQiCIfCEDIARC/////w+DIBUgEH58IQQgAyAEQiCIfCEDIARC/////w+DIBkgDH58IQQgAyAEQiCIfCEDIARC/////w+DQQA1AvwHIh0gCH58IQQgAyAEQiCIfCEDIARC/////w+DIAV+Qv////8PgyEcIARC/////w+DIAkgHH58IQQgAyAEQiCIfCEDIANCIIghBCADQv////8PgyAGIAE1AhgiH358IQMgBCADQiCIfCEEIANC/////w+DIAogG358IQMgBCADQiCIfCEEIANC/////w+DIA4gF358IQMgBCADQiCIfCEEIANC/////w+DIBIgE358IQMgBCADQiCIfCEEIANC/////w+DIBYgD358IQMgBCADQiCIfCEEIANC/////w+DIBogC358IQMgBCADQiCIfCEEIANC/////w+DIAA1AhgiHiAHfnwhAyAEIANCIIh8IQQgA0L/////D4MgDSAcfnwhAyAEIANCIIh8IQQgA0L/////D4MgESAYfnwhAyAEIANCIIh8IQQgA0L/////D4MgFSAUfnwhAyAEIANCIIh8IQQgA0L/////D4MgGSAQfnwhAyAEIANCIIh8IQQgA0L/////D4MgHSAMfnwhAyAEIANCIIh8IQQgA0L/////D4NBADUCgAgiISAIfnwhAyAEIANCIIh8IQQgA0L/////D4MgBX5C/////w+DISAgA0L/////D4MgCSAgfnwhAyAEIANCIIh8IQQgBEIgiCEDIARC/////w+DIAYgATUCHCIjfnwhBCADIARCIIh8IQMgBEL/////D4MgCiAffnwhBCADIARCIIh8IQMgBEL/////D4MgDiAbfnwhBCADIARCIIh8IQMgBEL/////D4MgEiAXfnwhBCADIARCIIh8IQMgBEL/////D4MgFiATfnwhBCADIARCIIh8IQMgBEL/////D4MgGiAPfnwhBCADIARCIIh8IQMgBEL/////D4MgHiALfnwhBCADIARCIIh8IQMgBEL/////D4MgADUCHCIiIAd+fCEEIAMgBEIgiHwhAyAEQv////8PgyANICB+fCEEIAMgBEIgiHwhAyAEQv////8PgyARIBx+fCEEIAMgBEIgiHwhAyAEQv////8PgyAVIBh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAZIBR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAdIBB+fCEEIAMgBEIgiHwhAyAEQv////8PgyAhIAx+fCEEIAMgBEIgiHwhAyAEQv////8Pg0EANQKECCIlIAh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAFfkL/////D4MhJCAEQv////8PgyAJICR+fCEEIAMgBEIgiHwhAyADQiCIIQQgA0L/////D4MgCiAjfnwhAyAEIANCIIh8IQQgA0L/////D4MgDiAffnwhAyAEIANCIIh8IQQgA0L/////D4MgEiAbfnwhAyAEIANCIIh8IQQgA0L/////D4MgFiAXfnwhAyAEIANCIIh8IQQgA0L/////D4MgGiATfnwhAyAEIANCIIh8IQQgA0L/////D4MgHiAPfnwhAyAEIANCIIh8IQQgA0L/////D4MgIiALfnwhAyAEIANCIIh8IQQgA0L/////D4MgDSAkfnwhAyAEIANCIIh8IQQgA0L/////D4MgESAgfnwhAyAEIANCIIh8IQQgA0L/////D4MgFSAcfnwhAyAEIANCIIh8IQQgA0L/////D4MgGSAYfnwhAyAEIANCIIh8IQQgA0L/////D4MgHSAUfnwhAyAEIANCIIh8IQQgA0L/////D4MgISAQfnwhAyAEIANCIIh8IQQgA0L/////D4MgJSAMfnwhAyAEIANCIIh8IQQgAiADPgIAIARCIIghAyAEQv////8PgyAOICN+fCEEIAMgBEIgiHwhAyAEQv////8PgyASIB9+fCEEIAMgBEIgiHwhAyAEQv////8PgyAWIBt+fCEEIAMgBEIgiHwhAyAEQv////8PgyAaIBd+fCEEIAMgBEIgiHwhAyAEQv////8PgyAeIBN+fCEEIAMgBEIgiHwhAyAEQv////8PgyAiIA9+fCEEIAMgBEIgiHwhAyAEQv////8PgyARICR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAVICB+fCEEIAMgBEIgiHwhAyAEQv////8PgyAZIBx+fCEEIAMgBEIgiHwhAyAEQv////8PgyAdIBh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAhIBR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAlIBB+fCEEIAMgBEIgiHwhAyACIAQ+AgQgA0IgiCEEIANC/////w+DIBIgI358IQMgBCADQiCIfCEEIANC/////w+DIBYgH358IQMgBCADQiCIfCEEIANC/////w+DIBogG358IQMgBCADQiCIfCEEIANC/////w+DIB4gF358IQMgBCADQiCIfCEEIANC/////w+DICIgE358IQMgBCADQiCIfCEEIANC/////w+DIBUgJH58IQMgBCADQiCIfCEEIANC/////w+DIBkgIH58IQMgBCADQiCIfCEEIANC/////w+DIB0gHH58IQMgBCADQiCIfCEEIANC/////w+DICEgGH58IQMgBCADQiCIfCEEIANC/////w+DICUgFH58IQMgBCADQiCIfCEEIAIgAz4CCCAEQiCIIQMgBEL/////D4MgFiAjfnwhBCADIARCIIh8IQMgBEL/////D4MgGiAffnwhBCADIARCIIh8IQMgBEL/////D4MgHiAbfnwhBCADIARCIIh8IQMgBEL/////D4MgIiAXfnwhBCADIARCIIh8IQMgBEL/////D4MgGSAkfnwhBCADIARCIIh8IQMgBEL/////D4MgHSAgfnwhBCADIARCIIh8IQMgBEL/////D4MgISAcfnwhBCADIARCIIh8IQMgBEL/////D4MgJSAYfnwhBCADIARCIIh8IQMgAiAEPgIMIANCIIghBCADQv////8PgyAaICN+fCEDIAQgA0IgiHwhBCADQv////8PgyAeIB9+fCEDIAQgA0IgiHwhBCADQv////8PgyAiIBt+fCEDIAQgA0IgiHwhBCADQv////8PgyAdICR+fCEDIAQgA0IgiHwhBCADQv////8PgyAhICB+fCEDIAQgA0IgiHwhBCADQv////8PgyAlIBx+fCEDIAQgA0IgiHwhBCACIAM+AhAgBEIgiCEDIARC/////w+DIB4gI358IQQgAyAEQiCIfCEDIARC/////w+DICIgH358IQQgAyAEQiCIfCEDIARC/////w+DICEgJH58IQQgAyAEQiCIfCEDIARC/////w+DICUgIH58IQQgAyAEQiCIfCEDIAIgBD4CFCADQiCIIQQgA0L/////D4MgIiAjfnwhAyAEIANCIIh8IQQgA0L/////D4MgJSAkfnwhAyAEIANCIIh8IQQgAiADPgIYIARCIIghAyACIAQ+AhwgA6cEQCACQegHIAIQBxoFIAJB6AcQBQRAIAJB6AcgAhAHGgsLCxIAIAAgAUHoDBAJQegMIAIQEQsLACAAQYgIIAEQEgsVACAAQagNEABByA0QAUGoDSABEBELFwAgACABEBUgAUHoByABEA0gASABEBQLCQBBqAggABAACywAIAAgASACEAYEQCACQegNIAIQBxoFIAJB6A0QBQRAIAJB6A0gAhAHGgsLCxcAIAAgASACEAcEQCACQegNIAIQBhoLCxQAIAAQAkUEQEHoDSAAIAEQBxoLC5wRAwF+AX4BfkL/////DiECQgAhAyAANQIAIAJ+Qv////8PgyEEIAA1AgAgA0IgiHxB6A01AgAgBH58IQMgACADPgIAIAA1AgQgA0IgiHxB6A01AgQgBH58IQMgACADPgIEIAA1AgggA0IgiHxB6A01AgggBH58IQMgACADPgIIIAA1AgwgA0IgiHxB6A01AgwgBH58IQMgACADPgIMIAA1AhAgA0IgiHxB6A01AhAgBH58IQMgACADPgIQIAA1AhQgA0IgiHxB6A01AhQgBH58IQMgACADPgIUIAA1AhggA0IgiHxB6A01AhggBH58IQMgACADPgIYIAA1AhwgA0IgiHxB6A01AhwgBH58IQMgACADPgIcQegOIANCIIg+AgBCACEDIAA1AgQgAn5C/////w+DIQQgADUCBCADQiCIfEHoDTUCACAEfnwhAyAAIAM+AgQgADUCCCADQiCIfEHoDTUCBCAEfnwhAyAAIAM+AgggADUCDCADQiCIfEHoDTUCCCAEfnwhAyAAIAM+AgwgADUCECADQiCIfEHoDTUCDCAEfnwhAyAAIAM+AhAgADUCFCADQiCIfEHoDTUCECAEfnwhAyAAIAM+AhQgADUCGCADQiCIfEHoDTUCFCAEfnwhAyAAIAM+AhggADUCHCADQiCIfEHoDTUCGCAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoDTUCHCAEfnwhAyAAIAM+AiBB6A4gA0IgiD4CBEIAIQMgADUCCCACfkL/////D4MhBCAANQIIIANCIIh8QegNNQIAIAR+fCEDIAAgAz4CCCAANQIMIANCIIh8QegNNQIEIAR+fCEDIAAgAz4CDCAANQIQIANCIIh8QegNNQIIIAR+fCEDIAAgAz4CECAANQIUIANCIIh8QegNNQIMIAR+fCEDIAAgAz4CFCAANQIYIANCIIh8QegNNQIQIAR+fCEDIAAgAz4CGCAANQIcIANCIIh8QegNNQIUIAR+fCEDIAAgAz4CHCAANQIgIANCIIh8QegNNQIYIAR+fCEDIAAgAz4CICAANQIkIANCIIh8QegNNQIcIAR+fCEDIAAgAz4CJEHoDiADQiCIPgIIQgAhAyAANQIMIAJ+Qv////8PgyEEIAA1AgwgA0IgiHxB6A01AgAgBH58IQMgACADPgIMIAA1AhAgA0IgiHxB6A01AgQgBH58IQMgACADPgIQIAA1AhQgA0IgiHxB6A01AgggBH58IQMgACADPgIUIAA1AhggA0IgiHxB6A01AgwgBH58IQMgACADPgIYIAA1AhwgA0IgiHxB6A01AhAgBH58IQMgACADPgIcIAA1AiAgA0IgiHxB6A01AhQgBH58IQMgACADPgIgIAA1AiQgA0IgiHxB6A01AhggBH58IQMgACADPgIkIAA1AiggA0IgiHxB6A01AhwgBH58IQMgACADPgIoQegOIANCIIg+AgxCACEDIAA1AhAgAn5C/////w+DIQQgADUCECADQiCIfEHoDTUCACAEfnwhAyAAIAM+AhAgADUCFCADQiCIfEHoDTUCBCAEfnwhAyAAIAM+AhQgADUCGCADQiCIfEHoDTUCCCAEfnwhAyAAIAM+AhggADUCHCADQiCIfEHoDTUCDCAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoDTUCECAEfnwhAyAAIAM+AiAgADUCJCADQiCIfEHoDTUCFCAEfnwhAyAAIAM+AiQgADUCKCADQiCIfEHoDTUCGCAEfnwhAyAAIAM+AiggADUCLCADQiCIfEHoDTUCHCAEfnwhAyAAIAM+AixB6A4gA0IgiD4CEEIAIQMgADUCFCACfkL/////D4MhBCAANQIUIANCIIh8QegNNQIAIAR+fCEDIAAgAz4CFCAANQIYIANCIIh8QegNNQIEIAR+fCEDIAAgAz4CGCAANQIcIANCIIh8QegNNQIIIAR+fCEDIAAgAz4CHCAANQIgIANCIIh8QegNNQIMIAR+fCEDIAAgAz4CICAANQIkIANCIIh8QegNNQIQIAR+fCEDIAAgAz4CJCAANQIoIANCIIh8QegNNQIUIAR+fCEDIAAgAz4CKCAANQIsIANCIIh8QegNNQIYIAR+fCEDIAAgAz4CLCAANQIwIANCIIh8QegNNQIcIAR+fCEDIAAgAz4CMEHoDiADQiCIPgIUQgAhAyAANQIYIAJ+Qv////8PgyEEIAA1AhggA0IgiHxB6A01AgAgBH58IQMgACADPgIYIAA1AhwgA0IgiHxB6A01AgQgBH58IQMgACADPgIcIAA1AiAgA0IgiHxB6A01AgggBH58IQMgACADPgIgIAA1AiQgA0IgiHxB6A01AgwgBH58IQMgACADPgIkIAA1AiggA0IgiHxB6A01AhAgBH58IQMgACADPgIoIAA1AiwgA0IgiHxB6A01AhQgBH58IQMgACADPgIsIAA1AjAgA0IgiHxB6A01AhggBH58IQMgACADPgIwIAA1AjQgA0IgiHxB6A01AhwgBH58IQMgACADPgI0QegOIANCIIg+AhhCACEDIAA1AhwgAn5C/////w+DIQQgADUCHCADQiCIfEHoDTUCACAEfnwhAyAAIAM+AhwgADUCICADQiCIfEHoDTUCBCAEfnwhAyAAIAM+AiAgADUCJCADQiCIfEHoDTUCCCAEfnwhAyAAIAM+AiQgADUCKCADQiCIfEHoDTUCDCAEfnwhAyAAIAM+AiggADUCLCADQiCIfEHoDTUCECAEfnwhAyAAIAM+AiwgADUCMCADQiCIfEHoDTUCFCAEfnwhAyAAIAM+AjAgADUCNCADQiCIfEHoDTUCGCAEfnwhAyAAIAM+AjQgADUCOCADQiCIfEHoDTUCHCAEfnwhAyAAIAM+AjhB6A4gA0IgiD4CHEHoDiAAQSBqIAEQGAu+HyMBfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+AX4BfgF+Qv////8OIQUgA0L/////D4MgADUCACIGIAE1AgAiB358IQMgBCADQiCIfCEEIANC/////w+DIAV+Qv////8PgyEIIANC/////w+DQQA1AugNIgkgCH58IQMgBCADQiCIfCEEIARCIIghAyAEQv////8PgyAGIAE1AgQiC358IQQgAyAEQiCIfCEDIARC/////w+DIAA1AgQiCiAHfnwhBCADIARCIIh8IQMgBEL/////D4NBADUC7A0iDSAIfnwhBCADIARCIIh8IQMgBEL/////D4MgBX5C/////w+DIQwgBEL/////D4MgCSAMfnwhBCADIARCIIh8IQMgA0IgiCEEIANC/////w+DIAYgATUCCCIPfnwhAyAEIANCIIh8IQQgA0L/////D4MgCiALfnwhAyAEIANCIIh8IQQgA0L/////D4MgADUCCCIOIAd+fCEDIAQgA0IgiHwhBCADQv////8PgyANIAx+fCEDIAQgA0IgiHwhBCADQv////8Pg0EANQLwDSIRIAh+fCEDIAQgA0IgiHwhBCADQv////8PgyAFfkL/////D4MhECADQv////8PgyAJIBB+fCEDIAQgA0IgiHwhBCAEQiCIIQMgBEL/////D4MgBiABNQIMIhN+fCEEIAMgBEIgiHwhAyAEQv////8PgyAKIA9+fCEEIAMgBEIgiHwhAyAEQv////8PgyAOIAt+fCEEIAMgBEIgiHwhAyAEQv////8PgyAANQIMIhIgB358IQQgAyAEQiCIfCEDIARC/////w+DIA0gEH58IQQgAyAEQiCIfCEDIARC/////w+DIBEgDH58IQQgAyAEQiCIfCEDIARC/////w+DQQA1AvQNIhUgCH58IQQgAyAEQiCIfCEDIARC/////w+DIAV+Qv////8PgyEUIARC/////w+DIAkgFH58IQQgAyAEQiCIfCEDIANCIIghBCADQv////8PgyAGIAE1AhAiF358IQMgBCADQiCIfCEEIANC/////w+DIAogE358IQMgBCADQiCIfCEEIANC/////w+DIA4gD358IQMgBCADQiCIfCEEIANC/////w+DIBIgC358IQMgBCADQiCIfCEEIANC/////w+DIAA1AhAiFiAHfnwhAyAEIANCIIh8IQQgA0L/////D4MgDSAUfnwhAyAEIANCIIh8IQQgA0L/////D4MgESAQfnwhAyAEIANCIIh8IQQgA0L/////D4MgFSAMfnwhAyAEIANCIIh8IQQgA0L/////D4NBADUC+A0iGSAIfnwhAyAEIANCIIh8IQQgA0L/////D4MgBX5C/////w+DIRggA0L/////D4MgCSAYfnwhAyAEIANCIIh8IQQgBEIgiCEDIARC/////w+DIAYgATUCFCIbfnwhBCADIARCIIh8IQMgBEL/////D4MgCiAXfnwhBCADIARCIIh8IQMgBEL/////D4MgDiATfnwhBCADIARCIIh8IQMgBEL/////D4MgEiAPfnwhBCADIARCIIh8IQMgBEL/////D4MgFiALfnwhBCADIARCIIh8IQMgBEL/////D4MgADUCFCIaIAd+fCEEIAMgBEIgiHwhAyAEQv////8PgyANIBh+fCEEIAMgBEIgiHwhAyAEQv////8PgyARIBR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAVIBB+fCEEIAMgBEIgiHwhAyAEQv////8PgyAZIAx+fCEEIAMgBEIgiHwhAyAEQv////8Pg0EANQL8DSIdIAh+fCEEIAMgBEIgiHwhAyAEQv////8PgyAFfkL/////D4MhHCAEQv////8PgyAJIBx+fCEEIAMgBEIgiHwhAyADQiCIIQQgA0L/////D4MgBiABNQIYIh9+fCEDIAQgA0IgiHwhBCADQv////8PgyAKIBt+fCEDIAQgA0IgiHwhBCADQv////8PgyAOIBd+fCEDIAQgA0IgiHwhBCADQv////8PgyASIBN+fCEDIAQgA0IgiHwhBCADQv////8PgyAWIA9+fCEDIAQgA0IgiHwhBCADQv////8PgyAaIAt+fCEDIAQgA0IgiHwhBCADQv////8PgyAANQIYIh4gB358IQMgBCADQiCIfCEEIANC/////w+DIA0gHH58IQMgBCADQiCIfCEEIANC/////w+DIBEgGH58IQMgBCADQiCIfCEEIANC/////w+DIBUgFH58IQMgBCADQiCIfCEEIANC/////w+DIBkgEH58IQMgBCADQiCIfCEEIANC/////w+DIB0gDH58IQMgBCADQiCIfCEEIANC/////w+DQQA1AoAOIiEgCH58IQMgBCADQiCIfCEEIANC/////w+DIAV+Qv////8PgyEgIANC/////w+DIAkgIH58IQMgBCADQiCIfCEEIARCIIghAyAEQv////8PgyAGIAE1AhwiI358IQQgAyAEQiCIfCEDIARC/////w+DIAogH358IQQgAyAEQiCIfCEDIARC/////w+DIA4gG358IQQgAyAEQiCIfCEDIARC/////w+DIBIgF358IQQgAyAEQiCIfCEDIARC/////w+DIBYgE358IQQgAyAEQiCIfCEDIARC/////w+DIBogD358IQQgAyAEQiCIfCEDIARC/////w+DIB4gC358IQQgAyAEQiCIfCEDIARC/////w+DIAA1AhwiIiAHfnwhBCADIARCIIh8IQMgBEL/////D4MgDSAgfnwhBCADIARCIIh8IQMgBEL/////D4MgESAcfnwhBCADIARCIIh8IQMgBEL/////D4MgFSAYfnwhBCADIARCIIh8IQMgBEL/////D4MgGSAUfnwhBCADIARCIIh8IQMgBEL/////D4MgHSAQfnwhBCADIARCIIh8IQMgBEL/////D4MgISAMfnwhBCADIARCIIh8IQMgBEL/////D4NBADUChA4iJSAIfnwhBCADIARCIIh8IQMgBEL/////D4MgBX5C/////w+DISQgBEL/////D4MgCSAkfnwhBCADIARCIIh8IQMgA0IgiCEEIANC/////w+DIAogI358IQMgBCADQiCIfCEEIANC/////w+DIA4gH358IQMgBCADQiCIfCEEIANC/////w+DIBIgG358IQMgBCADQiCIfCEEIANC/////w+DIBYgF358IQMgBCADQiCIfCEEIANC/////w+DIBogE358IQMgBCADQiCIfCEEIANC/////w+DIB4gD358IQMgBCADQiCIfCEEIANC/////w+DICIgC358IQMgBCADQiCIfCEEIANC/////w+DIA0gJH58IQMgBCADQiCIfCEEIANC/////w+DIBEgIH58IQMgBCADQiCIfCEEIANC/////w+DIBUgHH58IQMgBCADQiCIfCEEIANC/////w+DIBkgGH58IQMgBCADQiCIfCEEIANC/////w+DIB0gFH58IQMgBCADQiCIfCEEIANC/////w+DICEgEH58IQMgBCADQiCIfCEEIANC/////w+DICUgDH58IQMgBCADQiCIfCEEIAIgAz4CACAEQiCIIQMgBEL/////D4MgDiAjfnwhBCADIARCIIh8IQMgBEL/////D4MgEiAffnwhBCADIARCIIh8IQMgBEL/////D4MgFiAbfnwhBCADIARCIIh8IQMgBEL/////D4MgGiAXfnwhBCADIARCIIh8IQMgBEL/////D4MgHiATfnwhBCADIARCIIh8IQMgBEL/////D4MgIiAPfnwhBCADIARCIIh8IQMgBEL/////D4MgESAkfnwhBCADIARCIIh8IQMgBEL/////D4MgFSAgfnwhBCADIARCIIh8IQMgBEL/////D4MgGSAcfnwhBCADIARCIIh8IQMgBEL/////D4MgHSAYfnwhBCADIARCIIh8IQMgBEL/////D4MgISAUfnwhBCADIARCIIh8IQMgBEL/////D4MgJSAQfnwhBCADIARCIIh8IQMgAiAEPgIEIANCIIghBCADQv////8PgyASICN+fCEDIAQgA0IgiHwhBCADQv////8PgyAWIB9+fCEDIAQgA0IgiHwhBCADQv////8PgyAaIBt+fCEDIAQgA0IgiHwhBCADQv////8PgyAeIBd+fCEDIAQgA0IgiHwhBCADQv////8PgyAiIBN+fCEDIAQgA0IgiHwhBCADQv////8PgyAVICR+fCEDIAQgA0IgiHwhBCADQv////8PgyAZICB+fCEDIAQgA0IgiHwhBCADQv////8PgyAdIBx+fCEDIAQgA0IgiHwhBCADQv////8PgyAhIBh+fCEDIAQgA0IgiHwhBCADQv////8PgyAlIBR+fCEDIAQgA0IgiHwhBCACIAM+AgggBEIgiCEDIARC/////w+DIBYgI358IQQgAyAEQiCIfCEDIARC/////w+DIBogH358IQQgAyAEQiCIfCEDIARC/////w+DIB4gG358IQQgAyAEQiCIfCEDIARC/////w+DICIgF358IQQgAyAEQiCIfCEDIARC/////w+DIBkgJH58IQQgAyAEQiCIfCEDIARC/////w+DIB0gIH58IQQgAyAEQiCIfCEDIARC/////w+DICEgHH58IQQgAyAEQiCIfCEDIARC/////w+DICUgGH58IQQgAyAEQiCIfCEDIAIgBD4CDCADQiCIIQQgA0L/////D4MgGiAjfnwhAyAEIANCIIh8IQQgA0L/////D4MgHiAffnwhAyAEIANCIIh8IQQgA0L/////D4MgIiAbfnwhAyAEIANCIIh8IQQgA0L/////D4MgHSAkfnwhAyAEIANCIIh8IQQgA0L/////D4MgISAgfnwhAyAEIANCIIh8IQQgA0L/////D4MgJSAcfnwhAyAEIANCIIh8IQQgAiADPgIQIARCIIghAyAEQv////8PgyAeICN+fCEEIAMgBEIgiHwhAyAEQv////8PgyAiIB9+fCEEIAMgBEIgiHwhAyAEQv////8PgyAhICR+fCEEIAMgBEIgiHwhAyAEQv////8PgyAlICB+fCEEIAMgBEIgiHwhAyACIAQ+AhQgA0IgiCEEIANC/////w+DICIgI358IQMgBCADQiCIfCEEIANC/////w+DICUgJH58IQMgBCADQiCIfCEEIAIgAz4CGCAEQiCIIQMgAiAEPgIcIAOnBEAgAkHoDSACEAcaBSACQegNEAUEQCACQegNIAIQBxoLCwsSACAAIAFB6BIQCUHoEiACEBsLCwAgAEGIDiABEBwLFQAgAEGoExAAQcgTEAFBqBMgARAbCxcAIAAgARAfIAFB6A0gARANIAEgARAeCwkAQagOIAAQAAsVACAAIAFB6BMQHEHoE0GIDiACEBwLCwAgAEHoDSABEA0LCgAgAEHAAGoQAgsVACAAEAEgAEEgahAXIABBwABqEAELIgAgACABEAAgAEEgaiABQSBqEAAgAEHAAGogAUHAAGoQAAuGAgAgABAkBEAgACABECYPCyAAIABBiBQQEiAAQSBqIABBIGpBqBQQEkGoFEGoFEHIFBASIABBqBRB6BQQDkHoFEHoFEHoFBASQegUQYgUQegUEA9B6BRByBRB6BQQD0HoFEHoFEHoFBAOQYgUQYgUQYgVEA5BiBVBiBRBiBUQDkGIFUGIFUGoFRASIABBIGogAEHAAGpByBUQEkHoFEHoFCABEA5BqBUgASABEA9ByBRByBRB6BUQDkHoFUHoFUHoFRAOQegVQegVQegVEA5B6BQgASABQSBqEA8gAUEgakGIFSABQSBqEBIgAUEgakHoFSABQSBqEA9ByBVByBUgAUHAAGoQDgusAwIBfwF/IABBwABqIQMgAUHAAGohBCAAECQEQCABIAIQJg8LIAEQJARAIAAgAhAmDwsgAyADQYgWEBIgBCAEQagWEBIgAEGoFkHIFhASIAFBiBZB6BYQEiADQYgWQYgXEBIgBEGoFkGoFxASIABBIGpBqBdByBcQEiAB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IQUgAyEGIAAgAkEgbGohBwJAA0AgBCAHRg0BIAQgBSAGEBwgBEEgaiEEIAVBIGohBSAGQSBqIQYMAAsLCy4CAX8BfyAAIQMgACABQSBsaiECAkADQCADIAJGDQEgAxABIANBIGohAwwACwsLjgEGAX8BfwF/AX8BfwF/QQAhBCAAIQYgASEHAkADQCAEIAJGDQEgBigCACEJIAZBBGohBkEAIQUCQANAIAUgCUYNASADIAYoAgBBIGxqIQggBkEEaiEGIAcgBkGotwMQHEGotwMgCCAIEBggBkEgaiEGIAVBAWohBQwACwsgB0EgaiEHIARBAWohBAwACwsLDgAgABACIABBIGoQAnELDQAgABABIABBIGoQAQsNACAAEBcgAEEgahABCxQAIAAgARAAIABBIGogAUEgahAAC3kAIAAgAUHotwMQEiAAQSBqIAFBIGpBiLgDEBIgACAAQSBqQai4AxAOIAEgAUEgakHIuAMQDkGouANByLgDQai4AxASQYi4A0HItwMgAhASQei3AyACIAIQDkHotwNBiLgDIAJBIGoQDkGouAMgAkEgaiACQSBqEA8LGwAgACABIAIQDiAAQSBqIAFBIGogAkEgahAOCxsAIAAgASACEA8gAEEgaiABQSBqIAJBIGoQDwsUACAAIAEQECAAQSBqIAFBIGoQEAsUACAAIAEQFCAAQSBqIAFBIGoQFAsUACAAIAEQFSAAQSBqIAFBIGoQFQsVACAAIAEQBCAAQSBqIAFBIGoQBHELaAAgACAAQei4AxASIABBIGogAEEgakGIuQMQEkGIuQNByLcDQai5AxASQei4A0GouQNBqLkDEA9BqLkDQci5AxAWIABByLkDIAEQEiAAQSBqQci5AyABQSBqEBIgAUEgaiABQSBqEBALCgAgAEGAAWoQRwsWACAAEEggAEHAAGoQSSAAQYABahBICyQAIAAgARBKIABBwABqIAFBwABqEEogAEGAAWogAUGAAWoQSgu8AgAgABBTBEAgACABEFUPCyAAIABB6LkDEEsgAEHAAGogAEHAAGpBqLoDEEtBqLoDQai6A0HougMQSyAAQai6A0GouwMQTEGouwNBqLsDQai7AxBLQai7A0HouQNBqLsDEE1BqLsDQei6A0GouwMQTUGouwNBqLsDQai7AxBMQei5A0HouQNB6LsDEExB6LsDQei5A0HouwMQTEHouwNB6LsDQai8AxBLIABBwABqIABBgAFqQei8AxBLQai7A0GouwMgARBMQai8AyABIAEQTUHougNB6LoDQai9AxBMQai9A0GovQNBqL0DEExBqL0DQai9A0GovQMQTEGouwMgASABQcAAahBNIAFBwABqQei7AyABQcAAahBLIAFBwABqQai9AyABQcAAahBNQei8A0HovAMgAUGAAWoQTAvvAwIBfwF/IABBgAFqIQMgAUGAAWohBCAAEFMEQCABIAIQVQ8LIAEQUwRAIAAgAhBVDwsgAyADQei9AxBLIAQgBEGovgMQSyAAQai+A0HovgMQSyABQei9A0GovwMQSyADQei9A0HovwMQSyAEQai+A0GowAMQSyAAQcAAakGowANB6MADEEsgAUHAAGpB6L8DQajBAxBLQei+A0GovwMQUQRAQejAA0GowQMQUQRAIAAgAhBWDwsLQai/A0HovgNB6MEDEE1BqMEDQejAA0GowgMQTUHowQNB6MEDQejCAxBMQejCA0HowgNB6MIDEEtB6MEDQejCA0GowwMQS0GowgNBqMIDQejDAxBMQei+A0HowgNB6MQDEEtB6MMDQejDA0GoxAMQS0HoxANB6MQDQajFAxBMQajEA0GowwMgAhBNIAJBqMUDIAIQTUHowANBqMMDQejFAxBLQejFA0HoxQNB6MUDEExB6MQDIAIgAkHAAGoQTSACQcAAakHowwMgAkHAAGoQSyACQcAAakHoxQMgAkHAAGoQTSADIAQgAkGAAWoQTCACQYABaiACQYABaiACQYABahBLIAJBgAFqQei9AyACQYABahBNIAJBgAFqQai+AyACQYABahBNIAJBgAFqQejBAyACQYABahBLCyQAIAAgARBKIABBwABqIAFBwABqEE4gAEGAAWogAUGAAWoQSgsQACABIAIQWCAAIAIgAhBXCyQAIAAgARBQIABBwABqIAFBwABqEFAgAEGAAWogAUGAAWoQUAskACAAIAEQTyAAQcAAaiABQcAAahBPIABBgAFqIAFBgAFqEE8LWgAgABBTBEAgARBUBSAAQYABakGoxgMQUkGoxgNBqMYDQejGAxBLQajGA0HoxgNBqMcDEEsgAEHoxgMgARBLIABBwABqQajHAyABQcAAahBLIAFBgAFqEEkLC7ACAgF/AX8gAEHo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", "base64");
            exports.pq = 1000;
            exports.pr = 1768;
        
}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":6}],16:[function(require,module,exports){
/*
    Copyright 2019 0KIMS association.

    This file is part of websnark (Web Assembly zkSnark Prover).

    websnark is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    websnark is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with websnark. If not, see <https://www.gnu.org/licenses/>.
*/

/* globals window */

const buildGroth16 = require("./src/groth16");
const utils = require("./src/utils");

buildGroth16().then((groth16) => {
    window.groth16 = groth16;
    window.zkSnarkProofToSolidityInput = utils.toSolidityInput;

    window.genZKSnarkProofAndWitness = function (input, circuitJson, provingKey, cb) {
        const p = utils.genWitnessAndProve(groth16, input, circuitJson, provingKey);
        if (cb) {
            p.then((proof) => {
                cb(null, proof);
            }, (err) => {
                cb(err);
            });
        } else {
            return p;
        }
    };

    window.genZKSnarkProof = function (witness, provingKey, cb) {
        const p = groth16.proof(witness, provingKey);
        if (cb) {
            p.then((proof) => {
                cb(null, proof);
            }, (err) => {
                cb(err);
            });
        } else {
            return p;
        }
    };
});
},{"./src/groth16":17,"./src/utils":18}],17:[function(require,module,exports){
(function (process){(function (){
/*
    Copyright 2019 0KIMS association.

    This file is part of websnark (Web Assembly zkSnark Prover).

    websnark is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    websnark is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with websnark. If not, see <https://www.gnu.org/licenses/>.
*/

/* globals WebAssembly, Blob, Worker, navigator, Promise, window */
const bigInt = require("big-integer");
const groth16_wasm = require("../build/groth16_wasm.js");
const assert = require("assert");

class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}

/*
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
*/

function thread(self) {
    let instance;
    let memory;
    let i32;

    async function init(data) {
        const code = new Uint8Array(data.code);
        const wasmModule = await WebAssembly.compile(code);
        memory = new WebAssembly.Memory({ initial: data.init });
        i32 = new Uint32Array(memory.buffer);

        instance = await WebAssembly.instantiate(wasmModule, {
            env: {
                "memory": memory
            }
        });
    }

    function alloc(length) {
        while (i32[0] & 3) i32[0]++;  // Return always aligned pointers
        const res = i32[0];
        i32[0] += length;
        while (i32[0] > memory.buffer.byteLength) {
            memory.grow(100);
        }
        i32 = new Uint32Array(memory.buffer);
        return res;
    }

    function putBin(b) {
        const p = alloc(b.byteLength);
        const s32 = new Uint32Array(b);
        i32.set(s32, p / 4);
        return p;
    }

    function getBin(p, l) {
        return memory.buffer.slice(p, p + l);
    }

    self.onmessage = function (e) {
        let data;
        if (e.data) {
            data = e.data;
        } else {
            data = e;
        }

        if (data.command == "INIT") {
            init(data).then(function () {
                self.postMessage(data.result);
            });
        } else if (data.command == "G1_MULTIEXP") {

            const oldAlloc = i32[0];
            const pScalars = putBin(data.scalars);
            const pPoints = putBin(data.points);
            const pRes = alloc(96);
            instance.exports.g1_zero(pRes);
            instance.exports.g1_multiexp2(pScalars, pPoints, data.n, 7, pRes);

            data.result = getBin(pRes, 96);
            i32[0] = oldAlloc;
            self.postMessage(data.result, [data.result]);
        } else if (data.command == "G2_MULTIEXP") {

            const oldAlloc = i32[0];
            const pScalars = putBin(data.scalars);
            const pPoints = putBin(data.points);
            const pRes = alloc(192);
            instance.exports.g2_zero(pRes);
            instance.exports.g2_multiexp(pScalars, pPoints, data.n, 7, pRes);

            data.result = getBin(pRes, 192);
            i32[0] = oldAlloc;
            self.postMessage(data.result, [data.result]);
        } else if (data.command == "CALC_H") {
            const oldAlloc = i32[0];
            const pSignals = putBin(data.signals);
            const pPolsA = putBin(data.polsA);
            const pPolsB = putBin(data.polsB);
            const nSignals = data.nSignals;
            const domainSize = data.domainSize;
            const pSignalsM = alloc(nSignals * 32);
            const pPolA = alloc(domainSize * 32);
            const pPolB = alloc(domainSize * 32);
            const pPolA2 = alloc(domainSize * 32 * 2);
            const pPolB2 = alloc(domainSize * 32 * 2);

            instance.exports.fft_toMontgomeryN(pSignals, pSignalsM, nSignals);

            instance.exports.pol_zero(pPolA, domainSize);
            instance.exports.pol_zero(pPolB, domainSize);

            instance.exports.pol_constructLC(pPolsA, pSignalsM, nSignals, pPolA);
            instance.exports.pol_constructLC(pPolsB, pSignalsM, nSignals, pPolB);

            instance.exports.fft_copyNInterleaved(pPolA, pPolA2, domainSize);
            instance.exports.fft_copyNInterleaved(pPolB, pPolB2, domainSize);

            instance.exports.fft_ifft(pPolA, domainSize, 0);
            instance.exports.fft_ifft(pPolB, domainSize, 0);
            instance.exports.fft_fft(pPolA, domainSize, 1);
            instance.exports.fft_fft(pPolB, domainSize, 1);

            instance.exports.fft_copyNInterleaved(pPolA, pPolA2 + 32, domainSize);
            instance.exports.fft_copyNInterleaved(pPolB, pPolB2 + 32, domainSize);

            instance.exports.fft_mulN(pPolA2, pPolB2, domainSize * 2, pPolA2);

            instance.exports.fft_ifft(pPolA2, domainSize * 2, 0);

            instance.exports.fft_fromMontgomeryN(pPolA2 + domainSize * 32, pPolA2 + domainSize * 32, domainSize);

            data.result = getBin(pPolA2 + domainSize * 32, domainSize * 32);
            i32[0] = oldAlloc;
            self.postMessage(data.result, [data.result]);
        } else if (data.command == "TERMINATE") {
            process.exit();
        }
    };
}

// We use the Object.assign approach for the backwards compatibility
// @params Number wasmInitialMemory 
async function build(params) {
    const defaultParams = { wasmInitialMemory: 5000 };
    Object.assign(defaultParams, params);
    const groth16 = new Groth16();

    groth16.q = bigInt("21888242871839275222246405745257275088696311157297823662689037894645226208583");
    groth16.r = bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    groth16.n64 = Math.floor((groth16.q.minus(1).bitLength() - 1) / 64) + 1;
    groth16.n32 = groth16.n64 * 2;
    groth16.n8 = groth16.n64 * 8;

    groth16.memory = new WebAssembly.Memory({ initial: defaultParams.wasmInitialMemory });
    groth16.i32 = new Uint32Array(groth16.memory.buffer);

    const wasmModule = await WebAssembly.compile(groth16_wasm.code);

    groth16.instance = await WebAssembly.instantiate(wasmModule, {
        env: {
            "memory": groth16.memory
        }
    });

    groth16.pq = groth16_wasm.pq;
    groth16.pr = groth16_wasm.pr;

    groth16.pr0 = groth16.alloc(192);
    groth16.pr1 = groth16.alloc(192);

    groth16.workers = [];
    groth16.pendingDeferreds = [];
    groth16.working = [];

    let concurrency;

    if ((typeof (navigator) === "object") && navigator.hardwareConcurrency) {
        concurrency = navigator.hardwareConcurrency;
    } else {
        concurrency = 8;
    }

    function getOnMsg(i) {
        return function (e) {
            let data;
            if ((e) && (e.data)) {
                data = e.data;
            } else {
                data = e;
            }

            groth16.working[i] = false;
            groth16.pendingDeferreds[i].resolve(data);
            groth16.processWorks();
        };
    }

    for (let i = 0; i < concurrency; i++) {

        const blob = new Blob(["(", thread.toString(), ")(self);"], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);

        groth16.workers[i] = new Worker(url);

        groth16.workers[i].onmessage = getOnMsg(i);

        groth16.working[i] = false;
    }

    const initPromises = [];
    for (let i = 0; i < groth16.workers.length; i++) {
        const copyCode = groth16_wasm.code.buffer.slice(0);
        initPromises.push(groth16.postAction(i, {
            command: "INIT",
            init: defaultParams.wasmInitialMemory,
            code: copyCode

        }, [copyCode]));
    }

    await Promise.all(initPromises);

    return groth16;
}

class Groth16 {
    constructor() {
        this.actionQueue = [];
    }

    postAction(workerId, e, transfers, _deferred) {
        assert(this.working[workerId] == false);
        this.working[workerId] = true;

        this.pendingDeferreds[workerId] = _deferred ? _deferred : new Deferred();
        this.workers[workerId].postMessage(e, transfers);

        return this.pendingDeferreds[workerId].promise;
    }

    processWorks() {
        for (let i = 0; (i < this.workers.length) && (this.actionQueue.length > 0); i++) {
            if (this.working[i] == false) {
                const work = this.actionQueue.shift();
                this.postAction(i, work.data, work.transfers, work.deferred);
            }
        }
    }

    queueAction(actionData, transfers) {
        const d = new Deferred();
        this.actionQueue.push({
            data: actionData,
            transfers: transfers,
            deferred: d
        });
        this.processWorks();
        return d.promise;
    }

    alloc(length) {
        while (this.i32[0] & 3) this.i32[0]++;  // Return always aligned pointers
        const res = this.i32[0];
        this.i32[0] += length;
        return res;
    }


    putBin(p, b) {
        const s32 = new Uint32Array(b);
        this.i32.set(s32, p / 4);
    }

    getBin(p, l) {
        return this.memory.buffer.slice(p, p + l);
    }

    bin2int(b) {
        const i32 = new Uint32Array(b);
        let acc = bigInt(i32[7]);
        for (let i = 6; i >= 0; i--) {
            acc = acc.shiftLeft(32);
            acc = acc.add(i32[i]);
        }
        return acc.toString();
    }

    bin2g1(b) {
        return [
            this.bin2int(b.slice(0, 32)),
            this.bin2int(b.slice(32, 64)),
            this.bin2int(b.slice(64, 96)),
        ];
    }
    bin2g2(b) {
        return [
            [
                this.bin2int(b.slice(0, 32)),
                this.bin2int(b.slice(32, 64))
            ],
            [
                this.bin2int(b.slice(64, 96)),
                this.bin2int(b.slice(96, 128))
            ],
            [
                this.bin2int(b.slice(128, 160)),
                this.bin2int(b.slice(160, 192))
            ],
        ];
    }

    async g1_multiexp(scalars, points) {
        const nPoints = scalars.byteLength / 32;
        const nPointsPerThread = Math.floor(nPoints / this.workers.length);
        const opPromises = [];
        for (let i = 0; i < this.workers.length; i++) {
            const th_nPoints =
                i < this.workers.length - 1 ?
                    nPointsPerThread :
                    nPoints - (nPointsPerThread * (this.workers.length - 1));
            const scalars_th = scalars.slice(i * nPointsPerThread * 32, i * nPointsPerThread * 32 + th_nPoints * 32);
            const points_th = points.slice(i * nPointsPerThread * 64, i * nPointsPerThread * 64 + th_nPoints * 64);
            opPromises.push(
                this.queueAction({
                    command: "G1_MULTIEXP",
                    scalars: scalars_th,
                    points: points_th,
                    n: th_nPoints
                }, [scalars_th, points_th])
            );
        }

        const results = await Promise.all(opPromises);

        this.instance.exports.g1_zero(this.pr0);
        for (let i = 0; i < results.length; i++) {
            this.putBin(this.pr1, results[i]);
            this.instance.exports.g1_add(this.pr0, this.pr1, this.pr0);
        }

        return this.getBin(this.pr0, 96);
    }

    async g2_multiexp(scalars, points) {
        const nPoints = scalars.byteLength / 32;
        const nPointsPerThread = Math.floor(nPoints / this.workers.length);
        const opPromises = [];
        for (let i = 0; i < this.workers.length; i++) {
            const th_nPoints =
                i < this.workers.length - 1 ?
                    nPointsPerThread :
                    nPoints - (nPointsPerThread * (this.workers.length - 1));
            const scalars_th = scalars.slice(i * nPointsPerThread * 32, i * nPointsPerThread * 32 + th_nPoints * 32);
            const points_th = points.slice(i * nPointsPerThread * 128, i * nPointsPerThread * 128 + th_nPoints * 128);
            opPromises.push(
                this.queueAction({
                    command: "G2_MULTIEXP",
                    scalars: scalars_th,
                    points: points_th,
                    n: th_nPoints
                }, [scalars_th, points_th])
            );
        }

        const results = await Promise.all(opPromises);

        this.instance.exports.g2_zero(this.pr0);
        for (let i = 0; i < results.length; i++) {
            this.putBin(this.pr1, results[i]);
            this.instance.exports.g2_add(this.pr0, this.pr1, this.pr0);
        }

        return this.getBin(this.pr0, 192);
    }

    g1_affine(p) {
        this.putBin(this.pr0, p);
        this.instance.exports.g1_affine(this.pr0, this.pr0);
        return this.getBin(this.pr0, 96);
    }

    g2_affine(p) {
        this.putBin(this.pr0, p);
        this.instance.exports.g2_affine(this.pr0, this.pr0);
        return this.getBin(this.pr0, 192);
    }

    g1_fromMontgomery(p) {
        this.putBin(this.pr0, p);
        this.instance.exports.g1_fromMontgomery(this.pr0, this.pr0);
        return this.getBin(this.pr0, 96);
    }

    g2_fromMontgomery(p) {
        this.putBin(this.pr0, p);
        this.instance.exports.g2_fromMontgomery(this.pr0, this.pr0);
        return this.getBin(this.pr0, 192);
    }

    loadPoint1(b) {
        const p = this.alloc(96);
        this.putBin(p, b);
        this.instance.exports.f1m_one(p + 64);
        return p;
    }

    loadPoint2(b) {
        const p = this.alloc(192);
        this.putBin(p, b);
        this.instance.exports.f2m_one(p + 128);
        return p;
    }

    terminate() {
        for (let i = 0; i < this.workers.length; i++) {
            this.workers[i].postMessage({ command: "TERMINATE" });
        }
    }


    async calcH(signals, polsA, polsB, nSignals, domainSize) {
        return this.queueAction({
            command: "CALC_H",
            signals: signals,
            polsA: polsA,
            polsB: polsB,
            nSignals: nSignals,
            domainSize: domainSize
        }, [signals, polsA, polsB]);
    }

    async proof(signals, pkey) {
        const pkey32 = new Uint32Array(pkey);
        const nSignals = pkey32[0];
        const nPublic = pkey32[1];
        const domainSize = pkey32[2];
        const pPolsA = pkey32[3];
        const pPolsB = pkey32[4];
        const pPointsA = pkey32[5];
        const pPointsB1 = pkey32[6];
        const pPointsB2 = pkey32[7];
        const pPointsC = pkey32[8];
        const pHExps = pkey32[9];
        const polsA = pkey.slice(pPolsA, pPolsA + pPolsB);
        const polsB = pkey.slice(pPolsB, pPolsB + pPointsA);
        const pointsA = pkey.slice(pPointsA, pPointsA + nSignals * 64);
        const pointsB1 = pkey.slice(pPointsB1, pPointsB1 + nSignals * 64);
        const pointsB2 = pkey.slice(pPointsB2, pPointsB2 + nSignals * 128);
        const pointsC = pkey.slice(pPointsC, pPointsC + (nSignals - nPublic - 1) * 64);
        const pointsHExps = pkey.slice(pHExps, pHExps + domainSize * 64);

        const alfa1 = pkey.slice(10 * 4, 10 * 4 + 64);
        const beta1 = pkey.slice(10 * 4 + 64, 10 * 4 + 128);
        const delta1 = pkey.slice(10 * 4 + 128, 10 * 4 + 192);
        const beta2 = pkey.slice(10 * 4 + 192, 10 * 4 + 320);
        const delta2 = pkey.slice(10 * 4 + 320, 10 * 4 + 448);


        const pH = this.calcH(signals.slice(0), polsA, polsB, nSignals, domainSize).then((h) => {
            /* Debug code to print the result of h
            for (let i=0; i<domainSize; i++) {
                const a = this.bin2int(h.slice(i*32, i*32+32));
                console.log(i + " -> " + a.toString());
            }
*/
            return this.g1_multiexp(h, pointsHExps);
        });

        const pA = this.g1_multiexp(signals.slice(0), pointsA);
        const pB1 = this.g1_multiexp(signals.slice(0), pointsB1);
        const pB2 = this.g2_multiexp(signals.slice(0), pointsB2);
        const pC = this.g1_multiexp(signals.slice((nPublic + 1) * 32), pointsC);

        const res = await Promise.all([pA, pB1, pB2, pC, pH]);

        const pi_a = this.alloc(96);
        const pi_b = this.alloc(192);
        const pi_c = this.alloc(96);
        const pib1 = this.alloc(96);


        this.putBin(pi_a, res[0]);
        this.putBin(pib1, res[1]);
        this.putBin(pi_b, res[2]);
        this.putBin(pi_c, res[3]);

        const pAlfa1 = this.loadPoint1(alfa1);
        const pBeta1 = this.loadPoint1(beta1);
        const pDelta1 = this.loadPoint1(delta1);
        const pBeta2 = this.loadPoint2(beta2);
        const pDelta2 = this.loadPoint2(delta2);


        let rnd = new Uint32Array(8);

        const aux1 = this.alloc(96);
        const aux2 = this.alloc(192);

        const pr = this.alloc(32);
        const ps = this.alloc(32);

        window.crypto.getRandomValues(rnd);
        this.putBin(pr, rnd);

        window.crypto.getRandomValues(rnd);
        this.putBin(ps, rnd);

        /// Uncoment it to debug and check it works
        //        this.instance.exports.f1m_zero(pr);
        //        this.instance.exports.f1m_zero(ps);

        // pi_a = pi_a + Alfa1 + r*Delta1
        this.instance.exports.g1_add(pAlfa1, pi_a, pi_a);
        this.instance.exports.g1_timesScalar(pDelta1, pr, 32, aux1);
        this.instance.exports.g1_add(aux1, pi_a, pi_a);

        // pi_b = pi_b + Beta2 + s*Delta2
        this.instance.exports.g2_add(pBeta2, pi_b, pi_b);
        this.instance.exports.g2_timesScalar(pDelta2, ps, 32, aux2);
        this.instance.exports.g2_add(aux2, pi_b, pi_b);

        // pib1 = pib1 + Beta1 + s*Delta1
        this.instance.exports.g1_add(pBeta1, pib1, pib1);
        this.instance.exports.g1_timesScalar(pDelta1, ps, 32, aux1);
        this.instance.exports.g1_add(aux1, pib1, pib1);


        // pi_c = pi_c + pH
        this.putBin(aux1, res[4]);
        this.instance.exports.g1_add(aux1, pi_c, pi_c);


        // pi_c = pi_c + s*pi_a
        this.instance.exports.g1_timesScalar(pi_a, ps, 32, aux1);
        this.instance.exports.g1_add(aux1, pi_c, pi_c);

        // pi_c = pi_c + r*pib1
        this.instance.exports.g1_timesScalar(pib1, pr, 32, aux1);
        this.instance.exports.g1_add(aux1, pi_c, pi_c);

        // pi_c = pi_c - r*s*delta1
        const prs = this.alloc(64);
        this.instance.exports.int_mul(pr, ps, prs);
        this.instance.exports.g1_timesScalar(pDelta1, prs, 64, aux1);
        this.instance.exports.g1_neg(aux1, aux1);
        this.instance.exports.g1_add(aux1, pi_c, pi_c);

        this.instance.exports.g1_affine(pi_a, pi_a);
        this.instance.exports.g2_affine(pi_b, pi_b);
        this.instance.exports.g1_affine(pi_c, pi_c);

        this.instance.exports.g1_fromMontgomery(pi_a, pi_a);
        this.instance.exports.g2_fromMontgomery(pi_b, pi_b);
        this.instance.exports.g1_fromMontgomery(pi_c, pi_c);

        return {
            pi_a: this.bin2g1(this.getBin(pi_a, 96)),
            pi_b: this.bin2g2(this.getBin(pi_b, 192)),
            pi_c: this.bin2g1(this.getBin(pi_c, 96)),
        };

    }

}

module.exports = build;

}).call(this)}).call(this,require('_process'))
},{"../build/groth16_wasm.js":15,"_process":9,"assert":1,"big-integer":10}],18:[function(require,module,exports){
/*
    Copyright 2019 0KIMS association.

    This file is part of websnark (Web Assembly zkSnark Prover).

    websnark is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    websnark is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with websnark. If not, see <https://www.gnu.org/licenses/>.
*/

const bigInt = require("big-integer");
const Circuit = require("snarkjs/src/circuit");
const bigInt2 = require("snarkjs/src/bigint");
const hexifyBigInts = require("../tools/stringifybigint").hexifyBigInts;
const unhexifyBigInts = require("../tools/stringifybigint").unhexifyBigInts;
const stringifyBigInts = require("../tools/stringifybigint").stringifyBigInts;
const unstringifyBigInts = require("../tools/stringifybigint").unstringifyBigInts;
const stringifyBigInts2 = require("snarkjs/src/stringifybigint").stringifyBigInts;
const unstringifyBigInts2 = require("snarkjs/src/stringifybigint").unstringifyBigInts;

function bigInt2BytesLE(_a, len) {
    const b = Array(len);
    let v = bigInt(_a);
    for (let i=0; i<len; i++) {
        b[i] = v.and(0xFF).toJSNumber();
        v = v.shiftRight(8);
    }
    return b;
}

function bigInt2U32LE(_a, len) {
    const b = Array(len);
    let v = bigInt(_a);
    for (let i=0; i<len; i++) {
        b[i] = v.and(0xFFFFFFFF).toJSNumber();
        v = v.shiftRight(32);
    }
    return b;
}

function convertWitness(witness) {
    const buffLen = witness.length * 32;
    const buff = new ArrayBuffer(buffLen);
    const h = {
        dataView: new DataView(buff),
        offset: 0
    };
    const mask = bigInt2(0xFFFFFFFF);
    for (let i = 0; i < witness.length; i++) {
        for (let j = 0; j < 8; j++) {
            const v = Number(witness[i].shr(j * 32).and(mask));
            h.dataView.setUint32(h.offset, v, true);
            h.offset += 4;
        }
    }
    return buff;
}

function toHex32(number) {
    let str = number.toString(16);
    while (str.length < 64) str = "0" + str;
    return str;
}

function toSolidityInput(proof) {
    const flatProof = unstringifyBigInts([
        proof.pi_a[0], proof.pi_a[1],
        proof.pi_b[0][1], proof.pi_b[0][0],
        proof.pi_b[1][1], proof.pi_b[1][0],
        proof.pi_c[0], proof.pi_c[1],
    ]);
    const result = {
        proof: "0x" + flatProof.map(x => toHex32(x)).join("")
    };
    if (proof.publicSignals) {
        result.publicSignals = hexifyBigInts(unstringifyBigInts(proof.publicSignals));
    }
    return result;
}

function  genWitness(input, circuitJson) {
    const circuit = new Circuit(unstringifyBigInts2(circuitJson));
    const witness = circuit.calculateWitness(unstringifyBigInts2(input));
    const publicSignals = witness.slice(1, circuit.nPubInputs + circuit.nOutputs + 1);
    return {witness, publicSignals};
}

async function genWitnessAndProve(groth16, input, circuitJson, provingKey) {
    const witnessData = genWitness(input, circuitJson);
    const witnessBin = convertWitness(witnessData.witness);
    const result = await groth16.proof(witnessBin, provingKey);
    result.publicSignals = stringifyBigInts2(witnessData.publicSignals);
    return result;
}

module.exports = {bigInt2BytesLE, bigInt2U32LE, toSolidityInput, genWitnessAndProve};
},{"../tools/stringifybigint":19,"big-integer":10,"snarkjs/src/bigint":11,"snarkjs/src/circuit":13,"snarkjs/src/stringifybigint":14}],19:[function(require,module,exports){
/*
    Copyright 2018 0kims association.

    This file is part of snarkjs.

    snarkjs is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    snarkjs is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    snarkjs. If not, see <https://www.gnu.org/licenses/>.
*/

const bigInt = require("big-integer");

module.exports.stringifyBigInts = stringifyBigInts;
module.exports.unstringifyBigInts = unstringifyBigInts;
module.exports.hexifyBigInts = hexifyBigInts;
module.exports.unhexifyBigInts = unhexifyBigInts;

function stringifyBigInts(o) {
    if ((typeof(o) == "bigint") || (o instanceof bigInt))  {
        return o.toString(10);
    } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
            res[k] = stringifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return bigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object" && !(o instanceof bigInt)) {
        const res = {};
        for (let k in o) {
            res[k] = unstringifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

function hexifyBigInts(o) {
    if (typeof (o) === "bigInt" || (o instanceof bigInt)) {
        let str = o.toString(16);
        while (str.length < 64) str = "0" + str;
        str = "0x" + str;
        return str;
    } else if (Array.isArray(o)) {
        return o.map(hexifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
            res[k] = hexifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

function unhexifyBigInts(o) {
    if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o)))  {
        return bigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unhexifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
            res[k] = unhexifyBigInts(o[k]);
        }
        return res;
    } else {
        return o;
    }
}

},{"big-integer":10}]},{},[16]);
