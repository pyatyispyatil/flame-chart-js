(function () {
  'use strict';

  var domain;

  // This constructor is used to store event handlers. Instantiating this is
  // faster than explicitly calling `Object.create(null)` to get a "clean" empty
  // object (tested with v8 v4.9).
  function EventHandlers() {}
  EventHandlers.prototype = Object.create(null);

  function EventEmitter() {
    EventEmitter.init.call(this);
  }

  // nodejs oddity
  // require('events') === require('events').EventEmitter
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.usingDomains = false;

  EventEmitter.prototype.domain = undefined;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  EventEmitter.defaultMaxListeners = 10;

  EventEmitter.init = function() {
    this.domain = null;
    if (EventEmitter.usingDomains) {
      // if there is an active domain, then attach to it.
      if (domain.active ) ;
    }

    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n))
      throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
  };

  function $getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
  };

  // These standalone emit* functions are used to optimize calling of event
  // handlers for fast cases because emit() itself often has a variable number of
  // arguments and can be deoptimized because of that. These functions always have
  // the same number of arguments and thus do not get deoptimized, so the code
  // inside them can execute faster.
  function emitNone(handler, isFn, self) {
    if (isFn)
      handler.call(self);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self);
    }
  }
  function emitOne(handler, isFn, self, arg1) {
    if (isFn)
      handler.call(self, arg1);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1);
    }
  }
  function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn)
      handler.call(self, arg1, arg2);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2);
    }
  }
  function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn)
      handler.call(self, arg1, arg2, arg3);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2, arg3);
    }
  }

  function emitMany(handler, isFn, self, args) {
    if (isFn)
      handler.apply(self, args);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].apply(self, args);
    }
  }

  EventEmitter.prototype.emit = function emit(type) {
    var er, handler, len, args, i, events, domain;
    var doError = (type === 'error');

    events = this._events;
    if (events)
      doError = (doError && events.error == null);
    else if (!doError)
      return false;

    domain = this.domain;

    // If there is no 'error' event listener then throw.
    if (doError) {
      er = arguments[1];
      if (domain) {
        if (!er)
          er = new Error('Uncaught, unspecified "error" event');
        er.domainEmitter = this;
        er.domain = domain;
        er.domainThrown = false;
        domain.emit('error', er);
      } else if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
      return false;
    }

    handler = events[type];

    if (!handler)
      return false;

    var isFn = typeof handler === 'function';
    len = arguments.length;
    switch (len) {
      // fast cases
      case 1:
        emitNone(handler, isFn, this);
        break;
      case 2:
        emitOne(handler, isFn, this, arguments[1]);
        break;
      case 3:
        emitTwo(handler, isFn, this, arguments[1], arguments[2]);
        break;
      case 4:
        emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
        break;
      // slower
      default:
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        emitMany(handler, isFn, this, args);
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');

    events = target._events;
    if (!events) {
      events = target._events = new EventHandlers();
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (!existing) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] = prepend ? [listener, existing] :
                                            [existing, listener];
      } else {
        // If we've already got an array, just append.
        if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
      }

      // Check for listener leak
      if (!existing.warned) {
        m = $getMaxListeners(target);
        if (m && m > 0 && existing.length > m) {
          existing.warned = true;
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + type + ' listeners added. ' +
                              'Use emitter.setMaxListeners() to increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          emitWarning(w);
        }
      }
    }

    return target;
  }
  function emitWarning(e) {
    typeof console.warn === 'function' ? console.warn(e) : console.log(e);
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');

        events = this._events;
        if (!events)
          return this;

        list = events[type];
        if (!list)
          return this;

        if (list === listener || (list.listener && list.listener === listener)) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length; i-- > 0;) {
            if (list[i] === listener ||
                (list[i].listener && list[i].listener === listener)) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (list.length === 1) {
            list[0] = undefined;
            if (--this._eventsCount === 0) {
              this._events = new EventHandlers();
              return this;
            } else {
              delete events[type];
            }
          } else {
            spliceOne(list, position);
          }

          if (events.removeListener)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events;

        events = this._events;
        if (!events)
          return this;

        // not listening for removeListener, no need to emit
        if (!events.removeListener) {
          if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          } else if (events[type]) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = new EventHandlers();
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          do {
            this.removeListener(type, listeners[listeners.length - 1]);
          } while (listeners[0]);
        }

        return this;
      };

  EventEmitter.prototype.listeners = function listeners(type) {
    var evlistener;
    var ret;
    var events = this._events;

    if (!events)
      ret = [];
    else {
      evlistener = events[type];
      if (!evlistener)
        ret = [];
      else if (typeof evlistener === 'function')
        ret = [evlistener.listener || evlistener];
      else
        ret = unwrapListeners(evlistener);
    }

    return ret;
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;

    if (events) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  };

  // About 1.5x faster than the two-arg version of Array#splice().
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
      list[i] = list[k];
    list.pop();
  }

  function arrayClone(arr, i) {
    var copy = new Array(i);
    while (i--)
      copy[i] = arr[i];
    return copy;
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  class UIPlugin extends EventEmitter {
      constructor(name) {
          super();
          this.name = name;
      }
      init(renderEngine, interactionsEngine) {
          this.renderEngine = renderEngine;
          this.interactionsEngine = interactionsEngine;
      }
  }

  const MIN_BLOCK_SIZE = 1;
  const STICK_DISTANCE = 0.25;
  const MIN_CLUSTER_SIZE = MIN_BLOCK_SIZE * 2 + STICK_DISTANCE;
  const walk = (treeList, cb, parent = null, level = 0) => {
      treeList.forEach((child) => {
          const res = cb(child, parent, level);
          if (child.children) {
              walk(child.children, cb, res || child, level + 1);
          }
      });
  };
  const flatTree = (treeList) => {
      const result = [];
      let index = 0;
      walk(treeList, (node, parent, level) => {
          const newNode = {
              source: node,
              end: node.start + node.duration,
              parent,
              level,
              index: index++,
          };
          result.push(newNode);
          return newNode;
      });
      return result.sort((a, b) => a.level - b.level || a.source.start - b.source.start);
  };
  const getFlatTreeMinMax = (flatTree) => {
      let isFirst = true;
      let min = 0;
      let max = 0;
      flatTree.forEach(({ source: { start }, end }) => {
          if (isFirst) {
              min = start;
              max = end;
              isFirst = false;
          }
          else {
              min = min < start ? min : start;
              max = max > end ? max : end;
          }
      });
      return { min, max };
  };
  const calcClusterDuration = (nodes) => {
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      return lastNode.source.start + lastNode.source.duration - firstNode.source.start;
  };
  const checkNodeTimeboundNesting = (node, start, end) => (node.source.start < end && node.end > start) || (node.source.start > start && node.end < end);
  const checkClusterTimeboundNesting = (node, start, end) => (node.start < end && node.end > start) || (node.start > start && node.end < end);
  const defaultClusterizeCondition = (prevNode, node) => prevNode.source.color === node.source.color && prevNode.source.type === node.source.type;
  function metaClusterizeFlatTree(flatTree, condition = defaultClusterizeCondition) {
      return flatTree
          .reduce((acc, node) => {
          const lastCluster = acc[acc.length - 1];
          const lastNode = lastCluster && lastCluster[lastCluster.length - 1];
          if (lastNode && lastNode.level === node.level && condition(lastNode, node)) {
              lastCluster.push(node);
          }
          else {
              acc.push([node]);
          }
          return acc;
      }, [])
          .filter((nodes) => nodes.length)
          .map((nodes) => ({
          nodes,
      }));
  }
  const clusterizeFlatTree = (metaClusterizedFlatTree, zoom, start = 0, end = 0, stickDistance = STICK_DISTANCE, minBlockSize = MIN_BLOCK_SIZE) => {
      let lastCluster = null;
      let lastNode = null;
      let index = 0;
      return metaClusterizedFlatTree
          .reduce((acc, { nodes }) => {
          lastCluster = null;
          lastNode = null;
          index = 0;
          for (const node of nodes) {
              if (checkNodeTimeboundNesting(node, start, end)) {
                  if (lastCluster && !lastNode) {
                      lastCluster[index] = node;
                      index++;
                  }
                  else if (lastCluster &&
                      lastNode &&
                      (node.source.start - (lastNode.source.start + lastNode.source.duration)) * zoom <
                          stickDistance &&
                      node.source.duration * zoom < minBlockSize &&
                      lastNode.source.duration * zoom < minBlockSize) {
                      lastCluster[index] = node;
                      index++;
                  }
                  else {
                      lastCluster = [node];
                      index = 1;
                      acc.push(lastCluster);
                  }
                  lastNode = node;
              }
          }
          return acc;
      }, [])
          .map((nodes) => {
          const node = nodes[0];
          const duration = calcClusterDuration(nodes);
          return {
              start: node.source.start,
              end: node.source.start + duration,
              duration,
              type: node.source.type,
              color: node.source.color,
              level: node.level,
              nodes,
          };
      });
  };
  const reclusterizeClusteredFlatTree = (clusteredFlatTree, zoom, start, end, stickDistance, minBlockSize) => {
      return clusteredFlatTree.reduce((acc, cluster) => {
          if (checkClusterTimeboundNesting(cluster, start, end)) {
              if (cluster.duration * zoom <= MIN_CLUSTER_SIZE) {
                  acc.push(cluster);
              }
              else {
                  acc.push(...clusterizeFlatTree([cluster], zoom, start, end, stickDistance, minBlockSize));
              }
          }
          return acc;
      }, []);
  };

  var colorStringExports = {};
  var colorString$1 = {
    get exports(){ return colorStringExports; },
    set exports(v){ colorStringExports = v; },
  };

  var colorName = {
  	"aliceblue": [240, 248, 255],
  	"antiquewhite": [250, 235, 215],
  	"aqua": [0, 255, 255],
  	"aquamarine": [127, 255, 212],
  	"azure": [240, 255, 255],
  	"beige": [245, 245, 220],
  	"bisque": [255, 228, 196],
  	"black": [0, 0, 0],
  	"blanchedalmond": [255, 235, 205],
  	"blue": [0, 0, 255],
  	"blueviolet": [138, 43, 226],
  	"brown": [165, 42, 42],
  	"burlywood": [222, 184, 135],
  	"cadetblue": [95, 158, 160],
  	"chartreuse": [127, 255, 0],
  	"chocolate": [210, 105, 30],
  	"coral": [255, 127, 80],
  	"cornflowerblue": [100, 149, 237],
  	"cornsilk": [255, 248, 220],
  	"crimson": [220, 20, 60],
  	"cyan": [0, 255, 255],
  	"darkblue": [0, 0, 139],
  	"darkcyan": [0, 139, 139],
  	"darkgoldenrod": [184, 134, 11],
  	"darkgray": [169, 169, 169],
  	"darkgreen": [0, 100, 0],
  	"darkgrey": [169, 169, 169],
  	"darkkhaki": [189, 183, 107],
  	"darkmagenta": [139, 0, 139],
  	"darkolivegreen": [85, 107, 47],
  	"darkorange": [255, 140, 0],
  	"darkorchid": [153, 50, 204],
  	"darkred": [139, 0, 0],
  	"darksalmon": [233, 150, 122],
  	"darkseagreen": [143, 188, 143],
  	"darkslateblue": [72, 61, 139],
  	"darkslategray": [47, 79, 79],
  	"darkslategrey": [47, 79, 79],
  	"darkturquoise": [0, 206, 209],
  	"darkviolet": [148, 0, 211],
  	"deeppink": [255, 20, 147],
  	"deepskyblue": [0, 191, 255],
  	"dimgray": [105, 105, 105],
  	"dimgrey": [105, 105, 105],
  	"dodgerblue": [30, 144, 255],
  	"firebrick": [178, 34, 34],
  	"floralwhite": [255, 250, 240],
  	"forestgreen": [34, 139, 34],
  	"fuchsia": [255, 0, 255],
  	"gainsboro": [220, 220, 220],
  	"ghostwhite": [248, 248, 255],
  	"gold": [255, 215, 0],
  	"goldenrod": [218, 165, 32],
  	"gray": [128, 128, 128],
  	"green": [0, 128, 0],
  	"greenyellow": [173, 255, 47],
  	"grey": [128, 128, 128],
  	"honeydew": [240, 255, 240],
  	"hotpink": [255, 105, 180],
  	"indianred": [205, 92, 92],
  	"indigo": [75, 0, 130],
  	"ivory": [255, 255, 240],
  	"khaki": [240, 230, 140],
  	"lavender": [230, 230, 250],
  	"lavenderblush": [255, 240, 245],
  	"lawngreen": [124, 252, 0],
  	"lemonchiffon": [255, 250, 205],
  	"lightblue": [173, 216, 230],
  	"lightcoral": [240, 128, 128],
  	"lightcyan": [224, 255, 255],
  	"lightgoldenrodyellow": [250, 250, 210],
  	"lightgray": [211, 211, 211],
  	"lightgreen": [144, 238, 144],
  	"lightgrey": [211, 211, 211],
  	"lightpink": [255, 182, 193],
  	"lightsalmon": [255, 160, 122],
  	"lightseagreen": [32, 178, 170],
  	"lightskyblue": [135, 206, 250],
  	"lightslategray": [119, 136, 153],
  	"lightslategrey": [119, 136, 153],
  	"lightsteelblue": [176, 196, 222],
  	"lightyellow": [255, 255, 224],
  	"lime": [0, 255, 0],
  	"limegreen": [50, 205, 50],
  	"linen": [250, 240, 230],
  	"magenta": [255, 0, 255],
  	"maroon": [128, 0, 0],
  	"mediumaquamarine": [102, 205, 170],
  	"mediumblue": [0, 0, 205],
  	"mediumorchid": [186, 85, 211],
  	"mediumpurple": [147, 112, 219],
  	"mediumseagreen": [60, 179, 113],
  	"mediumslateblue": [123, 104, 238],
  	"mediumspringgreen": [0, 250, 154],
  	"mediumturquoise": [72, 209, 204],
  	"mediumvioletred": [199, 21, 133],
  	"midnightblue": [25, 25, 112],
  	"mintcream": [245, 255, 250],
  	"mistyrose": [255, 228, 225],
  	"moccasin": [255, 228, 181],
  	"navajowhite": [255, 222, 173],
  	"navy": [0, 0, 128],
  	"oldlace": [253, 245, 230],
  	"olive": [128, 128, 0],
  	"olivedrab": [107, 142, 35],
  	"orange": [255, 165, 0],
  	"orangered": [255, 69, 0],
  	"orchid": [218, 112, 214],
  	"palegoldenrod": [238, 232, 170],
  	"palegreen": [152, 251, 152],
  	"paleturquoise": [175, 238, 238],
  	"palevioletred": [219, 112, 147],
  	"papayawhip": [255, 239, 213],
  	"peachpuff": [255, 218, 185],
  	"peru": [205, 133, 63],
  	"pink": [255, 192, 203],
  	"plum": [221, 160, 221],
  	"powderblue": [176, 224, 230],
  	"purple": [128, 0, 128],
  	"rebeccapurple": [102, 51, 153],
  	"red": [255, 0, 0],
  	"rosybrown": [188, 143, 143],
  	"royalblue": [65, 105, 225],
  	"saddlebrown": [139, 69, 19],
  	"salmon": [250, 128, 114],
  	"sandybrown": [244, 164, 96],
  	"seagreen": [46, 139, 87],
  	"seashell": [255, 245, 238],
  	"sienna": [160, 82, 45],
  	"silver": [192, 192, 192],
  	"skyblue": [135, 206, 235],
  	"slateblue": [106, 90, 205],
  	"slategray": [112, 128, 144],
  	"slategrey": [112, 128, 144],
  	"snow": [255, 250, 250],
  	"springgreen": [0, 255, 127],
  	"steelblue": [70, 130, 180],
  	"tan": [210, 180, 140],
  	"teal": [0, 128, 128],
  	"thistle": [216, 191, 216],
  	"tomato": [255, 99, 71],
  	"turquoise": [64, 224, 208],
  	"violet": [238, 130, 238],
  	"wheat": [245, 222, 179],
  	"white": [255, 255, 255],
  	"whitesmoke": [245, 245, 245],
  	"yellow": [255, 255, 0],
  	"yellowgreen": [154, 205, 50]
  };

  var simpleSwizzleExports = {};
  var simpleSwizzle = {
    get exports(){ return simpleSwizzleExports; },
    set exports(v){ simpleSwizzleExports = v; },
  };

  var isArrayish$1 = function isArrayish(obj) {
  	if (!obj || typeof obj === 'string') {
  		return false;
  	}

  	return obj instanceof Array || Array.isArray(obj) ||
  		(obj.length >= 0 && (obj.splice instanceof Function ||
  			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
  };

  var isArrayish = isArrayish$1;

  var concat = Array.prototype.concat;
  var slice = Array.prototype.slice;

  var swizzle$1 = simpleSwizzle.exports = function swizzle(args) {
  	var results = [];

  	for (var i = 0, len = args.length; i < len; i++) {
  		var arg = args[i];

  		if (isArrayish(arg)) {
  			// http://jsperf.com/javascript-array-concat-vs-push/98
  			results = concat.call(results, slice.call(arg));
  		} else {
  			results.push(arg);
  		}
  	}

  	return results;
  };

  swizzle$1.wrap = function (fn) {
  	return function () {
  		return fn(swizzle$1(arguments));
  	};
  };

  /* MIT license */

  var colorNames = colorName;
  var swizzle = simpleSwizzleExports;
  var hasOwnProperty = Object.hasOwnProperty;

  var reverseNames = Object.create(null);

  // create a list of reverse color names
  for (var name in colorNames) {
  	if (hasOwnProperty.call(colorNames, name)) {
  		reverseNames[colorNames[name]] = name;
  	}
  }

  var cs = colorString$1.exports = {
  	to: {},
  	get: {}
  };

  cs.get = function (string) {
  	var prefix = string.substring(0, 3).toLowerCase();
  	var val;
  	var model;
  	switch (prefix) {
  		case 'hsl':
  			val = cs.get.hsl(string);
  			model = 'hsl';
  			break;
  		case 'hwb':
  			val = cs.get.hwb(string);
  			model = 'hwb';
  			break;
  		default:
  			val = cs.get.rgb(string);
  			model = 'rgb';
  			break;
  	}

  	if (!val) {
  		return null;
  	}

  	return {model: model, value: val};
  };

  cs.get.rgb = function (string) {
  	if (!string) {
  		return null;
  	}

  	var abbr = /^#([a-f0-9]{3,4})$/i;
  	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
  	var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
  	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
  	var keyword = /^(\w+)$/;

  	var rgb = [0, 0, 0, 1];
  	var match;
  	var i;
  	var hexAlpha;

  	if (match = string.match(hex)) {
  		hexAlpha = match[2];
  		match = match[1];

  		for (i = 0; i < 3; i++) {
  			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
  			var i2 = i * 2;
  			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
  		}

  		if (hexAlpha) {
  			rgb[3] = parseInt(hexAlpha, 16) / 255;
  		}
  	} else if (match = string.match(abbr)) {
  		match = match[1];
  		hexAlpha = match[3];

  		for (i = 0; i < 3; i++) {
  			rgb[i] = parseInt(match[i] + match[i], 16);
  		}

  		if (hexAlpha) {
  			rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
  		}
  	} else if (match = string.match(rgba)) {
  		for (i = 0; i < 3; i++) {
  			rgb[i] = parseInt(match[i + 1], 0);
  		}

  		if (match[4]) {
  			if (match[5]) {
  				rgb[3] = parseFloat(match[4]) * 0.01;
  			} else {
  				rgb[3] = parseFloat(match[4]);
  			}
  		}
  	} else if (match = string.match(per)) {
  		for (i = 0; i < 3; i++) {
  			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
  		}

  		if (match[4]) {
  			if (match[5]) {
  				rgb[3] = parseFloat(match[4]) * 0.01;
  			} else {
  				rgb[3] = parseFloat(match[4]);
  			}
  		}
  	} else if (match = string.match(keyword)) {
  		if (match[1] === 'transparent') {
  			return [0, 0, 0, 0];
  		}

  		if (!hasOwnProperty.call(colorNames, match[1])) {
  			return null;
  		}

  		rgb = colorNames[match[1]];
  		rgb[3] = 1;

  		return rgb;
  	} else {
  		return null;
  	}

  	for (i = 0; i < 3; i++) {
  		rgb[i] = clamp(rgb[i], 0, 255);
  	}
  	rgb[3] = clamp(rgb[3], 0, 1);

  	return rgb;
  };

  cs.get.hsl = function (string) {
  	if (!string) {
  		return null;
  	}

  	var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
  	var match = string.match(hsl);

  	if (match) {
  		var alpha = parseFloat(match[4]);
  		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
  		var s = clamp(parseFloat(match[2]), 0, 100);
  		var l = clamp(parseFloat(match[3]), 0, 100);
  		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

  		return [h, s, l, a];
  	}

  	return null;
  };

  cs.get.hwb = function (string) {
  	if (!string) {
  		return null;
  	}

  	var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
  	var match = string.match(hwb);

  	if (match) {
  		var alpha = parseFloat(match[4]);
  		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
  		var w = clamp(parseFloat(match[2]), 0, 100);
  		var b = clamp(parseFloat(match[3]), 0, 100);
  		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
  		return [h, w, b, a];
  	}

  	return null;
  };

  cs.to.hex = function () {
  	var rgba = swizzle(arguments);

  	return (
  		'#' +
  		hexDouble(rgba[0]) +
  		hexDouble(rgba[1]) +
  		hexDouble(rgba[2]) +
  		(rgba[3] < 1
  			? (hexDouble(Math.round(rgba[3] * 255)))
  			: '')
  	);
  };

  cs.to.rgb = function () {
  	var rgba = swizzle(arguments);

  	return rgba.length < 4 || rgba[3] === 1
  		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
  		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
  };

  cs.to.rgb.percent = function () {
  	var rgba = swizzle(arguments);

  	var r = Math.round(rgba[0] / 255 * 100);
  	var g = Math.round(rgba[1] / 255 * 100);
  	var b = Math.round(rgba[2] / 255 * 100);

  	return rgba.length < 4 || rgba[3] === 1
  		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
  		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
  };

  cs.to.hsl = function () {
  	var hsla = swizzle(arguments);
  	return hsla.length < 4 || hsla[3] === 1
  		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
  		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
  };

  // hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
  // (hwb have alpha optional & 1 is default value)
  cs.to.hwb = function () {
  	var hwba = swizzle(arguments);

  	var a = '';
  	if (hwba.length >= 4 && hwba[3] !== 1) {
  		a = ', ' + hwba[3];
  	}

  	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
  };

  cs.to.keyword = function (rgb) {
  	return reverseNames[rgb.slice(0, 3)];
  };

  // helpers
  function clamp(num, min, max) {
  	return Math.min(Math.max(min, num), max);
  }

  function hexDouble(num) {
  	var str = Math.round(num).toString(16).toUpperCase();
  	return (str.length < 2) ? '0' + str : str;
  }

  var conversionsExports = {};
  var conversions$2 = {
    get exports(){ return conversionsExports; },
    set exports(v){ conversionsExports = v; },
  };

  /* MIT license */

  var cssKeywords = colorName;

  // NOTE: conversions should only return primitive values (i.e. arrays, or
  //       values that give correct `typeof` results).
  //       do not use box values types (i.e. Number(), String(), etc.)

  var reverseKeywords = {};
  for (var key in cssKeywords) {
  	if (cssKeywords.hasOwnProperty(key)) {
  		reverseKeywords[cssKeywords[key]] = key;
  	}
  }

  var convert$2 = conversions$2.exports = {
  	rgb: {channels: 3, labels: 'rgb'},
  	hsl: {channels: 3, labels: 'hsl'},
  	hsv: {channels: 3, labels: 'hsv'},
  	hwb: {channels: 3, labels: 'hwb'},
  	cmyk: {channels: 4, labels: 'cmyk'},
  	xyz: {channels: 3, labels: 'xyz'},
  	lab: {channels: 3, labels: 'lab'},
  	lch: {channels: 3, labels: 'lch'},
  	hex: {channels: 1, labels: ['hex']},
  	keyword: {channels: 1, labels: ['keyword']},
  	ansi16: {channels: 1, labels: ['ansi16']},
  	ansi256: {channels: 1, labels: ['ansi256']},
  	hcg: {channels: 3, labels: ['h', 'c', 'g']},
  	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
  	gray: {channels: 1, labels: ['gray']}
  };

  // hide .channels and .labels properties
  for (var model in convert$2) {
  	if (convert$2.hasOwnProperty(model)) {
  		if (!('channels' in convert$2[model])) {
  			throw new Error('missing channels property: ' + model);
  		}

  		if (!('labels' in convert$2[model])) {
  			throw new Error('missing channel labels property: ' + model);
  		}

  		if (convert$2[model].labels.length !== convert$2[model].channels) {
  			throw new Error('channel and label counts mismatch: ' + model);
  		}

  		var channels = convert$2[model].channels;
  		var labels = convert$2[model].labels;
  		delete convert$2[model].channels;
  		delete convert$2[model].labels;
  		Object.defineProperty(convert$2[model], 'channels', {value: channels});
  		Object.defineProperty(convert$2[model], 'labels', {value: labels});
  	}
  }

  convert$2.rgb.hsl = function (rgb) {
  	var r = rgb[0] / 255;
  	var g = rgb[1] / 255;
  	var b = rgb[2] / 255;
  	var min = Math.min(r, g, b);
  	var max = Math.max(r, g, b);
  	var delta = max - min;
  	var h;
  	var s;
  	var l;

  	if (max === min) {
  		h = 0;
  	} else if (r === max) {
  		h = (g - b) / delta;
  	} else if (g === max) {
  		h = 2 + (b - r) / delta;
  	} else if (b === max) {
  		h = 4 + (r - g) / delta;
  	}

  	h = Math.min(h * 60, 360);

  	if (h < 0) {
  		h += 360;
  	}

  	l = (min + max) / 2;

  	if (max === min) {
  		s = 0;
  	} else if (l <= 0.5) {
  		s = delta / (max + min);
  	} else {
  		s = delta / (2 - max - min);
  	}

  	return [h, s * 100, l * 100];
  };

  convert$2.rgb.hsv = function (rgb) {
  	var rdif;
  	var gdif;
  	var bdif;
  	var h;
  	var s;

  	var r = rgb[0] / 255;
  	var g = rgb[1] / 255;
  	var b = rgb[2] / 255;
  	var v = Math.max(r, g, b);
  	var diff = v - Math.min(r, g, b);
  	var diffc = function (c) {
  		return (v - c) / 6 / diff + 1 / 2;
  	};

  	if (diff === 0) {
  		h = s = 0;
  	} else {
  		s = diff / v;
  		rdif = diffc(r);
  		gdif = diffc(g);
  		bdif = diffc(b);

  		if (r === v) {
  			h = bdif - gdif;
  		} else if (g === v) {
  			h = (1 / 3) + rdif - bdif;
  		} else if (b === v) {
  			h = (2 / 3) + gdif - rdif;
  		}
  		if (h < 0) {
  			h += 1;
  		} else if (h > 1) {
  			h -= 1;
  		}
  	}

  	return [
  		h * 360,
  		s * 100,
  		v * 100
  	];
  };

  convert$2.rgb.hwb = function (rgb) {
  	var r = rgb[0];
  	var g = rgb[1];
  	var b = rgb[2];
  	var h = convert$2.rgb.hsl(rgb)[0];
  	var w = 1 / 255 * Math.min(r, Math.min(g, b));

  	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

  	return [h, w * 100, b * 100];
  };

  convert$2.rgb.cmyk = function (rgb) {
  	var r = rgb[0] / 255;
  	var g = rgb[1] / 255;
  	var b = rgb[2] / 255;
  	var c;
  	var m;
  	var y;
  	var k;

  	k = Math.min(1 - r, 1 - g, 1 - b);
  	c = (1 - r - k) / (1 - k) || 0;
  	m = (1 - g - k) / (1 - k) || 0;
  	y = (1 - b - k) / (1 - k) || 0;

  	return [c * 100, m * 100, y * 100, k * 100];
  };

  /**
   * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
   * */
  function comparativeDistance(x, y) {
  	return (
  		Math.pow(x[0] - y[0], 2) +
  		Math.pow(x[1] - y[1], 2) +
  		Math.pow(x[2] - y[2], 2)
  	);
  }

  convert$2.rgb.keyword = function (rgb) {
  	var reversed = reverseKeywords[rgb];
  	if (reversed) {
  		return reversed;
  	}

  	var currentClosestDistance = Infinity;
  	var currentClosestKeyword;

  	for (var keyword in cssKeywords) {
  		if (cssKeywords.hasOwnProperty(keyword)) {
  			var value = cssKeywords[keyword];

  			// Compute comparative distance
  			var distance = comparativeDistance(rgb, value);

  			// Check if its less, if so set as closest
  			if (distance < currentClosestDistance) {
  				currentClosestDistance = distance;
  				currentClosestKeyword = keyword;
  			}
  		}
  	}

  	return currentClosestKeyword;
  };

  convert$2.keyword.rgb = function (keyword) {
  	return cssKeywords[keyword];
  };

  convert$2.rgb.xyz = function (rgb) {
  	var r = rgb[0] / 255;
  	var g = rgb[1] / 255;
  	var b = rgb[2] / 255;

  	// assume sRGB
  	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  	return [x * 100, y * 100, z * 100];
  };

  convert$2.rgb.lab = function (rgb) {
  	var xyz = convert$2.rgb.xyz(rgb);
  	var x = xyz[0];
  	var y = xyz[1];
  	var z = xyz[2];
  	var l;
  	var a;
  	var b;

  	x /= 95.047;
  	y /= 100;
  	z /= 108.883;

  	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

  	l = (116 * y) - 16;
  	a = 500 * (x - y);
  	b = 200 * (y - z);

  	return [l, a, b];
  };

  convert$2.hsl.rgb = function (hsl) {
  	var h = hsl[0] / 360;
  	var s = hsl[1] / 100;
  	var l = hsl[2] / 100;
  	var t1;
  	var t2;
  	var t3;
  	var rgb;
  	var val;

  	if (s === 0) {
  		val = l * 255;
  		return [val, val, val];
  	}

  	if (l < 0.5) {
  		t2 = l * (1 + s);
  	} else {
  		t2 = l + s - l * s;
  	}

  	t1 = 2 * l - t2;

  	rgb = [0, 0, 0];
  	for (var i = 0; i < 3; i++) {
  		t3 = h + 1 / 3 * -(i - 1);
  		if (t3 < 0) {
  			t3++;
  		}
  		if (t3 > 1) {
  			t3--;
  		}

  		if (6 * t3 < 1) {
  			val = t1 + (t2 - t1) * 6 * t3;
  		} else if (2 * t3 < 1) {
  			val = t2;
  		} else if (3 * t3 < 2) {
  			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
  		} else {
  			val = t1;
  		}

  		rgb[i] = val * 255;
  	}

  	return rgb;
  };

  convert$2.hsl.hsv = function (hsl) {
  	var h = hsl[0];
  	var s = hsl[1] / 100;
  	var l = hsl[2] / 100;
  	var smin = s;
  	var lmin = Math.max(l, 0.01);
  	var sv;
  	var v;

  	l *= 2;
  	s *= (l <= 1) ? l : 2 - l;
  	smin *= lmin <= 1 ? lmin : 2 - lmin;
  	v = (l + s) / 2;
  	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

  	return [h, sv * 100, v * 100];
  };

  convert$2.hsv.rgb = function (hsv) {
  	var h = hsv[0] / 60;
  	var s = hsv[1] / 100;
  	var v = hsv[2] / 100;
  	var hi = Math.floor(h) % 6;

  	var f = h - Math.floor(h);
  	var p = 255 * v * (1 - s);
  	var q = 255 * v * (1 - (s * f));
  	var t = 255 * v * (1 - (s * (1 - f)));
  	v *= 255;

  	switch (hi) {
  		case 0:
  			return [v, t, p];
  		case 1:
  			return [q, v, p];
  		case 2:
  			return [p, v, t];
  		case 3:
  			return [p, q, v];
  		case 4:
  			return [t, p, v];
  		case 5:
  			return [v, p, q];
  	}
  };

  convert$2.hsv.hsl = function (hsv) {
  	var h = hsv[0];
  	var s = hsv[1] / 100;
  	var v = hsv[2] / 100;
  	var vmin = Math.max(v, 0.01);
  	var lmin;
  	var sl;
  	var l;

  	l = (2 - s) * v;
  	lmin = (2 - s) * vmin;
  	sl = s * vmin;
  	sl /= (lmin <= 1) ? lmin : 2 - lmin;
  	sl = sl || 0;
  	l /= 2;

  	return [h, sl * 100, l * 100];
  };

  // http://dev.w3.org/csswg/css-color/#hwb-to-rgb
  convert$2.hwb.rgb = function (hwb) {
  	var h = hwb[0] / 360;
  	var wh = hwb[1] / 100;
  	var bl = hwb[2] / 100;
  	var ratio = wh + bl;
  	var i;
  	var v;
  	var f;
  	var n;

  	// wh + bl cant be > 1
  	if (ratio > 1) {
  		wh /= ratio;
  		bl /= ratio;
  	}

  	i = Math.floor(6 * h);
  	v = 1 - bl;
  	f = 6 * h - i;

  	if ((i & 0x01) !== 0) {
  		f = 1 - f;
  	}

  	n = wh + f * (v - wh); // linear interpolation

  	var r;
  	var g;
  	var b;
  	switch (i) {
  		default:
  		case 6:
  		case 0: r = v; g = n; b = wh; break;
  		case 1: r = n; g = v; b = wh; break;
  		case 2: r = wh; g = v; b = n; break;
  		case 3: r = wh; g = n; b = v; break;
  		case 4: r = n; g = wh; b = v; break;
  		case 5: r = v; g = wh; b = n; break;
  	}

  	return [r * 255, g * 255, b * 255];
  };

  convert$2.cmyk.rgb = function (cmyk) {
  	var c = cmyk[0] / 100;
  	var m = cmyk[1] / 100;
  	var y = cmyk[2] / 100;
  	var k = cmyk[3] / 100;
  	var r;
  	var g;
  	var b;

  	r = 1 - Math.min(1, c * (1 - k) + k);
  	g = 1 - Math.min(1, m * (1 - k) + k);
  	b = 1 - Math.min(1, y * (1 - k) + k);

  	return [r * 255, g * 255, b * 255];
  };

  convert$2.xyz.rgb = function (xyz) {
  	var x = xyz[0] / 100;
  	var y = xyz[1] / 100;
  	var z = xyz[2] / 100;
  	var r;
  	var g;
  	var b;

  	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
  	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
  	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

  	// assume sRGB
  	r = r > 0.0031308
  		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
  		: r * 12.92;

  	g = g > 0.0031308
  		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
  		: g * 12.92;

  	b = b > 0.0031308
  		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
  		: b * 12.92;

  	r = Math.min(Math.max(0, r), 1);
  	g = Math.min(Math.max(0, g), 1);
  	b = Math.min(Math.max(0, b), 1);

  	return [r * 255, g * 255, b * 255];
  };

  convert$2.xyz.lab = function (xyz) {
  	var x = xyz[0];
  	var y = xyz[1];
  	var z = xyz[2];
  	var l;
  	var a;
  	var b;

  	x /= 95.047;
  	y /= 100;
  	z /= 108.883;

  	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

  	l = (116 * y) - 16;
  	a = 500 * (x - y);
  	b = 200 * (y - z);

  	return [l, a, b];
  };

  convert$2.lab.xyz = function (lab) {
  	var l = lab[0];
  	var a = lab[1];
  	var b = lab[2];
  	var x;
  	var y;
  	var z;

  	y = (l + 16) / 116;
  	x = a / 500 + y;
  	z = y - b / 200;

  	var y2 = Math.pow(y, 3);
  	var x2 = Math.pow(x, 3);
  	var z2 = Math.pow(z, 3);
  	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
  	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
  	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

  	x *= 95.047;
  	y *= 100;
  	z *= 108.883;

  	return [x, y, z];
  };

  convert$2.lab.lch = function (lab) {
  	var l = lab[0];
  	var a = lab[1];
  	var b = lab[2];
  	var hr;
  	var h;
  	var c;

  	hr = Math.atan2(b, a);
  	h = hr * 360 / 2 / Math.PI;

  	if (h < 0) {
  		h += 360;
  	}

  	c = Math.sqrt(a * a + b * b);

  	return [l, c, h];
  };

  convert$2.lch.lab = function (lch) {
  	var l = lch[0];
  	var c = lch[1];
  	var h = lch[2];
  	var a;
  	var b;
  	var hr;

  	hr = h / 360 * 2 * Math.PI;
  	a = c * Math.cos(hr);
  	b = c * Math.sin(hr);

  	return [l, a, b];
  };

  convert$2.rgb.ansi16 = function (args) {
  	var r = args[0];
  	var g = args[1];
  	var b = args[2];
  	var value = 1 in arguments ? arguments[1] : convert$2.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

  	value = Math.round(value / 50);

  	if (value === 0) {
  		return 30;
  	}

  	var ansi = 30
  		+ ((Math.round(b / 255) << 2)
  		| (Math.round(g / 255) << 1)
  		| Math.round(r / 255));

  	if (value === 2) {
  		ansi += 60;
  	}

  	return ansi;
  };

  convert$2.hsv.ansi16 = function (args) {
  	// optimization here; we already know the value and don't need to get
  	// it converted for us.
  	return convert$2.rgb.ansi16(convert$2.hsv.rgb(args), args[2]);
  };

  convert$2.rgb.ansi256 = function (args) {
  	var r = args[0];
  	var g = args[1];
  	var b = args[2];

  	// we use the extended greyscale palette here, with the exception of
  	// black and white. normal palette only has 4 greyscale shades.
  	if (r === g && g === b) {
  		if (r < 8) {
  			return 16;
  		}

  		if (r > 248) {
  			return 231;
  		}

  		return Math.round(((r - 8) / 247) * 24) + 232;
  	}

  	var ansi = 16
  		+ (36 * Math.round(r / 255 * 5))
  		+ (6 * Math.round(g / 255 * 5))
  		+ Math.round(b / 255 * 5);

  	return ansi;
  };

  convert$2.ansi16.rgb = function (args) {
  	var color = args % 10;

  	// handle greyscale
  	if (color === 0 || color === 7) {
  		if (args > 50) {
  			color += 3.5;
  		}

  		color = color / 10.5 * 255;

  		return [color, color, color];
  	}

  	var mult = (~~(args > 50) + 1) * 0.5;
  	var r = ((color & 1) * mult) * 255;
  	var g = (((color >> 1) & 1) * mult) * 255;
  	var b = (((color >> 2) & 1) * mult) * 255;

  	return [r, g, b];
  };

  convert$2.ansi256.rgb = function (args) {
  	// handle greyscale
  	if (args >= 232) {
  		var c = (args - 232) * 10 + 8;
  		return [c, c, c];
  	}

  	args -= 16;

  	var rem;
  	var r = Math.floor(args / 36) / 5 * 255;
  	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
  	var b = (rem % 6) / 5 * 255;

  	return [r, g, b];
  };

  convert$2.rgb.hex = function (args) {
  	var integer = ((Math.round(args[0]) & 0xFF) << 16)
  		+ ((Math.round(args[1]) & 0xFF) << 8)
  		+ (Math.round(args[2]) & 0xFF);

  	var string = integer.toString(16).toUpperCase();
  	return '000000'.substring(string.length) + string;
  };

  convert$2.hex.rgb = function (args) {
  	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
  	if (!match) {
  		return [0, 0, 0];
  	}

  	var colorString = match[0];

  	if (match[0].length === 3) {
  		colorString = colorString.split('').map(function (char) {
  			return char + char;
  		}).join('');
  	}

  	var integer = parseInt(colorString, 16);
  	var r = (integer >> 16) & 0xFF;
  	var g = (integer >> 8) & 0xFF;
  	var b = integer & 0xFF;

  	return [r, g, b];
  };

  convert$2.rgb.hcg = function (rgb) {
  	var r = rgb[0] / 255;
  	var g = rgb[1] / 255;
  	var b = rgb[2] / 255;
  	var max = Math.max(Math.max(r, g), b);
  	var min = Math.min(Math.min(r, g), b);
  	var chroma = (max - min);
  	var grayscale;
  	var hue;

  	if (chroma < 1) {
  		grayscale = min / (1 - chroma);
  	} else {
  		grayscale = 0;
  	}

  	if (chroma <= 0) {
  		hue = 0;
  	} else
  	if (max === r) {
  		hue = ((g - b) / chroma) % 6;
  	} else
  	if (max === g) {
  		hue = 2 + (b - r) / chroma;
  	} else {
  		hue = 4 + (r - g) / chroma + 4;
  	}

  	hue /= 6;
  	hue %= 1;

  	return [hue * 360, chroma * 100, grayscale * 100];
  };

  convert$2.hsl.hcg = function (hsl) {
  	var s = hsl[1] / 100;
  	var l = hsl[2] / 100;
  	var c = 1;
  	var f = 0;

  	if (l < 0.5) {
  		c = 2.0 * s * l;
  	} else {
  		c = 2.0 * s * (1.0 - l);
  	}

  	if (c < 1.0) {
  		f = (l - 0.5 * c) / (1.0 - c);
  	}

  	return [hsl[0], c * 100, f * 100];
  };

  convert$2.hsv.hcg = function (hsv) {
  	var s = hsv[1] / 100;
  	var v = hsv[2] / 100;

  	var c = s * v;
  	var f = 0;

  	if (c < 1.0) {
  		f = (v - c) / (1 - c);
  	}

  	return [hsv[0], c * 100, f * 100];
  };

  convert$2.hcg.rgb = function (hcg) {
  	var h = hcg[0] / 360;
  	var c = hcg[1] / 100;
  	var g = hcg[2] / 100;

  	if (c === 0.0) {
  		return [g * 255, g * 255, g * 255];
  	}

  	var pure = [0, 0, 0];
  	var hi = (h % 1) * 6;
  	var v = hi % 1;
  	var w = 1 - v;
  	var mg = 0;

  	switch (Math.floor(hi)) {
  		case 0:
  			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
  		case 1:
  			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
  		case 2:
  			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
  		case 3:
  			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
  		case 4:
  			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
  		default:
  			pure[0] = 1; pure[1] = 0; pure[2] = w;
  	}

  	mg = (1.0 - c) * g;

  	return [
  		(c * pure[0] + mg) * 255,
  		(c * pure[1] + mg) * 255,
  		(c * pure[2] + mg) * 255
  	];
  };

  convert$2.hcg.hsv = function (hcg) {
  	var c = hcg[1] / 100;
  	var g = hcg[2] / 100;

  	var v = c + g * (1.0 - c);
  	var f = 0;

  	if (v > 0.0) {
  		f = c / v;
  	}

  	return [hcg[0], f * 100, v * 100];
  };

  convert$2.hcg.hsl = function (hcg) {
  	var c = hcg[1] / 100;
  	var g = hcg[2] / 100;

  	var l = g * (1.0 - c) + 0.5 * c;
  	var s = 0;

  	if (l > 0.0 && l < 0.5) {
  		s = c / (2 * l);
  	} else
  	if (l >= 0.5 && l < 1.0) {
  		s = c / (2 * (1 - l));
  	}

  	return [hcg[0], s * 100, l * 100];
  };

  convert$2.hcg.hwb = function (hcg) {
  	var c = hcg[1] / 100;
  	var g = hcg[2] / 100;
  	var v = c + g * (1.0 - c);
  	return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };

  convert$2.hwb.hcg = function (hwb) {
  	var w = hwb[1] / 100;
  	var b = hwb[2] / 100;
  	var v = 1 - b;
  	var c = v - w;
  	var g = 0;

  	if (c < 1) {
  		g = (v - c) / (1 - c);
  	}

  	return [hwb[0], c * 100, g * 100];
  };

  convert$2.apple.rgb = function (apple) {
  	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
  };

  convert$2.rgb.apple = function (rgb) {
  	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
  };

  convert$2.gray.rgb = function (args) {
  	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };

  convert$2.gray.hsl = convert$2.gray.hsv = function (args) {
  	return [0, 0, args[0]];
  };

  convert$2.gray.hwb = function (gray) {
  	return [0, 100, gray[0]];
  };

  convert$2.gray.cmyk = function (gray) {
  	return [0, 0, 0, gray[0]];
  };

  convert$2.gray.lab = function (gray) {
  	return [gray[0], 0, 0];
  };

  convert$2.gray.hex = function (gray) {
  	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
  	var integer = (val << 16) + (val << 8) + val;

  	var string = integer.toString(16).toUpperCase();
  	return '000000'.substring(string.length) + string;
  };

  convert$2.rgb.gray = function (rgb) {
  	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
  	return [val / 255 * 100];
  };

  var conversions$1 = conversionsExports;

  /*
  	this function routes a model to all other models.

  	all functions that are routed have a property `.conversion` attached
  	to the returned synthetic function. This property is an array
  	of strings, each with the steps in between the 'from' and 'to'
  	color models (inclusive).

  	conversions that are not possible simply are not included.
  */

  function buildGraph() {
  	var graph = {};
  	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
  	var models = Object.keys(conversions$1);

  	for (var len = models.length, i = 0; i < len; i++) {
  		graph[models[i]] = {
  			// http://jsperf.com/1-vs-infinity
  			// micro-opt, but this is simple.
  			distance: -1,
  			parent: null
  		};
  	}

  	return graph;
  }

  // https://en.wikipedia.org/wiki/Breadth-first_search
  function deriveBFS(fromModel) {
  	var graph = buildGraph();
  	var queue = [fromModel]; // unshift -> queue -> pop

  	graph[fromModel].distance = 0;

  	while (queue.length) {
  		var current = queue.pop();
  		var adjacents = Object.keys(conversions$1[current]);

  		for (var len = adjacents.length, i = 0; i < len; i++) {
  			var adjacent = adjacents[i];
  			var node = graph[adjacent];

  			if (node.distance === -1) {
  				node.distance = graph[current].distance + 1;
  				node.parent = current;
  				queue.unshift(adjacent);
  			}
  		}
  	}

  	return graph;
  }

  function link(from, to) {
  	return function (args) {
  		return to(from(args));
  	};
  }

  function wrapConversion(toModel, graph) {
  	var path = [graph[toModel].parent, toModel];
  	var fn = conversions$1[graph[toModel].parent][toModel];

  	var cur = graph[toModel].parent;
  	while (graph[cur].parent) {
  		path.unshift(graph[cur].parent);
  		fn = link(conversions$1[graph[cur].parent][cur], fn);
  		cur = graph[cur].parent;
  	}

  	fn.conversion = path;
  	return fn;
  }

  var route$1 = function (fromModel) {
  	var graph = deriveBFS(fromModel);
  	var conversion = {};

  	var models = Object.keys(graph);
  	for (var len = models.length, i = 0; i < len; i++) {
  		var toModel = models[i];
  		var node = graph[toModel];

  		if (node.parent === null) {
  			// no possible conversion, or this node is the source model.
  			continue;
  		}

  		conversion[toModel] = wrapConversion(toModel, graph);
  	}

  	return conversion;
  };

  var conversions = conversionsExports;
  var route = route$1;

  var convert$1 = {};

  var models = Object.keys(conversions);

  function wrapRaw(fn) {
  	var wrappedFn = function (args) {
  		if (args === undefined || args === null) {
  			return args;
  		}

  		if (arguments.length > 1) {
  			args = Array.prototype.slice.call(arguments);
  		}

  		return fn(args);
  	};

  	// preserve .conversion property if there is one
  	if ('conversion' in fn) {
  		wrappedFn.conversion = fn.conversion;
  	}

  	return wrappedFn;
  }

  function wrapRounded(fn) {
  	var wrappedFn = function (args) {
  		if (args === undefined || args === null) {
  			return args;
  		}

  		if (arguments.length > 1) {
  			args = Array.prototype.slice.call(arguments);
  		}

  		var result = fn(args);

  		// we're assuming the result is an array here.
  		// see notice in conversions.js; don't use box types
  		// in conversion functions.
  		if (typeof result === 'object') {
  			for (var len = result.length, i = 0; i < len; i++) {
  				result[i] = Math.round(result[i]);
  			}
  		}

  		return result;
  	};

  	// preserve .conversion property if there is one
  	if ('conversion' in fn) {
  		wrappedFn.conversion = fn.conversion;
  	}

  	return wrappedFn;
  }

  models.forEach(function (fromModel) {
  	convert$1[fromModel] = {};

  	Object.defineProperty(convert$1[fromModel], 'channels', {value: conversions[fromModel].channels});
  	Object.defineProperty(convert$1[fromModel], 'labels', {value: conversions[fromModel].labels});

  	var routes = route(fromModel);
  	var routeModels = Object.keys(routes);

  	routeModels.forEach(function (toModel) {
  		var fn = routes[toModel];

  		convert$1[fromModel][toModel] = wrapRounded(fn);
  		convert$1[fromModel][toModel].raw = wrapRaw(fn);
  	});
  });

  var colorConvert = convert$1;

  var colorString = colorStringExports;
  var convert = colorConvert;

  var _slice = [].slice;

  var skippedModels = [
  	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
  	'keyword',

  	// gray conflicts with some method names, and has its own method defined.
  	'gray',

  	// shouldn't really be in color-convert either...
  	'hex'
  ];

  var hashedModelKeys = {};
  Object.keys(convert).forEach(function (model) {
  	hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
  });

  var limiters = {};

  function Color(obj, model) {
  	if (!(this instanceof Color)) {
  		return new Color(obj, model);
  	}

  	if (model && model in skippedModels) {
  		model = null;
  	}

  	if (model && !(model in convert)) {
  		throw new Error('Unknown model: ' + model);
  	}

  	var i;
  	var channels;

  	if (obj == null) { // eslint-disable-line no-eq-null,eqeqeq
  		this.model = 'rgb';
  		this.color = [0, 0, 0];
  		this.valpha = 1;
  	} else if (obj instanceof Color) {
  		this.model = obj.model;
  		this.color = obj.color.slice();
  		this.valpha = obj.valpha;
  	} else if (typeof obj === 'string') {
  		var result = colorString.get(obj);
  		if (result === null) {
  			throw new Error('Unable to parse color from string: ' + obj);
  		}

  		this.model = result.model;
  		channels = convert[this.model].channels;
  		this.color = result.value.slice(0, channels);
  		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
  	} else if (obj.length) {
  		this.model = model || 'rgb';
  		channels = convert[this.model].channels;
  		var newArr = _slice.call(obj, 0, channels);
  		this.color = zeroArray(newArr, channels);
  		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
  	} else if (typeof obj === 'number') {
  		// this is always RGB - can be converted later on.
  		obj &= 0xFFFFFF;
  		this.model = 'rgb';
  		this.color = [
  			(obj >> 16) & 0xFF,
  			(obj >> 8) & 0xFF,
  			obj & 0xFF
  		];
  		this.valpha = 1;
  	} else {
  		this.valpha = 1;

  		var keys = Object.keys(obj);
  		if ('alpha' in obj) {
  			keys.splice(keys.indexOf('alpha'), 1);
  			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
  		}

  		var hashedKeys = keys.sort().join('');
  		if (!(hashedKeys in hashedModelKeys)) {
  			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
  		}

  		this.model = hashedModelKeys[hashedKeys];

  		var labels = convert[this.model].labels;
  		var color = [];
  		for (i = 0; i < labels.length; i++) {
  			color.push(obj[labels[i]]);
  		}

  		this.color = zeroArray(color);
  	}

  	// perform limitations (clamping, etc.)
  	if (limiters[this.model]) {
  		channels = convert[this.model].channels;
  		for (i = 0; i < channels; i++) {
  			var limit = limiters[this.model][i];
  			if (limit) {
  				this.color[i] = limit(this.color[i]);
  			}
  		}
  	}

  	this.valpha = Math.max(0, Math.min(1, this.valpha));

  	if (Object.freeze) {
  		Object.freeze(this);
  	}
  }

  Color.prototype = {
  	toString: function () {
  		return this.string();
  	},

  	toJSON: function () {
  		return this[this.model]();
  	},

  	string: function (places) {
  		var self = this.model in colorString.to ? this : this.rgb();
  		self = self.round(typeof places === 'number' ? places : 1);
  		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
  		return colorString.to[self.model](args);
  	},

  	percentString: function (places) {
  		var self = this.rgb().round(typeof places === 'number' ? places : 1);
  		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
  		return colorString.to.rgb.percent(args);
  	},

  	array: function () {
  		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
  	},

  	object: function () {
  		var result = {};
  		var channels = convert[this.model].channels;
  		var labels = convert[this.model].labels;

  		for (var i = 0; i < channels; i++) {
  			result[labels[i]] = this.color[i];
  		}

  		if (this.valpha !== 1) {
  			result.alpha = this.valpha;
  		}

  		return result;
  	},

  	unitArray: function () {
  		var rgb = this.rgb().color;
  		rgb[0] /= 255;
  		rgb[1] /= 255;
  		rgb[2] /= 255;

  		if (this.valpha !== 1) {
  			rgb.push(this.valpha);
  		}

  		return rgb;
  	},

  	unitObject: function () {
  		var rgb = this.rgb().object();
  		rgb.r /= 255;
  		rgb.g /= 255;
  		rgb.b /= 255;

  		if (this.valpha !== 1) {
  			rgb.alpha = this.valpha;
  		}

  		return rgb;
  	},

  	round: function (places) {
  		places = Math.max(places || 0, 0);
  		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
  	},

  	alpha: function (val) {
  		if (arguments.length) {
  			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
  		}

  		return this.valpha;
  	},

  	// rgb
  	red: getset('rgb', 0, maxfn(255)),
  	green: getset('rgb', 1, maxfn(255)),
  	blue: getset('rgb', 2, maxfn(255)),

  	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

  	saturationl: getset('hsl', 1, maxfn(100)),
  	lightness: getset('hsl', 2, maxfn(100)),

  	saturationv: getset('hsv', 1, maxfn(100)),
  	value: getset('hsv', 2, maxfn(100)),

  	chroma: getset('hcg', 1, maxfn(100)),
  	gray: getset('hcg', 2, maxfn(100)),

  	white: getset('hwb', 1, maxfn(100)),
  	wblack: getset('hwb', 2, maxfn(100)),

  	cyan: getset('cmyk', 0, maxfn(100)),
  	magenta: getset('cmyk', 1, maxfn(100)),
  	yellow: getset('cmyk', 2, maxfn(100)),
  	black: getset('cmyk', 3, maxfn(100)),

  	x: getset('xyz', 0, maxfn(100)),
  	y: getset('xyz', 1, maxfn(100)),
  	z: getset('xyz', 2, maxfn(100)),

  	l: getset('lab', 0, maxfn(100)),
  	a: getset('lab', 1),
  	b: getset('lab', 2),

  	keyword: function (val) {
  		if (arguments.length) {
  			return new Color(val);
  		}

  		return convert[this.model].keyword(this.color);
  	},

  	hex: function (val) {
  		if (arguments.length) {
  			return new Color(val);
  		}

  		return colorString.to.hex(this.rgb().round().color);
  	},

  	rgbNumber: function () {
  		var rgb = this.rgb().color;
  		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
  	},

  	luminosity: function () {
  		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
  		var rgb = this.rgb().color;

  		var lum = [];
  		for (var i = 0; i < rgb.length; i++) {
  			var chan = rgb[i] / 255;
  			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
  		}

  		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
  	},

  	contrast: function (color2) {
  		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
  		var lum1 = this.luminosity();
  		var lum2 = color2.luminosity();

  		if (lum1 > lum2) {
  			return (lum1 + 0.05) / (lum2 + 0.05);
  		}

  		return (lum2 + 0.05) / (lum1 + 0.05);
  	},

  	level: function (color2) {
  		var contrastRatio = this.contrast(color2);
  		if (contrastRatio >= 7.1) {
  			return 'AAA';
  		}

  		return (contrastRatio >= 4.5) ? 'AA' : '';
  	},

  	isDark: function () {
  		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
  		var rgb = this.rgb().color;
  		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  		return yiq < 128;
  	},

  	isLight: function () {
  		return !this.isDark();
  	},

  	negate: function () {
  		var rgb = this.rgb();
  		for (var i = 0; i < 3; i++) {
  			rgb.color[i] = 255 - rgb.color[i];
  		}
  		return rgb;
  	},

  	lighten: function (ratio) {
  		var hsl = this.hsl();
  		hsl.color[2] += hsl.color[2] * ratio;
  		return hsl;
  	},

  	darken: function (ratio) {
  		var hsl = this.hsl();
  		hsl.color[2] -= hsl.color[2] * ratio;
  		return hsl;
  	},

  	saturate: function (ratio) {
  		var hsl = this.hsl();
  		hsl.color[1] += hsl.color[1] * ratio;
  		return hsl;
  	},

  	desaturate: function (ratio) {
  		var hsl = this.hsl();
  		hsl.color[1] -= hsl.color[1] * ratio;
  		return hsl;
  	},

  	whiten: function (ratio) {
  		var hwb = this.hwb();
  		hwb.color[1] += hwb.color[1] * ratio;
  		return hwb;
  	},

  	blacken: function (ratio) {
  		var hwb = this.hwb();
  		hwb.color[2] += hwb.color[2] * ratio;
  		return hwb;
  	},

  	grayscale: function () {
  		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
  		var rgb = this.rgb().color;
  		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
  		return Color.rgb(val, val, val);
  	},

  	fade: function (ratio) {
  		return this.alpha(this.valpha - (this.valpha * ratio));
  	},

  	opaquer: function (ratio) {
  		return this.alpha(this.valpha + (this.valpha * ratio));
  	},

  	rotate: function (degrees) {
  		var hsl = this.hsl();
  		var hue = hsl.color[0];
  		hue = (hue + degrees) % 360;
  		hue = hue < 0 ? 360 + hue : hue;
  		hsl.color[0] = hue;
  		return hsl;
  	},

  	mix: function (mixinColor, weight) {
  		// ported from sass implementation in C
  		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
  		if (!mixinColor || !mixinColor.rgb) {
  			throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
  		}
  		var color1 = mixinColor.rgb();
  		var color2 = this.rgb();
  		var p = weight === undefined ? 0.5 : weight;

  		var w = 2 * p - 1;
  		var a = color1.alpha() - color2.alpha();

  		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
  		var w2 = 1 - w1;

  		return Color.rgb(
  				w1 * color1.red() + w2 * color2.red(),
  				w1 * color1.green() + w2 * color2.green(),
  				w1 * color1.blue() + w2 * color2.blue(),
  				color1.alpha() * p + color2.alpha() * (1 - p));
  	}
  };

  // model conversion methods and static constructors
  Object.keys(convert).forEach(function (model) {
  	if (skippedModels.indexOf(model) !== -1) {
  		return;
  	}

  	var channels = convert[model].channels;

  	// conversion methods
  	Color.prototype[model] = function () {
  		if (this.model === model) {
  			return new Color(this);
  		}

  		if (arguments.length) {
  			return new Color(arguments, model);
  		}

  		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
  		return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
  	};

  	// 'static' construction methods
  	Color[model] = function (color) {
  		if (typeof color === 'number') {
  			color = zeroArray(_slice.call(arguments), channels);
  		}
  		return new Color(color, model);
  	};
  });

  function roundTo(num, places) {
  	return Number(num.toFixed(places));
  }

  function roundToPlace(places) {
  	return function (num) {
  		return roundTo(num, places);
  	};
  }

  function getset(model, channel, modifier) {
  	model = Array.isArray(model) ? model : [model];

  	model.forEach(function (m) {
  		(limiters[m] || (limiters[m] = []))[channel] = modifier;
  	});

  	model = model[0];

  	return function (val) {
  		var result;

  		if (arguments.length) {
  			if (modifier) {
  				val = modifier(val);
  			}

  			result = this[model]();
  			result.color[channel] = val;
  			return result;
  		}

  		result = this[model]().color[channel];
  		if (modifier) {
  			result = modifier(result);
  		}

  		return result;
  	};
  }

  function maxfn(max) {
  	return function (v) {
  		return Math.max(0, Math.min(max, v));
  	};
  }

  function assertArray(val) {
  	return Array.isArray(val) ? val : [val];
  }

  function zeroArray(arr, length) {
  	for (var i = 0; i < length; i++) {
  		if (typeof arr[i] !== 'number') {
  			arr[i] = 0;
  		}
  	}

  	return arr;
  }

  var color = Color;

  const DEFAULT_COLOR = color.hsl(180, 30, 70);
  class FlameChartPlugin extends UIPlugin {
      constructor({ data, colors = {}, name = 'flameChartPlugin', }) {
          super(name);
          this.height = 0;
          this.flatTree = [];
          this.positionY = 0;
          this.colors = {};
          this.selectedRegion = null;
          this.hoveredRegion = null;
          this.lastRandomColor = DEFAULT_COLOR;
          this.metaClusterizedFlatTree = [];
          this.actualClusterizedFlatTree = [];
          this.initialClusterizedFlatTree = [];
          this.lastUsedColor = null;
          this.renderChartTimeout = -1;
          this.data = data;
          this.userColors = colors;
          this.parseData();
          this.reset();
      }
      init(renderEngine, interactionsEngine) {
          super.init(renderEngine, interactionsEngine);
          this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
          this.interactionsEngine.on('select', this.handleSelect.bind(this));
          this.interactionsEngine.on('hover', this.handleHover.bind(this));
          this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
          this.initData();
      }
      handlePositionChange({ deltaX, deltaY }) {
          const startPositionY = this.positionY;
          const startPositionX = this.renderEngine.parent.positionX;
          this.interactionsEngine.setCursor('grabbing');
          if (this.positionY + deltaY >= 0) {
              this.setPositionY(this.positionY + deltaY);
          }
          else {
              this.setPositionY(0);
          }
          this.renderEngine.tryToChangePosition(deltaX);
          if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
              this.renderEngine.parent.render();
          }
      }
      handleMouseUp() {
          this.interactionsEngine.clearCursor();
      }
      setPositionY(y) {
          this.positionY = y;
      }
      reset() {
          this.colors = {};
          this.lastRandomColor = DEFAULT_COLOR;
          this.positionY = 0;
          this.selectedRegion = null;
      }
      calcMinMax() {
          const { flatTree } = this;
          const { min, max } = getFlatTreeMinMax(flatTree);
          this.min = min;
          this.max = max;
      }
      handleSelect(region) {
          var _a;
          const selectedRegion = this.findNodeInCluster(region);
          if (this.selectedRegion !== selectedRegion) {
              this.selectedRegion = selectedRegion;
              this.renderEngine.render();
              this.emit('select', (_a = this.selectedRegion) === null || _a === void 0 ? void 0 : _a.data, 'flame-chart-node');
          }
      }
      handleHover(region) {
          this.hoveredRegion = this.findNodeInCluster(region);
      }
      findNodeInCluster(region) {
          const mouse = this.interactionsEngine.getMouse();
          if (region && region.type === "cluster" /* RegionTypes.CLUSTER */) {
              const hoveredNode = region.data.nodes.find(({ level, source: { start, duration } }) => {
                  const { x, y, w } = this.calcRect(start, duration, level);
                  return mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + this.renderEngine.blockHeight;
              });
              if (hoveredNode) {
                  return {
                      data: hoveredNode,
                      type: 'node',
                  };
              }
          }
          return null;
      }
      getColor(type = '_default', defaultColor) {
          if (defaultColor) {
              return defaultColor;
          }
          else if (this.colors[type]) {
              return this.colors[type];
          }
          else if (this.userColors[type]) {
              const color$1 = new color(this.userColors[type]);
              this.colors[type] = color$1.rgb().toString();
              return this.colors[type];
          }
          this.lastRandomColor = this.lastRandomColor.rotate(27);
          this.colors[type] = this.lastRandomColor.rgb().toString();
          return this.colors[type];
      }
      setData(data) {
          this.data = data;
          this.parseData();
          this.initData();
          this.reset();
          this.renderEngine.recalcMinMax();
          this.renderEngine.resetParentView();
      }
      parseData() {
          this.flatTree = flatTree(this.data);
          this.calcMinMax();
      }
      initData() {
          this.metaClusterizedFlatTree = metaClusterizeFlatTree(this.flatTree);
          this.initialClusterizedFlatTree = clusterizeFlatTree(this.metaClusterizedFlatTree, this.renderEngine.zoom, this.min, this.max);
          this.reclusterizeClusteredFlatTree();
      }
      reclusterizeClusteredFlatTree() {
          this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(this.initialClusterizedFlatTree, this.renderEngine.zoom, this.renderEngine.positionX, this.renderEngine.positionX + this.renderEngine.getRealView());
      }
      calcRect(start, duration, level) {
          const w = duration * this.renderEngine.zoom;
          return {
              x: this.renderEngine.timeToPosition(start),
              y: level * (this.renderEngine.blockHeight + 1) - this.positionY,
              w: w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3,
          };
      }
      renderTooltip() {
          if (this.hoveredRegion) {
              if (this.renderEngine.options.tooltip === false) {
                  return true;
              }
              else if (typeof this.renderEngine.options.tooltip === 'function') {
                  this.renderEngine.options.tooltip(this.hoveredRegion, this.renderEngine, this.interactionsEngine.getGlobalMouse());
              }
              else {
                  const { data: { source: { start, duration, name, children }, }, } = this.hoveredRegion;
                  const timeUnits = this.renderEngine.getTimeUnits();
                  const selfTime = duration - (children ? children.reduce((acc, { duration }) => acc + duration, 0) : 0);
                  const nodeAccuracy = this.renderEngine.getAccuracy() + 2;
                  const header = `${name}`;
                  const dur = `duration: ${duration.toFixed(nodeAccuracy)} ${timeUnits} ${(children === null || children === void 0 ? void 0 : children.length) ? `(self ${selfTime.toFixed(nodeAccuracy)} ${timeUnits})` : ''}`;
                  const st = `start: ${start.toFixed(nodeAccuracy)}`;
                  this.renderEngine.renderTooltipFromData([{ text: header }, { text: dur }, { text: st }], this.interactionsEngine.getGlobalMouse());
              }
              return true;
          }
          return false;
      }
      render() {
          const { width, blockHeight, height, minTextWidth } = this.renderEngine;
          this.lastUsedColor = null;
          this.reclusterizeClusteredFlatTree();
          const processCluster = (cb) => {
              return (cluster) => {
                  const { start, duration, level } = cluster;
                  const { x, y, w } = this.calcRect(start, duration, level);
                  if (x + w > 0 && x < width && y + blockHeight > 0 && y < height) {
                      cb(cluster, x, y, w);
                  }
              };
          };
          const renderCluster = (cluster, x, y, w) => {
              const { type, nodes, color } = cluster;
              const mouse = this.interactionsEngine.getMouse();
              if (mouse.y >= y && mouse.y <= y + blockHeight) {
                  addHitRegion(cluster, x, y, w);
              }
              if (w >= 0.25) {
                  this.renderEngine.addRectToRenderQueue(this.getColor(type, color), x, y, w);
              }
              if (w >= minTextWidth && nodes.length === 1) {
                  this.renderEngine.addTextToRenderQueue(nodes[0].source.name, x, y, w);
              }
          };
          const addHitRegion = (cluster, x, y, w) => {
              this.interactionsEngine.addHitRegion("cluster" /* RegionTypes.CLUSTER */, cluster, x, y, w, blockHeight);
          };
          this.actualClusterizedFlatTree.forEach(processCluster(renderCluster));
          if (this.selectedRegion && this.selectedRegion.type === 'node') {
              const { source: { start, duration }, level, } = this.selectedRegion.data;
              const { x, y, w } = this.calcRect(start, duration, level);
              this.renderEngine.addStrokeToRenderQueue('green', x, y, w, this.renderEngine.blockHeight);
          }
          clearTimeout(this.renderChartTimeout);
          this.renderChartTimeout = window.setTimeout(() => {
              this.interactionsEngine.clearHitRegions();
              this.actualClusterizedFlatTree.forEach(processCluster(addHitRegion));
          }, 16);
      }
  }

  const mergeObjects = (defaultStyles, styles = {}) => Object.keys(defaultStyles).reduce((acc, key) => {
      if (styles[key]) {
          acc[key] = styles[key];
      }
      else {
          acc[key] = defaultStyles[key];
      }
      return acc;
  }, {});
  const isNumber = (val) => typeof val === 'number';

  const defaultTimeGridPluginStyles = {
      font: '10px sans-serif',
      fontColor: 'black',
  };
  class TimeGridPlugin extends UIPlugin {
      constructor(settings = {}) {
          super('timeGridPlugin');
          this.styles = defaultTimeGridPluginStyles;
          this.height = 0;
          this.setSettings(settings);
      }
      setSettings({ styles }) {
          this.styles = mergeObjects(defaultTimeGridPluginStyles, styles);
          if (this.renderEngine) {
              this.overrideEngineSettings();
          }
      }
      overrideEngineSettings() {
          this.renderEngine.setSettingsOverrides({ styles: this.styles });
          this.height = Math.round(this.renderEngine.charHeight + 10);
      }
      init(renderEngine, interactionsEngine) {
          super.init(renderEngine, interactionsEngine);
          this.overrideEngineSettings();
      }
      render() {
          this.renderEngine.parent.timeGrid.renderTimes(this.renderEngine);
          this.renderEngine.parent.timeGrid.renderLines(0, this.renderEngine.height, this.renderEngine);
          return true;
      }
  }

  class MarksPlugin extends UIPlugin {
      constructor({ data, name = 'marksPlugin' }) {
          super(name);
          this.hoveredRegion = null;
          this.selectedRegion = null;
          this.marks = this.prepareMarks(data);
          this.calcMinMax();
      }
      calcMinMax() {
          const { marks } = this;
          if (marks.length) {
              this.min = marks.reduce((acc, { timestamp }) => (timestamp < acc ? timestamp : acc), marks[0].timestamp);
              this.max = marks.reduce((acc, { timestamp }) => (timestamp > acc ? timestamp : acc), marks[0].timestamp);
          }
      }
      init(renderEngine, interactionsEngine) {
          super.init(renderEngine, interactionsEngine);
          this.interactionsEngine.on('hover', this.handleHover.bind(this));
          this.interactionsEngine.on('select', this.handleSelect.bind(this));
      }
      handleHover(region) {
          this.hoveredRegion = region;
      }
      handleSelect(region) {
          if (region && region.type === 'timestamp') {
              this.selectedRegion = region;
              this.emit('select', region.data, 'timestamp');
              this.renderEngine.render();
          }
          else if (this.selectedRegion && !region) {
              this.selectedRegion = null;
              this.emit('select', null, 'timestamp');
              this.renderEngine.render();
          }
      }
      get height() {
          return this.renderEngine.blockHeight + 1;
      }
      prepareMarks(marks) {
          return marks
              .map(({ color: color$1, ...rest }) => ({
              ...rest,
              color: new color(color$1).alpha(0.7).rgb().toString(),
          }))
              .sort((a, b) => a.timestamp - b.timestamp);
      }
      setMarks(marks) {
          this.marks = this.prepareMarks(marks);
          this.calcMinMax();
          this.renderEngine.recalcMinMax();
          this.renderEngine.resetParentView();
      }
      calcMarksBlockPosition(position, prevEnding) {
          if (position > 0) {
              if (prevEnding > position) {
                  return prevEnding;
              }
              return position;
          }
          return position;
      }
      render() {
          this.marks.reduce((prevEnding, node) => {
              const { timestamp, color, shortName } = node;
              const { width } = this.renderEngine.ctx.measureText(shortName);
              const fullWidth = width + this.renderEngine.blockPaddingLeftRight * 2;
              const position = this.renderEngine.timeToPosition(timestamp);
              const blockPosition = this.calcMarksBlockPosition(position, prevEnding);
              this.renderEngine.addRectToRenderQueue(color, blockPosition, 0, fullWidth);
              this.renderEngine.addTextToRenderQueue(shortName, blockPosition, 0, fullWidth);
              this.interactionsEngine.addHitRegion("timestamp" /* RegionTypes.TIMESTAMP */, node, blockPosition, 0, fullWidth, this.renderEngine.blockHeight);
              return blockPosition + fullWidth;
          }, 0);
      }
      postRender() {
          this.marks.forEach((node) => {
              const { timestamp, color } = node;
              const position = this.renderEngine.timeToPosition(timestamp);
              this.renderEngine.parent.setStrokeColor(color);
              this.renderEngine.parent.ctx.beginPath();
              this.renderEngine.parent.ctx.setLineDash([8, 7]);
              this.renderEngine.parent.ctx.moveTo(position, this.renderEngine.position);
              this.renderEngine.parent.ctx.lineTo(position, this.renderEngine.parent.height);
              this.renderEngine.parent.ctx.stroke();
          });
      }
      renderTooltip() {
          if (this.hoveredRegion && this.hoveredRegion.type === 'timestamp') {
              if (this.renderEngine.options.tooltip === false) {
                  return true;
              }
              else if (typeof this.renderEngine.options.tooltip === 'function') {
                  this.renderEngine.options.tooltip(this.hoveredRegion, this.renderEngine, this.interactionsEngine.getGlobalMouse());
              }
              else {
                  const { data: { fullName, timestamp }, } = this.hoveredRegion;
                  const marksAccuracy = this.renderEngine.getAccuracy() + 2;
                  const header = `${fullName}`;
                  const time = `${timestamp.toFixed(marksAccuracy)} ${this.renderEngine.timeUnits}`;
                  this.renderEngine.renderTooltipFromData([{ text: header }, { text: time }], this.interactionsEngine.getGlobalMouse());
              }
              return true;
          }
          return false;
      }
  }

  const MIN_PIXEL_DELTA = 85;
  const defaultTimeGridStyles = {
      color: 'rgba(90,90,90,0.20)',
  };
  class TimeGrid {
      constructor(settings) {
          this.styles = defaultTimeGridStyles;
          this.timeUnits = 'ms';
          this.start = 0;
          this.end = 0;
          this.accuracy = 0;
          this.delta = 0;
          this.setSettings(settings);
      }
      setDefaultRenderEngine(renderEngine) {
          this.renderEngine = renderEngine;
          this.timeUnits = this.renderEngine.getTimeUnits();
      }
      setSettings({ styles }) {
          this.styles = mergeObjects(defaultTimeGridStyles, styles);
          if (this.renderEngine) {
              this.timeUnits = this.renderEngine.getTimeUnits();
          }
      }
      recalc() {
          const timeWidth = this.renderEngine.max - this.renderEngine.min;
          const initialLinesCount = this.renderEngine.width / MIN_PIXEL_DELTA;
          const initialTimeLineDelta = timeWidth / initialLinesCount;
          const realView = this.renderEngine.getRealView();
          const proportion = realView / (timeWidth || 1);
          this.delta = initialTimeLineDelta / Math.pow(2, Math.floor(Math.log2(1 / proportion)));
          this.start = Math.floor((this.renderEngine.positionX - this.renderEngine.min) / this.delta);
          this.end = Math.ceil(realView / this.delta) + this.start;
          this.accuracy = this.calcNumberFix();
      }
      calcNumberFix() {
          var _a;
          const strTimelineDelta = (this.delta / 2).toString();
          if (strTimelineDelta.includes('e')) {
              return Number((_a = strTimelineDelta.match(/\d+$/)) === null || _a === void 0 ? void 0 : _a[0]);
          }
          const zeros = strTimelineDelta.match(/(0\.0*)/);
          return zeros ? zeros[0].length - 1 : 0;
      }
      getTimelineAccuracy() {
          return this.accuracy;
      }
      forEachTime(cb) {
          for (let i = this.start; i <= this.end; i++) {
              const timePosition = i * this.delta + this.renderEngine.min;
              const pixelPosition = this.renderEngine.timeToPosition(Number(timePosition.toFixed(this.accuracy)));
              cb(pixelPosition, timePosition);
          }
      }
      renderLines(start, height, renderEngine = this.renderEngine) {
          renderEngine.setCtxColor(this.styles.color);
          this.forEachTime((pixelPosition) => {
              renderEngine.fillRect(pixelPosition, start, 1, height);
          });
      }
      renderTimes(renderEngine = this.renderEngine) {
          renderEngine.setCtxColor(renderEngine.styles.fontColor);
          renderEngine.setCtxFont(renderEngine.styles.font);
          this.forEachTime((pixelPosition, timePosition) => {
              renderEngine.fillText(timePosition.toFixed(this.accuracy) + this.timeUnits, pixelPosition + renderEngine.blockPaddingLeftRight, renderEngine.charHeight);
          });
      }
  }

  const defaultTimeframeSelectorPluginStyles = {
      font: '9px sans-serif',
      fontColor: 'black',
      overlayColor: 'rgba(112, 112, 112, 0.5)',
      graphStrokeColor: 'rgb(0, 0, 0, 0.2)',
      graphFillColor: 'rgb(0, 0, 0, 0.25)',
      bottomLineColor: 'rgb(0, 0, 0, 0.25)',
      knobColor: 'rgb(131, 131, 131)',
      knobStrokeColor: 'white',
      knobSize: 6,
      height: 60,
      backgroundColor: 'white',
  };
  class TimeframeSelectorPlugin extends UIPlugin {
      constructor({ data, settings, name = 'timeframeSelectorPlugin', }) {
          super(name);
          this.styles = defaultTimeframeSelectorPluginStyles;
          this.height = 0;
          this.leftKnobMoving = false;
          this.rightKnobMoving = false;
          this.selectingActive = false;
          this.startSelectingPosition = 0;
          this.actualClusters = [];
          this.clusters = [];
          this.maxLevel = 0;
          this.dots = [];
          this.actualClusterizedFlatTree = [];
          this.data = data;
          this.shouldRender = true;
          this.setSettings(settings);
      }
      init(renderEngine, interactionsEngine) {
          super.init(renderEngine, interactionsEngine);
          this.interactionsEngine.on('down', this.handleMouseDown.bind(this));
          this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
          this.interactionsEngine.on('move', this.handleMouseMove.bind(this));
          this.setSettings();
      }
      handleMouseDown(region, mouse) {
          if (region) {
              if (region.type === "timeframeKnob" /* RegionTypes.TIMEFRAME_KNOB */) {
                  if (region.data === 'left') {
                      this.leftKnobMoving = true;
                  }
                  else {
                      this.rightKnobMoving = true;
                  }
                  this.interactionsEngine.setCursor('ew-resize');
              }
              else if (region.type === "timeframeArea" /* RegionTypes.TIMEFRAME_AREA */) {
                  this.selectingActive = true;
                  this.startSelectingPosition = mouse.x;
              }
          }
      }
      handleMouseUp(_, mouse, isClick) {
          let isDoubleClick = false;
          if (this.timeout) {
              isDoubleClick = true;
          }
          clearTimeout(this.timeout);
          this.timeout = window.setTimeout(() => (this.timeout = void 0), 300);
          this.leftKnobMoving = false;
          this.rightKnobMoving = false;
          this.interactionsEngine.clearCursor();
          if (this.selectingActive && !isClick) {
              this.applyChanges();
          }
          this.selectingActive = false;
          if (isClick && !isDoubleClick) {
              const rightKnobPosition = this.getRightKnobPosition();
              const leftKnobPosition = this.getLeftKnobPosition();
              if (mouse.x > rightKnobPosition) {
                  this.setRightKnobPosition(mouse.x);
              }
              else if (mouse.x > leftKnobPosition && mouse.x < rightKnobPosition) {
                  if (mouse.x - leftKnobPosition > rightKnobPosition - mouse.x) {
                      this.setRightKnobPosition(mouse.x);
                  }
                  else {
                      this.setLeftKnobPosition(mouse.x);
                  }
              }
              else {
                  this.setLeftKnobPosition(mouse.x);
              }
              this.applyChanges();
          }
          if (isDoubleClick) {
              this.renderEngine.parent.setZoom(this.renderEngine.getInitialZoom());
              this.renderEngine.parent.setPositionX(this.renderEngine.min);
              this.renderEngine.parent.render();
          }
      }
      handleMouseMove(_, mouse) {
          if (this.leftKnobMoving) {
              this.setLeftKnobPosition(mouse.x);
              this.applyChanges();
          }
          if (this.rightKnobMoving) {
              this.setRightKnobPosition(mouse.x);
              this.applyChanges();
          }
          if (this.selectingActive) {
              if (this.startSelectingPosition >= mouse.x) {
                  this.setLeftKnobPosition(mouse.x);
                  this.setRightKnobPosition(this.startSelectingPosition);
              }
              else {
                  this.setRightKnobPosition(mouse.x);
                  this.setLeftKnobPosition(this.startSelectingPosition);
              }
              this.renderEngine.render();
          }
      }
      postInit() {
          this.offscreenRenderEngine = this.renderEngine.makeChild();
          this.offscreenRenderEngine.setSettingsOverrides({ styles: this.styles });
          this.timeGrid = new TimeGrid({ styles: this.renderEngine.parent.timeGrid.styles });
          this.timeGrid.setDefaultRenderEngine(this.offscreenRenderEngine);
          this.offscreenRenderEngine.on('resize', () => {
              this.offscreenRenderEngine.setZoom(this.renderEngine.getInitialZoom());
              this.offscreenRender();
          });
          this.offscreenRenderEngine.on('min-max-change', () => (this.shouldRender = true));
          this.setData(this.data);
      }
      setLeftKnobPosition(mouseX) {
          const maxPosition = this.getRightKnobPosition();
          if (mouseX < maxPosition - 1) {
              const realView = this.renderEngine.getRealView();
              const delta = this.renderEngine.setPositionX(this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
              const zoom = this.renderEngine.width / (realView - delta);
              this.renderEngine.setZoom(zoom);
          }
      }
      setRightKnobPosition(mouseX) {
          const minPosition = this.getLeftKnobPosition();
          if (mouseX > minPosition + 1) {
              const realView = this.renderEngine.getRealView();
              const delta = this.renderEngine.positionX +
                  realView -
                  (this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
              const zoom = this.renderEngine.width / (realView - delta);
              this.renderEngine.setZoom(zoom);
          }
      }
      getLeftKnobPosition() {
          return (this.renderEngine.positionX - this.renderEngine.min) * this.renderEngine.getInitialZoom();
      }
      getRightKnobPosition() {
          return ((this.renderEngine.positionX - this.renderEngine.min + this.renderEngine.getRealView()) *
              this.renderEngine.getInitialZoom());
      }
      applyChanges() {
          this.renderEngine.parent.setPositionX(this.renderEngine.positionX);
          this.renderEngine.parent.setZoom(this.renderEngine.zoom);
          this.renderEngine.parent.render();
      }
      setSettings({ styles } = { styles: this.styles }) {
          this.styles = mergeObjects(defaultTimeframeSelectorPluginStyles, styles);
          this.height = this.styles.height;
          if (this.offscreenRenderEngine) {
              this.offscreenRenderEngine.setSettingsOverrides({ styles: this.styles });
              this.timeGrid.setSettings({ styles: this.renderEngine.parent.timeGrid.styles });
          }
          this.shouldRender = true;
      }
      setData(data) {
          this.data = data;
          const dots = [];
          const tree = flatTree(this.data);
          const { min, max } = getFlatTreeMinMax(tree);
          let maxLevel = 0;
          this.min = min;
          this.max = max;
          this.clusters = metaClusterizeFlatTree(tree, () => true);
          this.actualClusters = clusterizeFlatTree(this.clusters, this.renderEngine.zoom, this.min, this.max, 2, Infinity);
          this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(this.actualClusters, this.renderEngine.zoom, this.min, this.max, 2, Infinity).sort((a, b) => a.start - b.start);
          this.actualClusterizedFlatTree.forEach(({ start, end, level }, index) => {
              if (maxLevel < level + 1) {
                  maxLevel = level + 1;
              }
              dots.push({
                  pos: start,
                  sort: 0,
                  level: level,
                  index,
                  type: 'start',
              }, {
                  pos: start,
                  sort: 1,
                  level: level + 1,
                  index,
                  type: 'start',
              }, {
                  pos: end,
                  sort: 2,
                  level: level + 1,
                  index,
                  type: 'end',
              }, {
                  pos: end,
                  sort: 3,
                  level: level,
                  index,
                  type: 'end',
              });
          });
          this.dots = dots.sort((a, b) => {
              if (a.pos !== b.pos) {
                  return a.pos - b.pos;
              }
              if (a.index === b.index) {
                  return a.sort - b.sort;
              }
              if (a.type === 'start' && b.type === 'start') {
                  return a.level - b.level;
              }
              else if (a.type === 'end' && b.type === 'end') {
                  return b.level - a.level;
              }
              return 0;
          });
          this.maxLevel = maxLevel;
          this.offscreenRender();
      }
      offscreenRender() {
          const zoom = this.offscreenRenderEngine.getInitialZoom();
          this.offscreenRenderEngine.setZoom(zoom);
          this.offscreenRenderEngine.setPositionX(this.offscreenRenderEngine.min);
          this.offscreenRenderEngine.clear();
          this.timeGrid.recalc();
          this.timeGrid.renderLines(0, this.offscreenRenderEngine.height);
          this.timeGrid.renderTimes();
          this.offscreenRenderEngine.setStrokeColor(this.styles.graphStrokeColor);
          this.offscreenRenderEngine.setCtxColor(this.styles.graphFillColor);
          this.offscreenRenderEngine.ctx.beginPath();
          const levelHeight = (this.height - this.renderEngine.charHeight - 4) / this.maxLevel;
          if (this.dots.length) {
              this.offscreenRenderEngine.ctx.moveTo((this.dots[0].pos - this.offscreenRenderEngine.min) * zoom, this.castLevelToHeight(this.dots[0].level, levelHeight));
              this.dots.forEach((dot) => {
                  const { pos, level } = dot;
                  this.offscreenRenderEngine.ctx.lineTo((pos - this.offscreenRenderEngine.min) * zoom, this.castLevelToHeight(level, levelHeight));
              });
          }
          this.offscreenRenderEngine.ctx.closePath();
          this.offscreenRenderEngine.ctx.stroke();
          this.offscreenRenderEngine.ctx.fill();
          this.offscreenRenderEngine.setCtxColor(this.styles.bottomLineColor);
          this.offscreenRenderEngine.ctx.fillRect(0, this.height - 1, this.offscreenRenderEngine.width, 1);
      }
      castLevelToHeight(level, levelHeight) {
          return this.height - level * levelHeight;
      }
      renderTimeframe() {
          const relativePositionX = this.renderEngine.positionX - this.renderEngine.min;
          const currentLeftPosition = relativePositionX * this.renderEngine.getInitialZoom();
          const currentRightPosition = (relativePositionX + this.renderEngine.getRealView()) * this.renderEngine.getInitialZoom();
          const currentLeftKnobPosition = currentLeftPosition - this.styles.knobSize / 2;
          const currentRightKnobPosition = currentRightPosition - this.styles.knobSize / 2;
          const knobHeight = this.renderEngine.height / 3;
          this.renderEngine.setCtxColor(this.styles.overlayColor);
          this.renderEngine.fillRect(0, 0, currentLeftPosition, this.renderEngine.height);
          this.renderEngine.fillRect(currentRightPosition, 0, this.renderEngine.width - currentRightPosition, this.renderEngine.height);
          this.renderEngine.setCtxColor(this.styles.overlayColor);
          this.renderEngine.fillRect(currentLeftPosition - 1, 0, 1, this.renderEngine.height);
          this.renderEngine.fillRect(currentRightPosition + 1, 0, 1, this.renderEngine.height);
          this.renderEngine.setCtxColor(this.styles.knobColor);
          this.renderEngine.fillRect(currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
          this.renderEngine.fillRect(currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);
          this.renderEngine.renderStroke(this.styles.knobStrokeColor, currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
          this.renderEngine.renderStroke(this.styles.knobStrokeColor, currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);
          this.interactionsEngine.addHitRegion("timeframeKnob" /* RegionTypes.TIMEFRAME_KNOB */, 'left', currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight, "ew-resize" /* CursorTypes.EW_RESIZE */);
          this.interactionsEngine.addHitRegion("timeframeKnob" /* RegionTypes.TIMEFRAME_KNOB */, 'right', currentRightKnobPosition, 0, this.styles.knobSize, knobHeight, "ew-resize" /* CursorTypes.EW_RESIZE */);
          this.interactionsEngine.addHitRegion("timeframeArea" /* RegionTypes.TIMEFRAME_AREA */, null, 0, 0, this.renderEngine.width, this.renderEngine.height, "text" /* CursorTypes.TEXT */);
      }
      render() {
          if (this.shouldRender) {
              this.shouldRender = false;
              this.offscreenRender();
          }
          this.renderEngine.copy(this.offscreenRenderEngine);
          this.renderTimeframe();
          return true;
      }
  }

  function getValueByChoice(array, property, fn) {
      if (array.length) {
          return array.reduce((acc, { [property]: value }) => fn(acc, value), array[0][property]);
      }
      return 0;
  }
  const defaultWaterfallPluginStyles = {
      defaultHeight: 68,
  };
  class WaterfallPlugin extends UIPlugin {
      constructor({ data, name = 'waterfallPlugin', settings, }) {
          super(name);
          this.styles = defaultWaterfallPluginStyles;
          this.height = defaultWaterfallPluginStyles.defaultHeight;
          this.data = [];
          this.positionY = 0;
          this.hoveredRegion = null;
          this.selectedRegion = null;
          this.initialData = [];
          this.setData(data);
          this.setSettings(settings);
      }
      init(renderEngine, interactionsEngine) {
          super.init(renderEngine, interactionsEngine);
          this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
          this.interactionsEngine.on('hover', this.handleHover.bind(this));
          this.interactionsEngine.on('select', this.handleSelect.bind(this));
          this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
      }
      handlePositionChange({ deltaX, deltaY }) {
          const startPositionY = this.positionY;
          const startPositionX = this.renderEngine.parent.positionX;
          this.interactionsEngine.setCursor('grabbing');
          if (this.positionY + deltaY >= 0) {
              this.setPositionY(this.positionY + deltaY);
          }
          else {
              this.setPositionY(0);
          }
          this.renderEngine.tryToChangePosition(deltaX);
          if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
              this.renderEngine.parent.render();
          }
      }
      handleMouseUp() {
          this.interactionsEngine.clearCursor();
      }
      handleHover(region) {
          this.hoveredRegion = region;
      }
      handleSelect(region) {
          if (region) {
              this.selectedRegion = region;
              this.emit('select', this.initialData[region.data], 'waterfall-node');
              this.renderEngine.render();
          }
          else if (this.selectedRegion && !region) {
              this.selectedRegion = null;
              this.emit('select', null, 'waterfall-node');
              this.renderEngine.render();
          }
      }
      setPositionY(y) {
          this.positionY = y;
      }
      setSettings({ styles }) {
          this.styles = mergeObjects(defaultWaterfallPluginStyles, styles);
          this.height = this.styles.defaultHeight;
          this.positionY = 0;
      }
      setData({ items: data, intervals: commonIntervals }) {
          this.positionY = 0;
          this.initialData = data;
          this.data = data
              .map(({ name, intervals, timing, ...rest }, index) => {
              const resolvedIntervals = typeof intervals === 'string' ? commonIntervals[intervals] : intervals;
              const preparedIntervals = resolvedIntervals
                  .map(({ start, end, color, type, name }) => ({
                  start: typeof start === 'string' ? timing[start] : start,
                  end: typeof end === 'string' ? timing[end] : end,
                  color,
                  name,
                  type,
              }))
                  .filter(({ start, end }) => typeof start === 'number' && typeof end === 'number');
              const blocks = preparedIntervals.filter(({ type }) => type === 'block');
              const blockStart = getValueByChoice(blocks, 'start', Math.min);
              const blockEnd = getValueByChoice(blocks, 'end', Math.max);
              const min = getValueByChoice(preparedIntervals, 'start', Math.min);
              const max = getValueByChoice(preparedIntervals, 'end', Math.max);
              return {
                  ...rest,
                  intervals: preparedIntervals,
                  textBlock: {
                      start: blockStart,
                      end: blockEnd,
                  },
                  name,
                  timing,
                  min,
                  max,
                  index,
              };
          })
              .filter(({ intervals }) => intervals.length)
              .sort((a, b) => a.min - b.min || b.max - a.max);
          if (data.length) {
              this.min = this.data.reduce((acc, { min }) => Math.min(acc, min), this.data[0].min);
              this.max = this.data.reduce((acc, { max }) => Math.max(acc, max), this.data[0].max);
          }
          if (this.renderEngine) {
              this.renderEngine.recalcMinMax();
              this.renderEngine.resetParentView();
          }
      }
      calcRect(start, duration, isEnd) {
          const w = duration * this.renderEngine.zoom;
          return {
              x: this.renderEngine.timeToPosition(start),
              w: isEnd ? (w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3) : w,
          };
      }
      renderTooltip() {
          if (this.hoveredRegion) {
              if (this.renderEngine.options.tooltip === false) {
                  return true;
              }
              else if (typeof this.renderEngine.options.tooltip === 'function') {
                  const { data: index } = this.hoveredRegion;
                  const data = { ...this.hoveredRegion };
                  // @ts-ignore data type on waterfall item is number but here it is something else?
                  data.data = this.data.find(({ index: i }) => index === i);
                  this.renderEngine.options.tooltip(data, this.renderEngine, this.interactionsEngine.getGlobalMouse());
              }
              else {
                  const { data: index } = this.hoveredRegion;
                  const dataItem = this.data.find(({ index: i }) => index === i);
                  if (dataItem) {
                      const { name, intervals, timing, meta = [] } = dataItem;
                      const timeUnits = this.renderEngine.getTimeUnits();
                      const nodeAccuracy = this.renderEngine.getAccuracy() + 2;
                      const header = { text: `${name}` };
                      const intervalsHeader = {
                          text: 'intervals',
                          color: this.renderEngine.styles.tooltipHeaderFontColor,
                      };
                      const intervalsTexts = intervals.map(({ name, start, end }) => ({
                          text: `${name}: ${(end - start).toFixed(nodeAccuracy)} ${timeUnits}`,
                      }));
                      const timingHeader = { text: 'timing', color: this.renderEngine.styles.tooltipHeaderFontColor };
                      const timingTexts = Object.entries(timing)
                          .filter(([, time]) => typeof time === 'number')
                          .map(([name, time]) => ({
                          text: `${name}: ${time.toFixed(nodeAccuracy)} ${timeUnits}`,
                      }));
                      const metaHeader = { text: 'meta', color: this.renderEngine.styles.tooltipHeaderFontColor };
                      const metaTexts = meta
                          ? meta.map(({ name, value, color }) => ({
                              text: `${name}: ${value}`,
                              color,
                          }))
                          : [];
                      this.renderEngine.renderTooltipFromData([
                          header,
                          intervalsHeader,
                          ...intervalsTexts,
                          timingHeader,
                          ...timingTexts,
                          ...(metaTexts.length ? [metaHeader, ...metaTexts] : []),
                      ], this.interactionsEngine.getGlobalMouse());
                  }
              }
              return true;
          }
          return false;
      }
      render() {
          const rightSide = this.renderEngine.positionX + this.renderEngine.getRealView();
          const leftSide = this.renderEngine.positionX;
          const blockHeight = this.renderEngine.blockHeight + 1;
          const stack = [];
          const viewedData = this.data
              .filter(({ min, max }) => !((rightSide < min && rightSide < max) || (leftSide > max && rightSide > min)))
              .map((entry) => {
              while (stack.length && entry.min - stack[stack.length - 1].max > 0) {
                  stack.pop();
              }
              const level = stack.length;
              const result = {
                  ...entry,
                  level,
              };
              stack.push(entry);
              return result;
          });
          viewedData.forEach(({ name, intervals, textBlock, level, index }) => {
              const y = level * blockHeight - this.positionY;
              if (y + blockHeight >= 0 && y - blockHeight <= this.renderEngine.height) {
                  const textStart = this.renderEngine.timeToPosition(textBlock.start);
                  const textEnd = this.renderEngine.timeToPosition(textBlock.end);
                  this.renderEngine.addTextToRenderQueue(name, textStart, y, textEnd - textStart);
                  const { x, w } = intervals.reduce((acc, { color, start, end, type }, index) => {
                      const { x, w } = this.calcRect(start, end - start, index === intervals.length - 1);
                      if (type === 'block') {
                          this.renderEngine.addRectToRenderQueue(color, x, y, w);
                      }
                      return {
                          x: acc.x === null ? x : acc.x,
                          w: w + acc.w,
                      };
                  }, { x: null, w: 0 });
                  if (this.selectedRegion && this.selectedRegion.type === 'waterfall-node') {
                      const selectedIndex = this.selectedRegion.data;
                      if (selectedIndex === index) {
                          this.renderEngine.addStrokeToRenderQueue('green', x !== null && x !== void 0 ? x : 0, y, w, this.renderEngine.blockHeight);
                      }
                  }
                  this.interactionsEngine.addHitRegion("waterfall-node" /* RegionTypes.WATERFALL_NODE */, index, x !== null && x !== void 0 ? x : 0, y, w, this.renderEngine.blockHeight);
              }
          }, 0);
      }
  }

  const defaultTogglePluginStyles = {
      height: 16,
      color: 'rgb(202,202,202, 0.25)',
      strokeColor: 'rgb(138,138,138, 0.50)',
      dotsColor: 'rgb(97,97,97)',
      fontColor: 'black',
      font: '10px sans-serif',
      triangleWidth: 10,
      triangleHeight: 7,
      triangleColor: 'black',
      leftPadding: 10,
  };
  class TogglePlugin extends UIPlugin {
      constructor(title, settings) {
          super('togglePlugin');
          this.styles = defaultTogglePluginStyles;
          this.height = 0;
          this.resizeActive = false;
          this.resizeStartHeight = 0;
          this.resizeStartPosition = 0;
          this.setSettings(settings);
          this.title = title;
      }
      setSettings({ styles }) {
          this.styles = mergeObjects(defaultTogglePluginStyles, styles);
          this.height = this.styles.height + 1;
      }
      init(renderEngine, interactionsEngine) {
          super.init(renderEngine, interactionsEngine);
          const nextEngine = this.getNextEngine();
          nextEngine.setFlexible();
          this.interactionsEngine.on('click', (region) => {
              if (region && region.type === 'toggle' && region.data === this.renderEngine.id) {
                  const nextEngine = this.getNextEngine();
                  if (nextEngine.collapsed) {
                      nextEngine.expand();
                  }
                  else {
                      nextEngine.collapse();
                  }
                  this.renderEngine.parent.recalcChildrenSizes();
                  this.renderEngine.parent.render();
              }
          });
          this.interactionsEngine.on('down', (region) => {
              if (region && region.type === 'knob-resize' && region.data === this.renderEngine.id) {
                  const prevEngine = this.getPrevEngine();
                  this.interactionsEngine.setCursor('row-resize');
                  this.resizeActive = true;
                  this.resizeStartHeight = prevEngine.height;
                  this.resizeStartPosition = this.interactionsEngine.getGlobalMouse().y;
              }
          });
          this.interactionsEngine.parent.on('move', () => {
              if (this.resizeActive) {
                  const prevEngine = this.getPrevEngine();
                  const mouse = this.interactionsEngine.getGlobalMouse();
                  if (prevEngine.flexible) {
                      const newPosition = this.resizeStartHeight - (this.resizeStartPosition - mouse.y);
                      if (newPosition <= 0) {
                          prevEngine.collapse();
                          prevEngine.resize({ height: 0 });
                      }
                      else {
                          if (prevEngine.collapsed) {
                              prevEngine.expand();
                          }
                          prevEngine.resize({ height: newPosition });
                      }
                      this.renderEngine.parent.render();
                  }
              }
          });
          this.interactionsEngine.parent.on('up', () => {
              this.interactionsEngine.clearCursor();
              this.resizeActive = false;
          });
      }
      getPrevEngine() {
          var _a;
          const prevRenderEngineId = ((_a = this.renderEngine.id) !== null && _a !== void 0 ? _a : 0) - 1;
          return this.renderEngine.parent.children[prevRenderEngineId];
      }
      getNextEngine() {
          var _a;
          const nextRenderEngineId = ((_a = this.renderEngine.id) !== null && _a !== void 0 ? _a : 0) + 1;
          return this.renderEngine.parent.children[nextRenderEngineId];
      }
      render() {
          const nextEngine = this.getNextEngine();
          const prevEngine = this.getPrevEngine();
          const triangleFullWidth = this.styles.leftPadding + this.styles.triangleWidth;
          const centerW = this.renderEngine.width / 2;
          const centerH = this.styles.height / 2;
          this.renderEngine.setCtxFont(this.styles.font);
          this.renderEngine.setCtxColor(this.styles.color);
          this.renderEngine.setStrokeColor(this.styles.strokeColor);
          this.renderEngine.fillRect(0, 0, this.renderEngine.width, this.styles.height);
          this.renderEngine.setCtxColor(this.styles.fontColor);
          this.renderEngine.addTextToRenderQueue(this.title, triangleFullWidth, 0, this.renderEngine.width);
          this.renderEngine.renderTriangle(this.styles.triangleColor, this.styles.leftPadding, this.styles.height / 2, this.styles.triangleWidth, this.styles.triangleHeight, nextEngine.collapsed ? 'right' : 'bottom');
          const { width: titleWidth } = this.renderEngine.ctx.measureText(this.title);
          const buttonWidth = titleWidth + triangleFullWidth;
          this.interactionsEngine.addHitRegion("toggle" /* RegionTypes.TOGGLE */, this.renderEngine.id, 0, 0, buttonWidth, this.styles.height, "pointer" /* CursorTypes.POINTER */);
          if (prevEngine.flexible) {
              this.renderEngine.renderCircle(this.styles.dotsColor, centerW, centerH, 1.5);
              this.renderEngine.renderCircle(this.styles.dotsColor, centerW - 10, centerH, 1.5);
              this.renderEngine.renderCircle(this.styles.dotsColor, centerW + 10, centerH, 1.5);
              this.interactionsEngine.addHitRegion("knob-resize" /* RegionTypes.KNOB_RESIZE */, this.renderEngine.id, buttonWidth, 0, this.renderEngine.width - buttonWidth, this.styles.height, "row-resize" /* CursorTypes.ROW_RESIZE */);
          }
      }
  }

  // eslint-disable-next-line prettier/prettier -- prettier complains about escaping of the " character
  const allChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890_-+()[]{}\\/|\'";:.,?~';
  const checkSafari = () => {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes('safari') ? !ua.includes('chrome') : false;
  };
  function getPixelRatio(context) {
      // Unfortunately using any here, since typescript is not aware of all of the browser prefixes
      const ctx = context;
      const dpr = window.devicePixelRatio || 1;
      const bsr = ctx.webkitBackingStorePixelRatio ||
          ctx.mozBackingStorePixelRatio ||
          ctx.msBackingStorePixelRatio ||
          ctx.oBackingStorePixelRatio ||
          ctx.backingStorePixelRatio ||
          1;
      return dpr / bsr;
  }
  const defaultRenderSettings = {
      tooltip: undefined,
      timeUnits: 'ms',
  };
  const defaultRenderStyles = {
      blockHeight: 16,
      blockPaddingLeftRight: 4,
      backgroundColor: 'white',
      font: '10px sans-serif',
      fontColor: 'black',
      tooltipHeaderFontColor: 'black',
      tooltipBodyFontColor: '#688f45',
      tooltipBackgroundColor: 'white',
      headerHeight: 14,
      headerColor: 'rgba(112, 112, 112, 0.25)',
      headerStrokeColor: 'rgba(112, 112, 112, 0.5)',
      headerTitleLeftPadding: 16,
  };
  class BasicRenderEngine extends EventEmitter {
      constructor(canvas, settings) {
          super();
          this.options = defaultRenderSettings;
          this.timeUnits = 'ms';
          this.styles = defaultRenderStyles;
          this.blockPaddingLeftRight = 0;
          this.blockHeight = 0;
          this.blockPaddingTopBottom = 0;
          this.charHeight = 0;
          this.placeholderWidth = 0;
          this.avgCharWidth = 0;
          this.minTextWidth = 0;
          this.textRenderQueue = [];
          this.strokeRenderQueue = [];
          this.rectRenderQueue = {};
          this.lastUsedColor = null;
          this.lastUsedStrokeColor = null;
          this.zoom = 0;
          this.positionX = 0;
          this.min = 0;
          this.max = 0;
          this.width = canvas.width;
          this.height = canvas.height;
          this.isSafari = checkSafari();
          this.canvas = canvas;
          this.ctx = canvas.getContext('2d', { alpha: false });
          this.pixelRatio = getPixelRatio(this.ctx);
          this.setSettings(settings);
          this.applyCanvasSize();
          this.reset();
      }
      setSettings({ options, styles }) {
          this.options = mergeObjects(defaultRenderSettings, options);
          this.styles = mergeObjects(defaultRenderStyles, styles);
          this.timeUnits = this.options.timeUnits;
          this.blockHeight = this.styles.blockHeight;
          this.ctx.font = this.styles.font;
          const { actualBoundingBoxAscent: fontAscent, actualBoundingBoxDescent: fontDescent, width: allCharsWidth, } = this.ctx.measureText(allChars);
          const { width: placeholderWidth } = this.ctx.measureText('…');
          const fontHeight = fontAscent + fontDescent;
          this.blockPaddingLeftRight = this.styles.blockPaddingLeftRight;
          this.blockPaddingTopBottom = Math.ceil((this.blockHeight - fontHeight) / 2);
          this.charHeight = fontHeight + 1;
          this.placeholderWidth = placeholderWidth;
          this.avgCharWidth = allCharsWidth / allChars.length;
          this.minTextWidth = this.avgCharWidth + this.placeholderWidth;
      }
      reset() {
          this.textRenderQueue = [];
          this.strokeRenderQueue = [];
          this.rectRenderQueue = {};
      }
      setCtxColor(color) {
          if (color && this.lastUsedColor !== color) {
              this.ctx.fillStyle = color;
              this.lastUsedColor = color;
          }
      }
      setStrokeColor(color) {
          if (color && this.lastUsedStrokeColor !== color) {
              this.ctx.strokeStyle = color;
              this.lastUsedStrokeColor = color;
          }
      }
      setCtxFont(font) {
          if (font && this.ctx.font !== font) {
              this.ctx.font = font;
          }
      }
      fillRect(x, y, w, h) {
          this.ctx.fillRect(x, y, w, h);
      }
      fillText(text, x, y) {
          this.ctx.fillText(text, x, y);
      }
      renderBlock(color, x, y, w) {
          this.setCtxColor(color);
          this.ctx.fillRect(x, y, w, this.blockHeight);
      }
      renderStroke(color, x, y, w, h) {
          this.setStrokeColor(color);
          this.ctx.setLineDash([]);
          this.ctx.strokeRect(x, y, w, h);
      }
      clear(w = this.width, h = this.height, x = 0, y = 0) {
          this.ctx.clearRect(x, y, w, h - 1);
          this.setCtxColor(this.styles.backgroundColor);
          this.ctx.fillRect(x, y, w, h);
          this.emit('clear');
      }
      timeToPosition(time) {
          return time * this.zoom - this.positionX * this.zoom;
      }
      pixelToTime(width) {
          return width / this.zoom;
      }
      setZoom(zoom) {
          this.zoom = zoom;
      }
      setPositionX(x) {
          const currentPos = this.positionX;
          this.positionX = x;
          return x - currentPos;
      }
      addRectToRenderQueue(color, x, y, w) {
          if (!this.rectRenderQueue[color]) {
              this.rectRenderQueue[color] = [];
          }
          this.rectRenderQueue[color].push({ x, y, w });
      }
      addTextToRenderQueue(text, x, y, w) {
          if (text) {
              const textMaxWidth = w - (this.blockPaddingLeftRight * 2 - (x < 0 ? x : 0));
              if (textMaxWidth > 0) {
                  this.textRenderQueue.push({ text, x, y, w, textMaxWidth });
              }
          }
      }
      addStrokeToRenderQueue(color, x, y, w, h) {
          this.strokeRenderQueue.push({ color, x, y, w, h });
      }
      resolveRectRenderQueue() {
          Object.entries(this.rectRenderQueue).forEach(([color, items]) => {
              this.setCtxColor(color);
              items.forEach(({ x, y, w }) => this.renderBlock(color, x, y, w));
          });
          this.rectRenderQueue = {};
      }
      resolveTextRenderQueue() {
          this.setCtxColor(this.styles.fontColor);
          this.textRenderQueue.forEach(({ text, x, y, textMaxWidth }) => {
              const { width: textWidth } = this.ctx.measureText(text);
              if (textWidth > textMaxWidth) {
                  const avgCharWidth = textWidth / text.length;
                  const maxChars = Math.floor((textMaxWidth - this.placeholderWidth) / avgCharWidth);
                  const halfChars = (maxChars - 1) / 2;
                  if (halfChars > 0) {
                      text =
                          text.slice(0, Math.ceil(halfChars)) +
                              '…' +
                              text.slice(text.length - Math.floor(halfChars), text.length);
                  }
                  else {
                      text = '';
                  }
              }
              if (text) {
                  this.ctx.fillText(text, (x < 0 ? 0 : x) + this.blockPaddingLeftRight, y + this.blockHeight - this.blockPaddingTopBottom);
              }
          });
          this.textRenderQueue = [];
      }
      resolveStrokeRenderQueue() {
          this.strokeRenderQueue.forEach(({ color, x, y, w, h }) => {
              this.renderStroke(color, x, y, w, h);
          });
          this.strokeRenderQueue = [];
      }
      setMinMax(min, max) {
          const hasChanges = min !== this.min || max !== this.max;
          this.min = min;
          this.max = max;
          if (hasChanges) {
              this.emit('min-max-change', min, max);
          }
      }
      getTimeUnits() {
          return this.timeUnits;
      }
      tryToChangePosition(positionDelta) {
          const realView = this.getRealView();
          if (this.positionX + positionDelta + realView <= this.max && this.positionX + positionDelta >= this.min) {
              this.setPositionX(this.positionX + positionDelta);
          }
          else if (this.positionX + positionDelta <= this.min) {
              this.setPositionX(this.min);
          }
          else if (this.positionX + positionDelta + realView >= this.max) {
              this.setPositionX(this.max - realView);
          }
      }
      getInitialZoom() {
          if (this.max - this.min > 0) {
              return this.width / (this.max - this.min);
          }
          return 1;
      }
      getRealView() {
          return this.width / this.zoom;
      }
      resetView() {
          this.setZoom(this.getInitialZoom());
          this.setPositionX(this.min);
      }
      resize(width, height) {
          const isWidthChanged = typeof width === 'number' && this.width !== width;
          const isHeightChanged = typeof height === 'number' && this.height !== height;
          if (isWidthChanged || isHeightChanged) {
              this.width = isWidthChanged ? width : this.width;
              this.height = isHeightChanged ? height : this.height;
              this.applyCanvasSize();
              this.emit('resize', { width: this.width, height: this.height });
              return isHeightChanged;
          }
          return false;
      }
      applyCanvasSize() {
          this.canvas.style.backgroundColor = 'white';
          this.canvas.style.overflow = 'hidden';
          this.canvas.style.width = this.width + 'px';
          this.canvas.style.height = this.height + 'px';
          this.canvas.width = this.width * this.pixelRatio;
          this.canvas.height = this.height * this.pixelRatio;
          this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
          this.ctx.font = this.styles.font;
          this.lastUsedColor = null;
          this.lastUsedStrokeColor = null;
      }
      copy(engine) {
          const ratio = this.isSafari ? 1 : engine.pixelRatio;
          if (engine.canvas.height) {
              this.ctx.drawImage(engine.canvas, 0, 0, engine.canvas.width * ratio, engine.canvas.height * ratio, 0, engine.position || 0, engine.width * ratio, engine.height * ratio);
          }
      }
      renderTooltipFromData(fields, mouse) {
          const mouseX = mouse.x + 10;
          const mouseY = mouse.y + 10;
          const maxWidth = fields
              .map(({ text }) => text)
              .map((text) => this.ctx.measureText(text))
              .reduce((acc, { width }) => Math.max(acc, width), 0);
          const fullWidth = maxWidth + this.blockPaddingLeftRight * 2;
          this.ctx.shadowColor = 'black';
          this.ctx.shadowBlur = 5;
          this.setCtxColor(this.styles.tooltipBackgroundColor);
          this.ctx.fillRect(mouseX, mouseY, fullWidth + this.blockPaddingLeftRight * 2, (this.charHeight + 2) * fields.length + this.blockPaddingLeftRight * 2);
          this.ctx.shadowColor = 'transparent';
          this.ctx.shadowBlur = 0;
          fields.forEach(({ text, color }, index) => {
              if (color) {
                  this.setCtxColor(color);
              }
              else if (!index) {
                  this.setCtxColor(this.styles.tooltipHeaderFontColor);
              }
              else {
                  this.setCtxColor(this.styles.tooltipBodyFontColor);
              }
              this.ctx.fillText(text, mouseX + this.blockPaddingLeftRight, mouseY + this.blockHeight - this.blockPaddingTopBottom + (this.charHeight + 2) * index);
          });
      }
      renderShape(color, dots, posX, posY) {
          this.setCtxColor(color);
          this.ctx.beginPath();
          this.ctx.moveTo(dots[0].x + posX, dots[0].y + posY);
          dots.slice(1).forEach(({ x, y }) => this.ctx.lineTo(x + posX, y + posY));
          this.ctx.closePath();
          this.ctx.fill();
      }
      renderTriangle(color, x, y, width, height, direction) {
          const halfHeight = height / 2;
          const halfWidth = width / 2;
          let dots;
          switch (direction) {
              case 'top':
                  dots = [
                      { x: 0 - halfWidth, y: halfHeight },
                      { x: 0, y: 0 - halfHeight },
                      { x: halfWidth, y: halfHeight },
                  ];
                  break;
              case 'right':
                  dots = [
                      { x: 0 - halfHeight, y: 0 - halfWidth },
                      { x: 0 - halfHeight, y: halfWidth },
                      { x: halfHeight, y: 0 },
                  ];
                  break;
              case 'bottom':
                  dots = [
                      { x: 0 - halfWidth, y: 0 - halfHeight },
                      { x: halfWidth, y: 0 - halfHeight },
                      { x: 0, y: halfHeight },
                  ];
                  break;
              case 'left':
                  dots = [
                      { x: halfHeight, y: 0 - halfWidth },
                      { x: halfHeight, y: halfWidth },
                      { x: 0 - halfHeight, y: 0 },
                  ];
                  break;
          }
          this.renderShape(color, dots, x, y);
      }
      renderCircle(color, x, y, radius) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
          this.setCtxColor(color);
          this.ctx.fill();
      }
  }

  class OffscreenRenderEngine extends BasicRenderEngine {
      constructor({ width, height, parent, id }) {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          super(canvas, { options: parent.options, styles: parent.styles });
          this.flexible = false;
          this.collapsed = false;
          this.position = 0;
          this.width = width;
          this.height = height;
          this.parent = parent;
          this.id = id;
          this.children = [];
          this.applyCanvasSize();
      }
      makeChild() {
          const child = new OffscreenRenderEngine({
              width: this.width,
              height: this.height,
              parent: this.parent,
              id: void 0,
          });
          this.children.push(child);
          child.setMinMax(this.min, this.max);
          child.resetView();
          return child;
      }
      setFlexible() {
          this.flexible = true;
      }
      collapse() {
          this.collapsed = true;
          this.clear();
      }
      expand() {
          this.collapsed = false;
      }
      setSettingsOverrides(settings) {
          this.setSettings({
              styles: mergeObjects(this.styles, settings.styles),
              options: mergeObjects(this.options, settings.options),
          });
          this.children.forEach((child) => child.setSettingsOverrides(settings));
      }
      // @ts-ignore - overrides a parent function which has different signature
      resize({ width, height, position }, isParentCall) {
          const isHeightChanged = super.resize(width, height);
          if (!isParentCall && isHeightChanged) {
              this.parent.recalcChildrenSizes();
          }
          if (typeof position === 'number') {
              this.position = position;
          }
          this.children.forEach((child) => child.resize({ width, height, position }));
      }
      setMinMax(min, max) {
          super.setMinMax(min, max);
          this.children.forEach((child) => child.setMinMax(min, max));
      }
      setSettings(settings) {
          super.setSettings(settings);
          if (this.children) {
              this.children.forEach((child) => child.setSettings(settings));
          }
      }
      tryToChangePosition(positionDelta) {
          this.parent.tryToChangePosition(positionDelta);
      }
      recalcMinMax() {
          this.parent.calcMinMax();
      }
      getTimeUnits() {
          return this.parent.getTimeUnits();
      }
      getAccuracy() {
          return this.parent.timeGrid.accuracy;
      }
      renderTimeGrid() {
          this.parent.timeGrid.renderLines(0, this.height, this);
      }
      renderTimeGridTimes() {
          this.parent.timeGrid.renderTimes(this);
      }
      standardRender() {
          this.resolveRectRenderQueue();
          this.resolveTextRenderQueue();
          this.resolveStrokeRenderQueue();
          this.renderTimeGrid();
      }
      renderTooltipFromData(fields, mouse) {
          this.parent.renderTooltipFromData(fields, mouse);
      }
      resetParentView() {
          this.parent.resetView();
          this.parent.render();
      }
      render() {
          this.parent.partialRender(this.id);
      }
  }

  const MAX_ACCURACY = 6;
  class RenderEngine extends BasicRenderEngine {
      constructor({ canvas, settings, timeGrid, plugins }) {
          super(canvas, settings);
          this.freeSpace = 0;
          this.lastPartialAnimationFrame = null;
          this.lastGlobalAnimationFrame = null;
          this.plugins = plugins;
          this.children = [];
          this.requestedRenders = [];
          this.timeGrid = timeGrid;
          this.timeGrid.setDefaultRenderEngine(this);
      }
      makeInstance() {
          const offscreenRenderEngine = new OffscreenRenderEngine({
              width: this.width,
              height: 0,
              id: this.children.length,
              parent: this,
          });
          offscreenRenderEngine.setMinMax(this.min, this.max);
          offscreenRenderEngine.resetView();
          this.children.push(offscreenRenderEngine);
          return offscreenRenderEngine;
      }
      calcMinMax() {
          const min = this.plugins
              .map(({ min }) => min)
              .filter(isNumber)
              .reduce((acc, min) => Math.min(acc, min));
          const max = this.plugins
              .map(({ max }) => max)
              .filter(isNumber)
              .reduce((acc, max) => Math.max(acc, max));
          this.setMinMax(min, max);
      }
      calcTimeGrid() {
          this.timeGrid.recalc();
      }
      setMinMax(min, max) {
          super.setMinMax(min, max);
          this.children.forEach((engine) => engine.setMinMax(min, max));
      }
      setSettings(data) {
          super.setSettings(data);
          if (this.children) {
              this.children.forEach((engine) => engine.setSettings(data));
              this.recalcChildrenSizes();
          }
      }
      resize(width, height) {
          const currentWidth = this.width;
          super.resize(width, height);
          this.recalcChildrenSizes();
          if (this.getInitialZoom() > this.zoom) {
              this.resetView();
          }
          else if (this.positionX > this.min) {
              this.tryToChangePosition(-this.pixelToTime((width - currentWidth) / 2));
          }
          return true;
      }
      recalcChildrenSizes() {
          const childrenSizes = this.getChildrenSizes();
          this.freeSpace = childrenSizes.reduce((acc, { height }) => acc - height, this.height);
          this.children.forEach((engine, index) => {
              engine.resize(childrenSizes[index], true);
          });
      }
      getChildrenSizes() {
          const indexes = this.children.map((_, index) => index);
          const enginesTypes = indexes.map((index) => {
              const plugin = this.plugins[index];
              const engine = this.children[index];
              if (engine.flexible && plugin.height) {
                  return 'flexibleStatic';
              }
              else if (!plugin.height) {
                  return 'flexibleGrowing';
              }
              return 'static';
          });
          const freeSpace = enginesTypes.reduce((acc, type, index) => {
              var _a, _b;
              const plugin = this.plugins[index];
              const engine = this.children[index];
              if (engine.collapsed) {
                  return acc;
              }
              else if (type === 'flexibleGrowing') {
                  return acc - (engine.height || 0);
              }
              else if (type === 'flexibleStatic') {
                  return acc - ((engine === null || engine === void 0 ? void 0 : engine.height) || (plugin === null || plugin === void 0 ? void 0 : plugin.height) || 0);
              }
              else if (type === 'static') {
                  return acc - ((_b = (_a = this.plugins[index]) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0);
              }
              return acc;
          }, this.height);
          const flexibleGrowingCount = enginesTypes.filter((type) => type === 'flexibleGrowing').length;
          const freeSpacePart = Math.floor(freeSpace / flexibleGrowingCount);
          return enginesTypes.reduce((acc, type, index) => {
              var _a, _b;
              const engine = this.children[index];
              const plugin = this.plugins[index];
              let height = 0;
              if (engine.collapsed) {
                  height = 0;
              }
              else {
                  switch (type) {
                      case 'static':
                          height = (_a = plugin.height) !== null && _a !== void 0 ? _a : 0;
                          break;
                      case 'flexibleGrowing':
                          height = (engine.height || 0) + freeSpacePart;
                          break;
                      case 'flexibleStatic':
                          height = (_b = (engine.height || this.plugins[index].height)) !== null && _b !== void 0 ? _b : 0;
                          break;
                  }
              }
              acc.result.push({
                  width: this.width,
                  position: acc.position,
                  height,
              });
              acc.position += height;
              return acc;
          }, {
              position: 0,
              result: [],
          }).result;
      }
      getAccuracy() {
          return this.timeGrid.accuracy;
      }
      setZoom(zoom) {
          if (this.getAccuracy() < MAX_ACCURACY || zoom <= this.zoom) {
              super.setZoom(zoom);
              this.children.forEach((engine) => engine.setZoom(zoom));
              return true;
          }
          return false;
      }
      setPositionX(x) {
          const res = super.setPositionX(x);
          this.children.forEach((engine) => engine.setPositionX(x));
          return res;
      }
      renderPlugin(index) {
          var _a;
          const plugin = this.plugins[index];
          const engine = this.children[index];
          engine === null || engine === void 0 ? void 0 : engine.clear();
          if (!engine.collapsed) {
              const isFullRendered = (_a = plugin === null || plugin === void 0 ? void 0 : plugin.render) === null || _a === void 0 ? void 0 : _a.call(plugin);
              if (!isFullRendered) {
                  engine.standardRender();
              }
          }
      }
      partialRender(id) {
          if (typeof id === 'number') {
              this.requestedRenders.push(id);
          }
          if (!this.lastPartialAnimationFrame) {
              this.lastPartialAnimationFrame = requestAnimationFrame(() => {
                  this.requestedRenders.forEach((index) => this.renderPlugin(index));
                  this.shallowRender();
                  this.requestedRenders = [];
                  this.lastPartialAnimationFrame = null;
              });
          }
      }
      shallowRender() {
          this.clear();
          this.timeGrid.renderLines(this.height - this.freeSpace, this.freeSpace);
          this.children.forEach((engine) => {
              if (!engine.collapsed) {
                  this.copy(engine);
              }
          });
          let tooltipRendered = false;
          this.plugins.forEach((plugin) => {
              if (plugin.postRender) {
                  plugin.postRender();
              }
              if (plugin.renderTooltip) {
                  tooltipRendered = tooltipRendered || Boolean(plugin.renderTooltip());
              }
          });
          if (!tooltipRendered && typeof this.options.tooltip === 'function') {
              // notify tooltip of nothing to render
              this.options.tooltip(null, this, null);
          }
      }
      render() {
          if (typeof this.lastPartialAnimationFrame === 'number') {
              cancelAnimationFrame(this.lastPartialAnimationFrame);
          }
          this.requestedRenders = [];
          this.lastPartialAnimationFrame = null;
          if (!this.lastGlobalAnimationFrame) {
              this.lastGlobalAnimationFrame = requestAnimationFrame(() => {
                  this.timeGrid.recalc();
                  this.children.forEach((_, index) => this.renderPlugin(index));
                  this.shallowRender();
                  this.lastGlobalAnimationFrame = null;
              });
          }
      }
  }

  const EVENT_NAMES = ['down', 'up', 'move', 'click', 'select'];

  class SeparatedInteractionsEngine extends EventEmitter {
      static getId() {
          return SeparatedInteractionsEngine.count++;
      }
      constructor(parent, renderEngine) {
          super();
          this.id = SeparatedInteractionsEngine.getId();
          this.parent = parent;
          this.renderEngine = renderEngine;
          renderEngine.on('clear', () => this.clearHitRegions());
          EVENT_NAMES.forEach((eventName) => parent.on(eventName, (region, mouse, isClick) => {
              if (!region || region.id === this.id) {
                  this.resend(eventName, region, mouse, isClick);
              }
          }));
          ['hover'].forEach((eventName) => parent.on(eventName, (region, mouse) => {
              if (!region || region.id === this.id) {
                  this.emit(eventName, region, mouse);
              }
          }));
          parent.on('change-position', (data, startMouse, endMouse, instance) => {
              if (instance === this) {
                  this.emit('change-position', data, startMouse, endMouse);
              }
          });
          this.hitRegions = [];
      }
      resend(event, ...args) {
          if (this.renderEngine.position <= this.parent.mouse.y &&
              this.renderEngine.height + this.renderEngine.position >= this.parent.mouse.y) {
              this.emit(event, ...args);
          }
      }
      getMouse() {
          const { x, y } = this.parent.mouse;
          return {
              x,
              y: y - this.renderEngine.position,
          };
      }
      getGlobalMouse() {
          return this.parent.mouse;
      }
      clearHitRegions() {
          this.hitRegions = [];
      }
      addHitRegion(type, data, x, y, w, h, cursor) {
          this.hitRegions.push({
              type,
              data,
              x,
              y,
              w,
              h,
              cursor,
              id: this.id,
          });
      }
      setCursor(cursor) {
          this.parent.setCursor(cursor);
      }
      clearCursor() {
          this.parent.clearCursor();
      }
  }
  SeparatedInteractionsEngine.count = 0;

  class InteractionsEngine extends EventEmitter {
      constructor(canvas, renderEngine) {
          super();
          this.selectedRegion = null;
          this.hoveredRegion = null;
          this.moveActive = false;
          this.currentCursor = null;
          this.renderEngine = renderEngine;
          this.canvas = canvas;
          this.hitRegions = [];
          this.instances = [];
          this.mouse = {
              x: 0,
              y: 0,
          };
          this.handleMouseWheel = this.handleMouseWheel.bind(this);
          this.handleMouseDown = this.handleMouseDown.bind(this);
          this.handleMouseUp = this.handleMouseUp.bind(this);
          this.handleMouseMove = this.handleMouseMove.bind(this);
          this.initListeners();
          this.reset();
      }
      makeInstance(renderEngine) {
          const separatedInteractionsEngine = new SeparatedInteractionsEngine(this, renderEngine);
          this.instances.push(separatedInteractionsEngine);
          return separatedInteractionsEngine;
      }
      reset() {
          this.selectedRegion = null;
          this.hoveredRegion = null;
          this.hitRegions = [];
      }
      destroy() {
          this.removeListeners();
      }
      initListeners() {
          if (this.canvas) {
              this.canvas.addEventListener('wheel', this.handleMouseWheel);
              this.canvas.addEventListener('mousedown', this.handleMouseDown);
              this.canvas.addEventListener('mouseup', this.handleMouseUp);
              this.canvas.addEventListener('mouseleave', this.handleMouseUp);
              this.canvas.addEventListener('mousemove', this.handleMouseMove);
          }
      }
      removeListeners() {
          if (this.canvas) {
              this.canvas.removeEventListener('wheel', this.handleMouseWheel);
              this.canvas.removeEventListener('mousedown', this.handleMouseDown);
              this.canvas.removeEventListener('mouseup', this.handleMouseUp);
              this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
              this.canvas.removeEventListener('mousemove', this.handleMouseMove);
          }
      }
      handleMouseWheel(e) {
          const { deltaY, deltaX } = e;
          e.preventDefault();
          const realView = this.renderEngine.getRealView();
          const initialZoom = this.renderEngine.getInitialZoom();
          const startPosition = this.renderEngine.positionX;
          const startZoom = this.renderEngine.zoom;
          const positionScrollDelta = deltaX / this.renderEngine.zoom;
          let zoomDelta = (deltaY / 1000) * this.renderEngine.zoom;
          this.renderEngine.tryToChangePosition(positionScrollDelta);
          zoomDelta =
              this.renderEngine.zoom - zoomDelta >= initialZoom ? zoomDelta : this.renderEngine.zoom - initialZoom;
          if (zoomDelta !== 0) {
              const zoomed = this.renderEngine.setZoom(this.renderEngine.zoom - zoomDelta);
              if (zoomed) {
                  const proportion = this.mouse.x / this.renderEngine.width;
                  const timeDelta = realView - this.renderEngine.width / this.renderEngine.zoom;
                  const positionDelta = timeDelta * proportion;
                  this.renderEngine.tryToChangePosition(positionDelta);
              }
          }
          this.checkRegionHover();
          if (startPosition !== this.renderEngine.positionX || startZoom !== this.renderEngine.zoom) {
              this.renderEngine.render();
          }
      }
      handleMouseDown() {
          this.moveActive = true;
          this.mouseDownPosition = {
              x: this.mouse.x,
              y: this.mouse.y,
          };
          this.mouseDownHoveredInstance = this.hoveredInstance;
          this.emit('down', this.hoveredRegion, this.mouse);
      }
      handleMouseUp() {
          this.moveActive = false;
          const isClick = this.mouseDownPosition &&
              this.mouseDownPosition.x === this.mouse.x &&
              this.mouseDownPosition.y === this.mouse.y;
          if (isClick) {
              this.handleRegionHit();
          }
          this.emit('up', this.hoveredRegion, this.mouse, isClick);
          if (isClick) {
              this.emit('click', this.hoveredRegion, this.mouse);
          }
      }
      handleMouseMove(e) {
          if (this.moveActive) {
              const mouseDeltaY = this.mouse.y - e.offsetY;
              const mouseDeltaX = (this.mouse.x - e.offsetX) / this.renderEngine.zoom;
              if (mouseDeltaY || mouseDeltaX) {
                  this.emit('change-position', {
                      deltaX: mouseDeltaX,
                      deltaY: mouseDeltaY,
                  }, this.mouseDownPosition, this.mouse, this.mouseDownHoveredInstance);
              }
          }
          this.mouse.x = e.offsetX;
          this.mouse.y = e.offsetY;
          this.checkRegionHover();
          this.emit('move', this.hoveredRegion, this.mouse);
      }
      handleRegionHit() {
          const selectedRegion = this.getHoveredRegion();
          this.emit('select', selectedRegion, this.mouse);
      }
      checkRegionHover() {
          const hoveredRegion = this.getHoveredRegion();
          if (hoveredRegion) {
              if (!this.currentCursor && hoveredRegion.cursor) {
                  this.renderEngine.canvas.style.cursor = hoveredRegion.cursor;
              }
              else if (!this.currentCursor) {
                  this.clearCursor();
              }
              this.hoveredRegion = hoveredRegion;
              this.emit('hover', hoveredRegion, this.mouse);
              this.renderEngine.partialRender();
          }
          else if (this.hoveredRegion && !hoveredRegion) {
              if (!this.currentCursor) {
                  this.clearCursor();
              }
              this.hoveredRegion = null;
              this.emit('hover', null, this.mouse);
              this.renderEngine.partialRender();
          }
      }
      getHoveredRegion() {
          const hoveredRegion = this.hitRegions.find(({ x, y, w, h }) => this.mouse.x >= x && this.mouse.x <= x + w && this.mouse.y >= y && this.mouse.y <= y + h);
          if (hoveredRegion) {
              return hoveredRegion;
          }
          const hoveredInstance = this.instances.find(({ renderEngine }) => renderEngine.position <= this.mouse.y && renderEngine.height + renderEngine.position >= this.mouse.y);
          this.hoveredInstance = hoveredInstance;
          if (hoveredInstance) {
              const offsetTop = hoveredInstance.renderEngine.position;
              return hoveredInstance.hitRegions.find(({ x, y, w, h }) => this.mouse.x >= x &&
                  this.mouse.x <= x + w &&
                  this.mouse.y >= y + offsetTop &&
                  this.mouse.y <= y + h + offsetTop);
          }
          return null;
      }
      clearHitRegions() {
          this.hitRegions = [];
      }
      addHitRegion(type, data, x, y, w, h, cursor) {
          this.hitRegions.push({
              type,
              data,
              x,
              y,
              w,
              h,
              cursor,
          });
      }
      setCursor(cursor) {
          this.renderEngine.canvas.style.cursor = cursor;
          this.currentCursor = cursor;
      }
      clearCursor() {
          const hoveredRegion = this.getHoveredRegion();
          this.currentCursor = null;
          if (hoveredRegion === null || hoveredRegion === void 0 ? void 0 : hoveredRegion.cursor) {
              this.renderEngine.canvas.style.cursor = hoveredRegion.cursor;
          }
          else {
              this.renderEngine.canvas.style.cursor = '';
          }
      }
  }

  class FlameChartContainer extends EventEmitter {
      constructor({ canvas, plugins, settings }) {
          var _a;
          super();
          const styles = (_a = settings === null || settings === void 0 ? void 0 : settings.styles) !== null && _a !== void 0 ? _a : {};
          this.timeGrid = new TimeGrid({ styles: styles === null || styles === void 0 ? void 0 : styles.timeGrid });
          this.renderEngine = new RenderEngine({
              canvas,
              settings: {
                  styles: styles === null || styles === void 0 ? void 0 : styles.main,
                  options: settings.options,
              },
              plugins,
              timeGrid: this.timeGrid,
          });
          this.interactionsEngine = new InteractionsEngine(canvas, this.renderEngine);
          this.plugins = plugins;
          const children = Array(this.plugins.length)
              .fill(null)
              .map(() => {
              const renderEngine = this.renderEngine.makeInstance();
              const interactionsEngine = this.interactionsEngine.makeInstance(renderEngine);
              return { renderEngine, interactionsEngine };
          });
          this.plugins.forEach((plugin, index) => {
              plugin.init(children[index].renderEngine, children[index].interactionsEngine);
          });
          this.renderEngine.calcMinMax();
          this.renderEngine.resetView();
          this.renderEngine.recalcChildrenSizes();
          this.renderEngine.calcTimeGrid();
          this.plugins.forEach((plugin) => { var _a; return (_a = plugin.postInit) === null || _a === void 0 ? void 0 : _a.call(plugin); });
          this.renderEngine.render();
      }
      render() {
          this.renderEngine.render();
      }
      resize(width, height) {
          this.renderEngine.resize(width, height);
          this.renderEngine.render();
      }
      execOnPlugins(fnName, ...args) {
          let index = 0;
          while (index < this.plugins.length) {
              if (this.plugins[index][fnName]) {
                  this.plugins[index][fnName](...args);
              }
              index++;
          }
      }
      setSettings(settings) {
          var _a, _b;
          this.timeGrid.setSettings({ styles: (_a = settings.styles) === null || _a === void 0 ? void 0 : _a.timeGrid });
          this.renderEngine.setSettings({ options: settings.options, styles: (_b = settings.styles) === null || _b === void 0 ? void 0 : _b.main });
          this.plugins.forEach((plugin) => { var _a, _b; return (_a = plugin.setSettings) === null || _a === void 0 ? void 0 : _a.call(plugin, { styles: (_b = settings.styles) === null || _b === void 0 ? void 0 : _b[plugin.name] }); });
          this.renderEngine.render();
      }
      setZoom(start, end) {
          const zoom = this.renderEngine.width / (end - start);
          this.renderEngine.setPositionX(start);
          this.renderEngine.setZoom(zoom);
          this.renderEngine.render();
      }
  }

  const defaultSettings = {};
  class FlameChart extends FlameChartContainer {
      constructor({ canvas, data, marks, waterfall, colors, settings = defaultSettings, plugins = [], }) {
          var _a;
          const activePlugins = [];
          const { headers: { waterfall: waterfallName = 'waterfall', flameChart: flameChartName = 'flame chart' } = {} } = settings;
          const styles = (_a = settings === null || settings === void 0 ? void 0 : settings.styles) !== null && _a !== void 0 ? _a : {};
          const timeGridPlugin = new TimeGridPlugin({ styles: styles === null || styles === void 0 ? void 0 : styles.timeGridPlugin });
          activePlugins.push(timeGridPlugin);
          let marksPlugin;
          let waterfallPlugin;
          let timeframeSelectorPlugin;
          let flameChartPlugin;
          if (marks) {
              marksPlugin = new MarksPlugin({ data: marks });
              marksPlugin.on('select', (node, type) => this.emit('select', node, type));
              activePlugins.push(marksPlugin);
          }
          if (waterfall) {
              waterfallPlugin = new WaterfallPlugin({ data: waterfall, settings: { styles: styles === null || styles === void 0 ? void 0 : styles.waterfallPlugin } });
              waterfallPlugin.on('select', (node, type) => this.emit('select', node, type));
              if (data) {
                  activePlugins.push(new TogglePlugin(waterfallName, { styles: styles === null || styles === void 0 ? void 0 : styles.togglePlugin }));
              }
              activePlugins.push(waterfallPlugin);
          }
          if (data) {
              timeframeSelectorPlugin = new TimeframeSelectorPlugin({
                  data,
                  settings: { styles: styles === null || styles === void 0 ? void 0 : styles.timeframeSelectorPlugin },
              });
              flameChartPlugin = new FlameChartPlugin({ data, colors });
              flameChartPlugin.on('select', (node, type) => this.emit('select', node, type));
              if (waterfall) {
                  activePlugins.push(new TogglePlugin(flameChartName, { styles: styles === null || styles === void 0 ? void 0 : styles.togglePlugin }));
              }
              activePlugins.push(flameChartPlugin);
              activePlugins.unshift(timeframeSelectorPlugin);
          }
          super({
              canvas,
              settings,
              plugins: [...activePlugins, ...plugins],
          });
          if (flameChartPlugin && timeframeSelectorPlugin) {
              this.setData = (data) => {
                  if (flameChartPlugin) {
                      flameChartPlugin.setData(data);
                  }
                  if (timeframeSelectorPlugin) {
                      timeframeSelectorPlugin.setData(data);
                  }
              };
              this.setFlameChartPosition = ({ x, y }) => {
                  if (typeof x === 'number') {
                      this.renderEngine.setPositionX(x);
                  }
                  if (typeof y === 'number' && flameChartPlugin) {
                      flameChartPlugin.setPositionY(y);
                  }
                  this.renderEngine.render();
              };
          }
          if (marksPlugin) {
              this.setMarks = (data) => {
                  if (marksPlugin) {
                      marksPlugin.setMarks(data);
                  }
              };
          }
          if (waterfallPlugin) {
              this.setWaterfall = (data) => {
                  if (waterfallPlugin) {
                      waterfallPlugin.setData(data);
                  }
              };
          }
      }
  }

  const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
  const randomString = (length, minLength = 4) => {
      const rndLength = rnd(length, minLength);
      let str = '';
      for (let i = rndLength; i--;) {
          str += chars[rnd(chars.length - 1)];
      }
      return str;
  };
  const rnd = (max, min = 0) => Math.round(Math.random() * (max - min)) + min;
  const rndFloat = (max, min = 0) => Math.random() * (max - min) + min;
  const generateRandomLevel = (count, minChild = 1, maxChild = 10) => {
      const childrenCount = count ? rnd(Math.min(count, maxChild), Math.min(count, minChild)) : 0;
      const children = Array(childrenCount)
          .fill(null)
          .map(() => ({ children: [] }));
      const rest = count - childrenCount;
      return {
          rest,
          children,
      };
  };
  const generateRandomNesting = (count, minChild, maxChild) => {
      const levels = [];
      let rest = count;
      let isStopped = false;
      while (rest > 0 && !isStopped) {
          if (!levels.length) {
              const layer = generateRandomLevel(rest, Math.min(minChild, 1), maxChild);
              levels.push([layer.children]);
              rest = layer.rest;
          }
          else {
              const level = levels[levels.length - 1];
              const innerLevel = [];
              level.forEach((subLevel) => {
                  subLevel.forEach((subSubLevel) => {
                      const layer = generateRandomLevel(rest, minChild, maxChild);
                      subSubLevel.children = layer.children;
                      rest = layer.rest;
                      innerLevel.push(layer.children);
                  });
              });
              if (!innerLevel.length) {
                  isStopped = true;
              }
              else {
                  levels.push(innerLevel);
              }
          }
      }
      console.log('Total count:', levels.reduce((acc, level) => level.reduce((acc, subLevel) => acc + subLevel.length, acc), 0));
      return levels[0][0];
  };
  const map = (nodes, cb, parent) => {
      return cb(nodes, parent).map((item) => {
          item.children = item.children ? map(item.children, cb, item) : [];
          return item;
      });
  };
  const generateRandomTree = ({ count, start, end, minChild, maxChild, thinning, colorsMonotony, colorsCount, }) => {
      const rootNodes = generateRandomNesting(count, minChild, maxChild);
      const types = Array(colorsCount)
          .fill(null)
          .map(() => randomString(10));
      let counter = 0;
      let typesCounter = 0;
      let currentType = types[typesCounter];
      const mappedNestingArrays = map(rootNodes, (nodes, parent) => {
          const itemsCount = nodes.length;
          const innerStart = (parent === null || parent === void 0 ? void 0 : parent.start) ? parent.start : start;
          const innerEnd = typeof (parent === null || parent === void 0 ? void 0 : parent.duration) === 'number' ? innerStart + (parent === null || parent === void 0 ? void 0 : parent.duration) : end;
          const timestamps = itemsCount > 1
              ? Array(itemsCount - 1)
                  .fill(null)
                  .map(() => rndFloat(innerStart, innerEnd))
                  .concat(innerStart, innerEnd)
                  .sort((a, b) => a - b)
              : [innerStart, innerEnd];
          nodes.forEach((item, index) => {
              const currentWindow = timestamps[index + 1] - timestamps[index];
              if (counter > colorsMonotony) {
                  counter = 0;
                  currentType = types[typesCounter];
                  typesCounter++;
                  if (typesCounter >= types.length) {
                      typesCounter = 0;
                  }
              }
              const start = timestamps[index] + rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
              const end = timestamps[index + 1] - rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
              item.start = start;
              item.duration = end - start;
              item.name = randomString(14);
              item.type = currentType;
              counter++;
          });
          return nodes;
      });
      console.log('[generateRandomTree]', mappedNestingArrays);
      return mappedNestingArrays;
  };
  const waterfallItems = [
      {
          name: 'foo',
          intervals: 'default',
          timing: {
              requestStart: 2050,
              responseStart: 2500,
              responseEnd: 2600,
          },
      },
      {
          name: 'bar',
          intervals: 'default',
          timing: {
              requestStart: 2120,
              responseStart: 2180,
              responseEnd: 2300,
          },
      },
      {
          name: 'bar2',
          intervals: 'default',
          timing: {
              requestStart: 2120,
              responseStart: 2180,
              responseEnd: 2300,
          },
      },
      {
          name: 'bar3',
          intervals: 'default',
          timing: {
              requestStart: 2130,
              responseStart: 2180,
              responseEnd: 2320,
          },
      },
      {
          name: 'bar4',
          intervals: 'default',
          timing: {
              requestStart: 2300,
              responseStart: 2350,
              responseEnd: 2400,
          },
      },
      {
          name: 'bar5',
          intervals: 'default',
          timing: {
              requestStart: 2500,
              responseStart: 2520,
              responseEnd: 2550,
          },
      },
  ];
  const waterfallIntervals = {
      default: [
          {
              name: 'waiting',
              color: 'rgb(207,196,152)',
              type: 'block',
              start: 'requestStart',
              end: 'responseStart',
          },
          {
              name: 'downloading',
              color: 'rgb(207,180,81)',
              type: 'block',
              start: 'responseStart',
              end: 'responseEnd',
          },
      ],
  };
  const marks = [
      {
          shortName: 'DCL',
          fullName: 'DOMContentLoaded',
          timestamp: 2000,
          color: '#d7c44c',
      },
      {
          shortName: 'LE',
          fullName: 'LoadEvent',
          timestamp: 2100,
          color: '#4fd24a',
      },
      {
          shortName: 'TTI',
          fullName: 'Time To Interactive',
          timestamp: 3000,
          color: '#4b7ad7',
      },
  ];

  const query = location.search;
  const initQuery = (flameChart) => {
      if (query) {
          const args = query
              .split('?')
              .map((arg) => arg.split('='))
              .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
          }, {});
          if (args['file']) {
              fetch(decodeURIComponent(args['file']), {
                  method: 'GET',
                  mode: 'no-cors',
              })
                  .then((res) => res.text())
                  .then((data) => {
                  flameChart.setData(JSON.parse(data));
                  flameChart.renderEngine.resetView();
              });
          }
      }
  };

  const wrapper = document.getElementById('wrapper');
  const canvas$1 = document.getElementById('canvas');
  const nodeView = document.getElementById('selected-node');
  const dataInputsContainer = document.getElementById('data-inputs');
  const stylesInputsContainer = document.getElementById('styles-inputs');
  const updateStylesButton = document.getElementById('update-styles-button');
  const updateButton = document.getElementById('update-button');
  const exportButton = document.getElementById('export-button');
  const importButton = document.getElementById('import-button');
  const importInput = document.getElementById('import-input');
  const customStyles = {};
  const createInput = ({ name, units, value, type = 'number' }, prefix) => {
      const input = document.createElement('input');
      const label = document.createElement('label');
      const div = document.createElement('div');
      const id = (prefix ? prefix + '-' : '') + name;
      div.classList.add('inputWrapper');
      label.classList.add('inputLabel');
      label.setAttribute('for', id);
      label.innerHTML = `${name}${units ? `(${units})` : ''}:`;
      input.id = id;
      input.value = value;
      input.classList.add('input');
      input.setAttribute('type', type);
      div.appendChild(label);
      div.appendChild(input);
      return {
          div,
          input,
          label,
      };
  };
  const addInputs = (inputsContainer, inputsDict) => {
      const fragment = document.createDocumentFragment();
      inputsDict.forEach((item, index) => {
          const { div, input } = createInput(item);
          input.addEventListener('change', (e) => (inputsDict[index].value = parseInt(e.target.value)));
          fragment.appendChild(div);
      });
      inputsContainer.appendChild(fragment);
  };
  const addStylesInputs = (inputsContainer, styles) => {
      const fragment = document.createDocumentFragment();
      Object.entries(styles).forEach(([key, value]) => {
          customStyles[key] = {
              ...value,
          };
      });
      Object.entries(styles).forEach(([component, stylesBlock]) => {
          const title = document.createElement('div');
          title.innerHTML = component;
          title.classList.add('inputsTitle');
          fragment.appendChild(title);
          Object.entries(stylesBlock).forEach(([styleName, value]) => {
              const isNumber = typeof value === 'number';
              const { input, div } = createInput({
                  name: styleName,
                  units: '',
                  value,
                  type: isNumber ? 'number' : 'text',
              }, component);
              input.addEventListener('change', (e) => {
                  const value = e.target.value;
                  customStyles[component][styleName] = isNumber ? parseInt(value) : value;
              });
              fragment.appendChild(div);
          });
      });
      inputsContainer.appendChild(fragment);
  };
  importButton === null || importButton === void 0 ? void 0 : importButton.addEventListener('click', () => {
      importInput === null || importInput === void 0 ? void 0 : importInput.click();
  });
  const download = (content, fileName, contentType) => {
      const a = document.createElement('a');
      const file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
  };
  const initView = (config, styles) => {
      addInputs(dataInputsContainer, config);
      addStylesInputs(stylesInputsContainer, styles);
  };
  const getInputValues = (config) => {
      return config.reduce((acc, { name, value }) => {
          acc[name] = value;
          return acc;
      }, {});
  };
  const setNodeView = (text) => {
      if (nodeView !== null) {
          nodeView.innerHTML = text;
      }
  };
  const onApplyStyles = (cb) => {
      updateStylesButton === null || updateStylesButton === void 0 ? void 0 : updateStylesButton.addEventListener('click', () => {
          cb(customStyles);
      });
  };
  const onUpdate = (cb) => {
      updateButton === null || updateButton === void 0 ? void 0 : updateButton.addEventListener('click', () => {
          updateButton.innerHTML = 'Generating...';
          updateButton.setAttribute('disabled', 'true');
          setTimeout(() => {
              cb();
              updateButton.removeAttribute('disabled');
              updateButton.innerHTML = 'Generate random tree';
          }, 1);
      });
  };
  const onExport = (cb) => {
      exportButton === null || exportButton === void 0 ? void 0 : exportButton.addEventListener('click', () => {
          const data = cb();
          download(data, 'data.json', 'application/json');
      });
  };
  const onImport = (cb) => {
      importInput === null || importInput === void 0 ? void 0 : importInput.addEventListener('change', (e) => {
          var _a;
          const input = e.target;
          if ((_a = input === null || input === void 0 ? void 0 : input.files) === null || _a === void 0 ? void 0 : _a.length) {
              input.files[0].text().then(cb);
          }
      });
  };
  const getWrapperWH = () => {
      const style = window.getComputedStyle(wrapper, null);
      return [parseInt(style.getPropertyValue('width')), parseInt(style.getPropertyValue('height')) - 3];
  };
  const getCanvas = () => {
      return canvas$1;
  };

  const treeConfig = [
      { name: 'count', value: 100000 },
      { name: 'start', value: 500 },
      { name: 'end', value: 5000 },
      { name: 'minChild', value: 1 },
      { name: 'maxChild', value: 3 },
      { name: 'thinning', units: '%', value: 12 },
      { name: 'colorsMonotony', value: 40 },
      { name: 'colorsCount', value: 10 },
  ];
  const colors = {
      task: '#696969',
      event: '#a4775b',
  };
  const generateData = () => {
      const inputs = getInputValues(treeConfig);
      return generateRandomTree(inputs);
  };
  let currentData = query ? [] : generateData();
  const [width, height] = getWrapperWH();
  const canvas = getCanvas();
  canvas.width = width;
  canvas.height = height;
  const flameChart = new FlameChart({
      canvas,
      data: currentData,
      marks,
      waterfall: {
          items: waterfallItems,
          intervals: waterfallIntervals,
      },
      colors,
  });
  flameChart.on('select', (node, type) => {
      console.log('select', node, type);
      setNodeView(node
          ? `${type}\r\n${JSON.stringify({
            ...node,
            source: {
                ...node.source,
                children: '...',
            },
            parent: undefined,
        }, null, '  ')}`
          : '');
  });
  window.addEventListener('resize', () => {
      const [width, height] = getWrapperWH();
      flameChart.resize(width, height);
  });
  onApplyStyles((styles) => {
      flameChart.setSettings({
          styles,
      });
  });
  onUpdate(() => {
      currentData = generateData();
      flameChart.setData(currentData);
  });
  onImport((data) => {
      currentData = JSON.parse(data);
      flameChart.setData(currentData);
  });
  onExport(() => {
      return JSON.stringify(currentData);
  });
  initQuery(flameChart);
  initView(treeConfig, {
      main: defaultRenderStyles,
      timeGrid: defaultTimeGridStyles,
      timeGridPlugin: defaultTimeGridPluginStyles,
      timeframeSelectorPlugin: defaultTimeframeSelectorPluginStyles,
      waterfallPlugin: defaultWaterfallPluginStyles,
      togglePlugin: defaultTogglePluginStyles,
  });

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi05ODJjMTk1Zi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL3JvbGx1cC1wbHVnaW4tbm9kZS1idWlsdGlucy9zcmMvZXM2L2V2ZW50cy5qcyIsIi4uLy4uLy4uLy4uL3NyYy9wbHVnaW5zL3VpLXBsdWdpbi50cyIsIi4uLy4uLy4uLy4uL3NyYy9wbHVnaW5zL3V0aWxzL3RyZWUtY2x1c3RlcnMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29sb3ItbmFtZS9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9pcy1hcnJheWlzaC9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9zaW1wbGUtc3dpenpsZS9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb2xvci1zdHJpbmcvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29sb3ItY29udmVydC9jb252ZXJzaW9ucy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb2xvci1jb252ZXJ0L3JvdXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29sb3IvaW5kZXguanMiLCIuLi8uLi8uLi8uLi9zcmMvcGx1Z2lucy9mbGFtZS1jaGFydC1wbHVnaW4udHMiLCIuLi8uLi8uLi8uLi9zcmMvdXRpbHMudHMiLCIuLi8uLi8uLi8uLi9zcmMvcGx1Z2lucy90aW1lLWdyaWQtcGx1Z2luLnRzIiwiLi4vLi4vLi4vLi4vc3JjL3BsdWdpbnMvbWFya3MtcGx1Z2luLnRzIiwiLi4vLi4vLi4vLi4vc3JjL2VuZ2luZXMvdGltZS1ncmlkLnRzIiwiLi4vLi4vLi4vLi4vc3JjL3BsdWdpbnMvdGltZWZyYW1lLXNlbGVjdG9yLXBsdWdpbi50cyIsIi4uLy4uLy4uLy4uL3NyYy9wbHVnaW5zL3dhdGVyZmFsbC1wbHVnaW4udHMiLCIuLi8uLi8uLi8uLi9zcmMvcGx1Z2lucy90b2dnbGUtcGx1Z2luLnRzIiwiLi4vLi4vLi4vLi4vc3JjL2VuZ2luZXMvYmFzaWMtcmVuZGVyLWVuZ2luZS50cyIsIi4uLy4uLy4uLy4uL3NyYy9lbmdpbmVzL29mZnNjcmVlbi1yZW5kZXItZW5naW5lLnRzIiwiLi4vLi4vLi4vLi4vc3JjL2VuZ2luZXMvcmVuZGVyLWVuZ2luZS50cyIsIi4uLy4uLy4uLy4uL3NyYy90eXBlcy50cyIsIi4uLy4uLy4uLy4uL3NyYy9lbmdpbmVzL3NlcGFyYXRlZC1pbnRlcmFjdGlvbnMtZW5naW5lLnRzIiwiLi4vLi4vLi4vLi4vc3JjL2VuZ2luZXMvaW50ZXJhY3Rpb25zLWVuZ2luZS50cyIsIi4uLy4uLy4uLy4uL3NyYy9mbGFtZS1jaGFydC1jb250YWluZXIudHMiLCIuLi8uLi8uLi8uLi9zcmMvZmxhbWUtY2hhcnQudHMiLCIuLi8uLi8uLi9zcmMvdGVzdC1kYXRhLnRzIiwiLi4vLi4vLi4vc3JjL3F1ZXJ5LnRzIiwiLi4vLi4vLi4vc3JjL3ZpZXcudHMiLCIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZG9tYWluO1xuXG4vLyBUaGlzIGNvbnN0cnVjdG9yIGlzIHVzZWQgdG8gc3RvcmUgZXZlbnQgaGFuZGxlcnMuIEluc3RhbnRpYXRpbmcgdGhpcyBpc1xuLy8gZmFzdGVyIHRoYW4gZXhwbGljaXRseSBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKG51bGwpYCB0byBnZXQgYSBcImNsZWFuXCIgZW1wdHlcbi8vIG9iamVjdCAodGVzdGVkIHdpdGggdjggdjQuOSkuXG5mdW5jdGlvbiBFdmVudEhhbmRsZXJzKCkge31cbkV2ZW50SGFuZGxlcnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBFdmVudEVtaXR0ZXIuaW5pdC5jYWxsKHRoaXMpO1xufVxuZXhwb3J0IGRlZmF1bHQgRXZlbnRFbWl0dGVyO1xuZXhwb3J0IHtFdmVudEVtaXR0ZXJ9O1xuXG4vLyBub2RlanMgb2RkaXR5XG4vLyByZXF1aXJlKCdldmVudHMnKSA9PT0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyXG5cbkV2ZW50RW1pdHRlci51c2luZ0RvbWFpbnMgPSBmYWxzZTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5kb21haW4gPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbkV2ZW50RW1pdHRlci5pbml0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZG9tYWluID0gbnVsbDtcbiAgaWYgKEV2ZW50RW1pdHRlci51c2luZ0RvbWFpbnMpIHtcbiAgICAvLyBpZiB0aGVyZSBpcyBhbiBhY3RpdmUgZG9tYWluLCB0aGVuIGF0dGFjaCB0byBpdC5cbiAgICBpZiAoZG9tYWluLmFjdGl2ZSAmJiAhKHRoaXMgaW5zdGFuY2VvZiBkb21haW4uRG9tYWluKSkge1xuICAgICAgdGhpcy5kb21haW4gPSBkb21haW4uYWN0aXZlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8IHRoaXMuX2V2ZW50cyA9PT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLl9ldmVudHMpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRIYW5kbGVycygpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59O1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiblwiIGFyZ3VtZW50IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiAkZ2V0TWF4TGlzdGVuZXJzKHRoYXQpIHtcbiAgaWYgKHRoYXQuX21heExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgcmV0dXJuIHRoYXQuX21heExpc3RlbmVycztcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiAkZ2V0TWF4TGlzdGVuZXJzKHRoaXMpO1xufTtcblxuLy8gVGhlc2Ugc3RhbmRhbG9uZSBlbWl0KiBmdW5jdGlvbnMgYXJlIHVzZWQgdG8gb3B0aW1pemUgY2FsbGluZyBvZiBldmVudFxuLy8gaGFuZGxlcnMgZm9yIGZhc3QgY2FzZXMgYmVjYXVzZSBlbWl0KCkgaXRzZWxmIG9mdGVuIGhhcyBhIHZhcmlhYmxlIG51bWJlciBvZlxuLy8gYXJndW1lbnRzIGFuZCBjYW4gYmUgZGVvcHRpbWl6ZWQgYmVjYXVzZSBvZiB0aGF0LiBUaGVzZSBmdW5jdGlvbnMgYWx3YXlzIGhhdmVcbi8vIHRoZSBzYW1lIG51bWJlciBvZiBhcmd1bWVudHMgYW5kIHRodXMgZG8gbm90IGdldCBkZW9wdGltaXplZCwgc28gdGhlIGNvZGVcbi8vIGluc2lkZSB0aGVtIGNhbiBleGVjdXRlIGZhc3Rlci5cbmZ1bmN0aW9uIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHNlbGYpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRPbmUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSkge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgc2VsZiwgYXJnMSwgYXJnMiwgYXJnMykge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZiwgYXJnMSwgYXJnMiwgYXJnMyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmdzKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuYXBwbHkoc2VsZiwgYXJncyk7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBldmVudHMsIGRvbWFpbjtcbiAgdmFyIG5lZWREb21haW5FeGl0ID0gZmFsc2U7XG4gIHZhciBkb0Vycm9yID0gKHR5cGUgPT09ICdlcnJvcicpO1xuXG4gIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgaWYgKGV2ZW50cylcbiAgICBkb0Vycm9yID0gKGRvRXJyb3IgJiYgZXZlbnRzLmVycm9yID09IG51bGwpO1xuICBlbHNlIGlmICghZG9FcnJvcilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgZG9tYWluID0gdGhpcy5kb21haW47XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAoZG9FcnJvcikge1xuICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgIGlmIChkb21haW4pIHtcbiAgICAgIGlmICghZXIpXG4gICAgICAgIGVyID0gbmV3IEVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50Jyk7XG4gICAgICBlci5kb21haW5FbWl0dGVyID0gdGhpcztcbiAgICAgIGVyLmRvbWFpbiA9IGRvbWFpbjtcbiAgICAgIGVyLmRvbWFpblRocm93biA9IGZhbHNlO1xuICAgICAgZG9tYWluLmVtaXQoJ2Vycm9yJywgZXIpO1xuICAgIH0gZWxzZSBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoIWhhbmRsZXIpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBpc0ZuID0gdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbic7XG4gIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHN3aXRjaCAobGVuKSB7XG4gICAgLy8gZmFzdCBjYXNlc1xuICAgIGNhc2UgMTpcbiAgICAgIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHRoaXMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7XG4gICAgICBicmVhaztcbiAgICAvLyBzbG93ZXJcbiAgICBkZWZhdWx0OlxuICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICBlbWl0TWFueShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIGlmIChuZWVkRG9tYWluRXhpdClcbiAgICBkb21haW4uZXhpdCgpO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIsIHByZXBlbmQpIHtcbiAgdmFyIG07XG4gIHZhciBldmVudHM7XG4gIHZhciBleGlzdGluZztcblxuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgaWYgKCFldmVudHMpIHtcbiAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cyA9IG5ldyBFdmVudEhhbmRsZXJzKCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lcikge1xuICAgICAgdGFyZ2V0LmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyID8gbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgICAgIC8vIFJlLWFzc2lnbiBgZXZlbnRzYCBiZWNhdXNlIGEgbmV3TGlzdGVuZXIgaGFuZGxlciBjb3VsZCBoYXZlIGNhdXNlZCB0aGVcbiAgICAgIC8vIHRoaXMuX2V2ZW50cyB0byBiZSBhc3NpZ25lZCB0byBhIG5ldyBvYmplY3RcbiAgICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICAgIH1cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIGlmICghZXhpc3RpbmcpIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICAgICsrdGFyZ2V0Ll9ldmVudHNDb3VudDtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGV4aXN0aW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgICBpZiAocHJlcGVuZCkge1xuICAgICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIG0gPSAkZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgICBpZiAobSAmJiBtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtKSB7XG4gICAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLmxlbmd0aCArICcgJyArIHR5cGUgKyAnIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0Jyk7XG4gICAgICAgIHcubmFtZSA9ICdNYXhMaXN0ZW5lcnNFeGNlZWRlZFdhcm5pbmcnO1xuICAgICAgICB3LmVtaXR0ZXIgPSB0YXJnZXQ7XG4gICAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICAgIHcuY291bnQgPSBleGlzdGluZy5sZW5ndGg7XG4gICAgICAgIGVtaXRXYXJuaW5nKHcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBlbWl0V2FybmluZyhlKSB7XG4gIHR5cGVvZiBjb25zb2xlLndhcm4gPT09ICdmdW5jdGlvbicgPyBjb25zb2xlLndhcm4oZSkgOiBjb25zb2xlLmxvZyhlKTtcbn1cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGZpcmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRhcmdldCwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICByZXR1cm4gZztcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAoIWxpc3QpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgKGxpc3QubGlzdGVuZXIgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudEhhbmRsZXJzKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBsaXN0WzBdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRIYW5kbGVycygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHM7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmICghZXZlbnRzKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKCFldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRIYW5kbGVycygpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0pIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudEhhbmRsZXJzKCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50cyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBrZXk7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRIYW5kbGVycygpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH0gd2hpbGUgKGxpc3RlbmVyc1swXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgdmFyIGV2bGlzdGVuZXI7XG4gIHZhciByZXQ7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKCFldmVudHMpXG4gICAgcmV0ID0gW107XG4gIGVsc2Uge1xuICAgIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG4gICAgaWYgKCFldmxpc3RlbmVyKVxuICAgICAgcmV0ID0gW107XG4gICAgZWxzZSBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgICByZXQgPSBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXTtcbiAgICBlbHNlXG4gICAgICByZXQgPSB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3Qub3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG4vLyBBYm91dCAxLjV4IGZhc3RlciB0aGFuIHRoZSB0d28tYXJnIHZlcnNpb24gb2YgQXJyYXkjc3BsaWNlKCkuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICh2YXIgaSA9IGluZGV4LCBrID0gaSArIDEsIG4gPSBsaXN0Lmxlbmd0aDsgayA8IG47IGkgKz0gMSwgayArPSAxKVxuICAgIGxpc3RbaV0gPSBsaXN0W2tdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgaSkge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShpKTtcbiAgd2hpbGUgKGktLSlcbiAgICBjb3B5W2ldID0gYXJyW2ldO1xuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gdW53cmFwTGlzdGVuZXJzKGFycikge1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGFyci5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJldC5sZW5ndGg7ICsraSkge1xuICAgIHJldFtpXSA9IGFycltpXS5saXN0ZW5lciB8fCBhcnJbaV07XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cbiIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBPZmZzY3JlZW5SZW5kZXJFbmdpbmUgfSBmcm9tICcuLi9lbmdpbmVzL29mZnNjcmVlbi1yZW5kZXItZW5naW5lJztcbmltcG9ydCB7IFNlcGFyYXRlZEludGVyYWN0aW9uc0VuZ2luZSB9IGZyb20gJy4uL2VuZ2luZXMvc2VwYXJhdGVkLWludGVyYWN0aW9ucy1lbmdpbmUnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVUlQbHVnaW48UyA9IHt9PiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGFic3RyYWN0IGhlaWdodD86IG51bWJlcjtcblxuICAgIGludGVyYWN0aW9uc0VuZ2luZTogU2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lO1xuICAgIHJlbmRlckVuZ2luZTogT2Zmc2NyZWVuUmVuZGVyRW5naW5lO1xuXG4gICAgbWluPzogbnVtYmVyO1xuICAgIG1heD86IG51bWJlcjtcbiAgICBzdHlsZXM/OiBTO1xuXG4gICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIGluaXQocmVuZGVyRW5naW5lOiBPZmZzY3JlZW5SZW5kZXJFbmdpbmUsIGludGVyYWN0aW9uc0VuZ2luZTogU2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lKSB7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lID0gcmVuZGVyRW5naW5lO1xuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZSA9IGludGVyYWN0aW9uc0VuZ2luZTtcbiAgICB9XG5cbiAgICBwb3N0SW5pdD8oKTogdm9pZDtcblxuICAgIHJlbmRlcj8oKTogYm9vbGVhbiB8IHVuZGVmaW5lZCB8IHZvaWQ7XG5cbiAgICBzZXRTZXR0aW5ncz8oc2V0dGluZ3M6IHsgc3R5bGVzOiBTIH0pOiB2b2lkO1xuXG4gICAgcmVuZGVyVG9vbHRpcD8oKTogYm9vbGVhbjtcblxuICAgIHBvc3RSZW5kZXI/KCk6IHZvaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFVJUGx1Z2luO1xuIiwiaW1wb3J0IHtcbiAgICBDbHVzdGVyaXplZEZsYXRUcmVlLFxuICAgIE1ldGFDbHVzdGVyaXplZEZsYXRUcmVlLFxuICAgIENsdXN0ZXJpemVkRmxhdFRyZWVOb2RlLFxuICAgIERhdGEsXG4gICAgRmxhdFRyZWUsXG4gICAgRmxhdFRyZWVOb2RlLFxuICAgIE5vZGUsXG59IGZyb20gJy4uLy4uL3R5cGVzJztcblxuY29uc3QgTUlOX0JMT0NLX1NJWkUgPSAxO1xuY29uc3QgU1RJQ0tfRElTVEFOQ0UgPSAwLjI1O1xuY29uc3QgTUlOX0NMVVNURVJfU0laRSA9IE1JTl9CTE9DS19TSVpFICogMiArIFNUSUNLX0RJU1RBTkNFO1xuXG5leHBvcnQgY29uc3Qgd2FsayA9IChcbiAgICB0cmVlTGlzdDogRGF0YSxcbiAgICBjYjogKGNoaWxkOiBOb2RlLCBwYXJlbnQ6IGFueSwgbGV2ZWw6IG51bWJlcikgPT4gRmxhdFRyZWVOb2RlLFxuICAgIHBhcmVudDogRmxhdFRyZWVOb2RlIHwgTm9kZSB8IG51bGwgPSBudWxsLFxuICAgIGxldmVsID0gMFxuKSA9PiB7XG4gICAgdHJlZUxpc3QuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgY29uc3QgcmVzID0gY2IoY2hpbGQsIHBhcmVudCwgbGV2ZWwpO1xuXG4gICAgICAgIGlmIChjaGlsZC5jaGlsZHJlbikge1xuICAgICAgICAgICAgd2FsayhjaGlsZC5jaGlsZHJlbiwgY2IsIHJlcyB8fCBjaGlsZCwgbGV2ZWwgKyAxKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGZsYXRUcmVlID0gKHRyZWVMaXN0OiBEYXRhKTogRmxhdFRyZWUgPT4ge1xuICAgIGNvbnN0IHJlc3VsdDogRmxhdFRyZWUgPSBbXTtcbiAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgd2Fsayh0cmVlTGlzdCwgKG5vZGUsIHBhcmVudCwgbGV2ZWwpID0+IHtcbiAgICAgICAgY29uc3QgbmV3Tm9kZTogRmxhdFRyZWVOb2RlID0ge1xuICAgICAgICAgICAgc291cmNlOiBub2RlLFxuICAgICAgICAgICAgZW5kOiBub2RlLnN0YXJ0ICsgbm9kZS5kdXJhdGlvbixcbiAgICAgICAgICAgIHBhcmVudCxcbiAgICAgICAgICAgIGxldmVsLFxuICAgICAgICAgICAgaW5kZXg6IGluZGV4KyssXG4gICAgICAgIH07XG5cbiAgICAgICAgcmVzdWx0LnB1c2gobmV3Tm9kZSk7XG5cbiAgICAgICAgcmV0dXJuIG5ld05vZGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0LnNvcnQoKGEsIGIpID0+IGEubGV2ZWwgLSBiLmxldmVsIHx8IGEuc291cmNlLnN0YXJ0IC0gYi5zb3VyY2Uuc3RhcnQpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEZsYXRUcmVlTWluTWF4ID0gKGZsYXRUcmVlOiBGbGF0VHJlZSkgPT4ge1xuICAgIGxldCBpc0ZpcnN0ID0gdHJ1ZTtcbiAgICBsZXQgbWluID0gMDtcbiAgICBsZXQgbWF4ID0gMDtcblxuICAgIGZsYXRUcmVlLmZvckVhY2goKHsgc291cmNlOiB7IHN0YXJ0IH0sIGVuZCB9KSA9PiB7XG4gICAgICAgIGlmIChpc0ZpcnN0KSB7XG4gICAgICAgICAgICBtaW4gPSBzdGFydDtcbiAgICAgICAgICAgIG1heCA9IGVuZDtcbiAgICAgICAgICAgIGlzRmlyc3QgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1pbiA9IG1pbiA8IHN0YXJ0ID8gbWluIDogc3RhcnQ7XG4gICAgICAgICAgICBtYXggPSBtYXggPiBlbmQgPyBtYXggOiBlbmQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7IG1pbiwgbWF4IH07XG59O1xuXG5jb25zdCBjYWxjQ2x1c3RlckR1cmF0aW9uID0gKG5vZGVzOiBGbGF0VHJlZU5vZGVbXSkgPT4ge1xuICAgIGNvbnN0IGZpcnN0Tm9kZSA9IG5vZGVzWzBdO1xuICAgIGNvbnN0IGxhc3ROb2RlID0gbm9kZXNbbm9kZXMubGVuZ3RoIC0gMV07XG5cbiAgICByZXR1cm4gbGFzdE5vZGUuc291cmNlLnN0YXJ0ICsgbGFzdE5vZGUuc291cmNlLmR1cmF0aW9uIC0gZmlyc3ROb2RlLnNvdXJjZS5zdGFydDtcbn07XG5cbmNvbnN0IGNoZWNrTm9kZVRpbWVib3VuZE5lc3RpbmcgPSAobm9kZTogRmxhdFRyZWVOb2RlLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikgPT5cbiAgICAobm9kZS5zb3VyY2Uuc3RhcnQgPCBlbmQgJiYgbm9kZS5lbmQgPiBzdGFydCkgfHwgKG5vZGUuc291cmNlLnN0YXJ0ID4gc3RhcnQgJiYgbm9kZS5lbmQgPCBlbmQpO1xuXG5jb25zdCBjaGVja0NsdXN0ZXJUaW1lYm91bmROZXN0aW5nID0gKG5vZGU6IENsdXN0ZXJpemVkRmxhdFRyZWVOb2RlLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikgPT5cbiAgICAobm9kZS5zdGFydCA8IGVuZCAmJiBub2RlLmVuZCA+IHN0YXJ0KSB8fCAobm9kZS5zdGFydCA+IHN0YXJ0ICYmIG5vZGUuZW5kIDwgZW5kKTtcblxuY29uc3QgZGVmYXVsdENsdXN0ZXJpemVDb25kaXRpb24gPSAocHJldk5vZGU6IEZsYXRUcmVlTm9kZSwgbm9kZTogRmxhdFRyZWVOb2RlKSA9PlxuICAgIHByZXZOb2RlLnNvdXJjZS5jb2xvciA9PT0gbm9kZS5zb3VyY2UuY29sb3IgJiYgcHJldk5vZGUuc291cmNlLnR5cGUgPT09IG5vZGUuc291cmNlLnR5cGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXRhQ2x1c3Rlcml6ZUZsYXRUcmVlKFxuICAgIGZsYXRUcmVlOiBGbGF0VHJlZSxcbiAgICBjb25kaXRpb24gPSBkZWZhdWx0Q2x1c3Rlcml6ZUNvbmRpdGlvblxuKTogTWV0YUNsdXN0ZXJpemVkRmxhdFRyZWUge1xuICAgIHJldHVybiBmbGF0VHJlZVxuICAgICAgICAucmVkdWNlPEZsYXRUcmVlTm9kZVtdW10+KChhY2MsIG5vZGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RDbHVzdGVyID0gYWNjW2FjYy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGxhc3ROb2RlID0gbGFzdENsdXN0ZXIgJiYgbGFzdENsdXN0ZXJbbGFzdENsdXN0ZXIubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgICAgIGlmIChsYXN0Tm9kZSAmJiBsYXN0Tm9kZS5sZXZlbCA9PT0gbm9kZS5sZXZlbCAmJiBjb25kaXRpb24obGFzdE5vZGUsIG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgbGFzdENsdXN0ZXIucHVzaChub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWNjLnB1c2goW25vZGVdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwgW10pXG4gICAgICAgIC5maWx0ZXIoKG5vZGVzKSA9PiBub2Rlcy5sZW5ndGgpXG4gICAgICAgIC5tYXAoKG5vZGVzKSA9PiAoe1xuICAgICAgICAgICAgbm9kZXMsXG4gICAgICAgIH0pKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNsdXN0ZXJpemVGbGF0VHJlZSA9IChcbiAgICBtZXRhQ2x1c3Rlcml6ZWRGbGF0VHJlZTogTWV0YUNsdXN0ZXJpemVkRmxhdFRyZWUsXG4gICAgem9vbTogbnVtYmVyLFxuICAgIHN0YXJ0ID0gMCxcbiAgICBlbmQgPSAwLFxuICAgIHN0aWNrRGlzdGFuY2UgPSBTVElDS19ESVNUQU5DRSxcbiAgICBtaW5CbG9ja1NpemUgPSBNSU5fQkxPQ0tfU0laRVxuKTogQ2x1c3Rlcml6ZWRGbGF0VHJlZSA9PiB7XG4gICAgbGV0IGxhc3RDbHVzdGVyOiBGbGF0VHJlZU5vZGVbXSB8IG51bGwgPSBudWxsO1xuICAgIGxldCBsYXN0Tm9kZTogRmxhdFRyZWVOb2RlIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGluZGV4ID0gMDtcblxuICAgIHJldHVybiBtZXRhQ2x1c3Rlcml6ZWRGbGF0VHJlZVxuICAgICAgICAucmVkdWNlPEZsYXRUcmVlTm9kZVtdW10+KChhY2MsIHsgbm9kZXMgfSkgPT4ge1xuICAgICAgICAgICAgbGFzdENsdXN0ZXIgPSBudWxsO1xuICAgICAgICAgICAgbGFzdE5vZGUgPSBudWxsO1xuICAgICAgICAgICAgaW5kZXggPSAwO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tOb2RlVGltZWJvdW5kTmVzdGluZyhub2RlLCBzdGFydCwgZW5kKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdENsdXN0ZXIgJiYgIWxhc3ROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q2x1c3RlcltpbmRleF0gPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDbHVzdGVyICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Tm9kZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKG5vZGUuc291cmNlLnN0YXJ0IC0gKGxhc3ROb2RlLnNvdXJjZS5zdGFydCArIGxhc3ROb2RlLnNvdXJjZS5kdXJhdGlvbikpICogem9vbSA8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RpY2tEaXN0YW5jZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zb3VyY2UuZHVyYXRpb24gKiB6b29tIDwgbWluQmxvY2tTaXplICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Tm9kZS5zb3VyY2UuZHVyYXRpb24gKiB6b29tIDwgbWluQmxvY2tTaXplXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENsdXN0ZXJbaW5kZXhdID0gbm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q2x1c3RlciA9IFtub2RlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2gobGFzdENsdXN0ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbGFzdE5vZGUgPSBub2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwgW10pXG4gICAgICAgIC5tYXAoKG5vZGVzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbMF07XG4gICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGNhbGNDbHVzdGVyRHVyYXRpb24obm9kZXMpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXJ0OiBub2RlLnNvdXJjZS5zdGFydCxcbiAgICAgICAgICAgICAgICBlbmQ6IG5vZGUuc291cmNlLnN0YXJ0ICsgZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgdHlwZTogbm9kZS5zb3VyY2UudHlwZSxcbiAgICAgICAgICAgICAgICBjb2xvcjogbm9kZS5zb3VyY2UuY29sb3IsXG4gICAgICAgICAgICAgICAgbGV2ZWw6IG5vZGUubGV2ZWwsXG4gICAgICAgICAgICAgICAgbm9kZXMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCByZWNsdXN0ZXJpemVDbHVzdGVyZWRGbGF0VHJlZSA9IChcbiAgICBjbHVzdGVyZWRGbGF0VHJlZTogQ2x1c3Rlcml6ZWRGbGF0VHJlZSxcbiAgICB6b29tOiBudW1iZXIsXG4gICAgc3RhcnQ6IG51bWJlcixcbiAgICBlbmQ6IG51bWJlcixcbiAgICBzdGlja0Rpc3RhbmNlPzogbnVtYmVyLFxuICAgIG1pbkJsb2NrU2l6ZT86IG51bWJlclxuKTogQ2x1c3Rlcml6ZWRGbGF0VHJlZSA9PiB7XG4gICAgcmV0dXJuIGNsdXN0ZXJlZEZsYXRUcmVlLnJlZHVjZTxDbHVzdGVyaXplZEZsYXRUcmVlPigoYWNjLCBjbHVzdGVyKSA9PiB7XG4gICAgICAgIGlmIChjaGVja0NsdXN0ZXJUaW1lYm91bmROZXN0aW5nKGNsdXN0ZXIsIHN0YXJ0LCBlbmQpKSB7XG4gICAgICAgICAgICBpZiAoY2x1c3Rlci5kdXJhdGlvbiAqIHpvb20gPD0gTUlOX0NMVVNURVJfU0laRSkge1xuICAgICAgICAgICAgICAgIGFjYy5wdXNoKGNsdXN0ZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY2MucHVzaCguLi5jbHVzdGVyaXplRmxhdFRyZWUoW2NsdXN0ZXJdLCB6b29tLCBzdGFydCwgZW5kLCBzdGlja0Rpc3RhbmNlLCBtaW5CbG9ja1NpemUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgW10pO1xufTtcbiIsIid1c2Ugc3RyaWN0J1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0XCJhbGljZWJsdWVcIjogWzI0MCwgMjQ4LCAyNTVdLFxyXG5cdFwiYW50aXF1ZXdoaXRlXCI6IFsyNTAsIDIzNSwgMjE1XSxcclxuXHRcImFxdWFcIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImFxdWFtYXJpbmVcIjogWzEyNywgMjU1LCAyMTJdLFxyXG5cdFwiYXp1cmVcIjogWzI0MCwgMjU1LCAyNTVdLFxyXG5cdFwiYmVpZ2VcIjogWzI0NSwgMjQ1LCAyMjBdLFxyXG5cdFwiYmlzcXVlXCI6IFsyNTUsIDIyOCwgMTk2XSxcclxuXHRcImJsYWNrXCI6IFswLCAwLCAwXSxcclxuXHRcImJsYW5jaGVkYWxtb25kXCI6IFsyNTUsIDIzNSwgMjA1XSxcclxuXHRcImJsdWVcIjogWzAsIDAsIDI1NV0sXHJcblx0XCJibHVldmlvbGV0XCI6IFsxMzgsIDQzLCAyMjZdLFxyXG5cdFwiYnJvd25cIjogWzE2NSwgNDIsIDQyXSxcclxuXHRcImJ1cmx5d29vZFwiOiBbMjIyLCAxODQsIDEzNV0sXHJcblx0XCJjYWRldGJsdWVcIjogWzk1LCAxNTgsIDE2MF0sXHJcblx0XCJjaGFydHJldXNlXCI6IFsxMjcsIDI1NSwgMF0sXHJcblx0XCJjaG9jb2xhdGVcIjogWzIxMCwgMTA1LCAzMF0sXHJcblx0XCJjb3JhbFwiOiBbMjU1LCAxMjcsIDgwXSxcclxuXHRcImNvcm5mbG93ZXJibHVlXCI6IFsxMDAsIDE0OSwgMjM3XSxcclxuXHRcImNvcm5zaWxrXCI6IFsyNTUsIDI0OCwgMjIwXSxcclxuXHRcImNyaW1zb25cIjogWzIyMCwgMjAsIDYwXSxcclxuXHRcImN5YW5cIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImRhcmtibHVlXCI6IFswLCAwLCAxMzldLFxyXG5cdFwiZGFya2N5YW5cIjogWzAsIDEzOSwgMTM5XSxcclxuXHRcImRhcmtnb2xkZW5yb2RcIjogWzE4NCwgMTM0LCAxMV0sXHJcblx0XCJkYXJrZ3JheVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJrZ3JlZW5cIjogWzAsIDEwMCwgMF0sXHJcblx0XCJkYXJrZ3JleVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJra2hha2lcIjogWzE4OSwgMTgzLCAxMDddLFxyXG5cdFwiZGFya21hZ2VudGFcIjogWzEzOSwgMCwgMTM5XSxcclxuXHRcImRhcmtvbGl2ZWdyZWVuXCI6IFs4NSwgMTA3LCA0N10sXHJcblx0XCJkYXJrb3JhbmdlXCI6IFsyNTUsIDE0MCwgMF0sXHJcblx0XCJkYXJrb3JjaGlkXCI6IFsxNTMsIDUwLCAyMDRdLFxyXG5cdFwiZGFya3JlZFwiOiBbMTM5LCAwLCAwXSxcclxuXHRcImRhcmtzYWxtb25cIjogWzIzMywgMTUwLCAxMjJdLFxyXG5cdFwiZGFya3NlYWdyZWVuXCI6IFsxNDMsIDE4OCwgMTQzXSxcclxuXHRcImRhcmtzbGF0ZWJsdWVcIjogWzcyLCA2MSwgMTM5XSxcclxuXHRcImRhcmtzbGF0ZWdyYXlcIjogWzQ3LCA3OSwgNzldLFxyXG5cdFwiZGFya3NsYXRlZ3JleVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrdHVycXVvaXNlXCI6IFswLCAyMDYsIDIwOV0sXHJcblx0XCJkYXJrdmlvbGV0XCI6IFsxNDgsIDAsIDIxMV0sXHJcblx0XCJkZWVwcGlua1wiOiBbMjU1LCAyMCwgMTQ3XSxcclxuXHRcImRlZXBza3libHVlXCI6IFswLCAxOTEsIDI1NV0sXHJcblx0XCJkaW1ncmF5XCI6IFsxMDUsIDEwNSwgMTA1XSxcclxuXHRcImRpbWdyZXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZG9kZ2VyYmx1ZVwiOiBbMzAsIDE0NCwgMjU1XSxcclxuXHRcImZpcmVicmlja1wiOiBbMTc4LCAzNCwgMzRdLFxyXG5cdFwiZmxvcmFsd2hpdGVcIjogWzI1NSwgMjUwLCAyNDBdLFxyXG5cdFwiZm9yZXN0Z3JlZW5cIjogWzM0LCAxMzksIDM0XSxcclxuXHRcImZ1Y2hzaWFcIjogWzI1NSwgMCwgMjU1XSxcclxuXHRcImdhaW5zYm9yb1wiOiBbMjIwLCAyMjAsIDIyMF0sXHJcblx0XCJnaG9zdHdoaXRlXCI6IFsyNDgsIDI0OCwgMjU1XSxcclxuXHRcImdvbGRcIjogWzI1NSwgMjE1LCAwXSxcclxuXHRcImdvbGRlbnJvZFwiOiBbMjE4LCAxNjUsIDMyXSxcclxuXHRcImdyYXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiZ3JlZW5cIjogWzAsIDEyOCwgMF0sXHJcblx0XCJncmVlbnllbGxvd1wiOiBbMTczLCAyNTUsIDQ3XSxcclxuXHRcImdyZXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiaG9uZXlkZXdcIjogWzI0MCwgMjU1LCAyNDBdLFxyXG5cdFwiaG90cGlua1wiOiBbMjU1LCAxMDUsIDE4MF0sXHJcblx0XCJpbmRpYW5yZWRcIjogWzIwNSwgOTIsIDkyXSxcclxuXHRcImluZGlnb1wiOiBbNzUsIDAsIDEzMF0sXHJcblx0XCJpdm9yeVwiOiBbMjU1LCAyNTUsIDI0MF0sXHJcblx0XCJraGFraVwiOiBbMjQwLCAyMzAsIDE0MF0sXHJcblx0XCJsYXZlbmRlclwiOiBbMjMwLCAyMzAsIDI1MF0sXHJcblx0XCJsYXZlbmRlcmJsdXNoXCI6IFsyNTUsIDI0MCwgMjQ1XSxcclxuXHRcImxhd25ncmVlblwiOiBbMTI0LCAyNTIsIDBdLFxyXG5cdFwibGVtb25jaGlmZm9uXCI6IFsyNTUsIDI1MCwgMjA1XSxcclxuXHRcImxpZ2h0Ymx1ZVwiOiBbMTczLCAyMTYsIDIzMF0sXHJcblx0XCJsaWdodGNvcmFsXCI6IFsyNDAsIDEyOCwgMTI4XSxcclxuXHRcImxpZ2h0Y3lhblwiOiBbMjI0LCAyNTUsIDI1NV0sXHJcblx0XCJsaWdodGdvbGRlbnJvZHllbGxvd1wiOiBbMjUwLCAyNTAsIDIxMF0sXHJcblx0XCJsaWdodGdyYXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRncmVlblwiOiBbMTQ0LCAyMzgsIDE0NF0sXHJcblx0XCJsaWdodGdyZXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRwaW5rXCI6IFsyNTUsIDE4MiwgMTkzXSxcclxuXHRcImxpZ2h0c2FsbW9uXCI6IFsyNTUsIDE2MCwgMTIyXSxcclxuXHRcImxpZ2h0c2VhZ3JlZW5cIjogWzMyLCAxNzgsIDE3MF0sXHJcblx0XCJsaWdodHNreWJsdWVcIjogWzEzNSwgMjA2LCAyNTBdLFxyXG5cdFwibGlnaHRzbGF0ZWdyYXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzbGF0ZWdyZXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzdGVlbGJsdWVcIjogWzE3NiwgMTk2LCAyMjJdLFxyXG5cdFwibGlnaHR5ZWxsb3dcIjogWzI1NSwgMjU1LCAyMjRdLFxyXG5cdFwibGltZVwiOiBbMCwgMjU1LCAwXSxcclxuXHRcImxpbWVncmVlblwiOiBbNTAsIDIwNSwgNTBdLFxyXG5cdFwibGluZW5cIjogWzI1MCwgMjQwLCAyMzBdLFxyXG5cdFwibWFnZW50YVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwibWFyb29uXCI6IFsxMjgsIDAsIDBdLFxyXG5cdFwibWVkaXVtYXF1YW1hcmluZVwiOiBbMTAyLCAyMDUsIDE3MF0sXHJcblx0XCJtZWRpdW1ibHVlXCI6IFswLCAwLCAyMDVdLFxyXG5cdFwibWVkaXVtb3JjaGlkXCI6IFsxODYsIDg1LCAyMTFdLFxyXG5cdFwibWVkaXVtcHVycGxlXCI6IFsxNDcsIDExMiwgMjE5XSxcclxuXHRcIm1lZGl1bXNlYWdyZWVuXCI6IFs2MCwgMTc5LCAxMTNdLFxyXG5cdFwibWVkaXVtc2xhdGVibHVlXCI6IFsxMjMsIDEwNCwgMjM4XSxcclxuXHRcIm1lZGl1bXNwcmluZ2dyZWVuXCI6IFswLCAyNTAsIDE1NF0sXHJcblx0XCJtZWRpdW10dXJxdW9pc2VcIjogWzcyLCAyMDksIDIwNF0sXHJcblx0XCJtZWRpdW12aW9sZXRyZWRcIjogWzE5OSwgMjEsIDEzM10sXHJcblx0XCJtaWRuaWdodGJsdWVcIjogWzI1LCAyNSwgMTEyXSxcclxuXHRcIm1pbnRjcmVhbVwiOiBbMjQ1LCAyNTUsIDI1MF0sXHJcblx0XCJtaXN0eXJvc2VcIjogWzI1NSwgMjI4LCAyMjVdLFxyXG5cdFwibW9jY2FzaW5cIjogWzI1NSwgMjI4LCAxODFdLFxyXG5cdFwibmF2YWpvd2hpdGVcIjogWzI1NSwgMjIyLCAxNzNdLFxyXG5cdFwibmF2eVwiOiBbMCwgMCwgMTI4XSxcclxuXHRcIm9sZGxhY2VcIjogWzI1MywgMjQ1LCAyMzBdLFxyXG5cdFwib2xpdmVcIjogWzEyOCwgMTI4LCAwXSxcclxuXHRcIm9saXZlZHJhYlwiOiBbMTA3LCAxNDIsIDM1XSxcclxuXHRcIm9yYW5nZVwiOiBbMjU1LCAxNjUsIDBdLFxyXG5cdFwib3JhbmdlcmVkXCI6IFsyNTUsIDY5LCAwXSxcclxuXHRcIm9yY2hpZFwiOiBbMjE4LCAxMTIsIDIxNF0sXHJcblx0XCJwYWxlZ29sZGVucm9kXCI6IFsyMzgsIDIzMiwgMTcwXSxcclxuXHRcInBhbGVncmVlblwiOiBbMTUyLCAyNTEsIDE1Ml0sXHJcblx0XCJwYWxldHVycXVvaXNlXCI6IFsxNzUsIDIzOCwgMjM4XSxcclxuXHRcInBhbGV2aW9sZXRyZWRcIjogWzIxOSwgMTEyLCAxNDddLFxyXG5cdFwicGFwYXlhd2hpcFwiOiBbMjU1LCAyMzksIDIxM10sXHJcblx0XCJwZWFjaHB1ZmZcIjogWzI1NSwgMjE4LCAxODVdLFxyXG5cdFwicGVydVwiOiBbMjA1LCAxMzMsIDYzXSxcclxuXHRcInBpbmtcIjogWzI1NSwgMTkyLCAyMDNdLFxyXG5cdFwicGx1bVwiOiBbMjIxLCAxNjAsIDIyMV0sXHJcblx0XCJwb3dkZXJibHVlXCI6IFsxNzYsIDIyNCwgMjMwXSxcclxuXHRcInB1cnBsZVwiOiBbMTI4LCAwLCAxMjhdLFxyXG5cdFwicmViZWNjYXB1cnBsZVwiOiBbMTAyLCA1MSwgMTUzXSxcclxuXHRcInJlZFwiOiBbMjU1LCAwLCAwXSxcclxuXHRcInJvc3licm93blwiOiBbMTg4LCAxNDMsIDE0M10sXHJcblx0XCJyb3lhbGJsdWVcIjogWzY1LCAxMDUsIDIyNV0sXHJcblx0XCJzYWRkbGVicm93blwiOiBbMTM5LCA2OSwgMTldLFxyXG5cdFwic2FsbW9uXCI6IFsyNTAsIDEyOCwgMTE0XSxcclxuXHRcInNhbmR5YnJvd25cIjogWzI0NCwgMTY0LCA5Nl0sXHJcblx0XCJzZWFncmVlblwiOiBbNDYsIDEzOSwgODddLFxyXG5cdFwic2Vhc2hlbGxcIjogWzI1NSwgMjQ1LCAyMzhdLFxyXG5cdFwic2llbm5hXCI6IFsxNjAsIDgyLCA0NV0sXHJcblx0XCJzaWx2ZXJcIjogWzE5MiwgMTkyLCAxOTJdLFxyXG5cdFwic2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDIzNV0sXHJcblx0XCJzbGF0ZWJsdWVcIjogWzEwNiwgOTAsIDIwNV0sXHJcblx0XCJzbGF0ZWdyYXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic2xhdGVncmV5XCI6IFsxMTIsIDEyOCwgMTQ0XSxcclxuXHRcInNub3dcIjogWzI1NSwgMjUwLCAyNTBdLFxyXG5cdFwic3ByaW5nZ3JlZW5cIjogWzAsIDI1NSwgMTI3XSxcclxuXHRcInN0ZWVsYmx1ZVwiOiBbNzAsIDEzMCwgMTgwXSxcclxuXHRcInRhblwiOiBbMjEwLCAxODAsIDE0MF0sXHJcblx0XCJ0ZWFsXCI6IFswLCAxMjgsIDEyOF0sXHJcblx0XCJ0aGlzdGxlXCI6IFsyMTYsIDE5MSwgMjE2XSxcclxuXHRcInRvbWF0b1wiOiBbMjU1LCA5OSwgNzFdLFxyXG5cdFwidHVycXVvaXNlXCI6IFs2NCwgMjI0LCAyMDhdLFxyXG5cdFwidmlvbGV0XCI6IFsyMzgsIDEzMCwgMjM4XSxcclxuXHRcIndoZWF0XCI6IFsyNDUsIDIyMiwgMTc5XSxcclxuXHRcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcclxuXHRcIndoaXRlc21va2VcIjogWzI0NSwgMjQ1LCAyNDVdLFxyXG5cdFwieWVsbG93XCI6IFsyNTUsIDI1NSwgMF0sXHJcblx0XCJ5ZWxsb3dncmVlblwiOiBbMTU0LCAyMDUsIDUwXVxyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXJyYXlpc2gob2JqKSB7XG5cdGlmICghb2JqIHx8IHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIG9iaiBpbnN0YW5jZW9mIEFycmF5IHx8IEFycmF5LmlzQXJyYXkob2JqKSB8fFxuXHRcdChvYmoubGVuZ3RoID49IDAgJiYgKG9iai5zcGxpY2UgaW5zdGFuY2VvZiBGdW5jdGlvbiB8fFxuXHRcdFx0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCAob2JqLmxlbmd0aCAtIDEpKSAmJiBvYmouY29uc3RydWN0b3IubmFtZSAhPT0gJ1N0cmluZycpKSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBcnJheWlzaCA9IHJlcXVpcmUoJ2lzLWFycmF5aXNoJyk7XG5cbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG52YXIgc3dpenpsZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3dpenpsZShhcmdzKSB7XG5cdHZhciByZXN1bHRzID0gW107XG5cblx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IGFyZ3MubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0XHR2YXIgYXJnID0gYXJnc1tpXTtcblxuXHRcdGlmIChpc0FycmF5aXNoKGFyZykpIHtcblx0XHRcdC8vIGh0dHA6Ly9qc3BlcmYuY29tL2phdmFzY3JpcHQtYXJyYXktY29uY2F0LXZzLXB1c2gvOThcblx0XHRcdHJlc3VsdHMgPSBjb25jYXQuY2FsbChyZXN1bHRzLCBzbGljZS5jYWxsKGFyZykpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLnB1c2goYXJnKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0cztcbn07XG5cbnN3aXp6bGUud3JhcCA9IGZ1bmN0aW9uIChmbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBmbihzd2l6emxlKGFyZ3VtZW50cykpO1xuXHR9O1xufTtcbiIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY29sb3JOYW1lcyA9IHJlcXVpcmUoJ2NvbG9yLW5hbWUnKTtcbnZhciBzd2l6emxlID0gcmVxdWlyZSgnc2ltcGxlLXN3aXp6bGUnKTtcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5oYXNPd25Qcm9wZXJ0eTtcblxudmFyIHJldmVyc2VOYW1lcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbi8vIGNyZWF0ZSBhIGxpc3Qgb2YgcmV2ZXJzZSBjb2xvciBuYW1lc1xuZm9yICh2YXIgbmFtZSBpbiBjb2xvck5hbWVzKSB7XG5cdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbG9yTmFtZXMsIG5hbWUpKSB7XG5cdFx0cmV2ZXJzZU5hbWVzW2NvbG9yTmFtZXNbbmFtZV1dID0gbmFtZTtcblx0fVxufVxuXG52YXIgY3MgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblx0dG86IHt9LFxuXHRnZXQ6IHt9XG59O1xuXG5jcy5nZXQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdHZhciBwcmVmaXggPSBzdHJpbmcuc3Vic3RyaW5nKDAsIDMpLnRvTG93ZXJDYXNlKCk7XG5cdHZhciB2YWw7XG5cdHZhciBtb2RlbDtcblx0c3dpdGNoIChwcmVmaXgpIHtcblx0XHRjYXNlICdoc2wnOlxuXHRcdFx0dmFsID0gY3MuZ2V0LmhzbChzdHJpbmcpO1xuXHRcdFx0bW9kZWwgPSAnaHNsJztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2h3Yic6XG5cdFx0XHR2YWwgPSBjcy5nZXQuaHdiKHN0cmluZyk7XG5cdFx0XHRtb2RlbCA9ICdod2InO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHZhbCA9IGNzLmdldC5yZ2Ioc3RyaW5nKTtcblx0XHRcdG1vZGVsID0gJ3JnYic7XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdGlmICghdmFsKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRyZXR1cm4ge21vZGVsOiBtb2RlbCwgdmFsdWU6IHZhbH07XG59O1xuXG5jcy5nZXQucmdiID0gZnVuY3Rpb24gKHN0cmluZykge1xuXHRpZiAoIXN0cmluZykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0dmFyIGFiYnIgPSAvXiMoW2EtZjAtOV17Myw0fSkkL2k7XG5cdHZhciBoZXggPSAvXiMoW2EtZjAtOV17Nn0pKFthLWYwLTldezJ9KT8kL2k7XG5cdHZhciByZ2JhID0gL15yZ2JhP1xcKFxccyooWystXT9cXGQrKSg/PVtcXHMsXSlcXHMqKD86LFxccyopPyhbKy1dP1xcZCspKD89W1xccyxdKVxccyooPzosXFxzKik/KFsrLV0/XFxkKylcXHMqKD86Wyx8XFwvXVxccyooWystXT9bXFxkXFwuXSspKCU/KVxccyopP1xcKSQvO1xuXHR2YXIgcGVyID0gL15yZ2JhP1xcKFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKiw/XFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqLD9cXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyooPzpbLHxcXC9dXFxzKihbKy1dP1tcXGRcXC5dKykoJT8pXFxzKik/XFwpJC87XG5cdHZhciBrZXl3b3JkID0gL14oXFx3KykkLztcblxuXHR2YXIgcmdiID0gWzAsIDAsIDAsIDFdO1xuXHR2YXIgbWF0Y2g7XG5cdHZhciBpO1xuXHR2YXIgaGV4QWxwaGE7XG5cblx0aWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGhleCkpIHtcblx0XHRoZXhBbHBoYSA9IG1hdGNoWzJdO1xuXHRcdG1hdGNoID0gbWF0Y2hbMV07XG5cblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHQvLyBodHRwczovL2pzcGVyZi5jb20vc2xpY2UtdnMtc3Vic3RyLXZzLXN1YnN0cmluZy1tZXRob2RzLWxvbmctc3RyaW5nLzE5XG5cdFx0XHR2YXIgaTIgPSBpICogMjtcblx0XHRcdHJnYltpXSA9IHBhcnNlSW50KG1hdGNoLnNsaWNlKGkyLCBpMiArIDIpLCAxNik7XG5cdFx0fVxuXG5cdFx0aWYgKGhleEFscGhhKSB7XG5cdFx0XHRyZ2JbM10gPSBwYXJzZUludChoZXhBbHBoYSwgMTYpIC8gMjU1O1xuXHRcdH1cblx0fSBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChhYmJyKSkge1xuXHRcdG1hdGNoID0gbWF0Y2hbMV07XG5cdFx0aGV4QWxwaGEgPSBtYXRjaFszXTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHRcdHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2ldICsgbWF0Y2hbaV0sIDE2KTtcblx0XHR9XG5cblx0XHRpZiAoaGV4QWxwaGEpIHtcblx0XHRcdHJnYlszXSA9IHBhcnNlSW50KGhleEFscGhhICsgaGV4QWxwaGEsIDE2KSAvIDI1NTtcblx0XHR9XG5cdH0gZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocmdiYSkpIHtcblx0XHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpICsgMV0sIDApO1xuXHRcdH1cblxuXHRcdGlmIChtYXRjaFs0XSkge1xuXHRcdFx0aWYgKG1hdGNoWzVdKSB7XG5cdFx0XHRcdHJnYlszXSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pICogMC4wMTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJnYlszXSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChwZXIpKSB7XG5cdFx0Zm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuXHRcdFx0cmdiW2ldID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KG1hdGNoW2kgKyAxXSkgKiAyLjU1KTtcblx0XHR9XG5cblx0XHRpZiAobWF0Y2hbNF0pIHtcblx0XHRcdGlmIChtYXRjaFs1XSkge1xuXHRcdFx0XHRyZ2JbM10gPSBwYXJzZUZsb2F0KG1hdGNoWzRdKSAqIDAuMDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZ2JbM10gPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goa2V5d29yZCkpIHtcblx0XHRpZiAobWF0Y2hbMV0gPT09ICd0cmFuc3BhcmVudCcpIHtcblx0XHRcdHJldHVybiBbMCwgMCwgMCwgMF07XG5cdFx0fVxuXG5cdFx0aWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbG9yTmFtZXMsIG1hdGNoWzFdKSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0cmdiID0gY29sb3JOYW1lc1ttYXRjaFsxXV07XG5cdFx0cmdiWzNdID0gMTtcblxuXHRcdHJldHVybiByZ2I7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0cmdiW2ldID0gY2xhbXAocmdiW2ldLCAwLCAyNTUpO1xuXHR9XG5cdHJnYlszXSA9IGNsYW1wKHJnYlszXSwgMCwgMSk7XG5cblx0cmV0dXJuIHJnYjtcbn07XG5cbmNzLmdldC5oc2wgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdGlmICghc3RyaW5nKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHR2YXIgaHNsID0gL15oc2xhP1xcKFxccyooWystXT8oPzpcXGR7MCwzfVxcLik/XFxkKykoPzpkZWcpP1xccyosP1xccyooWystXT9bXFxkXFwuXSspJVxccyosP1xccyooWystXT9bXFxkXFwuXSspJVxccyooPzpbLHxcXC9dXFxzKihbKy1dPyg/PVxcLlxcZHxcXGQpKD86MHxbMS05XVxcZCopPyg/OlxcLlxcZCopPyg/OltlRV1bKy1dP1xcZCspPylcXHMqKT9cXCkkLztcblx0dmFyIG1hdGNoID0gc3RyaW5nLm1hdGNoKGhzbCk7XG5cblx0aWYgKG1hdGNoKSB7XG5cdFx0dmFyIGFscGhhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG5cdFx0dmFyIGggPSAoKHBhcnNlRmxvYXQobWF0Y2hbMV0pICUgMzYwKSArIDM2MCkgJSAzNjA7XG5cdFx0dmFyIHMgPSBjbGFtcChwYXJzZUZsb2F0KG1hdGNoWzJdKSwgMCwgMTAwKTtcblx0XHR2YXIgbCA9IGNsYW1wKHBhcnNlRmxvYXQobWF0Y2hbM10pLCAwLCAxMDApO1xuXHRcdHZhciBhID0gY2xhbXAoaXNOYU4oYWxwaGEpID8gMSA6IGFscGhhLCAwLCAxKTtcblxuXHRcdHJldHVybiBbaCwgcywgbCwgYV07XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbmNzLmdldC5od2IgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cdGlmICghc3RyaW5nKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHR2YXIgaHdiID0gL15od2JcXChcXHMqKFsrLV0/XFxkezAsM30oPzpcXC5cXGQrKT8pKD86ZGVnKT9cXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKig/OixcXHMqKFsrLV0/KD89XFwuXFxkfFxcZCkoPzowfFsxLTldXFxkKik/KD86XFwuXFxkKik/KD86W2VFXVsrLV0/XFxkKyk/KVxccyopP1xcKSQvO1xuXHR2YXIgbWF0Y2ggPSBzdHJpbmcubWF0Y2goaHdiKTtcblxuXHRpZiAobWF0Y2gpIHtcblx0XHR2YXIgYWxwaGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcblx0XHR2YXIgaCA9ICgocGFyc2VGbG9hdChtYXRjaFsxXSkgJSAzNjApICsgMzYwKSAlIDM2MDtcblx0XHR2YXIgdyA9IGNsYW1wKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApO1xuXHRcdHZhciBiID0gY2xhbXAocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCk7XG5cdFx0dmFyIGEgPSBjbGFtcChpc05hTihhbHBoYSkgPyAxIDogYWxwaGEsIDAsIDEpO1xuXHRcdHJldHVybiBbaCwgdywgYiwgYV07XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbmNzLnRvLmhleCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHJnYmEgPSBzd2l6emxlKGFyZ3VtZW50cyk7XG5cblx0cmV0dXJuIChcblx0XHQnIycgK1xuXHRcdGhleERvdWJsZShyZ2JhWzBdKSArXG5cdFx0aGV4RG91YmxlKHJnYmFbMV0pICtcblx0XHRoZXhEb3VibGUocmdiYVsyXSkgK1xuXHRcdChyZ2JhWzNdIDwgMVxuXHRcdFx0PyAoaGV4RG91YmxlKE1hdGgucm91bmQocmdiYVszXSAqIDI1NSkpKVxuXHRcdFx0OiAnJylcblx0KTtcbn07XG5cbmNzLnRvLnJnYiA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHJnYmEgPSBzd2l6emxlKGFyZ3VtZW50cyk7XG5cblx0cmV0dXJuIHJnYmEubGVuZ3RoIDwgNCB8fCByZ2JhWzNdID09PSAxXG5cdFx0PyAncmdiKCcgKyBNYXRoLnJvdW5kKHJnYmFbMF0pICsgJywgJyArIE1hdGgucm91bmQocmdiYVsxXSkgKyAnLCAnICsgTWF0aC5yb3VuZChyZ2JhWzJdKSArICcpJ1xuXHRcdDogJ3JnYmEoJyArIE1hdGgucm91bmQocmdiYVswXSkgKyAnLCAnICsgTWF0aC5yb3VuZChyZ2JhWzFdKSArICcsICcgKyBNYXRoLnJvdW5kKHJnYmFbMl0pICsgJywgJyArIHJnYmFbM10gKyAnKSc7XG59O1xuXG5jcy50by5yZ2IucGVyY2VudCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHJnYmEgPSBzd2l6emxlKGFyZ3VtZW50cyk7XG5cblx0dmFyIHIgPSBNYXRoLnJvdW5kKHJnYmFbMF0gLyAyNTUgKiAxMDApO1xuXHR2YXIgZyA9IE1hdGgucm91bmQocmdiYVsxXSAvIDI1NSAqIDEwMCk7XG5cdHZhciBiID0gTWF0aC5yb3VuZChyZ2JhWzJdIC8gMjU1ICogMTAwKTtcblxuXHRyZXR1cm4gcmdiYS5sZW5ndGggPCA0IHx8IHJnYmFbM10gPT09IDFcblx0XHQ/ICdyZ2IoJyArIHIgKyAnJSwgJyArIGcgKyAnJSwgJyArIGIgKyAnJSknXG5cdFx0OiAncmdiYSgnICsgciArICclLCAnICsgZyArICclLCAnICsgYiArICclLCAnICsgcmdiYVszXSArICcpJztcbn07XG5cbmNzLnRvLmhzbCA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGhzbGEgPSBzd2l6emxlKGFyZ3VtZW50cyk7XG5cdHJldHVybiBoc2xhLmxlbmd0aCA8IDQgfHwgaHNsYVszXSA9PT0gMVxuXHRcdD8gJ2hzbCgnICsgaHNsYVswXSArICcsICcgKyBoc2xhWzFdICsgJyUsICcgKyBoc2xhWzJdICsgJyUpJ1xuXHRcdDogJ2hzbGEoJyArIGhzbGFbMF0gKyAnLCAnICsgaHNsYVsxXSArICclLCAnICsgaHNsYVsyXSArICclLCAnICsgaHNsYVszXSArICcpJztcbn07XG5cbi8vIGh3YiBpcyBhIGJpdCBkaWZmZXJlbnQgdGhhbiByZ2IoYSkgJiBoc2woYSkgc2luY2UgdGhlcmUgaXMgbm8gYWxwaGEgc3BlY2lmaWMgc3ludGF4XG4vLyAoaHdiIGhhdmUgYWxwaGEgb3B0aW9uYWwgJiAxIGlzIGRlZmF1bHQgdmFsdWUpXG5jcy50by5od2IgPSBmdW5jdGlvbiAoKSB7XG5cdHZhciBod2JhID0gc3dpenpsZShhcmd1bWVudHMpO1xuXG5cdHZhciBhID0gJyc7XG5cdGlmIChod2JhLmxlbmd0aCA+PSA0ICYmIGh3YmFbM10gIT09IDEpIHtcblx0XHRhID0gJywgJyArIGh3YmFbM107XG5cdH1cblxuXHRyZXR1cm4gJ2h3YignICsgaHdiYVswXSArICcsICcgKyBod2JhWzFdICsgJyUsICcgKyBod2JhWzJdICsgJyUnICsgYSArICcpJztcbn07XG5cbmNzLnRvLmtleXdvcmQgPSBmdW5jdGlvbiAocmdiKSB7XG5cdHJldHVybiByZXZlcnNlTmFtZXNbcmdiLnNsaWNlKDAsIDMpXTtcbn07XG5cbi8vIGhlbHBlcnNcbmZ1bmN0aW9uIGNsYW1wKG51bSwgbWluLCBtYXgpIHtcblx0cmV0dXJuIE1hdGgubWluKE1hdGgubWF4KG1pbiwgbnVtKSwgbWF4KTtcbn1cblxuZnVuY3Rpb24gaGV4RG91YmxlKG51bSkge1xuXHR2YXIgc3RyID0gTWF0aC5yb3VuZChudW0pLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuXHRyZXR1cm4gKHN0ci5sZW5ndGggPCAyKSA/ICcwJyArIHN0ciA6IHN0cjtcbn1cbiIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY3NzS2V5d29yZHMgPSByZXF1aXJlKCdjb2xvci1uYW1lJyk7XG5cbi8vIE5PVEU6IGNvbnZlcnNpb25zIHNob3VsZCBvbmx5IHJldHVybiBwcmltaXRpdmUgdmFsdWVzIChpLmUuIGFycmF5cywgb3Jcbi8vICAgICAgIHZhbHVlcyB0aGF0IGdpdmUgY29ycmVjdCBgdHlwZW9mYCByZXN1bHRzKS5cbi8vICAgICAgIGRvIG5vdCB1c2UgYm94IHZhbHVlcyB0eXBlcyAoaS5lLiBOdW1iZXIoKSwgU3RyaW5nKCksIGV0Yy4pXG5cbnZhciByZXZlcnNlS2V5d29yZHMgPSB7fTtcbmZvciAodmFyIGtleSBpbiBjc3NLZXl3b3Jkcykge1xuXHRpZiAoY3NzS2V5d29yZHMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdHJldmVyc2VLZXl3b3Jkc1tjc3NLZXl3b3Jkc1trZXldXSA9IGtleTtcblx0fVxufVxuXG52YXIgY29udmVydCA9IG1vZHVsZS5leHBvcnRzID0ge1xuXHRyZ2I6IHtjaGFubmVsczogMywgbGFiZWxzOiAncmdiJ30sXG5cdGhzbDoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICdoc2wnfSxcblx0aHN2OiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogJ2hzdid9LFxuXHRod2I6IHtjaGFubmVsczogMywgbGFiZWxzOiAnaHdiJ30sXG5cdGNteWs6IHtjaGFubmVsczogNCwgbGFiZWxzOiAnY215ayd9LFxuXHR4eXo6IHtjaGFubmVsczogMywgbGFiZWxzOiAneHl6J30sXG5cdGxhYjoge2NoYW5uZWxzOiAzLCBsYWJlbHM6ICdsYWInfSxcblx0bGNoOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogJ2xjaCd9LFxuXHRoZXg6IHtjaGFubmVsczogMSwgbGFiZWxzOiBbJ2hleCddfSxcblx0a2V5d29yZDoge2NoYW5uZWxzOiAxLCBsYWJlbHM6IFsna2V5d29yZCddfSxcblx0YW5zaTE2OiB7Y2hhbm5lbHM6IDEsIGxhYmVsczogWydhbnNpMTYnXX0sXG5cdGFuc2kyNTY6IHtjaGFubmVsczogMSwgbGFiZWxzOiBbJ2Fuc2kyNTYnXX0sXG5cdGhjZzoge2NoYW5uZWxzOiAzLCBsYWJlbHM6IFsnaCcsICdjJywgJ2cnXX0sXG5cdGFwcGxlOiB7Y2hhbm5lbHM6IDMsIGxhYmVsczogWydyMTYnLCAnZzE2JywgJ2IxNiddfSxcblx0Z3JheToge2NoYW5uZWxzOiAxLCBsYWJlbHM6IFsnZ3JheSddfVxufTtcblxuLy8gaGlkZSAuY2hhbm5lbHMgYW5kIC5sYWJlbHMgcHJvcGVydGllc1xuZm9yICh2YXIgbW9kZWwgaW4gY29udmVydCkge1xuXHRpZiAoY29udmVydC5oYXNPd25Qcm9wZXJ0eShtb2RlbCkpIHtcblx0XHRpZiAoISgnY2hhbm5lbHMnIGluIGNvbnZlcnRbbW9kZWxdKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGNoYW5uZWxzIHByb3BlcnR5OiAnICsgbW9kZWwpO1xuXHRcdH1cblxuXHRcdGlmICghKCdsYWJlbHMnIGluIGNvbnZlcnRbbW9kZWxdKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIGNoYW5uZWwgbGFiZWxzIHByb3BlcnR5OiAnICsgbW9kZWwpO1xuXHRcdH1cblxuXHRcdGlmIChjb252ZXJ0W21vZGVsXS5sYWJlbHMubGVuZ3RoICE9PSBjb252ZXJ0W21vZGVsXS5jaGFubmVscykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdjaGFubmVsIGFuZCBsYWJlbCBjb3VudHMgbWlzbWF0Y2g6ICcgKyBtb2RlbCk7XG5cdFx0fVxuXG5cdFx0dmFyIGNoYW5uZWxzID0gY29udmVydFttb2RlbF0uY2hhbm5lbHM7XG5cdFx0dmFyIGxhYmVscyA9IGNvbnZlcnRbbW9kZWxdLmxhYmVscztcblx0XHRkZWxldGUgY29udmVydFttb2RlbF0uY2hhbm5lbHM7XG5cdFx0ZGVsZXRlIGNvbnZlcnRbbW9kZWxdLmxhYmVscztcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udmVydFttb2RlbF0sICdjaGFubmVscycsIHt2YWx1ZTogY2hhbm5lbHN9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoY29udmVydFttb2RlbF0sICdsYWJlbHMnLCB7dmFsdWU6IGxhYmVsc30pO1xuXHR9XG59XG5cbmNvbnZlcnQucmdiLmhzbCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpO1xuXHR2YXIgbWF4ID0gTWF0aC5tYXgociwgZywgYik7XG5cdHZhciBkZWx0YSA9IG1heCAtIG1pbjtcblx0dmFyIGg7XG5cdHZhciBzO1xuXHR2YXIgbDtcblxuXHRpZiAobWF4ID09PSBtaW4pIHtcblx0XHRoID0gMDtcblx0fSBlbHNlIGlmIChyID09PSBtYXgpIHtcblx0XHRoID0gKGcgLSBiKSAvIGRlbHRhO1xuXHR9IGVsc2UgaWYgKGcgPT09IG1heCkge1xuXHRcdGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuXHR9IGVsc2UgaWYgKGIgPT09IG1heCkge1xuXHRcdGggPSA0ICsgKHIgLSBnKSAvIGRlbHRhO1xuXHR9XG5cblx0aCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuXHRpZiAoaCA8IDApIHtcblx0XHRoICs9IDM2MDtcblx0fVxuXG5cdGwgPSAobWluICsgbWF4KSAvIDI7XG5cblx0aWYgKG1heCA9PT0gbWluKSB7XG5cdFx0cyA9IDA7XG5cdH0gZWxzZSBpZiAobCA8PSAwLjUpIHtcblx0XHRzID0gZGVsdGEgLyAobWF4ICsgbWluKTtcblx0fSBlbHNlIHtcblx0XHRzID0gZGVsdGEgLyAoMiAtIG1heCAtIG1pbik7XG5cdH1cblxuXHRyZXR1cm4gW2gsIHMgKiAxMDAsIGwgKiAxMDBdO1xufTtcblxuY29udmVydC5yZ2IuaHN2ID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgcmRpZjtcblx0dmFyIGdkaWY7XG5cdHZhciBiZGlmO1xuXHR2YXIgaDtcblx0dmFyIHM7XG5cblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIHYgPSBNYXRoLm1heChyLCBnLCBiKTtcblx0dmFyIGRpZmYgPSB2IC0gTWF0aC5taW4ociwgZywgYik7XG5cdHZhciBkaWZmYyA9IGZ1bmN0aW9uIChjKSB7XG5cdFx0cmV0dXJuICh2IC0gYykgLyA2IC8gZGlmZiArIDEgLyAyO1xuXHR9O1xuXG5cdGlmIChkaWZmID09PSAwKSB7XG5cdFx0aCA9IHMgPSAwO1xuXHR9IGVsc2Uge1xuXHRcdHMgPSBkaWZmIC8gdjtcblx0XHRyZGlmID0gZGlmZmMocik7XG5cdFx0Z2RpZiA9IGRpZmZjKGcpO1xuXHRcdGJkaWYgPSBkaWZmYyhiKTtcblxuXHRcdGlmIChyID09PSB2KSB7XG5cdFx0XHRoID0gYmRpZiAtIGdkaWY7XG5cdFx0fSBlbHNlIGlmIChnID09PSB2KSB7XG5cdFx0XHRoID0gKDEgLyAzKSArIHJkaWYgLSBiZGlmO1xuXHRcdH0gZWxzZSBpZiAoYiA9PT0gdikge1xuXHRcdFx0aCA9ICgyIC8gMykgKyBnZGlmIC0gcmRpZjtcblx0XHR9XG5cdFx0aWYgKGggPCAwKSB7XG5cdFx0XHRoICs9IDE7XG5cdFx0fSBlbHNlIGlmIChoID4gMSkge1xuXHRcdFx0aCAtPSAxO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBbXG5cdFx0aCAqIDM2MCxcblx0XHRzICogMTAwLFxuXHRcdHYgKiAxMDBcblx0XTtcbn07XG5cbmNvbnZlcnQucmdiLmh3YiA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF07XG5cdHZhciBnID0gcmdiWzFdO1xuXHR2YXIgYiA9IHJnYlsyXTtcblx0dmFyIGggPSBjb252ZXJ0LnJnYi5oc2wocmdiKVswXTtcblx0dmFyIHcgPSAxIC8gMjU1ICogTWF0aC5taW4ociwgTWF0aC5taW4oZywgYikpO1xuXG5cdGIgPSAxIC0gMSAvIDI1NSAqIE1hdGgubWF4KHIsIE1hdGgubWF4KGcsIGIpKTtcblxuXHRyZXR1cm4gW2gsIHcgKiAxMDAsIGIgKiAxMDBdO1xufTtcblxuY29udmVydC5yZ2IuY215ayA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIGM7XG5cdHZhciBtO1xuXHR2YXIgeTtcblx0dmFyIGs7XG5cblx0ayA9IE1hdGgubWluKDEgLSByLCAxIC0gZywgMSAtIGIpO1xuXHRjID0gKDEgLSByIC0gaykgLyAoMSAtIGspIHx8IDA7XG5cdG0gPSAoMSAtIGcgLSBrKSAvICgxIC0gaykgfHwgMDtcblx0eSA9ICgxIC0gYiAtIGspIC8gKDEgLSBrKSB8fCAwO1xuXG5cdHJldHVybiBbYyAqIDEwMCwgbSAqIDEwMCwgeSAqIDEwMCwgayAqIDEwMF07XG59O1xuXG4vKipcbiAqIFNlZSBodHRwczovL2VuLm0ud2lraXBlZGlhLm9yZy93aWtpL0V1Y2xpZGVhbl9kaXN0YW5jZSNTcXVhcmVkX0V1Y2xpZGVhbl9kaXN0YW5jZVxuICogKi9cbmZ1bmN0aW9uIGNvbXBhcmF0aXZlRGlzdGFuY2UoeCwgeSkge1xuXHRyZXR1cm4gKFxuXHRcdE1hdGgucG93KHhbMF0gLSB5WzBdLCAyKSArXG5cdFx0TWF0aC5wb3coeFsxXSAtIHlbMV0sIDIpICtcblx0XHRNYXRoLnBvdyh4WzJdIC0geVsyXSwgMilcblx0KTtcbn1cblxuY29udmVydC5yZ2Iua2V5d29yZCA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHJldmVyc2VkID0gcmV2ZXJzZUtleXdvcmRzW3JnYl07XG5cdGlmIChyZXZlcnNlZCkge1xuXHRcdHJldHVybiByZXZlcnNlZDtcblx0fVxuXG5cdHZhciBjdXJyZW50Q2xvc2VzdERpc3RhbmNlID0gSW5maW5pdHk7XG5cdHZhciBjdXJyZW50Q2xvc2VzdEtleXdvcmQ7XG5cblx0Zm9yICh2YXIga2V5d29yZCBpbiBjc3NLZXl3b3Jkcykge1xuXHRcdGlmIChjc3NLZXl3b3Jkcy5oYXNPd25Qcm9wZXJ0eShrZXl3b3JkKSkge1xuXHRcdFx0dmFyIHZhbHVlID0gY3NzS2V5d29yZHNba2V5d29yZF07XG5cblx0XHRcdC8vIENvbXB1dGUgY29tcGFyYXRpdmUgZGlzdGFuY2Vcblx0XHRcdHZhciBkaXN0YW5jZSA9IGNvbXBhcmF0aXZlRGlzdGFuY2UocmdiLCB2YWx1ZSk7XG5cblx0XHRcdC8vIENoZWNrIGlmIGl0cyBsZXNzLCBpZiBzbyBzZXQgYXMgY2xvc2VzdFxuXHRcdFx0aWYgKGRpc3RhbmNlIDwgY3VycmVudENsb3Nlc3REaXN0YW5jZSkge1xuXHRcdFx0XHRjdXJyZW50Q2xvc2VzdERpc3RhbmNlID0gZGlzdGFuY2U7XG5cdFx0XHRcdGN1cnJlbnRDbG9zZXN0S2V5d29yZCA9IGtleXdvcmQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGN1cnJlbnRDbG9zZXN0S2V5d29yZDtcbn07XG5cbmNvbnZlcnQua2V5d29yZC5yZ2IgPSBmdW5jdGlvbiAoa2V5d29yZCkge1xuXHRyZXR1cm4gY3NzS2V5d29yZHNba2V5d29yZF07XG59O1xuXG5jb252ZXJ0LnJnYi54eXogPSBmdW5jdGlvbiAocmdiKSB7XG5cdHZhciByID0gcmdiWzBdIC8gMjU1O1xuXHR2YXIgZyA9IHJnYlsxXSAvIDI1NTtcblx0dmFyIGIgPSByZ2JbMl0gLyAyNTU7XG5cblx0Ly8gYXNzdW1lIHNSR0Jcblx0ciA9IHIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChyICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKHIgLyAxMi45Mik7XG5cdGcgPSBnID4gMC4wNDA0NSA/IE1hdGgucG93KCgoZyArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChnIC8gMTIuOTIpO1xuXHRiID0gYiA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoYiAvIDEyLjkyKTtcblxuXHR2YXIgeCA9IChyICogMC40MTI0KSArIChnICogMC4zNTc2KSArIChiICogMC4xODA1KTtcblx0dmFyIHkgPSAociAqIDAuMjEyNikgKyAoZyAqIDAuNzE1MikgKyAoYiAqIDAuMDcyMik7XG5cdHZhciB6ID0gKHIgKiAwLjAxOTMpICsgKGcgKiAwLjExOTIpICsgKGIgKiAwLjk1MDUpO1xuXG5cdHJldHVybiBbeCAqIDEwMCwgeSAqIDEwMCwgeiAqIDEwMF07XG59O1xuXG5jb252ZXJ0LnJnYi5sYWIgPSBmdW5jdGlvbiAocmdiKSB7XG5cdHZhciB4eXogPSBjb252ZXJ0LnJnYi54eXoocmdiKTtcblx0dmFyIHggPSB4eXpbMF07XG5cdHZhciB5ID0geHl6WzFdO1xuXHR2YXIgeiA9IHh5elsyXTtcblx0dmFyIGw7XG5cdHZhciBhO1xuXHR2YXIgYjtcblxuXHR4IC89IDk1LjA0Nztcblx0eSAvPSAxMDA7XG5cdHogLz0gMTA4Ljg4MztcblxuXHR4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMSAvIDMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuXHR5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMSAvIDMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuXHR6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMSAvIDMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG5cdGwgPSAoMTE2ICogeSkgLSAxNjtcblx0YSA9IDUwMCAqICh4IC0geSk7XG5cdGIgPSAyMDAgKiAoeSAtIHopO1xuXG5cdHJldHVybiBbbCwgYSwgYl07XG59O1xuXG5jb252ZXJ0LmhzbC5yZ2IgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBoID0gaHNsWzBdIC8gMzYwO1xuXHR2YXIgcyA9IGhzbFsxXSAvIDEwMDtcblx0dmFyIGwgPSBoc2xbMl0gLyAxMDA7XG5cdHZhciB0MTtcblx0dmFyIHQyO1xuXHR2YXIgdDM7XG5cdHZhciByZ2I7XG5cdHZhciB2YWw7XG5cblx0aWYgKHMgPT09IDApIHtcblx0XHR2YWwgPSBsICogMjU1O1xuXHRcdHJldHVybiBbdmFsLCB2YWwsIHZhbF07XG5cdH1cblxuXHRpZiAobCA8IDAuNSkge1xuXHRcdHQyID0gbCAqICgxICsgcyk7XG5cdH0gZWxzZSB7XG5cdFx0dDIgPSBsICsgcyAtIGwgKiBzO1xuXHR9XG5cblx0dDEgPSAyICogbCAtIHQyO1xuXG5cdHJnYiA9IFswLCAwLCAwXTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHR0MyA9IGggKyAxIC8gMyAqIC0oaSAtIDEpO1xuXHRcdGlmICh0MyA8IDApIHtcblx0XHRcdHQzKys7XG5cdFx0fVxuXHRcdGlmICh0MyA+IDEpIHtcblx0XHRcdHQzLS07XG5cdFx0fVxuXG5cdFx0aWYgKDYgKiB0MyA8IDEpIHtcblx0XHRcdHZhbCA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzO1xuXHRcdH0gZWxzZSBpZiAoMiAqIHQzIDwgMSkge1xuXHRcdFx0dmFsID0gdDI7XG5cdFx0fSBlbHNlIGlmICgzICogdDMgPCAyKSB7XG5cdFx0XHR2YWwgPSB0MSArICh0MiAtIHQxKSAqICgyIC8gMyAtIHQzKSAqIDY7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhbCA9IHQxO1xuXHRcdH1cblxuXHRcdHJnYltpXSA9IHZhbCAqIDI1NTtcblx0fVxuXG5cdHJldHVybiByZ2I7XG59O1xuXG5jb252ZXJ0LmhzbC5oc3YgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBoID0gaHNsWzBdO1xuXHR2YXIgcyA9IGhzbFsxXSAvIDEwMDtcblx0dmFyIGwgPSBoc2xbMl0gLyAxMDA7XG5cdHZhciBzbWluID0gcztcblx0dmFyIGxtaW4gPSBNYXRoLm1heChsLCAwLjAxKTtcblx0dmFyIHN2O1xuXHR2YXIgdjtcblxuXHRsICo9IDI7XG5cdHMgKj0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG5cdHNtaW4gKj0gbG1pbiA8PSAxID8gbG1pbiA6IDIgLSBsbWluO1xuXHR2ID0gKGwgKyBzKSAvIDI7XG5cdHN2ID0gbCA9PT0gMCA/ICgyICogc21pbikgLyAobG1pbiArIHNtaW4pIDogKDIgKiBzKSAvIChsICsgcyk7XG5cblx0cmV0dXJuIFtoLCBzdiAqIDEwMCwgdiAqIDEwMF07XG59O1xuXG5jb252ZXJ0Lmhzdi5yZ2IgPSBmdW5jdGlvbiAoaHN2KSB7XG5cdHZhciBoID0gaHN2WzBdIC8gNjA7XG5cdHZhciBzID0gaHN2WzFdIC8gMTAwO1xuXHR2YXIgdiA9IGhzdlsyXSAvIDEwMDtcblx0dmFyIGhpID0gTWF0aC5mbG9vcihoKSAlIDY7XG5cblx0dmFyIGYgPSBoIC0gTWF0aC5mbG9vcihoKTtcblx0dmFyIHAgPSAyNTUgKiB2ICogKDEgLSBzKTtcblx0dmFyIHEgPSAyNTUgKiB2ICogKDEgLSAocyAqIGYpKTtcblx0dmFyIHQgPSAyNTUgKiB2ICogKDEgLSAocyAqICgxIC0gZikpKTtcblx0diAqPSAyNTU7XG5cblx0c3dpdGNoIChoaSkge1xuXHRcdGNhc2UgMDpcblx0XHRcdHJldHVybiBbdiwgdCwgcF07XG5cdFx0Y2FzZSAxOlxuXHRcdFx0cmV0dXJuIFtxLCB2LCBwXTtcblx0XHRjYXNlIDI6XG5cdFx0XHRyZXR1cm4gW3AsIHYsIHRdO1xuXHRcdGNhc2UgMzpcblx0XHRcdHJldHVybiBbcCwgcSwgdl07XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIFt0LCBwLCB2XTtcblx0XHRjYXNlIDU6XG5cdFx0XHRyZXR1cm4gW3YsIHAsIHFdO1xuXHR9XG59O1xuXG5jb252ZXJ0Lmhzdi5oc2wgPSBmdW5jdGlvbiAoaHN2KSB7XG5cdHZhciBoID0gaHN2WzBdO1xuXHR2YXIgcyA9IGhzdlsxXSAvIDEwMDtcblx0dmFyIHYgPSBoc3ZbMl0gLyAxMDA7XG5cdHZhciB2bWluID0gTWF0aC5tYXgodiwgMC4wMSk7XG5cdHZhciBsbWluO1xuXHR2YXIgc2w7XG5cdHZhciBsO1xuXG5cdGwgPSAoMiAtIHMpICogdjtcblx0bG1pbiA9ICgyIC0gcykgKiB2bWluO1xuXHRzbCA9IHMgKiB2bWluO1xuXHRzbCAvPSAobG1pbiA8PSAxKSA/IGxtaW4gOiAyIC0gbG1pbjtcblx0c2wgPSBzbCB8fCAwO1xuXHRsIC89IDI7XG5cblx0cmV0dXJuIFtoLCBzbCAqIDEwMCwgbCAqIDEwMF07XG59O1xuXG4vLyBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtY29sb3IvI2h3Yi10by1yZ2JcbmNvbnZlcnQuaHdiLnJnYiA9IGZ1bmN0aW9uIChod2IpIHtcblx0dmFyIGggPSBod2JbMF0gLyAzNjA7XG5cdHZhciB3aCA9IGh3YlsxXSAvIDEwMDtcblx0dmFyIGJsID0gaHdiWzJdIC8gMTAwO1xuXHR2YXIgcmF0aW8gPSB3aCArIGJsO1xuXHR2YXIgaTtcblx0dmFyIHY7XG5cdHZhciBmO1xuXHR2YXIgbjtcblxuXHQvLyB3aCArIGJsIGNhbnQgYmUgPiAxXG5cdGlmIChyYXRpbyA+IDEpIHtcblx0XHR3aCAvPSByYXRpbztcblx0XHRibCAvPSByYXRpbztcblx0fVxuXG5cdGkgPSBNYXRoLmZsb29yKDYgKiBoKTtcblx0diA9IDEgLSBibDtcblx0ZiA9IDYgKiBoIC0gaTtcblxuXHRpZiAoKGkgJiAweDAxKSAhPT0gMCkge1xuXHRcdGYgPSAxIC0gZjtcblx0fVxuXG5cdG4gPSB3aCArIGYgKiAodiAtIHdoKTsgLy8gbGluZWFyIGludGVycG9sYXRpb25cblxuXHR2YXIgcjtcblx0dmFyIGc7XG5cdHZhciBiO1xuXHRzd2l0Y2ggKGkpIHtcblx0XHRkZWZhdWx0OlxuXHRcdGNhc2UgNjpcblx0XHRjYXNlIDA6IHIgPSB2OyBnID0gbjsgYiA9IHdoOyBicmVhaztcblx0XHRjYXNlIDE6IHIgPSBuOyBnID0gdjsgYiA9IHdoOyBicmVhaztcblx0XHRjYXNlIDI6IHIgPSB3aDsgZyA9IHY7IGIgPSBuOyBicmVhaztcblx0XHRjYXNlIDM6IHIgPSB3aDsgZyA9IG47IGIgPSB2OyBicmVhaztcblx0XHRjYXNlIDQ6IHIgPSBuOyBnID0gd2g7IGIgPSB2OyBicmVhaztcblx0XHRjYXNlIDU6IHIgPSB2OyBnID0gd2g7IGIgPSBuOyBicmVhaztcblx0fVxuXG5cdHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59O1xuXG5jb252ZXJ0LmNteWsucmdiID0gZnVuY3Rpb24gKGNteWspIHtcblx0dmFyIGMgPSBjbXlrWzBdIC8gMTAwO1xuXHR2YXIgbSA9IGNteWtbMV0gLyAxMDA7XG5cdHZhciB5ID0gY215a1syXSAvIDEwMDtcblx0dmFyIGsgPSBjbXlrWzNdIC8gMTAwO1xuXHR2YXIgcjtcblx0dmFyIGc7XG5cdHZhciBiO1xuXG5cdHIgPSAxIC0gTWF0aC5taW4oMSwgYyAqICgxIC0gaykgKyBrKTtcblx0ZyA9IDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspO1xuXHRiID0gMSAtIE1hdGgubWluKDEsIHkgKiAoMSAtIGspICsgayk7XG5cblx0cmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn07XG5cbmNvbnZlcnQueHl6LnJnYiA9IGZ1bmN0aW9uICh4eXopIHtcblx0dmFyIHggPSB4eXpbMF0gLyAxMDA7XG5cdHZhciB5ID0geHl6WzFdIC8gMTAwO1xuXHR2YXIgeiA9IHh5elsyXSAvIDEwMDtcblx0dmFyIHI7XG5cdHZhciBnO1xuXHR2YXIgYjtcblxuXHRyID0gKHggKiAzLjI0MDYpICsgKHkgKiAtMS41MzcyKSArICh6ICogLTAuNDk4Nik7XG5cdGcgPSAoeCAqIC0wLjk2ODkpICsgKHkgKiAxLjg3NTgpICsgKHogKiAwLjA0MTUpO1xuXHRiID0gKHggKiAwLjA1NTcpICsgKHkgKiAtMC4yMDQwKSArICh6ICogMS4wNTcwKTtcblxuXHQvLyBhc3N1bWUgc1JHQlxuXHRyID0gciA+IDAuMDAzMTMwOFxuXHRcdD8gKCgxLjA1NSAqIE1hdGgucG93KHIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG5cdFx0OiByICogMTIuOTI7XG5cblx0ZyA9IGcgPiAwLjAwMzEzMDhcblx0XHQ/ICgoMS4wNTUgKiBNYXRoLnBvdyhnLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuXHRcdDogZyAqIDEyLjkyO1xuXG5cdGIgPSBiID4gMC4wMDMxMzA4XG5cdFx0PyAoKDEuMDU1ICogTWF0aC5wb3coYiwgMS4wIC8gMi40KSkgLSAwLjA1NSlcblx0XHQ6IGIgKiAxMi45MjtcblxuXHRyID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgciksIDEpO1xuXHRnID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgZyksIDEpO1xuXHRiID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgYiksIDEpO1xuXG5cdHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59O1xuXG5jb252ZXJ0Lnh5ei5sYWIgPSBmdW5jdGlvbiAoeHl6KSB7XG5cdHZhciB4ID0geHl6WzBdO1xuXHR2YXIgeSA9IHh5elsxXTtcblx0dmFyIHogPSB4eXpbMl07XG5cdHZhciBsO1xuXHR2YXIgYTtcblx0dmFyIGI7XG5cblx0eCAvPSA5NS4wNDc7XG5cdHkgLz0gMTAwO1xuXHR6IC89IDEwOC44ODM7XG5cblx0eCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEgLyAzKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcblx0eSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEgLyAzKSA6ICg3Ljc4NyAqIHkpICsgKDE2IC8gMTE2KTtcblx0eiA9IHogPiAwLjAwODg1NiA/IE1hdGgucG93KHosIDEgLyAzKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuXHRsID0gKDExNiAqIHkpIC0gMTY7XG5cdGEgPSA1MDAgKiAoeCAtIHkpO1xuXHRiID0gMjAwICogKHkgLSB6KTtcblxuXHRyZXR1cm4gW2wsIGEsIGJdO1xufTtcblxuY29udmVydC5sYWIueHl6ID0gZnVuY3Rpb24gKGxhYikge1xuXHR2YXIgbCA9IGxhYlswXTtcblx0dmFyIGEgPSBsYWJbMV07XG5cdHZhciBiID0gbGFiWzJdO1xuXHR2YXIgeDtcblx0dmFyIHk7XG5cdHZhciB6O1xuXG5cdHkgPSAobCArIDE2KSAvIDExNjtcblx0eCA9IGEgLyA1MDAgKyB5O1xuXHR6ID0geSAtIGIgLyAyMDA7XG5cblx0dmFyIHkyID0gTWF0aC5wb3coeSwgMyk7XG5cdHZhciB4MiA9IE1hdGgucG93KHgsIDMpO1xuXHR2YXIgejIgPSBNYXRoLnBvdyh6LCAzKTtcblx0eSA9IHkyID4gMC4wMDg4NTYgPyB5MiA6ICh5IC0gMTYgLyAxMTYpIC8gNy43ODc7XG5cdHggPSB4MiA+IDAuMDA4ODU2ID8geDIgOiAoeCAtIDE2IC8gMTE2KSAvIDcuNzg3O1xuXHR6ID0gejIgPiAwLjAwODg1NiA/IHoyIDogKHogLSAxNiAvIDExNikgLyA3Ljc4NztcblxuXHR4ICo9IDk1LjA0Nztcblx0eSAqPSAxMDA7XG5cdHogKj0gMTA4Ljg4MztcblxuXHRyZXR1cm4gW3gsIHksIHpdO1xufTtcblxuY29udmVydC5sYWIubGNoID0gZnVuY3Rpb24gKGxhYikge1xuXHR2YXIgbCA9IGxhYlswXTtcblx0dmFyIGEgPSBsYWJbMV07XG5cdHZhciBiID0gbGFiWzJdO1xuXHR2YXIgaHI7XG5cdHZhciBoO1xuXHR2YXIgYztcblxuXHRociA9IE1hdGguYXRhbjIoYiwgYSk7XG5cdGggPSBociAqIDM2MCAvIDIgLyBNYXRoLlBJO1xuXG5cdGlmIChoIDwgMCkge1xuXHRcdGggKz0gMzYwO1xuXHR9XG5cblx0YyA9IE1hdGguc3FydChhICogYSArIGIgKiBiKTtcblxuXHRyZXR1cm4gW2wsIGMsIGhdO1xufTtcblxuY29udmVydC5sY2gubGFiID0gZnVuY3Rpb24gKGxjaCkge1xuXHR2YXIgbCA9IGxjaFswXTtcblx0dmFyIGMgPSBsY2hbMV07XG5cdHZhciBoID0gbGNoWzJdO1xuXHR2YXIgYTtcblx0dmFyIGI7XG5cdHZhciBocjtcblxuXHRociA9IGggLyAzNjAgKiAyICogTWF0aC5QSTtcblx0YSA9IGMgKiBNYXRoLmNvcyhocik7XG5cdGIgPSBjICogTWF0aC5zaW4oaHIpO1xuXG5cdHJldHVybiBbbCwgYSwgYl07XG59O1xuXG5jb252ZXJ0LnJnYi5hbnNpMTYgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgciA9IGFyZ3NbMF07XG5cdHZhciBnID0gYXJnc1sxXTtcblx0dmFyIGIgPSBhcmdzWzJdO1xuXHR2YXIgdmFsdWUgPSAxIGluIGFyZ3VtZW50cyA/IGFyZ3VtZW50c1sxXSA6IGNvbnZlcnQucmdiLmhzdihhcmdzKVsyXTsgLy8gaHN2IC0+IGFuc2kxNiBvcHRpbWl6YXRpb25cblxuXHR2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgLyA1MCk7XG5cblx0aWYgKHZhbHVlID09PSAwKSB7XG5cdFx0cmV0dXJuIDMwO1xuXHR9XG5cblx0dmFyIGFuc2kgPSAzMFxuXHRcdCsgKChNYXRoLnJvdW5kKGIgLyAyNTUpIDw8IDIpXG5cdFx0fCAoTWF0aC5yb3VuZChnIC8gMjU1KSA8PCAxKVxuXHRcdHwgTWF0aC5yb3VuZChyIC8gMjU1KSk7XG5cblx0aWYgKHZhbHVlID09PSAyKSB7XG5cdFx0YW5zaSArPSA2MDtcblx0fVxuXG5cdHJldHVybiBhbnNpO1xufTtcblxuY29udmVydC5oc3YuYW5zaTE2ID0gZnVuY3Rpb24gKGFyZ3MpIHtcblx0Ly8gb3B0aW1pemF0aW9uIGhlcmU7IHdlIGFscmVhZHkga25vdyB0aGUgdmFsdWUgYW5kIGRvbid0IG5lZWQgdG8gZ2V0XG5cdC8vIGl0IGNvbnZlcnRlZCBmb3IgdXMuXG5cdHJldHVybiBjb252ZXJ0LnJnYi5hbnNpMTYoY29udmVydC5oc3YucmdiKGFyZ3MpLCBhcmdzWzJdKTtcbn07XG5cbmNvbnZlcnQucmdiLmFuc2kyNTYgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgciA9IGFyZ3NbMF07XG5cdHZhciBnID0gYXJnc1sxXTtcblx0dmFyIGIgPSBhcmdzWzJdO1xuXG5cdC8vIHdlIHVzZSB0aGUgZXh0ZW5kZWQgZ3JleXNjYWxlIHBhbGV0dGUgaGVyZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mXG5cdC8vIGJsYWNrIGFuZCB3aGl0ZS4gbm9ybWFsIHBhbGV0dGUgb25seSBoYXMgNCBncmV5c2NhbGUgc2hhZGVzLlxuXHRpZiAociA9PT0gZyAmJiBnID09PSBiKSB7XG5cdFx0aWYgKHIgPCA4KSB7XG5cdFx0XHRyZXR1cm4gMTY7XG5cdFx0fVxuXG5cdFx0aWYgKHIgPiAyNDgpIHtcblx0XHRcdHJldHVybiAyMzE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoKChyIC0gOCkgLyAyNDcpICogMjQpICsgMjMyO1xuXHR9XG5cblx0dmFyIGFuc2kgPSAxNlxuXHRcdCsgKDM2ICogTWF0aC5yb3VuZChyIC8gMjU1ICogNSkpXG5cdFx0KyAoNiAqIE1hdGgucm91bmQoZyAvIDI1NSAqIDUpKVxuXHRcdCsgTWF0aC5yb3VuZChiIC8gMjU1ICogNSk7XG5cblx0cmV0dXJuIGFuc2k7XG59O1xuXG5jb252ZXJ0LmFuc2kxNi5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHR2YXIgY29sb3IgPSBhcmdzICUgMTA7XG5cblx0Ly8gaGFuZGxlIGdyZXlzY2FsZVxuXHRpZiAoY29sb3IgPT09IDAgfHwgY29sb3IgPT09IDcpIHtcblx0XHRpZiAoYXJncyA+IDUwKSB7XG5cdFx0XHRjb2xvciArPSAzLjU7XG5cdFx0fVxuXG5cdFx0Y29sb3IgPSBjb2xvciAvIDEwLjUgKiAyNTU7XG5cblx0XHRyZXR1cm4gW2NvbG9yLCBjb2xvciwgY29sb3JdO1xuXHR9XG5cblx0dmFyIG11bHQgPSAofn4oYXJncyA+IDUwKSArIDEpICogMC41O1xuXHR2YXIgciA9ICgoY29sb3IgJiAxKSAqIG11bHQpICogMjU1O1xuXHR2YXIgZyA9ICgoKGNvbG9yID4+IDEpICYgMSkgKiBtdWx0KSAqIDI1NTtcblx0dmFyIGIgPSAoKChjb2xvciA+PiAyKSAmIDEpICogbXVsdCkgKiAyNTU7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQuYW5zaTI1Ni5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHQvLyBoYW5kbGUgZ3JleXNjYWxlXG5cdGlmIChhcmdzID49IDIzMikge1xuXHRcdHZhciBjID0gKGFyZ3MgLSAyMzIpICogMTAgKyA4O1xuXHRcdHJldHVybiBbYywgYywgY107XG5cdH1cblxuXHRhcmdzIC09IDE2O1xuXG5cdHZhciByZW07XG5cdHZhciByID0gTWF0aC5mbG9vcihhcmdzIC8gMzYpIC8gNSAqIDI1NTtcblx0dmFyIGcgPSBNYXRoLmZsb29yKChyZW0gPSBhcmdzICUgMzYpIC8gNikgLyA1ICogMjU1O1xuXHR2YXIgYiA9IChyZW0gJSA2KSAvIDUgKiAyNTU7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQucmdiLmhleCA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciBpbnRlZ2VyID0gKChNYXRoLnJvdW5kKGFyZ3NbMF0pICYgMHhGRikgPDwgMTYpXG5cdFx0KyAoKE1hdGgucm91bmQoYXJnc1sxXSkgJiAweEZGKSA8PCA4KVxuXHRcdCsgKE1hdGgucm91bmQoYXJnc1syXSkgJiAweEZGKTtcblxuXHR2YXIgc3RyaW5nID0gaW50ZWdlci50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblx0cmV0dXJuICcwMDAwMDAnLnN1YnN0cmluZyhzdHJpbmcubGVuZ3RoKSArIHN0cmluZztcbn07XG5cbmNvbnZlcnQuaGV4LnJnYiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdHZhciBtYXRjaCA9IGFyZ3MudG9TdHJpbmcoMTYpLm1hdGNoKC9bYS1mMC05XXs2fXxbYS1mMC05XXszfS9pKTtcblx0aWYgKCFtYXRjaCkge1xuXHRcdHJldHVybiBbMCwgMCwgMF07XG5cdH1cblxuXHR2YXIgY29sb3JTdHJpbmcgPSBtYXRjaFswXTtcblxuXHRpZiAobWF0Y2hbMF0ubGVuZ3RoID09PSAzKSB7XG5cdFx0Y29sb3JTdHJpbmcgPSBjb2xvclN0cmluZy5zcGxpdCgnJykubWFwKGZ1bmN0aW9uIChjaGFyKSB7XG5cdFx0XHRyZXR1cm4gY2hhciArIGNoYXI7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHR2YXIgaW50ZWdlciA9IHBhcnNlSW50KGNvbG9yU3RyaW5nLCAxNik7XG5cdHZhciByID0gKGludGVnZXIgPj4gMTYpICYgMHhGRjtcblx0dmFyIGcgPSAoaW50ZWdlciA+PiA4KSAmIDB4RkY7XG5cdHZhciBiID0gaW50ZWdlciAmIDB4RkY7XG5cblx0cmV0dXJuIFtyLCBnLCBiXTtcbn07XG5cbmNvbnZlcnQucmdiLmhjZyA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0dmFyIHIgPSByZ2JbMF0gLyAyNTU7XG5cdHZhciBnID0gcmdiWzFdIC8gMjU1O1xuXHR2YXIgYiA9IHJnYlsyXSAvIDI1NTtcblx0dmFyIG1heCA9IE1hdGgubWF4KE1hdGgubWF4KHIsIGcpLCBiKTtcblx0dmFyIG1pbiA9IE1hdGgubWluKE1hdGgubWluKHIsIGcpLCBiKTtcblx0dmFyIGNocm9tYSA9IChtYXggLSBtaW4pO1xuXHR2YXIgZ3JheXNjYWxlO1xuXHR2YXIgaHVlO1xuXG5cdGlmIChjaHJvbWEgPCAxKSB7XG5cdFx0Z3JheXNjYWxlID0gbWluIC8gKDEgLSBjaHJvbWEpO1xuXHR9IGVsc2Uge1xuXHRcdGdyYXlzY2FsZSA9IDA7XG5cdH1cblxuXHRpZiAoY2hyb21hIDw9IDApIHtcblx0XHRodWUgPSAwO1xuXHR9IGVsc2Vcblx0aWYgKG1heCA9PT0gcikge1xuXHRcdGh1ZSA9ICgoZyAtIGIpIC8gY2hyb21hKSAlIDY7XG5cdH0gZWxzZVxuXHRpZiAobWF4ID09PSBnKSB7XG5cdFx0aHVlID0gMiArIChiIC0gcikgLyBjaHJvbWE7XG5cdH0gZWxzZSB7XG5cdFx0aHVlID0gNCArIChyIC0gZykgLyBjaHJvbWEgKyA0O1xuXHR9XG5cblx0aHVlIC89IDY7XG5cdGh1ZSAlPSAxO1xuXG5cdHJldHVybiBbaHVlICogMzYwLCBjaHJvbWEgKiAxMDAsIGdyYXlzY2FsZSAqIDEwMF07XG59O1xuXG5jb252ZXJ0LmhzbC5oY2cgPSBmdW5jdGlvbiAoaHNsKSB7XG5cdHZhciBzID0gaHNsWzFdIC8gMTAwO1xuXHR2YXIgbCA9IGhzbFsyXSAvIDEwMDtcblx0dmFyIGMgPSAxO1xuXHR2YXIgZiA9IDA7XG5cblx0aWYgKGwgPCAwLjUpIHtcblx0XHRjID0gMi4wICogcyAqIGw7XG5cdH0gZWxzZSB7XG5cdFx0YyA9IDIuMCAqIHMgKiAoMS4wIC0gbCk7XG5cdH1cblxuXHRpZiAoYyA8IDEuMCkge1xuXHRcdGYgPSAobCAtIDAuNSAqIGMpIC8gKDEuMCAtIGMpO1xuXHR9XG5cblx0cmV0dXJuIFtoc2xbMF0sIGMgKiAxMDAsIGYgKiAxMDBdO1xufTtcblxuY29udmVydC5oc3YuaGNnID0gZnVuY3Rpb24gKGhzdikge1xuXHR2YXIgcyA9IGhzdlsxXSAvIDEwMDtcblx0dmFyIHYgPSBoc3ZbMl0gLyAxMDA7XG5cblx0dmFyIGMgPSBzICogdjtcblx0dmFyIGYgPSAwO1xuXG5cdGlmIChjIDwgMS4wKSB7XG5cdFx0ZiA9ICh2IC0gYykgLyAoMSAtIGMpO1xuXHR9XG5cblx0cmV0dXJuIFtoc3ZbMF0sIGMgKiAxMDAsIGYgKiAxMDBdO1xufTtcblxuY29udmVydC5oY2cucmdiID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgaCA9IGhjZ1swXSAvIDM2MDtcblx0dmFyIGMgPSBoY2dbMV0gLyAxMDA7XG5cdHZhciBnID0gaGNnWzJdIC8gMTAwO1xuXG5cdGlmIChjID09PSAwLjApIHtcblx0XHRyZXR1cm4gW2cgKiAyNTUsIGcgKiAyNTUsIGcgKiAyNTVdO1xuXHR9XG5cblx0dmFyIHB1cmUgPSBbMCwgMCwgMF07XG5cdHZhciBoaSA9IChoICUgMSkgKiA2O1xuXHR2YXIgdiA9IGhpICUgMTtcblx0dmFyIHcgPSAxIC0gdjtcblx0dmFyIG1nID0gMDtcblxuXHRzd2l0Y2ggKE1hdGguZmxvb3IoaGkpKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0cHVyZVswXSA9IDE7IHB1cmVbMV0gPSB2OyBwdXJlWzJdID0gMDsgYnJlYWs7XG5cdFx0Y2FzZSAxOlxuXHRcdFx0cHVyZVswXSA9IHc7IHB1cmVbMV0gPSAxOyBwdXJlWzJdID0gMDsgYnJlYWs7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0cHVyZVswXSA9IDA7IHB1cmVbMV0gPSAxOyBwdXJlWzJdID0gdjsgYnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cHVyZVswXSA9IDA7IHB1cmVbMV0gPSB3OyBwdXJlWzJdID0gMTsgYnJlYWs7XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cHVyZVswXSA9IHY7IHB1cmVbMV0gPSAwOyBwdXJlWzJdID0gMTsgYnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHB1cmVbMF0gPSAxOyBwdXJlWzFdID0gMDsgcHVyZVsyXSA9IHc7XG5cdH1cblxuXHRtZyA9ICgxLjAgLSBjKSAqIGc7XG5cblx0cmV0dXJuIFtcblx0XHQoYyAqIHB1cmVbMF0gKyBtZykgKiAyNTUsXG5cdFx0KGMgKiBwdXJlWzFdICsgbWcpICogMjU1LFxuXHRcdChjICogcHVyZVsyXSArIG1nKSAqIDI1NVxuXHRdO1xufTtcblxuY29udmVydC5oY2cuaHN2ID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgYyA9IGhjZ1sxXSAvIDEwMDtcblx0dmFyIGcgPSBoY2dbMl0gLyAxMDA7XG5cblx0dmFyIHYgPSBjICsgZyAqICgxLjAgLSBjKTtcblx0dmFyIGYgPSAwO1xuXG5cdGlmICh2ID4gMC4wKSB7XG5cdFx0ZiA9IGMgLyB2O1xuXHR9XG5cblx0cmV0dXJuIFtoY2dbMF0sIGYgKiAxMDAsIHYgKiAxMDBdO1xufTtcblxuY29udmVydC5oY2cuaHNsID0gZnVuY3Rpb24gKGhjZykge1xuXHR2YXIgYyA9IGhjZ1sxXSAvIDEwMDtcblx0dmFyIGcgPSBoY2dbMl0gLyAxMDA7XG5cblx0dmFyIGwgPSBnICogKDEuMCAtIGMpICsgMC41ICogYztcblx0dmFyIHMgPSAwO1xuXG5cdGlmIChsID4gMC4wICYmIGwgPCAwLjUpIHtcblx0XHRzID0gYyAvICgyICogbCk7XG5cdH0gZWxzZVxuXHRpZiAobCA+PSAwLjUgJiYgbCA8IDEuMCkge1xuXHRcdHMgPSBjIC8gKDIgKiAoMSAtIGwpKTtcblx0fVxuXG5cdHJldHVybiBbaGNnWzBdLCBzICogMTAwLCBsICogMTAwXTtcbn07XG5cbmNvbnZlcnQuaGNnLmh3YiA9IGZ1bmN0aW9uIChoY2cpIHtcblx0dmFyIGMgPSBoY2dbMV0gLyAxMDA7XG5cdHZhciBnID0gaGNnWzJdIC8gMTAwO1xuXHR2YXIgdiA9IGMgKyBnICogKDEuMCAtIGMpO1xuXHRyZXR1cm4gW2hjZ1swXSwgKHYgLSBjKSAqIDEwMCwgKDEgLSB2KSAqIDEwMF07XG59O1xuXG5jb252ZXJ0Lmh3Yi5oY2cgPSBmdW5jdGlvbiAoaHdiKSB7XG5cdHZhciB3ID0gaHdiWzFdIC8gMTAwO1xuXHR2YXIgYiA9IGh3YlsyXSAvIDEwMDtcblx0dmFyIHYgPSAxIC0gYjtcblx0dmFyIGMgPSB2IC0gdztcblx0dmFyIGcgPSAwO1xuXG5cdGlmIChjIDwgMSkge1xuXHRcdGcgPSAodiAtIGMpIC8gKDEgLSBjKTtcblx0fVxuXG5cdHJldHVybiBbaHdiWzBdLCBjICogMTAwLCBnICogMTAwXTtcbn07XG5cbmNvbnZlcnQuYXBwbGUucmdiID0gZnVuY3Rpb24gKGFwcGxlKSB7XG5cdHJldHVybiBbKGFwcGxlWzBdIC8gNjU1MzUpICogMjU1LCAoYXBwbGVbMV0gLyA2NTUzNSkgKiAyNTUsIChhcHBsZVsyXSAvIDY1NTM1KSAqIDI1NV07XG59O1xuXG5jb252ZXJ0LnJnYi5hcHBsZSA9IGZ1bmN0aW9uIChyZ2IpIHtcblx0cmV0dXJuIFsocmdiWzBdIC8gMjU1KSAqIDY1NTM1LCAocmdiWzFdIC8gMjU1KSAqIDY1NTM1LCAocmdiWzJdIC8gMjU1KSAqIDY1NTM1XTtcbn07XG5cbmNvbnZlcnQuZ3JheS5yZ2IgPSBmdW5jdGlvbiAoYXJncykge1xuXHRyZXR1cm4gW2FyZ3NbMF0gLyAxMDAgKiAyNTUsIGFyZ3NbMF0gLyAxMDAgKiAyNTUsIGFyZ3NbMF0gLyAxMDAgKiAyNTVdO1xufTtcblxuY29udmVydC5ncmF5LmhzbCA9IGNvbnZlcnQuZ3JheS5oc3YgPSBmdW5jdGlvbiAoYXJncykge1xuXHRyZXR1cm4gWzAsIDAsIGFyZ3NbMF1dO1xufTtcblxuY29udmVydC5ncmF5Lmh3YiA9IGZ1bmN0aW9uIChncmF5KSB7XG5cdHJldHVybiBbMCwgMTAwLCBncmF5WzBdXTtcbn07XG5cbmNvbnZlcnQuZ3JheS5jbXlrID0gZnVuY3Rpb24gKGdyYXkpIHtcblx0cmV0dXJuIFswLCAwLCAwLCBncmF5WzBdXTtcbn07XG5cbmNvbnZlcnQuZ3JheS5sYWIgPSBmdW5jdGlvbiAoZ3JheSkge1xuXHRyZXR1cm4gW2dyYXlbMF0sIDAsIDBdO1xufTtcblxuY29udmVydC5ncmF5LmhleCA9IGZ1bmN0aW9uIChncmF5KSB7XG5cdHZhciB2YWwgPSBNYXRoLnJvdW5kKGdyYXlbMF0gLyAxMDAgKiAyNTUpICYgMHhGRjtcblx0dmFyIGludGVnZXIgPSAodmFsIDw8IDE2KSArICh2YWwgPDwgOCkgKyB2YWw7XG5cblx0dmFyIHN0cmluZyA9IGludGVnZXIudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG5cdHJldHVybiAnMDAwMDAwJy5zdWJzdHJpbmcoc3RyaW5nLmxlbmd0aCkgKyBzdHJpbmc7XG59O1xuXG5jb252ZXJ0LnJnYi5ncmF5ID0gZnVuY3Rpb24gKHJnYikge1xuXHR2YXIgdmFsID0gKHJnYlswXSArIHJnYlsxXSArIHJnYlsyXSkgLyAzO1xuXHRyZXR1cm4gW3ZhbCAvIDI1NSAqIDEwMF07XG59O1xuIiwidmFyIGNvbnZlcnNpb25zID0gcmVxdWlyZSgnLi9jb252ZXJzaW9ucycpO1xuXG4vKlxuXHR0aGlzIGZ1bmN0aW9uIHJvdXRlcyBhIG1vZGVsIHRvIGFsbCBvdGhlciBtb2RlbHMuXG5cblx0YWxsIGZ1bmN0aW9ucyB0aGF0IGFyZSByb3V0ZWQgaGF2ZSBhIHByb3BlcnR5IGAuY29udmVyc2lvbmAgYXR0YWNoZWRcblx0dG8gdGhlIHJldHVybmVkIHN5bnRoZXRpYyBmdW5jdGlvbi4gVGhpcyBwcm9wZXJ0eSBpcyBhbiBhcnJheVxuXHRvZiBzdHJpbmdzLCBlYWNoIHdpdGggdGhlIHN0ZXBzIGluIGJldHdlZW4gdGhlICdmcm9tJyBhbmQgJ3RvJ1xuXHRjb2xvciBtb2RlbHMgKGluY2x1c2l2ZSkuXG5cblx0Y29udmVyc2lvbnMgdGhhdCBhcmUgbm90IHBvc3NpYmxlIHNpbXBseSBhcmUgbm90IGluY2x1ZGVkLlxuKi9cblxuZnVuY3Rpb24gYnVpbGRHcmFwaCgpIHtcblx0dmFyIGdyYXBoID0ge307XG5cdC8vIGh0dHBzOi8vanNwZXJmLmNvbS9vYmplY3Qta2V5cy12cy1mb3ItaW4td2l0aC1jbG9zdXJlLzNcblx0dmFyIG1vZGVscyA9IE9iamVjdC5rZXlzKGNvbnZlcnNpb25zKTtcblxuXHRmb3IgKHZhciBsZW4gPSBtb2RlbHMubGVuZ3RoLCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0Z3JhcGhbbW9kZWxzW2ldXSA9IHtcblx0XHRcdC8vIGh0dHA6Ly9qc3BlcmYuY29tLzEtdnMtaW5maW5pdHlcblx0XHRcdC8vIG1pY3JvLW9wdCwgYnV0IHRoaXMgaXMgc2ltcGxlLlxuXHRcdFx0ZGlzdGFuY2U6IC0xLFxuXHRcdFx0cGFyZW50OiBudWxsXG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiBncmFwaDtcbn1cblxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQnJlYWR0aC1maXJzdF9zZWFyY2hcbmZ1bmN0aW9uIGRlcml2ZUJGUyhmcm9tTW9kZWwpIHtcblx0dmFyIGdyYXBoID0gYnVpbGRHcmFwaCgpO1xuXHR2YXIgcXVldWUgPSBbZnJvbU1vZGVsXTsgLy8gdW5zaGlmdCAtPiBxdWV1ZSAtPiBwb3BcblxuXHRncmFwaFtmcm9tTW9kZWxdLmRpc3RhbmNlID0gMDtcblxuXHR3aGlsZSAocXVldWUubGVuZ3RoKSB7XG5cdFx0dmFyIGN1cnJlbnQgPSBxdWV1ZS5wb3AoKTtcblx0XHR2YXIgYWRqYWNlbnRzID0gT2JqZWN0LmtleXMoY29udmVyc2lvbnNbY3VycmVudF0pO1xuXG5cdFx0Zm9yICh2YXIgbGVuID0gYWRqYWNlbnRzLmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0dmFyIGFkamFjZW50ID0gYWRqYWNlbnRzW2ldO1xuXHRcdFx0dmFyIG5vZGUgPSBncmFwaFthZGphY2VudF07XG5cblx0XHRcdGlmIChub2RlLmRpc3RhbmNlID09PSAtMSkge1xuXHRcdFx0XHRub2RlLmRpc3RhbmNlID0gZ3JhcGhbY3VycmVudF0uZGlzdGFuY2UgKyAxO1xuXHRcdFx0XHRub2RlLnBhcmVudCA9IGN1cnJlbnQ7XG5cdFx0XHRcdHF1ZXVlLnVuc2hpZnQoYWRqYWNlbnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBncmFwaDtcbn1cblxuZnVuY3Rpb24gbGluayhmcm9tLCB0bykge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGFyZ3MpIHtcblx0XHRyZXR1cm4gdG8oZnJvbShhcmdzKSk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIHdyYXBDb252ZXJzaW9uKHRvTW9kZWwsIGdyYXBoKSB7XG5cdHZhciBwYXRoID0gW2dyYXBoW3RvTW9kZWxdLnBhcmVudCwgdG9Nb2RlbF07XG5cdHZhciBmbiA9IGNvbnZlcnNpb25zW2dyYXBoW3RvTW9kZWxdLnBhcmVudF1bdG9Nb2RlbF07XG5cblx0dmFyIGN1ciA9IGdyYXBoW3RvTW9kZWxdLnBhcmVudDtcblx0d2hpbGUgKGdyYXBoW2N1cl0ucGFyZW50KSB7XG5cdFx0cGF0aC51bnNoaWZ0KGdyYXBoW2N1cl0ucGFyZW50KTtcblx0XHRmbiA9IGxpbmsoY29udmVyc2lvbnNbZ3JhcGhbY3VyXS5wYXJlbnRdW2N1cl0sIGZuKTtcblx0XHRjdXIgPSBncmFwaFtjdXJdLnBhcmVudDtcblx0fVxuXG5cdGZuLmNvbnZlcnNpb24gPSBwYXRoO1xuXHRyZXR1cm4gZm47XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZyb21Nb2RlbCkge1xuXHR2YXIgZ3JhcGggPSBkZXJpdmVCRlMoZnJvbU1vZGVsKTtcblx0dmFyIGNvbnZlcnNpb24gPSB7fTtcblxuXHR2YXIgbW9kZWxzID0gT2JqZWN0LmtleXMoZ3JhcGgpO1xuXHRmb3IgKHZhciBsZW4gPSBtb2RlbHMubGVuZ3RoLCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0dmFyIHRvTW9kZWwgPSBtb2RlbHNbaV07XG5cdFx0dmFyIG5vZGUgPSBncmFwaFt0b01vZGVsXTtcblxuXHRcdGlmIChub2RlLnBhcmVudCA9PT0gbnVsbCkge1xuXHRcdFx0Ly8gbm8gcG9zc2libGUgY29udmVyc2lvbiwgb3IgdGhpcyBub2RlIGlzIHRoZSBzb3VyY2UgbW9kZWwuXG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb252ZXJzaW9uW3RvTW9kZWxdID0gd3JhcENvbnZlcnNpb24odG9Nb2RlbCwgZ3JhcGgpO1xuXHR9XG5cblx0cmV0dXJuIGNvbnZlcnNpb247XG59O1xuXG4iLCJ2YXIgY29udmVyc2lvbnMgPSByZXF1aXJlKCcuL2NvbnZlcnNpb25zJyk7XG52YXIgcm91dGUgPSByZXF1aXJlKCcuL3JvdXRlJyk7XG5cbnZhciBjb252ZXJ0ID0ge307XG5cbnZhciBtb2RlbHMgPSBPYmplY3Qua2V5cyhjb252ZXJzaW9ucyk7XG5cbmZ1bmN0aW9uIHdyYXBSYXcoZm4pIHtcblx0dmFyIHdyYXBwZWRGbiA9IGZ1bmN0aW9uIChhcmdzKSB7XG5cdFx0aWYgKGFyZ3MgPT09IHVuZGVmaW5lZCB8fCBhcmdzID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gYXJncztcblx0XHR9XG5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmbihhcmdzKTtcblx0fTtcblxuXHQvLyBwcmVzZXJ2ZSAuY29udmVyc2lvbiBwcm9wZXJ0eSBpZiB0aGVyZSBpcyBvbmVcblx0aWYgKCdjb252ZXJzaW9uJyBpbiBmbikge1xuXHRcdHdyYXBwZWRGbi5jb252ZXJzaW9uID0gZm4uY29udmVyc2lvbjtcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkRm47XG59XG5cbmZ1bmN0aW9uIHdyYXBSb3VuZGVkKGZuKSB7XG5cdHZhciB3cmFwcGVkRm4gPSBmdW5jdGlvbiAoYXJncykge1xuXHRcdGlmIChhcmdzID09PSB1bmRlZmluZWQgfHwgYXJncyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGFyZ3M7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0ID0gZm4oYXJncyk7XG5cblx0XHQvLyB3ZSdyZSBhc3N1bWluZyB0aGUgcmVzdWx0IGlzIGFuIGFycmF5IGhlcmUuXG5cdFx0Ly8gc2VlIG5vdGljZSBpbiBjb252ZXJzaW9ucy5qczsgZG9uJ3QgdXNlIGJveCB0eXBlc1xuXHRcdC8vIGluIGNvbnZlcnNpb24gZnVuY3Rpb25zLlxuXHRcdGlmICh0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0Jykge1xuXHRcdFx0Zm9yICh2YXIgbGVuID0gcmVzdWx0Lmxlbmd0aCwgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRyZXN1bHRbaV0gPSBNYXRoLnJvdW5kKHJlc3VsdFtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHQvLyBwcmVzZXJ2ZSAuY29udmVyc2lvbiBwcm9wZXJ0eSBpZiB0aGVyZSBpcyBvbmVcblx0aWYgKCdjb252ZXJzaW9uJyBpbiBmbikge1xuXHRcdHdyYXBwZWRGbi5jb252ZXJzaW9uID0gZm4uY29udmVyc2lvbjtcblx0fVxuXG5cdHJldHVybiB3cmFwcGVkRm47XG59XG5cbm1vZGVscy5mb3JFYWNoKGZ1bmN0aW9uIChmcm9tTW9kZWwpIHtcblx0Y29udmVydFtmcm9tTW9kZWxdID0ge307XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbnZlcnRbZnJvbU1vZGVsXSwgJ2NoYW5uZWxzJywge3ZhbHVlOiBjb252ZXJzaW9uc1tmcm9tTW9kZWxdLmNoYW5uZWxzfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb252ZXJ0W2Zyb21Nb2RlbF0sICdsYWJlbHMnLCB7dmFsdWU6IGNvbnZlcnNpb25zW2Zyb21Nb2RlbF0ubGFiZWxzfSk7XG5cblx0dmFyIHJvdXRlcyA9IHJvdXRlKGZyb21Nb2RlbCk7XG5cdHZhciByb3V0ZU1vZGVscyA9IE9iamVjdC5rZXlzKHJvdXRlcyk7XG5cblx0cm91dGVNb2RlbHMuZm9yRWFjaChmdW5jdGlvbiAodG9Nb2RlbCkge1xuXHRcdHZhciBmbiA9IHJvdXRlc1t0b01vZGVsXTtcblxuXHRcdGNvbnZlcnRbZnJvbU1vZGVsXVt0b01vZGVsXSA9IHdyYXBSb3VuZGVkKGZuKTtcblx0XHRjb252ZXJ0W2Zyb21Nb2RlbF1bdG9Nb2RlbF0ucmF3ID0gd3JhcFJhdyhmbik7XG5cdH0pO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udmVydDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbG9yU3RyaW5nID0gcmVxdWlyZSgnY29sb3Itc3RyaW5nJyk7XG52YXIgY29udmVydCA9IHJlcXVpcmUoJ2NvbG9yLWNvbnZlcnQnKTtcblxudmFyIF9zbGljZSA9IFtdLnNsaWNlO1xuXG52YXIgc2tpcHBlZE1vZGVscyA9IFtcblx0Ly8gdG8gYmUgaG9uZXN0LCBJIGRvbid0IHJlYWxseSBmZWVsIGxpa2Uga2V5d29yZCBiZWxvbmdzIGluIGNvbG9yIGNvbnZlcnQsIGJ1dCBlaC5cblx0J2tleXdvcmQnLFxuXG5cdC8vIGdyYXkgY29uZmxpY3RzIHdpdGggc29tZSBtZXRob2QgbmFtZXMsIGFuZCBoYXMgaXRzIG93biBtZXRob2QgZGVmaW5lZC5cblx0J2dyYXknLFxuXG5cdC8vIHNob3VsZG4ndCByZWFsbHkgYmUgaW4gY29sb3ItY29udmVydCBlaXRoZXIuLi5cblx0J2hleCdcbl07XG5cbnZhciBoYXNoZWRNb2RlbEtleXMgPSB7fTtcbk9iamVjdC5rZXlzKGNvbnZlcnQpLmZvckVhY2goZnVuY3Rpb24gKG1vZGVsKSB7XG5cdGhhc2hlZE1vZGVsS2V5c1tfc2xpY2UuY2FsbChjb252ZXJ0W21vZGVsXS5sYWJlbHMpLnNvcnQoKS5qb2luKCcnKV0gPSBtb2RlbDtcbn0pO1xuXG52YXIgbGltaXRlcnMgPSB7fTtcblxuZnVuY3Rpb24gQ29sb3Iob2JqLCBtb2RlbCkge1xuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29sb3IpKSB7XG5cdFx0cmV0dXJuIG5ldyBDb2xvcihvYmosIG1vZGVsKTtcblx0fVxuXG5cdGlmIChtb2RlbCAmJiBtb2RlbCBpbiBza2lwcGVkTW9kZWxzKSB7XG5cdFx0bW9kZWwgPSBudWxsO1xuXHR9XG5cblx0aWYgKG1vZGVsICYmICEobW9kZWwgaW4gY29udmVydCkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbW9kZWw6ICcgKyBtb2RlbCk7XG5cdH1cblxuXHR2YXIgaTtcblx0dmFyIGNoYW5uZWxzO1xuXG5cdGlmIChvYmogPT0gbnVsbCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWVxLW51bGwsZXFlcWVxXG5cdFx0dGhpcy5tb2RlbCA9ICdyZ2InO1xuXHRcdHRoaXMuY29sb3IgPSBbMCwgMCwgMF07XG5cdFx0dGhpcy52YWxwaGEgPSAxO1xuXHR9IGVsc2UgaWYgKG9iaiBpbnN0YW5jZW9mIENvbG9yKSB7XG5cdFx0dGhpcy5tb2RlbCA9IG9iai5tb2RlbDtcblx0XHR0aGlzLmNvbG9yID0gb2JqLmNvbG9yLnNsaWNlKCk7XG5cdFx0dGhpcy52YWxwaGEgPSBvYmoudmFscGhhO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG5cdFx0dmFyIHJlc3VsdCA9IGNvbG9yU3RyaW5nLmdldChvYmopO1xuXHRcdGlmIChyZXN1bHQgPT09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHBhcnNlIGNvbG9yIGZyb20gc3RyaW5nOiAnICsgb2JqKTtcblx0XHR9XG5cblx0XHR0aGlzLm1vZGVsID0gcmVzdWx0Lm1vZGVsO1xuXHRcdGNoYW5uZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5jaGFubmVscztcblx0XHR0aGlzLmNvbG9yID0gcmVzdWx0LnZhbHVlLnNsaWNlKDAsIGNoYW5uZWxzKTtcblx0XHR0aGlzLnZhbHBoYSA9IHR5cGVvZiByZXN1bHQudmFsdWVbY2hhbm5lbHNdID09PSAnbnVtYmVyJyA/IHJlc3VsdC52YWx1ZVtjaGFubmVsc10gOiAxO1xuXHR9IGVsc2UgaWYgKG9iai5sZW5ndGgpIHtcblx0XHR0aGlzLm1vZGVsID0gbW9kZWwgfHwgJ3JnYic7XG5cdFx0Y2hhbm5lbHMgPSBjb252ZXJ0W3RoaXMubW9kZWxdLmNoYW5uZWxzO1xuXHRcdHZhciBuZXdBcnIgPSBfc2xpY2UuY2FsbChvYmosIDAsIGNoYW5uZWxzKTtcblx0XHR0aGlzLmNvbG9yID0gemVyb0FycmF5KG5ld0FyciwgY2hhbm5lbHMpO1xuXHRcdHRoaXMudmFscGhhID0gdHlwZW9mIG9ialtjaGFubmVsc10gPT09ICdudW1iZXInID8gb2JqW2NoYW5uZWxzXSA6IDE7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ251bWJlcicpIHtcblx0XHQvLyB0aGlzIGlzIGFsd2F5cyBSR0IgLSBjYW4gYmUgY29udmVydGVkIGxhdGVyIG9uLlxuXHRcdG9iaiAmPSAweEZGRkZGRjtcblx0XHR0aGlzLm1vZGVsID0gJ3JnYic7XG5cdFx0dGhpcy5jb2xvciA9IFtcblx0XHRcdChvYmogPj4gMTYpICYgMHhGRixcblx0XHRcdChvYmogPj4gOCkgJiAweEZGLFxuXHRcdFx0b2JqICYgMHhGRlxuXHRcdF07XG5cdFx0dGhpcy52YWxwaGEgPSAxO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMudmFscGhhID0gMTtcblxuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblx0XHRpZiAoJ2FscGhhJyBpbiBvYmopIHtcblx0XHRcdGtleXMuc3BsaWNlKGtleXMuaW5kZXhPZignYWxwaGEnKSwgMSk7XG5cdFx0XHR0aGlzLnZhbHBoYSA9IHR5cGVvZiBvYmouYWxwaGEgPT09ICdudW1iZXInID8gb2JqLmFscGhhIDogMDtcblx0XHR9XG5cblx0XHR2YXIgaGFzaGVkS2V5cyA9IGtleXMuc29ydCgpLmpvaW4oJycpO1xuXHRcdGlmICghKGhhc2hlZEtleXMgaW4gaGFzaGVkTW9kZWxLZXlzKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdVbmFibGUgdG8gcGFyc2UgY29sb3IgZnJvbSBvYmplY3Q6ICcgKyBKU09OLnN0cmluZ2lmeShvYmopKTtcblx0XHR9XG5cblx0XHR0aGlzLm1vZGVsID0gaGFzaGVkTW9kZWxLZXlzW2hhc2hlZEtleXNdO1xuXG5cdFx0dmFyIGxhYmVscyA9IGNvbnZlcnRbdGhpcy5tb2RlbF0ubGFiZWxzO1xuXHRcdHZhciBjb2xvciA9IFtdO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbG9yLnB1c2gob2JqW2xhYmVsc1tpXV0pO1xuXHRcdH1cblxuXHRcdHRoaXMuY29sb3IgPSB6ZXJvQXJyYXkoY29sb3IpO1xuXHR9XG5cblx0Ly8gcGVyZm9ybSBsaW1pdGF0aW9ucyAoY2xhbXBpbmcsIGV0Yy4pXG5cdGlmIChsaW1pdGVyc1t0aGlzLm1vZGVsXSkge1xuXHRcdGNoYW5uZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5jaGFubmVscztcblx0XHRmb3IgKGkgPSAwOyBpIDwgY2hhbm5lbHM7IGkrKykge1xuXHRcdFx0dmFyIGxpbWl0ID0gbGltaXRlcnNbdGhpcy5tb2RlbF1baV07XG5cdFx0XHRpZiAobGltaXQpIHtcblx0XHRcdFx0dGhpcy5jb2xvcltpXSA9IGxpbWl0KHRoaXMuY29sb3JbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHRoaXMudmFscGhhID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdGhpcy52YWxwaGEpKTtcblxuXHRpZiAoT2JqZWN0LmZyZWV6ZSkge1xuXHRcdE9iamVjdC5mcmVlemUodGhpcyk7XG5cdH1cbn1cblxuQ29sb3IucHJvdG90eXBlID0ge1xuXHR0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnN0cmluZygpO1xuXHR9LFxuXG5cdHRvSlNPTjogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzW3RoaXMubW9kZWxdKCk7XG5cdH0sXG5cblx0c3RyaW5nOiBmdW5jdGlvbiAocGxhY2VzKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzLm1vZGVsIGluIGNvbG9yU3RyaW5nLnRvID8gdGhpcyA6IHRoaXMucmdiKCk7XG5cdFx0c2VsZiA9IHNlbGYucm91bmQodHlwZW9mIHBsYWNlcyA9PT0gJ251bWJlcicgPyBwbGFjZXMgOiAxKTtcblx0XHR2YXIgYXJncyA9IHNlbGYudmFscGhhID09PSAxID8gc2VsZi5jb2xvciA6IHNlbGYuY29sb3IuY29uY2F0KHRoaXMudmFscGhhKTtcblx0XHRyZXR1cm4gY29sb3JTdHJpbmcudG9bc2VsZi5tb2RlbF0oYXJncyk7XG5cdH0sXG5cblx0cGVyY2VudFN0cmluZzogZnVuY3Rpb24gKHBsYWNlcykge1xuXHRcdHZhciBzZWxmID0gdGhpcy5yZ2IoKS5yb3VuZCh0eXBlb2YgcGxhY2VzID09PSAnbnVtYmVyJyA/IHBsYWNlcyA6IDEpO1xuXHRcdHZhciBhcmdzID0gc2VsZi52YWxwaGEgPT09IDEgPyBzZWxmLmNvbG9yIDogc2VsZi5jb2xvci5jb25jYXQodGhpcy52YWxwaGEpO1xuXHRcdHJldHVybiBjb2xvclN0cmluZy50by5yZ2IucGVyY2VudChhcmdzKTtcblx0fSxcblxuXHRhcnJheTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB0aGlzLnZhbHBoYSA9PT0gMSA/IHRoaXMuY29sb3Iuc2xpY2UoKSA6IHRoaXMuY29sb3IuY29uY2F0KHRoaXMudmFscGhhKTtcblx0fSxcblxuXHRvYmplY3Q6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0dmFyIGNoYW5uZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5jaGFubmVscztcblx0XHR2YXIgbGFiZWxzID0gY29udmVydFt0aGlzLm1vZGVsXS5sYWJlbHM7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5uZWxzOyBpKyspIHtcblx0XHRcdHJlc3VsdFtsYWJlbHNbaV1dID0gdGhpcy5jb2xvcltpXTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy52YWxwaGEgIT09IDEpIHtcblx0XHRcdHJlc3VsdC5hbHBoYSA9IHRoaXMudmFscGhhO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0dW5pdEFycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHJnYiA9IHRoaXMucmdiKCkuY29sb3I7XG5cdFx0cmdiWzBdIC89IDI1NTtcblx0XHRyZ2JbMV0gLz0gMjU1O1xuXHRcdHJnYlsyXSAvPSAyNTU7XG5cblx0XHRpZiAodGhpcy52YWxwaGEgIT09IDEpIHtcblx0XHRcdHJnYi5wdXNoKHRoaXMudmFscGhhKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmdiO1xuXHR9LFxuXG5cdHVuaXRPYmplY3Q6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgcmdiID0gdGhpcy5yZ2IoKS5vYmplY3QoKTtcblx0XHRyZ2IuciAvPSAyNTU7XG5cdFx0cmdiLmcgLz0gMjU1O1xuXHRcdHJnYi5iIC89IDI1NTtcblxuXHRcdGlmICh0aGlzLnZhbHBoYSAhPT0gMSkge1xuXHRcdFx0cmdiLmFscGhhID0gdGhpcy52YWxwaGE7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJnYjtcblx0fSxcblxuXHRyb3VuZDogZnVuY3Rpb24gKHBsYWNlcykge1xuXHRcdHBsYWNlcyA9IE1hdGgubWF4KHBsYWNlcyB8fCAwLCAwKTtcblx0XHRyZXR1cm4gbmV3IENvbG9yKHRoaXMuY29sb3IubWFwKHJvdW5kVG9QbGFjZShwbGFjZXMpKS5jb25jYXQodGhpcy52YWxwaGEpLCB0aGlzLm1vZGVsKTtcblx0fSxcblxuXHRhbHBoYTogZnVuY3Rpb24gKHZhbCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENvbG9yKHRoaXMuY29sb3IuY29uY2F0KE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHZhbCkpKSwgdGhpcy5tb2RlbCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMudmFscGhhO1xuXHR9LFxuXG5cdC8vIHJnYlxuXHRyZWQ6IGdldHNldCgncmdiJywgMCwgbWF4Zm4oMjU1KSksXG5cdGdyZWVuOiBnZXRzZXQoJ3JnYicsIDEsIG1heGZuKDI1NSkpLFxuXHRibHVlOiBnZXRzZXQoJ3JnYicsIDIsIG1heGZuKDI1NSkpLFxuXG5cdGh1ZTogZ2V0c2V0KFsnaHNsJywgJ2hzdicsICdoc2wnLCAnaHdiJywgJ2hjZyddLCAwLCBmdW5jdGlvbiAodmFsKSB7IHJldHVybiAoKHZhbCAlIDM2MCkgKyAzNjApICUgMzYwOyB9KSwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBicmFjZS1zdHlsZVxuXG5cdHNhdHVyYXRpb25sOiBnZXRzZXQoJ2hzbCcsIDEsIG1heGZuKDEwMCkpLFxuXHRsaWdodG5lc3M6IGdldHNldCgnaHNsJywgMiwgbWF4Zm4oMTAwKSksXG5cblx0c2F0dXJhdGlvbnY6IGdldHNldCgnaHN2JywgMSwgbWF4Zm4oMTAwKSksXG5cdHZhbHVlOiBnZXRzZXQoJ2hzdicsIDIsIG1heGZuKDEwMCkpLFxuXG5cdGNocm9tYTogZ2V0c2V0KCdoY2cnLCAxLCBtYXhmbigxMDApKSxcblx0Z3JheTogZ2V0c2V0KCdoY2cnLCAyLCBtYXhmbigxMDApKSxcblxuXHR3aGl0ZTogZ2V0c2V0KCdod2InLCAxLCBtYXhmbigxMDApKSxcblx0d2JsYWNrOiBnZXRzZXQoJ2h3YicsIDIsIG1heGZuKDEwMCkpLFxuXG5cdGN5YW46IGdldHNldCgnY215aycsIDAsIG1heGZuKDEwMCkpLFxuXHRtYWdlbnRhOiBnZXRzZXQoJ2NteWsnLCAxLCBtYXhmbigxMDApKSxcblx0eWVsbG93OiBnZXRzZXQoJ2NteWsnLCAyLCBtYXhmbigxMDApKSxcblx0YmxhY2s6IGdldHNldCgnY215aycsIDMsIG1heGZuKDEwMCkpLFxuXG5cdHg6IGdldHNldCgneHl6JywgMCwgbWF4Zm4oMTAwKSksXG5cdHk6IGdldHNldCgneHl6JywgMSwgbWF4Zm4oMTAwKSksXG5cdHo6IGdldHNldCgneHl6JywgMiwgbWF4Zm4oMTAwKSksXG5cblx0bDogZ2V0c2V0KCdsYWInLCAwLCBtYXhmbigxMDApKSxcblx0YTogZ2V0c2V0KCdsYWInLCAxKSxcblx0YjogZ2V0c2V0KCdsYWInLCAyKSxcblxuXHRrZXl3b3JkOiBmdW5jdGlvbiAodmFsKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBuZXcgQ29sb3IodmFsKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY29udmVydFt0aGlzLm1vZGVsXS5rZXl3b3JkKHRoaXMuY29sb3IpO1xuXHR9LFxuXG5cdGhleDogZnVuY3Rpb24gKHZhbCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IENvbG9yKHZhbCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvbG9yU3RyaW5nLnRvLmhleCh0aGlzLnJnYigpLnJvdW5kKCkuY29sb3IpO1xuXHR9LFxuXG5cdHJnYk51bWJlcjogZnVuY3Rpb24gKCkge1xuXHRcdHZhciByZ2IgPSB0aGlzLnJnYigpLmNvbG9yO1xuXHRcdHJldHVybiAoKHJnYlswXSAmIDB4RkYpIDw8IDE2KSB8ICgocmdiWzFdICYgMHhGRikgPDwgOCkgfCAocmdiWzJdICYgMHhGRik7XG5cdH0sXG5cblx0bHVtaW5vc2l0eTogZnVuY3Rpb24gKCkge1xuXHRcdC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1dDQUcyMC8jcmVsYXRpdmVsdW1pbmFuY2VkZWZcblx0XHR2YXIgcmdiID0gdGhpcy5yZ2IoKS5jb2xvcjtcblxuXHRcdHZhciBsdW0gPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGNoYW4gPSByZ2JbaV0gLyAyNTU7XG5cdFx0XHRsdW1baV0gPSAoY2hhbiA8PSAwLjAzOTI4KSA/IGNoYW4gLyAxMi45MiA6IE1hdGgucG93KCgoY2hhbiArIDAuMDU1KSAvIDEuMDU1KSwgMi40KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gMC4yMTI2ICogbHVtWzBdICsgMC43MTUyICogbHVtWzFdICsgMC4wNzIyICogbHVtWzJdO1xuXHR9LFxuXG5cdGNvbnRyYXN0OiBmdW5jdGlvbiAoY29sb3IyKSB7XG5cdFx0Ly8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNjb250cmFzdC1yYXRpb2RlZlxuXHRcdHZhciBsdW0xID0gdGhpcy5sdW1pbm9zaXR5KCk7XG5cdFx0dmFyIGx1bTIgPSBjb2xvcjIubHVtaW5vc2l0eSgpO1xuXG5cdFx0aWYgKGx1bTEgPiBsdW0yKSB7XG5cdFx0XHRyZXR1cm4gKGx1bTEgKyAwLjA1KSAvIChsdW0yICsgMC4wNSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChsdW0yICsgMC4wNSkgLyAobHVtMSArIDAuMDUpO1xuXHR9LFxuXG5cdGxldmVsOiBmdW5jdGlvbiAoY29sb3IyKSB7XG5cdFx0dmFyIGNvbnRyYXN0UmF0aW8gPSB0aGlzLmNvbnRyYXN0KGNvbG9yMik7XG5cdFx0aWYgKGNvbnRyYXN0UmF0aW8gPj0gNy4xKSB7XG5cdFx0XHRyZXR1cm4gJ0FBQSc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChjb250cmFzdFJhdGlvID49IDQuNSkgPyAnQUEnIDogJyc7XG5cdH0sXG5cblx0aXNEYXJrOiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gWUlRIGVxdWF0aW9uIGZyb20gaHR0cDovLzI0d2F5cy5vcmcvMjAxMC9jYWxjdWxhdGluZy1jb2xvci1jb250cmFzdFxuXHRcdHZhciByZ2IgPSB0aGlzLnJnYigpLmNvbG9yO1xuXHRcdHZhciB5aXEgPSAocmdiWzBdICogMjk5ICsgcmdiWzFdICogNTg3ICsgcmdiWzJdICogMTE0KSAvIDEwMDA7XG5cdFx0cmV0dXJuIHlpcSA8IDEyODtcblx0fSxcblxuXHRpc0xpZ2h0OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuICF0aGlzLmlzRGFyaygpO1xuXHR9LFxuXG5cdG5lZ2F0ZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciByZ2IgPSB0aGlzLnJnYigpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRyZ2IuY29sb3JbaV0gPSAyNTUgLSByZ2IuY29sb3JbaV07XG5cdFx0fVxuXHRcdHJldHVybiByZ2I7XG5cdH0sXG5cblx0bGlnaHRlbjogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dmFyIGhzbCA9IHRoaXMuaHNsKCk7XG5cdFx0aHNsLmNvbG9yWzJdICs9IGhzbC5jb2xvclsyXSAqIHJhdGlvO1xuXHRcdHJldHVybiBoc2w7XG5cdH0sXG5cblx0ZGFya2VuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR2YXIgaHNsID0gdGhpcy5oc2woKTtcblx0XHRoc2wuY29sb3JbMl0gLT0gaHNsLmNvbG9yWzJdICogcmF0aW87XG5cdFx0cmV0dXJuIGhzbDtcblx0fSxcblxuXHRzYXR1cmF0ZTogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dmFyIGhzbCA9IHRoaXMuaHNsKCk7XG5cdFx0aHNsLmNvbG9yWzFdICs9IGhzbC5jb2xvclsxXSAqIHJhdGlvO1xuXHRcdHJldHVybiBoc2w7XG5cdH0sXG5cblx0ZGVzYXR1cmF0ZTogZnVuY3Rpb24gKHJhdGlvKSB7XG5cdFx0dmFyIGhzbCA9IHRoaXMuaHNsKCk7XG5cdFx0aHNsLmNvbG9yWzFdIC09IGhzbC5jb2xvclsxXSAqIHJhdGlvO1xuXHRcdHJldHVybiBoc2w7XG5cdH0sXG5cblx0d2hpdGVuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR2YXIgaHdiID0gdGhpcy5od2IoKTtcblx0XHRod2IuY29sb3JbMV0gKz0gaHdiLmNvbG9yWzFdICogcmF0aW87XG5cdFx0cmV0dXJuIGh3Yjtcblx0fSxcblxuXHRibGFja2VuOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHR2YXIgaHdiID0gdGhpcy5od2IoKTtcblx0XHRod2IuY29sb3JbMl0gKz0gaHdiLmNvbG9yWzJdICogcmF0aW87XG5cdFx0cmV0dXJuIGh3Yjtcblx0fSxcblxuXHRncmF5c2NhbGU6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYXlzY2FsZSNDb252ZXJ0aW5nX2NvbG9yX3RvX2dyYXlzY2FsZVxuXHRcdHZhciByZ2IgPSB0aGlzLnJnYigpLmNvbG9yO1xuXHRcdHZhciB2YWwgPSByZ2JbMF0gKiAwLjMgKyByZ2JbMV0gKiAwLjU5ICsgcmdiWzJdICogMC4xMTtcblx0XHRyZXR1cm4gQ29sb3IucmdiKHZhbCwgdmFsLCB2YWwpO1xuXHR9LFxuXG5cdGZhZGU6IGZ1bmN0aW9uIChyYXRpbykge1xuXHRcdHJldHVybiB0aGlzLmFscGhhKHRoaXMudmFscGhhIC0gKHRoaXMudmFscGhhICogcmF0aW8pKTtcblx0fSxcblxuXHRvcGFxdWVyOiBmdW5jdGlvbiAocmF0aW8pIHtcblx0XHRyZXR1cm4gdGhpcy5hbHBoYSh0aGlzLnZhbHBoYSArICh0aGlzLnZhbHBoYSAqIHJhdGlvKSk7XG5cdH0sXG5cblx0cm90YXRlOiBmdW5jdGlvbiAoZGVncmVlcykge1xuXHRcdHZhciBoc2wgPSB0aGlzLmhzbCgpO1xuXHRcdHZhciBodWUgPSBoc2wuY29sb3JbMF07XG5cdFx0aHVlID0gKGh1ZSArIGRlZ3JlZXMpICUgMzYwO1xuXHRcdGh1ZSA9IGh1ZSA8IDAgPyAzNjAgKyBodWUgOiBodWU7XG5cdFx0aHNsLmNvbG9yWzBdID0gaHVlO1xuXHRcdHJldHVybiBoc2w7XG5cdH0sXG5cblx0bWl4OiBmdW5jdGlvbiAobWl4aW5Db2xvciwgd2VpZ2h0KSB7XG5cdFx0Ly8gcG9ydGVkIGZyb20gc2FzcyBpbXBsZW1lbnRhdGlvbiBpbiBDXG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3Nhc3MvbGlic2Fzcy9ibG9iLzBlNmI0YTI4NTAwOTIzNTZhYTNlY2UwN2M2YjI0OWYwMjIxY2FjZWQvZnVuY3Rpb25zLmNwcCNMMjA5XG5cdFx0aWYgKCFtaXhpbkNvbG9yIHx8ICFtaXhpbkNvbG9yLnJnYikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdBcmd1bWVudCB0byBcIm1peFwiIHdhcyBub3QgYSBDb2xvciBpbnN0YW5jZSwgYnV0IHJhdGhlciBhbiBpbnN0YW5jZSBvZiAnICsgdHlwZW9mIG1peGluQ29sb3IpO1xuXHRcdH1cblx0XHR2YXIgY29sb3IxID0gbWl4aW5Db2xvci5yZ2IoKTtcblx0XHR2YXIgY29sb3IyID0gdGhpcy5yZ2IoKTtcblx0XHR2YXIgcCA9IHdlaWdodCA9PT0gdW5kZWZpbmVkID8gMC41IDogd2VpZ2h0O1xuXG5cdFx0dmFyIHcgPSAyICogcCAtIDE7XG5cdFx0dmFyIGEgPSBjb2xvcjEuYWxwaGEoKSAtIGNvbG9yMi5hbHBoYSgpO1xuXG5cdFx0dmFyIHcxID0gKCgodyAqIGEgPT09IC0xKSA/IHcgOiAodyArIGEpIC8gKDEgKyB3ICogYSkpICsgMSkgLyAyLjA7XG5cdFx0dmFyIHcyID0gMSAtIHcxO1xuXG5cdFx0cmV0dXJuIENvbG9yLnJnYihcblx0XHRcdFx0dzEgKiBjb2xvcjEucmVkKCkgKyB3MiAqIGNvbG9yMi5yZWQoKSxcblx0XHRcdFx0dzEgKiBjb2xvcjEuZ3JlZW4oKSArIHcyICogY29sb3IyLmdyZWVuKCksXG5cdFx0XHRcdHcxICogY29sb3IxLmJsdWUoKSArIHcyICogY29sb3IyLmJsdWUoKSxcblx0XHRcdFx0Y29sb3IxLmFscGhhKCkgKiBwICsgY29sb3IyLmFscGhhKCkgKiAoMSAtIHApKTtcblx0fVxufTtcblxuLy8gbW9kZWwgY29udmVyc2lvbiBtZXRob2RzIGFuZCBzdGF0aWMgY29uc3RydWN0b3JzXG5PYmplY3Qua2V5cyhjb252ZXJ0KS5mb3JFYWNoKGZ1bmN0aW9uIChtb2RlbCkge1xuXHRpZiAoc2tpcHBlZE1vZGVscy5pbmRleE9mKG1vZGVsKSAhPT0gLTEpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgY2hhbm5lbHMgPSBjb252ZXJ0W21vZGVsXS5jaGFubmVscztcblxuXHQvLyBjb252ZXJzaW9uIG1ldGhvZHNcblx0Q29sb3IucHJvdG90eXBlW21vZGVsXSA9IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5tb2RlbCA9PT0gbW9kZWwpIHtcblx0XHRcdHJldHVybiBuZXcgQ29sb3IodGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBuZXcgQ29sb3IoYXJndW1lbnRzLCBtb2RlbCk7XG5cdFx0fVxuXG5cdFx0dmFyIG5ld0FscGhhID0gdHlwZW9mIGFyZ3VtZW50c1tjaGFubmVsc10gPT09ICdudW1iZXInID8gY2hhbm5lbHMgOiB0aGlzLnZhbHBoYTtcblx0XHRyZXR1cm4gbmV3IENvbG9yKGFzc2VydEFycmF5KGNvbnZlcnRbdGhpcy5tb2RlbF1bbW9kZWxdLnJhdyh0aGlzLmNvbG9yKSkuY29uY2F0KG5ld0FscGhhKSwgbW9kZWwpO1xuXHR9O1xuXG5cdC8vICdzdGF0aWMnIGNvbnN0cnVjdGlvbiBtZXRob2RzXG5cdENvbG9yW21vZGVsXSA9IGZ1bmN0aW9uIChjb2xvcikge1xuXHRcdGlmICh0eXBlb2YgY29sb3IgPT09ICdudW1iZXInKSB7XG5cdFx0XHRjb2xvciA9IHplcm9BcnJheShfc2xpY2UuY2FsbChhcmd1bWVudHMpLCBjaGFubmVscyk7XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgQ29sb3IoY29sb3IsIG1vZGVsKTtcblx0fTtcbn0pO1xuXG5mdW5jdGlvbiByb3VuZFRvKG51bSwgcGxhY2VzKSB7XG5cdHJldHVybiBOdW1iZXIobnVtLnRvRml4ZWQocGxhY2VzKSk7XG59XG5cbmZ1bmN0aW9uIHJvdW5kVG9QbGFjZShwbGFjZXMpIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChudW0pIHtcblx0XHRyZXR1cm4gcm91bmRUbyhudW0sIHBsYWNlcyk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIGdldHNldChtb2RlbCwgY2hhbm5lbCwgbW9kaWZpZXIpIHtcblx0bW9kZWwgPSBBcnJheS5pc0FycmF5KG1vZGVsKSA/IG1vZGVsIDogW21vZGVsXTtcblxuXHRtb2RlbC5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG5cdFx0KGxpbWl0ZXJzW21dIHx8IChsaW1pdGVyc1ttXSA9IFtdKSlbY2hhbm5lbF0gPSBtb2RpZmllcjtcblx0fSk7XG5cblx0bW9kZWwgPSBtb2RlbFswXTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuXHRcdHZhciByZXN1bHQ7XG5cblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0aWYgKG1vZGlmaWVyKSB7XG5cdFx0XHRcdHZhbCA9IG1vZGlmaWVyKHZhbCk7XG5cdFx0XHR9XG5cblx0XHRcdHJlc3VsdCA9IHRoaXNbbW9kZWxdKCk7XG5cdFx0XHRyZXN1bHQuY29sb3JbY2hhbm5lbF0gPSB2YWw7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdHJlc3VsdCA9IHRoaXNbbW9kZWxdKCkuY29sb3JbY2hhbm5lbF07XG5cdFx0aWYgKG1vZGlmaWVyKSB7XG5cdFx0XHRyZXN1bHQgPSBtb2RpZmllcihyZXN1bHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG59XG5cbmZ1bmN0aW9uIG1heGZuKG1heCkge1xuXHRyZXR1cm4gZnVuY3Rpb24gKHYpIHtcblx0XHRyZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4obWF4LCB2KSk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIGFzc2VydEFycmF5KHZhbCkge1xuXHRyZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsIDogW3ZhbF07XG59XG5cbmZ1bmN0aW9uIHplcm9BcnJheShhcnIsIGxlbmd0aCkge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKHR5cGVvZiBhcnJbaV0gIT09ICdudW1iZXInKSB7XG5cdFx0XHRhcnJbaV0gPSAwO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBhcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3I7XG4iLCJpbXBvcnQge1xuICAgIGNsdXN0ZXJpemVGbGF0VHJlZSxcbiAgICBmbGF0VHJlZSxcbiAgICBnZXRGbGF0VHJlZU1pbk1heCxcbiAgICBtZXRhQ2x1c3Rlcml6ZUZsYXRUcmVlLFxuICAgIHJlY2x1c3Rlcml6ZUNsdXN0ZXJlZEZsYXRUcmVlLFxufSBmcm9tICcuL3V0aWxzL3RyZWUtY2x1c3RlcnMnO1xuaW1wb3J0IENvbG9yIGZyb20gJ2NvbG9yJztcbmltcG9ydCBVSVBsdWdpbiBmcm9tICcuL3VpLXBsdWdpbic7XG5pbXBvcnQge1xuICAgIENsdXN0ZXJpemVkRmxhdFRyZWUsXG4gICAgQ2x1c3Rlcml6ZWRGbGF0VHJlZU5vZGUsXG4gICAgQ29sb3JzLFxuICAgIERhdGEsXG4gICAgRmxhdFRyZWUsXG4gICAgRmxhdFRyZWVOb2RlLFxuICAgIEhpdFJlZ2lvbixcbiAgICBNZXRhQ2x1c3Rlcml6ZWRGbGF0VHJlZSxcbiAgICBSZWdpb25UeXBlcyxcbn0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgT2Zmc2NyZWVuUmVuZGVyRW5naW5lIH0gZnJvbSAnLi4vZW5naW5lcy9vZmZzY3JlZW4tcmVuZGVyLWVuZ2luZSc7XG5pbXBvcnQgeyBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUgfSBmcm9tICcuLi9lbmdpbmVzL3NlcGFyYXRlZC1pbnRlcmFjdGlvbnMtZW5naW5lJztcblxudHlwZSBDbHVzdGVyTm9kZSA9IHsgZGF0YTogRmxhdFRyZWVOb2RlOyB0eXBlOiBzdHJpbmcgfTtcblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IENvbG9yLmhzbCgxODAsIDMwLCA3MCk7XG5cbmV4cG9ydCBjbGFzcyBGbGFtZUNoYXJ0UGx1Z2luIGV4dGVuZHMgVUlQbHVnaW4ge1xuICAgIGhlaWdodCA9IDA7XG5cbiAgICBkYXRhOiBEYXRhO1xuICAgIHVzZXJDb2xvcnM6IENvbG9ycztcbiAgICBmbGF0VHJlZTogRmxhdFRyZWUgPSBbXTtcbiAgICBwb3NpdGlvblkgPSAwO1xuICAgIGNvbG9yczogQ29sb3JzID0ge307XG4gICAgc2VsZWN0ZWRSZWdpb246IENsdXN0ZXJOb2RlIHwgbnVsbCA9IG51bGw7XG4gICAgaG92ZXJlZFJlZ2lvbjogQ2x1c3Rlck5vZGUgfCBudWxsID0gbnVsbDtcbiAgICBsYXN0UmFuZG9tQ29sb3I6IHR5cGVvZiBERUZBVUxUX0NPTE9SID0gREVGQVVMVF9DT0xPUjtcbiAgICBtZXRhQ2x1c3Rlcml6ZWRGbGF0VHJlZTogTWV0YUNsdXN0ZXJpemVkRmxhdFRyZWUgPSBbXTtcbiAgICBhY3R1YWxDbHVzdGVyaXplZEZsYXRUcmVlOiBDbHVzdGVyaXplZEZsYXRUcmVlID0gW107XG4gICAgaW5pdGlhbENsdXN0ZXJpemVkRmxhdFRyZWU6IENsdXN0ZXJpemVkRmxhdFRyZWUgPSBbXTtcbiAgICBsYXN0VXNlZENvbG9yOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgICByZW5kZXJDaGFydFRpbWVvdXQgPSAtMTtcblxuICAgIGNvbnN0cnVjdG9yKHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgY29sb3JzID0ge30sXG4gICAgICAgIG5hbWUgPSAnZmxhbWVDaGFydFBsdWdpbicsXG4gICAgfToge1xuICAgICAgICBkYXRhOiBEYXRhO1xuICAgICAgICBjb2xvcnM6IENvbG9ycyB8IHVuZGVmaW5lZDtcbiAgICAgICAgbmFtZT86IHN0cmluZztcbiAgICB9KSB7XG4gICAgICAgIHN1cGVyKG5hbWUpO1xuXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMudXNlckNvbG9ycyA9IGNvbG9ycztcblxuICAgICAgICB0aGlzLnBhcnNlRGF0YSgpO1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgaW5pdChyZW5kZXJFbmdpbmU6IE9mZnNjcmVlblJlbmRlckVuZ2luZSwgaW50ZXJhY3Rpb25zRW5naW5lOiBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUpIHtcbiAgICAgICAgc3VwZXIuaW5pdChyZW5kZXJFbmdpbmUsIGludGVyYWN0aW9uc0VuZ2luZSk7XG5cbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUub24oJ2NoYW5nZS1wb3NpdGlvbicsIHRoaXMuaGFuZGxlUG9zaXRpb25DaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLm9uKCdzZWxlY3QnLCB0aGlzLmhhbmRsZVNlbGVjdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUub24oJ2hvdmVyJywgdGhpcy5oYW5kbGVIb3Zlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUub24oJ3VwJywgdGhpcy5oYW5kbGVNb3VzZVVwLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuaW5pdERhdGEoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVQb3NpdGlvbkNoYW5nZSh7IGRlbHRhWCwgZGVsdGFZIH06IHsgZGVsdGFYOiBudW1iZXI7IGRlbHRhWTogbnVtYmVyIH0pIHtcbiAgICAgICAgY29uc3Qgc3RhcnRQb3NpdGlvblkgPSB0aGlzLnBvc2l0aW9uWTtcbiAgICAgICAgY29uc3Qgc3RhcnRQb3NpdGlvblggPSB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQucG9zaXRpb25YO1xuXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLnNldEN1cnNvcignZ3JhYmJpbmcnKTtcblxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvblkgKyBkZWx0YVkgPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvblkodGhpcy5wb3NpdGlvblkgKyBkZWx0YVkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvblkoMCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS50cnlUb0NoYW5nZVBvc2l0aW9uKGRlbHRhWCk7XG5cbiAgICAgICAgaWYgKHN0YXJ0UG9zaXRpb25YICE9PSB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQucG9zaXRpb25YIHx8IHN0YXJ0UG9zaXRpb25ZICE9PSB0aGlzLnBvc2l0aW9uWSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucGFyZW50LnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VVcCgpIHtcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuY2xlYXJDdXJzb3IoKTtcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvblkoeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb25ZID0geTtcbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5jb2xvcnMgPSB7fTtcbiAgICAgICAgdGhpcy5sYXN0UmFuZG9tQ29sb3IgPSBERUZBVUxUX0NPTE9SO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb25ZID0gMDtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFJlZ2lvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgY2FsY01pbk1heCgpIHtcbiAgICAgICAgY29uc3QgeyBmbGF0VHJlZSB9ID0gdGhpcztcblxuICAgICAgICBjb25zdCB7IG1pbiwgbWF4IH0gPSBnZXRGbGF0VHJlZU1pbk1heChmbGF0VHJlZSk7XG5cbiAgICAgICAgdGhpcy5taW4gPSBtaW47XG4gICAgICAgIHRoaXMubWF4ID0gbWF4O1xuICAgIH1cblxuICAgIGhhbmRsZVNlbGVjdChyZWdpb246IEhpdFJlZ2lvbjxDbHVzdGVyaXplZEZsYXRUcmVlTm9kZT4pIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRSZWdpb24gPSB0aGlzLmZpbmROb2RlSW5DbHVzdGVyKHJlZ2lvbik7XG5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRSZWdpb24gIT09IHNlbGVjdGVkUmVnaW9uKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUmVnaW9uID0gc2VsZWN0ZWRSZWdpb247XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlcigpO1xuXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3NlbGVjdCcsIHRoaXMuc2VsZWN0ZWRSZWdpb24/LmRhdGEsICdmbGFtZS1jaGFydC1ub2RlJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVIb3ZlcihyZWdpb246IEhpdFJlZ2lvbjxDbHVzdGVyaXplZEZsYXRUcmVlTm9kZT4pIHtcbiAgICAgICAgdGhpcy5ob3ZlcmVkUmVnaW9uID0gdGhpcy5maW5kTm9kZUluQ2x1c3RlcihyZWdpb24pO1xuICAgIH1cblxuICAgIGZpbmROb2RlSW5DbHVzdGVyKHJlZ2lvbjogSGl0UmVnaW9uPENsdXN0ZXJpemVkRmxhdFRyZWVOb2RlPik6IENsdXN0ZXJOb2RlIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuZ2V0TW91c2UoKTtcblxuICAgICAgICBpZiAocmVnaW9uICYmIHJlZ2lvbi50eXBlID09PSBSZWdpb25UeXBlcy5DTFVTVEVSKSB7XG4gICAgICAgICAgICBjb25zdCBob3ZlcmVkTm9kZSA9IHJlZ2lvbi5kYXRhLm5vZGVzLmZpbmQoKHsgbGV2ZWwsIHNvdXJjZTogeyBzdGFydCwgZHVyYXRpb24gfSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyB4LCB5LCB3IH0gPSB0aGlzLmNhbGNSZWN0KHN0YXJ0LCBkdXJhdGlvbiwgbGV2ZWwpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vdXNlLnggPj0geCAmJiBtb3VzZS54IDw9IHggKyB3ICYmIG1vdXNlLnkgPj0geSAmJiBtb3VzZS55IDw9IHkgKyB0aGlzLnJlbmRlckVuZ2luZS5ibG9ja0hlaWdodDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaG92ZXJlZE5vZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBob3ZlcmVkTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ25vZGUnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZ2V0Q29sb3IodHlwZTogc3RyaW5nID0gJ19kZWZhdWx0JywgZGVmYXVsdENvbG9yPzogc3RyaW5nKSB7XG4gICAgICAgIGlmIChkZWZhdWx0Q29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0Q29sb3I7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb2xvcnNbdHlwZV0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1t0eXBlXTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnVzZXJDb2xvcnNbdHlwZV0pIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gbmV3IENvbG9yKHRoaXMudXNlckNvbG9yc1t0eXBlXSk7XG5cbiAgICAgICAgICAgIHRoaXMuY29sb3JzW3R5cGVdID0gY29sb3IucmdiKCkudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdFJhbmRvbUNvbG9yID0gdGhpcy5sYXN0UmFuZG9tQ29sb3Iucm90YXRlKDI3KTtcbiAgICAgICAgdGhpcy5jb2xvcnNbdHlwZV0gPSB0aGlzLmxhc3RSYW5kb21Db2xvci5yZ2IoKS50b1N0cmluZygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yc1t0eXBlXTtcbiAgICB9XG5cbiAgICBzZXREYXRhKGRhdGE6IERhdGEpIHtcbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcblxuICAgICAgICB0aGlzLnBhcnNlRGF0YSgpO1xuICAgICAgICB0aGlzLmluaXREYXRhKCk7XG5cbiAgICAgICAgdGhpcy5yZXNldCgpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlY2FsY01pbk1heCgpO1xuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZXNldFBhcmVudFZpZXcoKTtcbiAgICB9XG5cbiAgICBwYXJzZURhdGEoKSB7XG4gICAgICAgIHRoaXMuZmxhdFRyZWUgPSBmbGF0VHJlZSh0aGlzLmRhdGEpO1xuXG4gICAgICAgIHRoaXMuY2FsY01pbk1heCgpO1xuICAgIH1cblxuICAgIGluaXREYXRhKCkge1xuICAgICAgICB0aGlzLm1ldGFDbHVzdGVyaXplZEZsYXRUcmVlID0gbWV0YUNsdXN0ZXJpemVGbGF0VHJlZSh0aGlzLmZsYXRUcmVlKTtcbiAgICAgICAgdGhpcy5pbml0aWFsQ2x1c3Rlcml6ZWRGbGF0VHJlZSA9IGNsdXN0ZXJpemVGbGF0VHJlZShcbiAgICAgICAgICAgIHRoaXMubWV0YUNsdXN0ZXJpemVkRmxhdFRyZWUsXG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS56b29tLFxuICAgICAgICAgICAgdGhpcy5taW4sXG4gICAgICAgICAgICB0aGlzLm1heFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucmVjbHVzdGVyaXplQ2x1c3RlcmVkRmxhdFRyZWUoKTtcbiAgICB9XG5cbiAgICByZWNsdXN0ZXJpemVDbHVzdGVyZWRGbGF0VHJlZSgpIHtcbiAgICAgICAgdGhpcy5hY3R1YWxDbHVzdGVyaXplZEZsYXRUcmVlID0gcmVjbHVzdGVyaXplQ2x1c3RlcmVkRmxhdFRyZWUoXG4gICAgICAgICAgICB0aGlzLmluaXRpYWxDbHVzdGVyaXplZEZsYXRUcmVlLFxuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuem9vbSxcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uWCxcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uWCArIHRoaXMucmVuZGVyRW5naW5lLmdldFJlYWxWaWV3KClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjYWxjUmVjdChzdGFydDogbnVtYmVyLCBkdXJhdGlvbjogbnVtYmVyLCBsZXZlbDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHcgPSBkdXJhdGlvbiAqIHRoaXMucmVuZGVyRW5naW5lLnpvb207XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHRoaXMucmVuZGVyRW5naW5lLnRpbWVUb1Bvc2l0aW9uKHN0YXJ0KSxcbiAgICAgICAgICAgIHk6IGxldmVsICogKHRoaXMucmVuZGVyRW5naW5lLmJsb2NrSGVpZ2h0ICsgMSkgLSB0aGlzLnBvc2l0aW9uWSxcbiAgICAgICAgICAgIHc6IHcgPD0gMC4xID8gMC4xIDogdyA+PSAzID8gdyAtIDEgOiB3IC0gdyAvIDMsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgcmVuZGVyVG9vbHRpcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaG92ZXJlZFJlZ2lvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVuZGVyRW5naW5lLm9wdGlvbnMudG9vbHRpcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVuZGVyRW5naW5lLm9wdGlvbnMudG9vbHRpcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLm9wdGlvbnMudG9vbHRpcChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3ZlcmVkUmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuZ2V0R2xvYmFsTW91c2UoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiB7IHN0YXJ0LCBkdXJhdGlvbiwgbmFtZSwgY2hpbGRyZW4gfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9ID0gdGhpcy5ob3ZlcmVkUmVnaW9uO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVVbml0cyA9IHRoaXMucmVuZGVyRW5naW5lLmdldFRpbWVVbml0cygpO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZlRpbWUgPSBkdXJhdGlvbiAtIChjaGlsZHJlbiA/IGNoaWxkcmVuLnJlZHVjZSgoYWNjLCB7IGR1cmF0aW9uIH0pID0+IGFjYyArIGR1cmF0aW9uLCAwKSA6IDApO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZUFjY3VyYWN5ID0gdGhpcy5yZW5kZXJFbmdpbmUuZ2V0QWNjdXJhY3koKSArIDI7XG4gICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyID0gYCR7bmFtZX1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IGR1ciA9IGBkdXJhdGlvbjogJHtkdXJhdGlvbi50b0ZpeGVkKG5vZGVBY2N1cmFjeSl9ICR7dGltZVVuaXRzfSAke1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbj8ubGVuZ3RoID8gYChzZWxmICR7c2VsZlRpbWUudG9GaXhlZChub2RlQWNjdXJhY3kpfSAke3RpbWVVbml0c30pYCA6ICcnXG4gICAgICAgICAgICAgICAgfWA7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3QgPSBgc3RhcnQ6ICR7c3RhcnQudG9GaXhlZChub2RlQWNjdXJhY3kpfWA7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZW5kZXJUb29sdGlwRnJvbURhdGEoXG4gICAgICAgICAgICAgICAgICAgIFt7IHRleHQ6IGhlYWRlciB9LCB7IHRleHQ6IGR1ciB9LCB7IHRleHQ6IHN0IH1dLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5nZXRHbG9iYWxNb3VzZSgpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgYmxvY2tIZWlnaHQsIGhlaWdodCwgbWluVGV4dFdpZHRoIH0gPSB0aGlzLnJlbmRlckVuZ2luZTtcbiAgICAgICAgdGhpcy5sYXN0VXNlZENvbG9yID0gbnVsbDtcblxuICAgICAgICB0aGlzLnJlY2x1c3Rlcml6ZUNsdXN0ZXJlZEZsYXRUcmVlKCk7XG5cbiAgICAgICAgY29uc3QgcHJvY2Vzc0NsdXN0ZXIgPSAoY2I6IChjbHVzdGVyOiBDbHVzdGVyaXplZEZsYXRUcmVlTm9kZSwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlcikgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjbHVzdGVyOiBDbHVzdGVyaXplZEZsYXRUcmVlTm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgc3RhcnQsIGR1cmF0aW9uLCBsZXZlbCB9ID0gY2x1c3RlcjtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHgsIHksIHcgfSA9IHRoaXMuY2FsY1JlY3Qoc3RhcnQsIGR1cmF0aW9uLCBsZXZlbCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoeCArIHcgPiAwICYmIHggPCB3aWR0aCAmJiB5ICsgYmxvY2tIZWlnaHQgPiAwICYmIHkgPCBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoY2x1c3RlciwgeCwgeSwgdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCByZW5kZXJDbHVzdGVyID0gKGNsdXN0ZXI6IENsdXN0ZXJpemVkRmxhdFRyZWVOb2RlLCB4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IHR5cGUsIG5vZGVzLCBjb2xvciB9ID0gY2x1c3RlcjtcbiAgICAgICAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuZ2V0TW91c2UoKTtcblxuICAgICAgICAgICAgaWYgKG1vdXNlLnkgPj0geSAmJiBtb3VzZS55IDw9IHkgKyBibG9ja0hlaWdodCkge1xuICAgICAgICAgICAgICAgIGFkZEhpdFJlZ2lvbihjbHVzdGVyLCB4LCB5LCB3KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHcgPj0gMC4yNSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmFkZFJlY3RUb1JlbmRlclF1ZXVlKHRoaXMuZ2V0Q29sb3IodHlwZSwgY29sb3IpLCB4LCB5LCB3KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHcgPj0gbWluVGV4dFdpZHRoICYmIG5vZGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmFkZFRleHRUb1JlbmRlclF1ZXVlKG5vZGVzWzBdLnNvdXJjZS5uYW1lLCB4LCB5LCB3KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhZGRIaXRSZWdpb24gPSAoY2x1c3RlcjogQ2x1c3Rlcml6ZWRGbGF0VHJlZU5vZGUsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLmFkZEhpdFJlZ2lvbihSZWdpb25UeXBlcy5DTFVTVEVSLCBjbHVzdGVyLCB4LCB5LCB3LCBibG9ja0hlaWdodCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5hY3R1YWxDbHVzdGVyaXplZEZsYXRUcmVlLmZvckVhY2gocHJvY2Vzc0NsdXN0ZXIocmVuZGVyQ2x1c3RlcikpO1xuXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkUmVnaW9uICYmIHRoaXMuc2VsZWN0ZWRSZWdpb24udHlwZSA9PT0gJ25vZGUnKSB7XG4gICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgc291cmNlOiB7IHN0YXJ0LCBkdXJhdGlvbiB9LFxuICAgICAgICAgICAgICAgIGxldmVsLFxuICAgICAgICAgICAgfSA9IHRoaXMuc2VsZWN0ZWRSZWdpb24uZGF0YTtcbiAgICAgICAgICAgIGNvbnN0IHsgeCwgeSwgdyB9ID0gdGhpcy5jYWxjUmVjdChzdGFydCwgZHVyYXRpb24sIGxldmVsKTtcblxuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuYWRkU3Ryb2tlVG9SZW5kZXJRdWV1ZSgnZ3JlZW4nLCB4LCB5LCB3LCB0aGlzLnJlbmRlckVuZ2luZS5ibG9ja0hlaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5yZW5kZXJDaGFydFRpbWVvdXQpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyQ2hhcnRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuY2xlYXJIaXRSZWdpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmFjdHVhbENsdXN0ZXJpemVkRmxhdFRyZWUuZm9yRWFjaChwcm9jZXNzQ2x1c3RlcihhZGRIaXRSZWdpb24pKTtcbiAgICAgICAgfSwgMTYpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjb25zdCBtZXJnZU9iamVjdHMgPSA8UyBleHRlbmRzIFJlY29yZDxQcm9wZXJ0eUtleSwgYW55Pj4oZGVmYXVsdFN0eWxlczogUywgc3R5bGVzOiBQYXJ0aWFsPFM+ID0ge30pOiBTID0+XG4gICAgT2JqZWN0LmtleXMoZGVmYXVsdFN0eWxlcykucmVkdWNlKChhY2MsIGtleToga2V5b2YgUykgPT4ge1xuICAgICAgICBpZiAoc3R5bGVzW2tleV0pIHtcbiAgICAgICAgICAgIGFjY1trZXldID0gc3R5bGVzW2tleV0hO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWNjW2tleV0gPSBkZWZhdWx0U3R5bGVzW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9IGFzIFMpO1xuXG5leHBvcnQgY29uc3QgaXNOdW1iZXIgPSAodmFsOiB1bmtub3duKTogdmFsIGlzIG51bWJlciA9PiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbiIsImltcG9ydCB7IG1lcmdlT2JqZWN0cyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IE9mZnNjcmVlblJlbmRlckVuZ2luZSB9IGZyb20gJy4uL2VuZ2luZXMvb2Zmc2NyZWVuLXJlbmRlci1lbmdpbmUnO1xuaW1wb3J0IFVJUGx1Z2luIGZyb20gJy4vdWktcGx1Z2luJztcbmltcG9ydCB7IFNlcGFyYXRlZEludGVyYWN0aW9uc0VuZ2luZSB9IGZyb20gJy4uL2VuZ2luZXMvc2VwYXJhdGVkLWludGVyYWN0aW9ucy1lbmdpbmUnO1xuXG5leHBvcnQgdHlwZSBUaW1lR3JpZFBsdWdpblN0eWxlcyA9IHtcbiAgICBmb250OiBzdHJpbmc7XG4gICAgZm9udENvbG9yOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUaW1lR3JpZFBsdWdpblNldHRpbmdzID0ge1xuICAgIHN0eWxlcz86IFBhcnRpYWw8VGltZUdyaWRQbHVnaW5TdHlsZXM+O1xufTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUaW1lR3JpZFBsdWdpblN0eWxlczogVGltZUdyaWRQbHVnaW5TdHlsZXMgPSB7XG4gICAgZm9udDogJzEwcHggc2Fucy1zZXJpZicsXG4gICAgZm9udENvbG9yOiAnYmxhY2snLFxufTtcblxuZXhwb3J0IGNsYXNzIFRpbWVHcmlkUGx1Z2luIGV4dGVuZHMgVUlQbHVnaW48VGltZUdyaWRQbHVnaW5TdHlsZXM+IHtcbiAgICBvdmVycmlkZSBzdHlsZXM6IFRpbWVHcmlkUGx1Z2luU3R5bGVzID0gZGVmYXVsdFRpbWVHcmlkUGx1Z2luU3R5bGVzO1xuICAgIGhlaWdodCA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcihzZXR0aW5nczogVGltZUdyaWRQbHVnaW5TZXR0aW5ncyA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCd0aW1lR3JpZFBsdWdpbicpO1xuICAgICAgICB0aGlzLnNldFNldHRpbmdzKHNldHRpbmdzKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBzZXRTZXR0aW5ncyh7IHN0eWxlcyB9OiBUaW1lR3JpZFBsdWdpblNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gbWVyZ2VPYmplY3RzKGRlZmF1bHRUaW1lR3JpZFBsdWdpblN0eWxlcywgc3R5bGVzKTtcblxuICAgICAgICBpZiAodGhpcy5yZW5kZXJFbmdpbmUpIHtcbiAgICAgICAgICAgIHRoaXMub3ZlcnJpZGVFbmdpbmVTZXR0aW5ncygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb3ZlcnJpZGVFbmdpbmVTZXR0aW5ncygpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuc2V0U2V0dGluZ3NPdmVycmlkZXMoeyBzdHlsZXM6IHRoaXMuc3R5bGVzIH0pO1xuICAgICAgICB0aGlzLmhlaWdodCA9IE1hdGgucm91bmQodGhpcy5yZW5kZXJFbmdpbmUuY2hhckhlaWdodCArIDEwKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBpbml0KHJlbmRlckVuZ2luZTogT2Zmc2NyZWVuUmVuZGVyRW5naW5lLCBpbnRlcmFjdGlvbnNFbmdpbmU6IFNlcGFyYXRlZEludGVyYWN0aW9uc0VuZ2luZSkge1xuICAgICAgICBzdXBlci5pbml0KHJlbmRlckVuZ2luZSwgaW50ZXJhY3Rpb25zRW5naW5lKTtcblxuICAgICAgICB0aGlzLm92ZXJyaWRlRW5naW5lU2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC50aW1lR3JpZC5yZW5kZXJUaW1lcyh0aGlzLnJlbmRlckVuZ2luZSk7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC50aW1lR3JpZC5yZW5kZXJMaW5lcygwLCB0aGlzLnJlbmRlckVuZ2luZS5oZWlnaHQsIHRoaXMucmVuZGVyRW5naW5lKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgQ29sb3IgZnJvbSAnY29sb3InO1xuaW1wb3J0IFVJUGx1Z2luIGZyb20gJy4vdWktcGx1Z2luJztcbmltcG9ydCB7IEhpdFJlZ2lvbiwgTWFyaywgTWFya3MsIFJlZ2lvblR5cGVzIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgT2Zmc2NyZWVuUmVuZGVyRW5naW5lIH0gZnJvbSAnLi4vZW5naW5lcy9vZmZzY3JlZW4tcmVuZGVyLWVuZ2luZSc7XG5pbXBvcnQgeyBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUgfSBmcm9tICcuLi9lbmdpbmVzL3NlcGFyYXRlZC1pbnRlcmFjdGlvbnMtZW5naW5lJztcblxudHlwZSBNYXJrSGl0UmVnaW9uID0gSGl0UmVnaW9uPE1hcms+O1xuXG5leHBvcnQgY2xhc3MgTWFya3NQbHVnaW4gZXh0ZW5kcyBVSVBsdWdpbiB7XG4gICAgbWFya3M6IE1hcmtzO1xuICAgIGhvdmVyZWRSZWdpb246IE1hcmtIaXRSZWdpb24gfCBudWxsID0gbnVsbDtcbiAgICBzZWxlY3RlZFJlZ2lvbjogTWFya0hpdFJlZ2lvbiB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoeyBkYXRhLCBuYW1lID0gJ21hcmtzUGx1Z2luJyB9OiB7IGRhdGE6IE1hcmtzOyBuYW1lPzogc3RyaW5nIH0pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMubWFya3MgPSB0aGlzLnByZXBhcmVNYXJrcyhkYXRhKTtcblxuICAgICAgICB0aGlzLmNhbGNNaW5NYXgoKTtcbiAgICB9XG5cbiAgICBjYWxjTWluTWF4KCkge1xuICAgICAgICBjb25zdCB7IG1hcmtzIH0gPSB0aGlzO1xuXG4gICAgICAgIGlmIChtYXJrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMubWluID0gbWFya3MucmVkdWNlKChhY2MsIHsgdGltZXN0YW1wIH0pID0+ICh0aW1lc3RhbXAgPCBhY2MgPyB0aW1lc3RhbXAgOiBhY2MpLCBtYXJrc1swXS50aW1lc3RhbXApO1xuICAgICAgICAgICAgdGhpcy5tYXggPSBtYXJrcy5yZWR1Y2UoKGFjYywgeyB0aW1lc3RhbXAgfSkgPT4gKHRpbWVzdGFtcCA+IGFjYyA/IHRpbWVzdGFtcCA6IGFjYyksIG1hcmtzWzBdLnRpbWVzdGFtcCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvdmVycmlkZSBpbml0KHJlbmRlckVuZ2luZTogT2Zmc2NyZWVuUmVuZGVyRW5naW5lLCBpbnRlcmFjdGlvbnNFbmdpbmU6IFNlcGFyYXRlZEludGVyYWN0aW9uc0VuZ2luZSkge1xuICAgICAgICBzdXBlci5pbml0KHJlbmRlckVuZ2luZSwgaW50ZXJhY3Rpb25zRW5naW5lKTtcblxuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5vbignaG92ZXInLCB0aGlzLmhhbmRsZUhvdmVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5vbignc2VsZWN0JywgdGhpcy5oYW5kbGVTZWxlY3QuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaGFuZGxlSG92ZXIocmVnaW9uOiBNYXJrSGl0UmVnaW9uKSB7XG4gICAgICAgIHRoaXMuaG92ZXJlZFJlZ2lvbiA9IHJlZ2lvbjtcbiAgICB9XG5cbiAgICBoYW5kbGVTZWxlY3QocmVnaW9uOiBNYXJrSGl0UmVnaW9uKSB7XG4gICAgICAgIGlmIChyZWdpb24gJiYgcmVnaW9uLnR5cGUgPT09ICd0aW1lc3RhbXAnKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUmVnaW9uID0gcmVnaW9uO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdzZWxlY3QnLCByZWdpb24uZGF0YSwgJ3RpbWVzdGFtcCcpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVuZGVyKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zZWxlY3RlZFJlZ2lvbiAmJiAhcmVnaW9uKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUmVnaW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnc2VsZWN0JywgbnVsbCwgJ3RpbWVzdGFtcCcpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvdmVycmlkZSBnZXQgaGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJFbmdpbmUuYmxvY2tIZWlnaHQgKyAxO1xuICAgIH1cblxuICAgIHByZXBhcmVNYXJrcyhtYXJrczogTWFya3MpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtzXG4gICAgICAgICAgICAubWFwKCh7IGNvbG9yLCAuLi5yZXN0IH0pID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucmVzdCxcbiAgICAgICAgICAgICAgICBjb2xvcjogbmV3IENvbG9yKGNvbG9yKS5hbHBoYSgwLjcpLnJnYigpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnRpbWVzdGFtcCAtIGIudGltZXN0YW1wKTtcbiAgICB9XG5cbiAgICBzZXRNYXJrcyhtYXJrczogTWFya3MpIHtcbiAgICAgICAgdGhpcy5tYXJrcyA9IHRoaXMucHJlcGFyZU1hcmtzKG1hcmtzKTtcblxuICAgICAgICB0aGlzLmNhbGNNaW5NYXgoKTtcblxuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZWNhbGNNaW5NYXgoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVzZXRQYXJlbnRWaWV3KCk7XG4gICAgfVxuXG4gICAgY2FsY01hcmtzQmxvY2tQb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyLCBwcmV2RW5kaW5nOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHBvc2l0aW9uID4gMCkge1xuICAgICAgICAgICAgaWYgKHByZXZFbmRpbmcgPiBwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2RW5kaW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG5cbiAgICBvdmVycmlkZSByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMubWFya3MucmVkdWNlKChwcmV2RW5kaW5nLCBub2RlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IHRpbWVzdGFtcCwgY29sb3IsIHNob3J0TmFtZSB9ID0gbm9kZTtcbiAgICAgICAgICAgIGNvbnN0IHsgd2lkdGggfSA9IHRoaXMucmVuZGVyRW5naW5lLmN0eC5tZWFzdXJlVGV4dChzaG9ydE5hbWUpO1xuICAgICAgICAgICAgY29uc3QgZnVsbFdpZHRoID0gd2lkdGggKyB0aGlzLnJlbmRlckVuZ2luZS5ibG9ja1BhZGRpbmdMZWZ0UmlnaHQgKiAyO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnJlbmRlckVuZ2luZS50aW1lVG9Qb3NpdGlvbih0aW1lc3RhbXApO1xuICAgICAgICAgICAgY29uc3QgYmxvY2tQb3NpdGlvbiA9IHRoaXMuY2FsY01hcmtzQmxvY2tQb3NpdGlvbihwb3NpdGlvbiwgcHJldkVuZGluZyk7XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmFkZFJlY3RUb1JlbmRlclF1ZXVlKGNvbG9yLCBibG9ja1Bvc2l0aW9uLCAwLCBmdWxsV2lkdGgpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuYWRkVGV4dFRvUmVuZGVyUXVldWUoc2hvcnROYW1lLCBibG9ja1Bvc2l0aW9uLCAwLCBmdWxsV2lkdGgpO1xuXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5hZGRIaXRSZWdpb24oXG4gICAgICAgICAgICAgICAgUmVnaW9uVHlwZXMuVElNRVNUQU1QLFxuICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgYmxvY2tQb3NpdGlvbixcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIGZ1bGxXaWR0aCxcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5ibG9ja0hlaWdodFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJsb2NrUG9zaXRpb24gKyBmdWxsV2lkdGg7XG4gICAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHBvc3RSZW5kZXIoKSB7XG4gICAgICAgIHRoaXMubWFya3MuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyB0aW1lc3RhbXAsIGNvbG9yIH0gPSBub2RlO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnJlbmRlckVuZ2luZS50aW1lVG9Qb3NpdGlvbih0aW1lc3RhbXApO1xuXG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQuc2V0U3Ryb2tlQ29sb3IoY29sb3IpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucGFyZW50LmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5jdHguc2V0TGluZURhc2goWzgsIDddKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5jdHgubW92ZVRvKHBvc2l0aW9uLCB0aGlzLnJlbmRlckVuZ2luZS5wb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQuY3R4LmxpbmVUbyhwb3NpdGlvbiwgdGhpcy5yZW5kZXJFbmdpbmUucGFyZW50LmhlaWdodCk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQuY3R4LnN0cm9rZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSByZW5kZXJUb29sdGlwKCkge1xuICAgICAgICBpZiAodGhpcy5ob3ZlcmVkUmVnaW9uICYmIHRoaXMuaG92ZXJlZFJlZ2lvbi50eXBlID09PSAndGltZXN0YW1wJykge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVuZGVyRW5naW5lLm9wdGlvbnMudG9vbHRpcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMucmVuZGVyRW5naW5lLm9wdGlvbnMudG9vbHRpcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLm9wdGlvbnMudG9vbHRpcChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3ZlcmVkUmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuZ2V0R2xvYmFsTW91c2UoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogeyBmdWxsTmFtZSwgdGltZXN0YW1wIH0sXG4gICAgICAgICAgICAgICAgfSA9IHRoaXMuaG92ZXJlZFJlZ2lvbjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG1hcmtzQWNjdXJhY3kgPSB0aGlzLnJlbmRlckVuZ2luZS5nZXRBY2N1cmFjeSgpICsgMjtcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkZXIgPSBgJHtmdWxsTmFtZX1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWUgPSBgJHt0aW1lc3RhbXAudG9GaXhlZChtYXJrc0FjY3VyYWN5KX0gJHt0aGlzLnJlbmRlckVuZ2luZS50aW1lVW5pdHN9YDtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlclRvb2x0aXBGcm9tRGF0YShcbiAgICAgICAgICAgICAgICAgICAgW3sgdGV4dDogaGVhZGVyIH0sIHsgdGV4dDogdGltZSB9XSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuZ2V0R2xvYmFsTW91c2UoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgbWVyZ2VPYmplY3RzIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgUmVuZGVyRW5naW5lIH0gZnJvbSAnLi9yZW5kZXItZW5naW5lJztcbmltcG9ydCB7IE9mZnNjcmVlblJlbmRlckVuZ2luZSB9IGZyb20gJy4vb2Zmc2NyZWVuLXJlbmRlci1lbmdpbmUnO1xuXG5jb25zdCBNSU5fUElYRUxfREVMVEEgPSA4NTtcblxuZXhwb3J0IHR5cGUgVGltZUdyaWRTdHlsZXMgPSB7XG4gICAgY29sb3I6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRpbWVHcmlkU2V0dGluZ3MgPSB7XG4gICAgc3R5bGVzPzogUGFydGlhbDxUaW1lR3JpZFN0eWxlcz47XG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRpbWVHcmlkU3R5bGVzOiBUaW1lR3JpZFN0eWxlcyA9IHtcbiAgICBjb2xvcjogJ3JnYmEoOTAsOTAsOTAsMC4yMCknLFxufTtcblxuZXhwb3J0IGNsYXNzIFRpbWVHcmlkIHtcbiAgICByZW5kZXJFbmdpbmU6IE9mZnNjcmVlblJlbmRlckVuZ2luZSB8IFJlbmRlckVuZ2luZTtcbiAgICBzdGFydDogbnVtYmVyO1xuICAgIGVuZDogbnVtYmVyO1xuICAgIGFjY3VyYWN5OiBudW1iZXI7XG4gICAgZGVsdGE6IG51bWJlcjtcbiAgICBzdHlsZXM6IFRpbWVHcmlkU3R5bGVzID0gZGVmYXVsdFRpbWVHcmlkU3R5bGVzO1xuICAgIHRpbWVVbml0cyA9ICdtcyc7XG5cbiAgICBjb25zdHJ1Y3RvcihzZXR0aW5nczogVGltZUdyaWRTZXR0aW5ncykge1xuICAgICAgICB0aGlzLnN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5lbmQgPSAwO1xuICAgICAgICB0aGlzLmFjY3VyYWN5ID0gMDtcbiAgICAgICAgdGhpcy5kZWx0YSA9IDA7XG5cbiAgICAgICAgdGhpcy5zZXRTZXR0aW5ncyhzZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgc2V0RGVmYXVsdFJlbmRlckVuZ2luZShyZW5kZXJFbmdpbmU6IE9mZnNjcmVlblJlbmRlckVuZ2luZSB8IFJlbmRlckVuZ2luZSkge1xuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZSA9IHJlbmRlckVuZ2luZTtcbiAgICAgICAgdGhpcy50aW1lVW5pdHMgPSB0aGlzLnJlbmRlckVuZ2luZS5nZXRUaW1lVW5pdHMoKTtcbiAgICB9XG5cbiAgICBzZXRTZXR0aW5ncyh7IHN0eWxlcyB9OiBUaW1lR3JpZFNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gbWVyZ2VPYmplY3RzKGRlZmF1bHRUaW1lR3JpZFN0eWxlcywgc3R5bGVzKTtcblxuICAgICAgICBpZiAodGhpcy5yZW5kZXJFbmdpbmUpIHtcbiAgICAgICAgICAgIHRoaXMudGltZVVuaXRzID0gdGhpcy5yZW5kZXJFbmdpbmUuZ2V0VGltZVVuaXRzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWNhbGMoKSB7XG4gICAgICAgIGNvbnN0IHRpbWVXaWR0aCA9IHRoaXMucmVuZGVyRW5naW5lLm1heCAtIHRoaXMucmVuZGVyRW5naW5lLm1pbjtcbiAgICAgICAgY29uc3QgaW5pdGlhbExpbmVzQ291bnQgPSB0aGlzLnJlbmRlckVuZ2luZS53aWR0aCAvIE1JTl9QSVhFTF9ERUxUQTtcbiAgICAgICAgY29uc3QgaW5pdGlhbFRpbWVMaW5lRGVsdGEgPSB0aW1lV2lkdGggLyBpbml0aWFsTGluZXNDb3VudDtcblxuICAgICAgICBjb25zdCByZWFsVmlldyA9IHRoaXMucmVuZGVyRW5naW5lLmdldFJlYWxWaWV3KCk7XG4gICAgICAgIGNvbnN0IHByb3BvcnRpb24gPSByZWFsVmlldyAvICh0aW1lV2lkdGggfHwgMSk7XG5cbiAgICAgICAgdGhpcy5kZWx0YSA9IGluaXRpYWxUaW1lTGluZURlbHRhIC8gTWF0aC5wb3coMiwgTWF0aC5mbG9vcihNYXRoLmxvZzIoMSAvIHByb3BvcnRpb24pKSk7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBNYXRoLmZsb29yKCh0aGlzLnJlbmRlckVuZ2luZS5wb3NpdGlvblggLSB0aGlzLnJlbmRlckVuZ2luZS5taW4pIC8gdGhpcy5kZWx0YSk7XG4gICAgICAgIHRoaXMuZW5kID0gTWF0aC5jZWlsKHJlYWxWaWV3IC8gdGhpcy5kZWx0YSkgKyB0aGlzLnN0YXJ0O1xuXG4gICAgICAgIHRoaXMuYWNjdXJhY3kgPSB0aGlzLmNhbGNOdW1iZXJGaXgoKTtcbiAgICB9XG5cbiAgICBjYWxjTnVtYmVyRml4KCkge1xuICAgICAgICBjb25zdCBzdHJUaW1lbGluZURlbHRhID0gKHRoaXMuZGVsdGEgLyAyKS50b1N0cmluZygpO1xuXG4gICAgICAgIGlmIChzdHJUaW1lbGluZURlbHRhLmluY2x1ZGVzKCdlJykpIHtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIoc3RyVGltZWxpbmVEZWx0YS5tYXRjaCgvXFxkKyQvKT8uWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB6ZXJvcyA9IHN0clRpbWVsaW5lRGVsdGEubWF0Y2goLygwXFwuMCopLyk7XG4gICAgICAgIHJldHVybiB6ZXJvcyA/IHplcm9zWzBdLmxlbmd0aCAtIDEgOiAwO1xuICAgIH1cblxuICAgIGdldFRpbWVsaW5lQWNjdXJhY3koKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjY3VyYWN5O1xuICAgIH1cblxuICAgIGZvckVhY2hUaW1lKGNiOiAocGl4ZWxQb3NpdGlvbjogbnVtYmVyLCB0aW1lUG9zaXRpb246IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5zdGFydDsgaSA8PSB0aGlzLmVuZDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lUG9zaXRpb24gPSBpICogdGhpcy5kZWx0YSArIHRoaXMucmVuZGVyRW5naW5lLm1pbjtcbiAgICAgICAgICAgIGNvbnN0IHBpeGVsUG9zaXRpb24gPSB0aGlzLnJlbmRlckVuZ2luZS50aW1lVG9Qb3NpdGlvbihOdW1iZXIodGltZVBvc2l0aW9uLnRvRml4ZWQodGhpcy5hY2N1cmFjeSkpKTtcblxuICAgICAgICAgICAgY2IocGl4ZWxQb3NpdGlvbiwgdGltZVBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlckxpbmVzKHN0YXJ0OiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCByZW5kZXJFbmdpbmU6IE9mZnNjcmVlblJlbmRlckVuZ2luZSB8IFJlbmRlckVuZ2luZSA9IHRoaXMucmVuZGVyRW5naW5lKSB7XG4gICAgICAgIHJlbmRlckVuZ2luZS5zZXRDdHhDb2xvcih0aGlzLnN0eWxlcy5jb2xvcik7XG5cbiAgICAgICAgdGhpcy5mb3JFYWNoVGltZSgocGl4ZWxQb3NpdGlvbjogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICByZW5kZXJFbmdpbmUuZmlsbFJlY3QocGl4ZWxQb3NpdGlvbiwgc3RhcnQsIDEsIGhlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlclRpbWVzKHJlbmRlckVuZ2luZTogT2Zmc2NyZWVuUmVuZGVyRW5naW5lIHwgUmVuZGVyRW5naW5lID0gdGhpcy5yZW5kZXJFbmdpbmUpIHtcbiAgICAgICAgcmVuZGVyRW5naW5lLnNldEN0eENvbG9yKHJlbmRlckVuZ2luZS5zdHlsZXMuZm9udENvbG9yKTtcbiAgICAgICAgcmVuZGVyRW5naW5lLnNldEN0eEZvbnQocmVuZGVyRW5naW5lLnN0eWxlcy5mb250KTtcblxuICAgICAgICB0aGlzLmZvckVhY2hUaW1lKChwaXhlbFBvc2l0aW9uLCB0aW1lUG9zaXRpb24pID0+IHtcbiAgICAgICAgICAgIHJlbmRlckVuZ2luZS5maWxsVGV4dChcbiAgICAgICAgICAgICAgICB0aW1lUG9zaXRpb24udG9GaXhlZCh0aGlzLmFjY3VyYWN5KSArIHRoaXMudGltZVVuaXRzLFxuICAgICAgICAgICAgICAgIHBpeGVsUG9zaXRpb24gKyByZW5kZXJFbmdpbmUuYmxvY2tQYWRkaW5nTGVmdFJpZ2h0LFxuICAgICAgICAgICAgICAgIHJlbmRlckVuZ2luZS5jaGFySGVpZ2h0XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgIGNsdXN0ZXJpemVGbGF0VHJlZSxcbiAgICBmbGF0VHJlZSxcbiAgICBnZXRGbGF0VHJlZU1pbk1heCxcbiAgICBtZXRhQ2x1c3Rlcml6ZUZsYXRUcmVlLFxuICAgIHJlY2x1c3Rlcml6ZUNsdXN0ZXJlZEZsYXRUcmVlLFxufSBmcm9tICcuL3V0aWxzL3RyZWUtY2x1c3RlcnMnO1xuaW1wb3J0IHsgbWVyZ2VPYmplY3RzIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgVGltZUdyaWQgfSBmcm9tICcuLi9lbmdpbmVzL3RpbWUtZ3JpZCc7XG5pbXBvcnQge1xuICAgIENsdXN0ZXJpemVkRmxhdFRyZWUsXG4gICAgQ3Vyc29yVHlwZXMsXG4gICAgRGF0YSxcbiAgICBIaXRSZWdpb24sXG4gICAgTWV0YUNsdXN0ZXJpemVkRmxhdFRyZWUsXG4gICAgTW91c2UsXG4gICAgUmVnaW9uVHlwZXMsXG59IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IE9mZnNjcmVlblJlbmRlckVuZ2luZSB9IGZyb20gJy4uL2VuZ2luZXMvb2Zmc2NyZWVuLXJlbmRlci1lbmdpbmUnO1xuaW1wb3J0IHsgU2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lIH0gZnJvbSAnLi4vZW5naW5lcy9zZXBhcmF0ZWQtaW50ZXJhY3Rpb25zLWVuZ2luZSc7XG5pbXBvcnQgVUlQbHVnaW4gZnJvbSAnLi91aS1wbHVnaW4nO1xuXG5pbnRlcmZhY2UgRG90IHtcbiAgICBwb3M6IG51bWJlcjtcbiAgICBzb3J0OiBudW1iZXI7XG4gICAgbGV2ZWw6IG51bWJlcjtcbiAgICBpbmRleDogbnVtYmVyO1xuICAgIHR5cGU6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgVGltZWZyYW1lU2VsZWN0b3JQbHVnaW5TdHlsZXMgPSB7XG4gICAgZm9udDogc3RyaW5nO1xuICAgIGZvbnRDb2xvcjogc3RyaW5nO1xuICAgIG92ZXJsYXlDb2xvcjogc3RyaW5nO1xuICAgIGdyYXBoU3Ryb2tlQ29sb3I6IHN0cmluZztcbiAgICBncmFwaEZpbGxDb2xvcjogc3RyaW5nO1xuICAgIGJvdHRvbUxpbmVDb2xvcjogc3RyaW5nO1xuICAgIGtub2JDb2xvcjogc3RyaW5nO1xuICAgIGtub2JTdHJva2VDb2xvcjogc3RyaW5nO1xuICAgIGtub2JTaXplOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgYmFja2dyb3VuZENvbG9yOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUaW1lZnJhbWVTZWxlY3RvclBsdWdpblNldHRpbmdzID0ge1xuICAgIHN0eWxlcz86IFBhcnRpYWw8VGltZWZyYW1lU2VsZWN0b3JQbHVnaW5TdHlsZXM+O1xufTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUaW1lZnJhbWVTZWxlY3RvclBsdWdpblN0eWxlcyA9IHtcbiAgICBmb250OiAnOXB4IHNhbnMtc2VyaWYnLFxuICAgIGZvbnRDb2xvcjogJ2JsYWNrJyxcbiAgICBvdmVybGF5Q29sb3I6ICdyZ2JhKDExMiwgMTEyLCAxMTIsIDAuNSknLFxuICAgIGdyYXBoU3Ryb2tlQ29sb3I6ICdyZ2IoMCwgMCwgMCwgMC4yKScsXG4gICAgZ3JhcGhGaWxsQ29sb3I6ICdyZ2IoMCwgMCwgMCwgMC4yNSknLFxuICAgIGJvdHRvbUxpbmVDb2xvcjogJ3JnYigwLCAwLCAwLCAwLjI1KScsXG4gICAga25vYkNvbG9yOiAncmdiKDEzMSwgMTMxLCAxMzEpJyxcbiAgICBrbm9iU3Ryb2tlQ29sb3I6ICd3aGl0ZScsXG4gICAga25vYlNpemU6IDYsXG4gICAgaGVpZ2h0OiA2MCxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG59O1xuXG5leHBvcnQgY2xhc3MgVGltZWZyYW1lU2VsZWN0b3JQbHVnaW4gZXh0ZW5kcyBVSVBsdWdpbjxUaW1lZnJhbWVTZWxlY3RvclBsdWdpblN0eWxlcz4ge1xuICAgIG92ZXJyaWRlIHN0eWxlczogVGltZWZyYW1lU2VsZWN0b3JQbHVnaW5TdHlsZXMgPSBkZWZhdWx0VGltZWZyYW1lU2VsZWN0b3JQbHVnaW5TdHlsZXM7XG4gICAgaGVpZ2h0ID0gMDtcblxuICAgIHByaXZhdGUgZGF0YTogRGF0YTtcbiAgICBwcml2YXRlIHNob3VsZFJlbmRlcjogYm9vbGVhbjtcbiAgICBwcml2YXRlIGxlZnRLbm9iTW92aW5nID0gZmFsc2U7XG4gICAgcHJpdmF0ZSByaWdodEtub2JNb3ZpbmcgPSBmYWxzZTtcbiAgICBwcml2YXRlIHNlbGVjdGluZ0FjdGl2ZSA9IGZhbHNlO1xuICAgIHByaXZhdGUgc3RhcnRTZWxlY3RpbmdQb3NpdGlvbiA9IDA7XG4gICAgcHJpdmF0ZSB0aW1lb3V0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBvZmZzY3JlZW5SZW5kZXJFbmdpbmU6IE9mZnNjcmVlblJlbmRlckVuZ2luZTtcbiAgICBwcml2YXRlIHRpbWVHcmlkOiBUaW1lR3JpZDtcbiAgICBwcml2YXRlIGFjdHVhbENsdXN0ZXJzOiBDbHVzdGVyaXplZEZsYXRUcmVlID0gW107XG4gICAgcHJpdmF0ZSBjbHVzdGVyczogTWV0YUNsdXN0ZXJpemVkRmxhdFRyZWUgPSBbXTtcbiAgICBwcml2YXRlIG1heExldmVsID0gMDtcbiAgICBwcml2YXRlIGRvdHM6IERvdFtdID0gW107XG4gICAgcHJpdmF0ZSBhY3R1YWxDbHVzdGVyaXplZEZsYXRUcmVlOiBDbHVzdGVyaXplZEZsYXRUcmVlID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcih7XG4gICAgICAgIGRhdGEsXG4gICAgICAgIHNldHRpbmdzLFxuICAgICAgICBuYW1lID0gJ3RpbWVmcmFtZVNlbGVjdG9yUGx1Z2luJyxcbiAgICB9OiB7XG4gICAgICAgIGRhdGE6IERhdGE7XG4gICAgICAgIHNldHRpbmdzOiBUaW1lZnJhbWVTZWxlY3RvclBsdWdpblNldHRpbmdzO1xuICAgICAgICBuYW1lPzogc3RyaW5nO1xuICAgIH0pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuc2hvdWxkUmVuZGVyID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZXRTZXR0aW5ncyhzZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgaW5pdChyZW5kZXJFbmdpbmU6IE9mZnNjcmVlblJlbmRlckVuZ2luZSwgaW50ZXJhY3Rpb25zRW5naW5lOiBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUpIHtcbiAgICAgICAgc3VwZXIuaW5pdChyZW5kZXJFbmdpbmUsIGludGVyYWN0aW9uc0VuZ2luZSk7XG5cbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUub24oJ2Rvd24nLCB0aGlzLmhhbmRsZU1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUub24oJ3VwJywgdGhpcy5oYW5kbGVNb3VzZVVwLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5vbignbW92ZScsIHRoaXMuaGFuZGxlTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuc2V0U2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZURvd24ocmVnaW9uOiBIaXRSZWdpb248J3JpZ2h0JyB8ICdsZWZ0Jz4sIG1vdXNlOiBNb3VzZSkge1xuICAgICAgICBpZiAocmVnaW9uKSB7XG4gICAgICAgICAgICBpZiAocmVnaW9uLnR5cGUgPT09IFJlZ2lvblR5cGVzLlRJTUVGUkFNRV9LTk9CKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlZ2lvbi5kYXRhID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sZWZ0S25vYk1vdmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yaWdodEtub2JNb3ZpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLnNldEN1cnNvcignZXctcmVzaXplJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlZ2lvbi50eXBlID09PSBSZWdpb25UeXBlcy5USU1FRlJBTUVfQVJFQSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW5nQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0U2VsZWN0aW5nUG9zaXRpb24gPSBtb3VzZS54O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VVcChfOiBIaXRSZWdpb24sIG1vdXNlOiBNb3VzZSwgaXNDbGljazogYm9vbGVhbikge1xuICAgICAgICBsZXQgaXNEb3VibGVDbGljayA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIHtcbiAgICAgICAgICAgIGlzRG91YmxlQ2xpY2sgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+ICh0aGlzLnRpbWVvdXQgPSB2b2lkIDApLCAzMDApO1xuICAgICAgICB0aGlzLmxlZnRLbm9iTW92aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmlnaHRLbm9iTW92aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLmNsZWFyQ3Vyc29yKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW5nQWN0aXZlICYmICFpc0NsaWNrKSB7XG4gICAgICAgICAgICB0aGlzLmFwcGx5Q2hhbmdlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZWxlY3RpbmdBY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICBpZiAoaXNDbGljayAmJiAhaXNEb3VibGVDbGljaykge1xuICAgICAgICAgICAgY29uc3QgcmlnaHRLbm9iUG9zaXRpb24gPSB0aGlzLmdldFJpZ2h0S25vYlBvc2l0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBsZWZ0S25vYlBvc2l0aW9uID0gdGhpcy5nZXRMZWZ0S25vYlBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGlmIChtb3VzZS54ID4gcmlnaHRLbm9iUG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFJpZ2h0S25vYlBvc2l0aW9uKG1vdXNlLngpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtb3VzZS54ID4gbGVmdEtub2JQb3NpdGlvbiAmJiBtb3VzZS54IDwgcmlnaHRLbm9iUG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAobW91c2UueCAtIGxlZnRLbm9iUG9zaXRpb24gPiByaWdodEtub2JQb3NpdGlvbiAtIG1vdXNlLngpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRSaWdodEtub2JQb3NpdGlvbihtb3VzZS54KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldExlZnRLbm9iUG9zaXRpb24obW91c2UueCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldExlZnRLbm9iUG9zaXRpb24obW91c2UueCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuYXBwbHlDaGFuZ2VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNEb3VibGVDbGljaykge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucGFyZW50LnNldFpvb20odGhpcy5yZW5kZXJFbmdpbmUuZ2V0SW5pdGlhbFpvb20oKSk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQuc2V0UG9zaXRpb25YKHRoaXMucmVuZGVyRW5naW5lLm1pbik7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZU1vdmUoXzogSGl0UmVnaW9uLCBtb3VzZTogTW91c2UpIHtcbiAgICAgICAgaWYgKHRoaXMubGVmdEtub2JNb3ZpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TGVmdEtub2JQb3NpdGlvbihtb3VzZS54KTtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlDaGFuZ2VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5yaWdodEtub2JNb3ZpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UmlnaHRLbm9iUG9zaXRpb24obW91c2UueCk7XG4gICAgICAgICAgICB0aGlzLmFwcGx5Q2hhbmdlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW5nQWN0aXZlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGFydFNlbGVjdGluZ1Bvc2l0aW9uID49IG1vdXNlLngpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldExlZnRLbm9iUG9zaXRpb24obW91c2UueCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRSaWdodEtub2JQb3NpdGlvbih0aGlzLnN0YXJ0U2VsZWN0aW5nUG9zaXRpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFJpZ2h0S25vYlBvc2l0aW9uKG1vdXNlLngpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGVmdEtub2JQb3NpdGlvbih0aGlzLnN0YXJ0U2VsZWN0aW5nUG9zaXRpb24pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG92ZXJyaWRlIHBvc3RJbml0KCkge1xuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZSA9IHRoaXMucmVuZGVyRW5naW5lLm1ha2VDaGlsZCgpO1xuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5zZXRTZXR0aW5nc092ZXJyaWRlcyh7IHN0eWxlczogdGhpcy5zdHlsZXMgfSk7XG5cbiAgICAgICAgdGhpcy50aW1lR3JpZCA9IG5ldyBUaW1lR3JpZCh7IHN0eWxlczogdGhpcy5yZW5kZXJFbmdpbmUucGFyZW50LnRpbWVHcmlkLnN0eWxlcyB9KTtcbiAgICAgICAgdGhpcy50aW1lR3JpZC5zZXREZWZhdWx0UmVuZGVyRW5naW5lKHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lKTtcblxuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5vbigncmVzaXplJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUuc2V0Wm9vbSh0aGlzLnJlbmRlckVuZ2luZS5nZXRJbml0aWFsWm9vbSgpKTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2NyZWVuUmVuZGVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lLm9uKCdtaW4tbWF4LWNoYW5nZScsICgpID0+ICh0aGlzLnNob3VsZFJlbmRlciA9IHRydWUpKTtcblxuICAgICAgICB0aGlzLnNldERhdGEodGhpcy5kYXRhKTtcbiAgICB9XG5cbiAgICBzZXRMZWZ0S25vYlBvc2l0aW9uKG1vdXNlWDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IG1heFBvc2l0aW9uID0gdGhpcy5nZXRSaWdodEtub2JQb3NpdGlvbigpO1xuXG4gICAgICAgIGlmIChtb3VzZVggPCBtYXhQb3NpdGlvbiAtIDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlYWxWaWV3ID0gdGhpcy5yZW5kZXJFbmdpbmUuZ2V0UmVhbFZpZXcoKTtcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy5yZW5kZXJFbmdpbmUuc2V0UG9zaXRpb25YKFxuICAgICAgICAgICAgICAgIHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lLnBpeGVsVG9UaW1lKG1vdXNlWCkgKyB0aGlzLnJlbmRlckVuZ2luZS5taW5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCB6b29tID0gdGhpcy5yZW5kZXJFbmdpbmUud2lkdGggLyAocmVhbFZpZXcgLSBkZWx0YSk7XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnNldFpvb20oem9vbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRSaWdodEtub2JQb3NpdGlvbihtb3VzZVg6IG51bWJlcikge1xuICAgICAgICBjb25zdCBtaW5Qb3NpdGlvbiA9IHRoaXMuZ2V0TGVmdEtub2JQb3NpdGlvbigpO1xuXG4gICAgICAgIGlmIChtb3VzZVggPiBtaW5Qb3NpdGlvbiArIDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlYWxWaWV3ID0gdGhpcy5yZW5kZXJFbmdpbmUuZ2V0UmVhbFZpZXcoKTtcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID1cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5wb3NpdGlvblggK1xuICAgICAgICAgICAgICAgIHJlYWxWaWV3IC1cbiAgICAgICAgICAgICAgICAodGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUucGl4ZWxUb1RpbWUobW91c2VYKSArIHRoaXMucmVuZGVyRW5naW5lLm1pbik7XG4gICAgICAgICAgICBjb25zdCB6b29tID0gdGhpcy5yZW5kZXJFbmdpbmUud2lkdGggLyAocmVhbFZpZXcgLSBkZWx0YSk7XG5cbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnNldFpvb20oem9vbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRMZWZ0S25vYlBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uWCAtIHRoaXMucmVuZGVyRW5naW5lLm1pbikgKiB0aGlzLnJlbmRlckVuZ2luZS5nZXRJbml0aWFsWm9vbSgpO1xuICAgIH1cblxuICAgIGdldFJpZ2h0S25vYlBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgKHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uWCAtIHRoaXMucmVuZGVyRW5naW5lLm1pbiArIHRoaXMucmVuZGVyRW5naW5lLmdldFJlYWxWaWV3KCkpICpcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmdldEluaXRpYWxab29tKClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBhcHBseUNoYW5nZXMoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5zZXRQb3NpdGlvblgodGhpcy5yZW5kZXJFbmdpbmUucG9zaXRpb25YKTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucGFyZW50LnNldFpvb20odGhpcy5yZW5kZXJFbmdpbmUuem9vbSk7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBzZXRTZXR0aW5ncyh7IHN0eWxlcyB9OiBUaW1lZnJhbWVTZWxlY3RvclBsdWdpblNldHRpbmdzID0geyBzdHlsZXM6IHRoaXMuc3R5bGVzIH0pIHtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBtZXJnZU9iamVjdHMoZGVmYXVsdFRpbWVmcmFtZVNlbGVjdG9yUGx1Z2luU3R5bGVzLCBzdHlsZXMpO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuc3R5bGVzLmhlaWdodDtcblxuICAgICAgICBpZiAodGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUpIHtcbiAgICAgICAgICAgIHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lLnNldFNldHRpbmdzT3ZlcnJpZGVzKHsgc3R5bGVzOiB0aGlzLnN0eWxlcyB9KTtcbiAgICAgICAgICAgIHRoaXMudGltZUdyaWQuc2V0U2V0dGluZ3MoeyBzdHlsZXM6IHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC50aW1lR3JpZC5zdHlsZXMgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNob3VsZFJlbmRlciA9IHRydWU7XG4gICAgfVxuXG4gICAgc2V0RGF0YShkYXRhOiBEYXRhKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgY29uc3QgZG90czogRG90W10gPSBbXTtcbiAgICAgICAgY29uc3QgdHJlZSA9IGZsYXRUcmVlKHRoaXMuZGF0YSk7XG4gICAgICAgIGNvbnN0IHsgbWluLCBtYXggfSA9IGdldEZsYXRUcmVlTWluTWF4KHRyZWUpO1xuXG4gICAgICAgIGxldCBtYXhMZXZlbCA9IDA7XG5cbiAgICAgICAgdGhpcy5taW4gPSBtaW47XG4gICAgICAgIHRoaXMubWF4ID0gbWF4O1xuXG4gICAgICAgIHRoaXMuY2x1c3RlcnMgPSBtZXRhQ2x1c3Rlcml6ZUZsYXRUcmVlKHRyZWUsICgpID0+IHRydWUpO1xuICAgICAgICB0aGlzLmFjdHVhbENsdXN0ZXJzID0gY2x1c3Rlcml6ZUZsYXRUcmVlKFxuICAgICAgICAgICAgdGhpcy5jbHVzdGVycyxcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnpvb20sXG4gICAgICAgICAgICB0aGlzLm1pbixcbiAgICAgICAgICAgIHRoaXMubWF4LFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIEluZmluaXR5XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuYWN0dWFsQ2x1c3Rlcml6ZWRGbGF0VHJlZSA9IHJlY2x1c3Rlcml6ZUNsdXN0ZXJlZEZsYXRUcmVlKFxuICAgICAgICAgICAgdGhpcy5hY3R1YWxDbHVzdGVycyxcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnpvb20sXG4gICAgICAgICAgICB0aGlzLm1pbixcbiAgICAgICAgICAgIHRoaXMubWF4LFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIEluZmluaXR5XG4gICAgICAgICkuc29ydCgoYSwgYikgPT4gYS5zdGFydCAtIGIuc3RhcnQpO1xuXG4gICAgICAgIHRoaXMuYWN0dWFsQ2x1c3Rlcml6ZWRGbGF0VHJlZS5mb3JFYWNoKCh7IHN0YXJ0LCBlbmQsIGxldmVsIH0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAobWF4TGV2ZWwgPCBsZXZlbCArIDEpIHtcbiAgICAgICAgICAgICAgICBtYXhMZXZlbCA9IGxldmVsICsgMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG90cy5wdXNoKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zOiBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgc29ydDogMCxcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsLFxuICAgICAgICAgICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0YXJ0JyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zOiBzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgc29ydDogMSxcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsICsgMSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdGFydCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHBvczogZW5kLFxuICAgICAgICAgICAgICAgICAgICBzb3J0OiAyLFxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogbGV2ZWwgKyAxLFxuICAgICAgICAgICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VuZCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHBvczogZW5kLFxuICAgICAgICAgICAgICAgICAgICBzb3J0OiAzLFxuICAgICAgICAgICAgICAgICAgICBsZXZlbDogbGV2ZWwsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnZW5kJyxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmRvdHMgPSBkb3RzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmIChhLnBvcyAhPT0gYi5wb3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5wb3MgLSBiLnBvcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhLmluZGV4ID09PSBiLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuc29ydCAtIGIuc29ydDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhLnR5cGUgPT09ICdzdGFydCcgJiYgYi50eXBlID09PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEubGV2ZWwgLSBiLmxldmVsO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhLnR5cGUgPT09ICdlbmQnICYmIGIudHlwZSA9PT0gJ2VuZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYi5sZXZlbCAtIGEubGV2ZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5tYXhMZXZlbCA9IG1heExldmVsO1xuXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuUmVuZGVyKCk7XG4gICAgfVxuXG4gICAgb2Zmc2NyZWVuUmVuZGVyKCkge1xuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUuZ2V0SW5pdGlhbFpvb20oKTtcblxuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5zZXRab29tKHpvb20pO1xuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5zZXRQb3NpdGlvblgodGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUubWluKTtcbiAgICAgICAgdGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUuY2xlYXIoKTtcblxuICAgICAgICB0aGlzLnRpbWVHcmlkLnJlY2FsYygpO1xuICAgICAgICB0aGlzLnRpbWVHcmlkLnJlbmRlckxpbmVzKDAsIHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lLmhlaWdodCk7XG4gICAgICAgIHRoaXMudGltZUdyaWQucmVuZGVyVGltZXMoKTtcblxuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5zZXRTdHJva2VDb2xvcih0aGlzLnN0eWxlcy5ncmFwaFN0cm9rZUNvbG9yKTtcbiAgICAgICAgdGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUuc2V0Q3R4Q29sb3IodGhpcy5zdHlsZXMuZ3JhcGhGaWxsQ29sb3IpO1xuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5jdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgY29uc3QgbGV2ZWxIZWlnaHQgPSAodGhpcy5oZWlnaHQgLSB0aGlzLnJlbmRlckVuZ2luZS5jaGFySGVpZ2h0IC0gNCkgLyB0aGlzLm1heExldmVsO1xuXG4gICAgICAgIGlmICh0aGlzLmRvdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5jdHgubW92ZVRvKFxuICAgICAgICAgICAgICAgICh0aGlzLmRvdHNbMF0ucG9zIC0gdGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUubWluKSAqIHpvb20sXG4gICAgICAgICAgICAgICAgdGhpcy5jYXN0TGV2ZWxUb0hlaWdodCh0aGlzLmRvdHNbMF0ubGV2ZWwsIGxldmVsSGVpZ2h0KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdGhpcy5kb3RzLmZvckVhY2goKGRvdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcG9zLCBsZXZlbCB9ID0gZG90O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUuY3R4LmxpbmVUbyhcbiAgICAgICAgICAgICAgICAgICAgKHBvcyAtIHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lLm1pbikgKiB6b29tLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhc3RMZXZlbFRvSGVpZ2h0KGxldmVsLCBsZXZlbEhlaWdodClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5jdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgdGhpcy5vZmZzY3JlZW5SZW5kZXJFbmdpbmUuY3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZS5jdHguZmlsbCgpO1xuXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lLnNldEN0eENvbG9yKHRoaXMuc3R5bGVzLmJvdHRvbUxpbmVDb2xvcik7XG4gICAgICAgIHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lLmN0eC5maWxsUmVjdCgwLCB0aGlzLmhlaWdodCAtIDEsIHRoaXMub2Zmc2NyZWVuUmVuZGVyRW5naW5lLndpZHRoLCAxKTtcbiAgICB9XG5cbiAgICBjYXN0TGV2ZWxUb0hlaWdodChsZXZlbDogbnVtYmVyLCBsZXZlbEhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlaWdodCAtIGxldmVsICogbGV2ZWxIZWlnaHQ7XG4gICAgfVxuXG4gICAgcmVuZGVyVGltZWZyYW1lKCkge1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBvc2l0aW9uWCA9IHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uWCAtIHRoaXMucmVuZGVyRW5naW5lLm1pbjtcblxuICAgICAgICBjb25zdCBjdXJyZW50TGVmdFBvc2l0aW9uID0gcmVsYXRpdmVQb3NpdGlvblggKiB0aGlzLnJlbmRlckVuZ2luZS5nZXRJbml0aWFsWm9vbSgpO1xuICAgICAgICBjb25zdCBjdXJyZW50UmlnaHRQb3NpdGlvbiA9XG4gICAgICAgICAgICAocmVsYXRpdmVQb3NpdGlvblggKyB0aGlzLnJlbmRlckVuZ2luZS5nZXRSZWFsVmlldygpKSAqIHRoaXMucmVuZGVyRW5naW5lLmdldEluaXRpYWxab29tKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRMZWZ0S25vYlBvc2l0aW9uID0gY3VycmVudExlZnRQb3NpdGlvbiAtIHRoaXMuc3R5bGVzLmtub2JTaXplIC8gMjtcbiAgICAgICAgY29uc3QgY3VycmVudFJpZ2h0S25vYlBvc2l0aW9uID0gY3VycmVudFJpZ2h0UG9zaXRpb24gLSB0aGlzLnN0eWxlcy5rbm9iU2l6ZSAvIDI7XG4gICAgICAgIGNvbnN0IGtub2JIZWlnaHQgPSB0aGlzLnJlbmRlckVuZ2luZS5oZWlnaHQgLyAzO1xuXG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnNldEN0eENvbG9yKHRoaXMuc3R5bGVzLm92ZXJsYXlDb2xvcik7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmZpbGxSZWN0KDAsIDAsIGN1cnJlbnRMZWZ0UG9zaXRpb24sIHRoaXMucmVuZGVyRW5naW5lLmhlaWdodCk7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmZpbGxSZWN0KFxuICAgICAgICAgICAgY3VycmVudFJpZ2h0UG9zaXRpb24sXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUud2lkdGggLSBjdXJyZW50UmlnaHRQb3NpdGlvbixcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmhlaWdodFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnNldEN0eENvbG9yKHRoaXMuc3R5bGVzLm92ZXJsYXlDb2xvcik7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmZpbGxSZWN0KGN1cnJlbnRMZWZ0UG9zaXRpb24gLSAxLCAwLCAxLCB0aGlzLnJlbmRlckVuZ2luZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5maWxsUmVjdChjdXJyZW50UmlnaHRQb3NpdGlvbiArIDEsIDAsIDEsIHRoaXMucmVuZGVyRW5naW5lLmhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuc2V0Q3R4Q29sb3IodGhpcy5zdHlsZXMua25vYkNvbG9yKTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuZmlsbFJlY3QoY3VycmVudExlZnRLbm9iUG9zaXRpb24sIDAsIHRoaXMuc3R5bGVzLmtub2JTaXplLCBrbm9iSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuZmlsbFJlY3QoY3VycmVudFJpZ2h0S25vYlBvc2l0aW9uLCAwLCB0aGlzLnN0eWxlcy5rbm9iU2l6ZSwga25vYkhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVuZGVyU3Ryb2tlKFxuICAgICAgICAgICAgdGhpcy5zdHlsZXMua25vYlN0cm9rZUNvbG9yLFxuICAgICAgICAgICAgY3VycmVudExlZnRLbm9iUG9zaXRpb24sXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5zdHlsZXMua25vYlNpemUsXG4gICAgICAgICAgICBrbm9iSGVpZ2h0XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlclN0cm9rZShcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzLmtub2JTdHJva2VDb2xvcixcbiAgICAgICAgICAgIGN1cnJlbnRSaWdodEtub2JQb3NpdGlvbixcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICB0aGlzLnN0eWxlcy5rbm9iU2l6ZSxcbiAgICAgICAgICAgIGtub2JIZWlnaHRcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5hZGRIaXRSZWdpb24oXG4gICAgICAgICAgICBSZWdpb25UeXBlcy5USU1FRlJBTUVfS05PQixcbiAgICAgICAgICAgICdsZWZ0JyxcbiAgICAgICAgICAgIGN1cnJlbnRMZWZ0S25vYlBvc2l0aW9uLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzLmtub2JTaXplLFxuICAgICAgICAgICAga25vYkhlaWdodCxcbiAgICAgICAgICAgIEN1cnNvclR5cGVzLkVXX1JFU0laRVxuICAgICAgICApO1xuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5hZGRIaXRSZWdpb24oXG4gICAgICAgICAgICBSZWdpb25UeXBlcy5USU1FRlJBTUVfS05PQixcbiAgICAgICAgICAgICdyaWdodCcsXG4gICAgICAgICAgICBjdXJyZW50UmlnaHRLbm9iUG9zaXRpb24sXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5zdHlsZXMua25vYlNpemUsXG4gICAgICAgICAgICBrbm9iSGVpZ2h0LFxuICAgICAgICAgICAgQ3Vyc29yVHlwZXMuRVdfUkVTSVpFXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLmFkZEhpdFJlZ2lvbihcbiAgICAgICAgICAgIFJlZ2lvblR5cGVzLlRJTUVGUkFNRV9BUkVBLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUud2lkdGgsXG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5oZWlnaHQsXG4gICAgICAgICAgICBDdXJzb3JUeXBlcy5URVhUXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5zaG91bGRSZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvdWxkUmVuZGVyID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm9mZnNjcmVlblJlbmRlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuY29weSh0aGlzLm9mZnNjcmVlblJlbmRlckVuZ2luZSk7XG4gICAgICAgIHRoaXMucmVuZGVyVGltZWZyYW1lKCk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgbWVyZ2VPYmplY3RzIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IFVJUGx1Z2luIGZyb20gJy4vdWktcGx1Z2luJztcbmltcG9ydCB7IEhpdFJlZ2lvbiwgUmVnaW9uVHlwZXMsIFdhdGVyZmFsbCwgV2F0ZXJmYWxsSW50ZXJ2YWwsIFdhdGVyZmFsbEl0ZW1zIH0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgT2Zmc2NyZWVuUmVuZGVyRW5naW5lIH0gZnJvbSAnLi4vZW5naW5lcy9vZmZzY3JlZW4tcmVuZGVyLWVuZ2luZSc7XG5pbXBvcnQgeyBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUgfSBmcm9tICcuLi9lbmdpbmVzL3NlcGFyYXRlZC1pbnRlcmFjdGlvbnMtZW5naW5lJztcblxuZnVuY3Rpb24gZ2V0VmFsdWVCeUNob2ljZTxUIGV4dGVuZHMgT21pdDxXYXRlcmZhbGxJbnRlcnZhbCwgJ3N0YXJ0JyB8ICdlbmQnPiAmIHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfT4oXG4gICAgYXJyYXk6IFRbXSxcbiAgICBwcm9wZXJ0eTogJ2VuZCcgfCAnc3RhcnQnLFxuICAgIGZuOiBNYXRoWydtaW4nXSB8IE1hdGhbJ21heCddXG4pOiBudW1iZXIge1xuICAgIGlmIChhcnJheS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5LnJlZHVjZSgoYWNjLCB7IFtwcm9wZXJ0eV06IHZhbHVlIH0pID0+IGZuKGFjYywgdmFsdWUpLCBhcnJheVswXVtwcm9wZXJ0eV0pO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbn1cblxuZXhwb3J0IHR5cGUgV2F0ZXJmYWxsUGx1Z2luU3R5bGVzID0ge1xuICAgIGRlZmF1bHRIZWlnaHQ6IG51bWJlcjtcbn07XG5cbnR5cGUgV2F0dGVyZmFsbFBsdWdpbkRhdGFJdGVtID0ge1xuICAgIGludGVydmFsczogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlcjsgY29sb3I6IHN0cmluZzsgbmFtZTogc3RyaW5nOyB0eXBlOiAnYmxvY2snIHwgJ2xpbmUnIH1bXTtcbiAgICBpbmRleDogbnVtYmVyO1xuICAgIG1heDogbnVtYmVyO1xuICAgIG1pbjogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB0ZXh0QmxvY2s6IHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfTtcbiAgICB0aW1pbmc6IFJlY29yZDxQcm9wZXJ0eUtleSwgbnVtYmVyPjtcbiAgICBtZXRhPzogYW55W107XG59O1xuXG5leHBvcnQgdHlwZSBXYXRlcmZhbGxQbHVnaW5TZXR0aW5ncyA9IHtcbiAgICBzdHlsZXM/OiBQYXJ0aWFsPFdhdGVyZmFsbFBsdWdpblN0eWxlcz47XG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFdhdGVyZmFsbFBsdWdpblN0eWxlczogV2F0ZXJmYWxsUGx1Z2luU3R5bGVzID0ge1xuICAgIGRlZmF1bHRIZWlnaHQ6IDY4LFxufTtcblxuZXhwb3J0IGNsYXNzIFdhdGVyZmFsbFBsdWdpbiBleHRlbmRzIFVJUGx1Z2luPFdhdGVyZmFsbFBsdWdpblN0eWxlcz4ge1xuICAgIG92ZXJyaWRlIHN0eWxlczogV2F0ZXJmYWxsUGx1Z2luU3R5bGVzID0gZGVmYXVsdFdhdGVyZmFsbFBsdWdpblN0eWxlcztcbiAgICBoZWlnaHQgPSBkZWZhdWx0V2F0ZXJmYWxsUGx1Z2luU3R5bGVzLmRlZmF1bHRIZWlnaHQ7XG5cbiAgICBkYXRhOiBXYXR0ZXJmYWxsUGx1Z2luRGF0YUl0ZW1bXSA9IFtdO1xuICAgIHBvc2l0aW9uWSA9IDA7XG4gICAgaG92ZXJlZFJlZ2lvbjogSGl0UmVnaW9uPG51bWJlcj4gfCBudWxsID0gbnVsbDtcbiAgICBzZWxlY3RlZFJlZ2lvbjogSGl0UmVnaW9uPG51bWJlcj4gfCBudWxsID0gbnVsbDtcbiAgICBpbml0aWFsRGF0YTogV2F0ZXJmYWxsSXRlbXMgPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgbmFtZSA9ICd3YXRlcmZhbGxQbHVnaW4nLFxuICAgICAgICBzZXR0aW5ncyxcbiAgICB9OiB7XG4gICAgICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgICAgIGRhdGE6IFdhdGVyZmFsbDtcbiAgICAgICAgc2V0dGluZ3M6IFdhdGVyZmFsbFBsdWdpblNldHRpbmdzO1xuICAgIH0pIHtcbiAgICAgICAgc3VwZXIobmFtZSk7XG4gICAgICAgIHRoaXMuc2V0RGF0YShkYXRhKTtcbiAgICAgICAgdGhpcy5zZXRTZXR0aW5ncyhzZXR0aW5ncyk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgaW5pdChyZW5kZXJFbmdpbmU6IE9mZnNjcmVlblJlbmRlckVuZ2luZSwgaW50ZXJhY3Rpb25zRW5naW5lOiBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUpIHtcbiAgICAgICAgc3VwZXIuaW5pdChyZW5kZXJFbmdpbmUsIGludGVyYWN0aW9uc0VuZ2luZSk7XG5cbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUub24oJ2NoYW5nZS1wb3NpdGlvbicsIHRoaXMuaGFuZGxlUG9zaXRpb25DaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLm9uKCdob3ZlcicsIHRoaXMuaGFuZGxlSG92ZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLm9uKCdzZWxlY3QnLCB0aGlzLmhhbmRsZVNlbGVjdC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUub24oJ3VwJywgdGhpcy5oYW5kbGVNb3VzZVVwLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGhhbmRsZVBvc2l0aW9uQ2hhbmdlKHsgZGVsdGFYLCBkZWx0YVkgfTogeyBkZWx0YVg6IG51bWJlcjsgZGVsdGFZOiBudW1iZXIgfSkge1xuICAgICAgICBjb25zdCBzdGFydFBvc2l0aW9uWSA9IHRoaXMucG9zaXRpb25ZO1xuICAgICAgICBjb25zdCBzdGFydFBvc2l0aW9uWCA9IHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5wb3NpdGlvblg7XG5cbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuc2V0Q3Vyc29yKCdncmFiYmluZycpO1xuXG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uWSArIGRlbHRhWSA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSh0aGlzLnBvc2l0aW9uWSArIGRlbHRhWSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uWSgwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnRyeVRvQ2hhbmdlUG9zaXRpb24oZGVsdGFYKTtcblxuICAgICAgICBpZiAoc3RhcnRQb3NpdGlvblggIT09IHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5wb3NpdGlvblggfHwgc3RhcnRQb3NpdGlvblkgIT09IHRoaXMucG9zaXRpb25ZKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZVVwKCkge1xuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5jbGVhckN1cnNvcigpO1xuICAgIH1cblxuICAgIGhhbmRsZUhvdmVyKHJlZ2lvbjogSGl0UmVnaW9uPG51bWJlcj4gfCBudWxsKSB7XG4gICAgICAgIHRoaXMuaG92ZXJlZFJlZ2lvbiA9IHJlZ2lvbjtcbiAgICB9XG5cbiAgICBoYW5kbGVTZWxlY3QocmVnaW9uOiBIaXRSZWdpb248bnVtYmVyPiB8IG51bGwpIHtcbiAgICAgICAgaWYgKHJlZ2lvbikge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFJlZ2lvbiA9IHJlZ2lvbjtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnc2VsZWN0JywgdGhpcy5pbml0aWFsRGF0YVtyZWdpb24uZGF0YV0sICd3YXRlcmZhbGwtbm9kZScpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVuZGVyKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zZWxlY3RlZFJlZ2lvbiAmJiAhcmVnaW9uKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkUmVnaW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnc2VsZWN0JywgbnVsbCwgJ3dhdGVyZmFsbC1ub2RlJyk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFBvc2l0aW9uWSh5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvblkgPSB5O1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHNldFNldHRpbmdzKHsgc3R5bGVzIH06IFdhdGVyZmFsbFBsdWdpblNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gbWVyZ2VPYmplY3RzKGRlZmF1bHRXYXRlcmZhbGxQbHVnaW5TdHlsZXMsIHN0eWxlcyk7XG5cbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLnN0eWxlcy5kZWZhdWx0SGVpZ2h0O1xuICAgICAgICB0aGlzLnBvc2l0aW9uWSA9IDA7XG4gICAgfVxuXG4gICAgc2V0RGF0YSh7IGl0ZW1zOiBkYXRhLCBpbnRlcnZhbHM6IGNvbW1vbkludGVydmFscyB9OiBXYXRlcmZhbGwpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvblkgPSAwO1xuXG4gICAgICAgIHRoaXMuaW5pdGlhbERhdGEgPSBkYXRhO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhXG4gICAgICAgICAgICAubWFwKCh7IG5hbWUsIGludGVydmFscywgdGltaW5nLCAuLi5yZXN0IH0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRJbnRlcnZhbHMgPSB0eXBlb2YgaW50ZXJ2YWxzID09PSAnc3RyaW5nJyA/IGNvbW1vbkludGVydmFsc1tpbnRlcnZhbHNdIDogaW50ZXJ2YWxzO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXBhcmVkSW50ZXJ2YWxzID0gcmVzb2x2ZWRJbnRlcnZhbHNcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoeyBzdGFydCwgZW5kLCBjb2xvciwgdHlwZSwgbmFtZSB9KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycgPyB0aW1pbmdbc3RhcnRdIDogc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnID8gdGltaW5nW2VuZF0gOiBlbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoeyBzdGFydCwgZW5kIH0pID0+IHR5cGVvZiBzdGFydCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGVuZCA9PT0gJ251bWJlcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2NrcyA9IHByZXBhcmVkSW50ZXJ2YWxzLmZpbHRlcigoeyB0eXBlIH0pID0+IHR5cGUgPT09ICdibG9jaycpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2tTdGFydCA9IGdldFZhbHVlQnlDaG9pY2UoYmxvY2tzLCAnc3RhcnQnLCBNYXRoLm1pbik7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2tFbmQgPSBnZXRWYWx1ZUJ5Q2hvaWNlKGJsb2NrcywgJ2VuZCcsIE1hdGgubWF4KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG1pbiA9IGdldFZhbHVlQnlDaG9pY2UocHJlcGFyZWRJbnRlcnZhbHMsICdzdGFydCcsIE1hdGgubWluKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXggPSBnZXRWYWx1ZUJ5Q2hvaWNlKHByZXBhcmVkSW50ZXJ2YWxzLCAnZW5kJywgTWF0aC5tYXgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucmVzdCxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWxzOiBwcmVwYXJlZEludGVydmFscyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dEJsb2NrOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogYmxvY2tTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZDogYmxvY2tFbmQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRpbWluZyxcbiAgICAgICAgICAgICAgICAgICAgbWluLFxuICAgICAgICAgICAgICAgICAgICBtYXgsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZpbHRlcigoeyBpbnRlcnZhbHMgfSkgPT4gaW50ZXJ2YWxzLmxlbmd0aClcbiAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLm1pbiAtIGIubWluIHx8IGIubWF4IC0gYS5tYXgpO1xuXG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5taW4gPSB0aGlzLmRhdGEucmVkdWNlKChhY2MsIHsgbWluIH0pID0+IE1hdGgubWluKGFjYywgbWluKSwgdGhpcy5kYXRhWzBdLm1pbik7XG4gICAgICAgICAgICB0aGlzLm1heCA9IHRoaXMuZGF0YS5yZWR1Y2UoKGFjYywgeyBtYXggfSkgPT4gTWF0aC5tYXgoYWNjLCBtYXgpLCB0aGlzLmRhdGFbMF0ubWF4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnJlbmRlckVuZ2luZSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVjYWxjTWluTWF4KCk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZXNldFBhcmVudFZpZXcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGNSZWN0KHN0YXJ0OiBudW1iZXIsIGR1cmF0aW9uOiBudW1iZXIsIGlzRW5kOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHcgPSBkdXJhdGlvbiAqIHRoaXMucmVuZGVyRW5naW5lLnpvb207XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHRoaXMucmVuZGVyRW5naW5lLnRpbWVUb1Bvc2l0aW9uKHN0YXJ0KSxcbiAgICAgICAgICAgIHc6IGlzRW5kID8gKHcgPD0gMC4xID8gMC4xIDogdyA+PSAzID8gdyAtIDEgOiB3IC0gdyAvIDMpIDogdyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSByZW5kZXJUb29sdGlwKCkge1xuICAgICAgICBpZiAodGhpcy5ob3ZlcmVkUmVnaW9uKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZW5kZXJFbmdpbmUub3B0aW9ucy50b29sdGlwID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yZW5kZXJFbmdpbmUub3B0aW9ucy50b29sdGlwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBkYXRhOiBpbmRleCB9ID0gdGhpcy5ob3ZlcmVkUmVnaW9uO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7IC4uLnRoaXMuaG92ZXJlZFJlZ2lvbiB9O1xuXG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSBkYXRhIHR5cGUgb24gd2F0ZXJmYWxsIGl0ZW0gaXMgbnVtYmVyIGJ1dCBoZXJlIGl0IGlzIHNvbWV0aGluZyBlbHNlP1xuICAgICAgICAgICAgICAgIGRhdGEuZGF0YSA9IHRoaXMuZGF0YS5maW5kKCh7IGluZGV4OiBpIH0pID0+IGluZGV4ID09PSBpKTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLm9wdGlvbnMudG9vbHRpcChkYXRhLCB0aGlzLnJlbmRlckVuZ2luZSwgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuZ2V0R2xvYmFsTW91c2UoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZGF0YTogaW5kZXggfSA9IHRoaXMuaG92ZXJlZFJlZ2lvbjtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhSXRlbSA9IHRoaXMuZGF0YS5maW5kKCh7IGluZGV4OiBpIH0pID0+IGluZGV4ID09PSBpKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YUl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBuYW1lLCBpbnRlcnZhbHMsIHRpbWluZywgbWV0YSA9IFtdIH0gPSBkYXRhSXRlbTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZVVuaXRzID0gdGhpcy5yZW5kZXJFbmdpbmUuZ2V0VGltZVVuaXRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVBY2N1cmFjeSA9IHRoaXMucmVuZGVyRW5naW5lLmdldEFjY3VyYWN5KCkgKyAyO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IHsgdGV4dDogYCR7bmFtZX1gIH07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGludGVydmFsc0hlYWRlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdpbnRlcnZhbHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHRoaXMucmVuZGVyRW5naW5lLnN0eWxlcy50b29sdGlwSGVhZGVyRm9udENvbG9yLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnZhbHNUZXh0cyA9IGludGVydmFscy5tYXAoKHsgbmFtZSwgc3RhcnQsIGVuZCB9KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogYCR7bmFtZX06ICR7KGVuZCAtIHN0YXJ0KS50b0ZpeGVkKG5vZGVBY2N1cmFjeSl9ICR7dGltZVVuaXRzfWAsXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltaW5nSGVhZGVyID0geyB0ZXh0OiAndGltaW5nJywgY29sb3I6IHRoaXMucmVuZGVyRW5naW5lLnN0eWxlcy50b29sdGlwSGVhZGVyRm9udENvbG9yIH07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWluZ1RleHRzID0gT2JqZWN0LmVudHJpZXModGltaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoWywgdGltZV0pID0+IHR5cGVvZiB0aW1lID09PSAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKFtuYW1lLCB0aW1lXTogW3N0cmluZywgbnVtYmVyXSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBgJHtuYW1lfTogJHt0aW1lLnRvRml4ZWQobm9kZUFjY3VyYWN5KX0gJHt0aW1lVW5pdHN9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWV0YUhlYWRlciA9IHsgdGV4dDogJ21ldGEnLCBjb2xvcjogdGhpcy5yZW5kZXJFbmdpbmUuc3R5bGVzLnRvb2x0aXBIZWFkZXJGb250Q29sb3IgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWV0YVRleHRzID0gbWV0YVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBtZXRhLm1hcCgoeyBuYW1lLCB2YWx1ZSwgY29sb3IgfSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IGAke25hbWV9OiAke3ZhbHVlfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlclRvb2x0aXBGcm9tRGF0YShcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWxzSGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmludGVydmFsc1RleHRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWluZ0hlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi50aW1pbmdUZXh0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4obWV0YVRleHRzLmxlbmd0aCA/IFttZXRhSGVhZGVyLCAuLi5tZXRhVGV4dHNdIDogW10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLmdldEdsb2JhbE1vdXNlKClcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCByaWdodFNpZGUgPSB0aGlzLnJlbmRlckVuZ2luZS5wb3NpdGlvblggKyB0aGlzLnJlbmRlckVuZ2luZS5nZXRSZWFsVmlldygpO1xuICAgICAgICBjb25zdCBsZWZ0U2lkZSA9IHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uWDtcbiAgICAgICAgY29uc3QgYmxvY2tIZWlnaHQgPSB0aGlzLnJlbmRlckVuZ2luZS5ibG9ja0hlaWdodCArIDE7XG4gICAgICAgIGNvbnN0IHN0YWNrOiBXYXR0ZXJmYWxsUGx1Z2luRGF0YUl0ZW1bXSA9IFtdO1xuICAgICAgICBjb25zdCB2aWV3ZWREYXRhID0gdGhpcy5kYXRhXG4gICAgICAgICAgICAuZmlsdGVyKCh7IG1pbiwgbWF4IH0pID0+ICEoKHJpZ2h0U2lkZSA8IG1pbiAmJiByaWdodFNpZGUgPCBtYXgpIHx8IChsZWZ0U2lkZSA+IG1heCAmJiByaWdodFNpZGUgPiBtaW4pKSlcbiAgICAgICAgICAgIC5tYXAoKGVudHJ5KSA9PiB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aCAmJiBlbnRyeS5taW4gLSBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5tYXggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGxldmVsID0gc3RhY2subGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5lbnRyeSxcbiAgICAgICAgICAgICAgICAgICAgbGV2ZWwsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goZW50cnkpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHZpZXdlZERhdGEuZm9yRWFjaCgoeyBuYW1lLCBpbnRlcnZhbHMsIHRleHRCbG9jaywgbGV2ZWwsIGluZGV4IH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBsZXZlbCAqIGJsb2NrSGVpZ2h0IC0gdGhpcy5wb3NpdGlvblk7XG5cbiAgICAgICAgICAgIGlmICh5ICsgYmxvY2tIZWlnaHQgPj0gMCAmJiB5IC0gYmxvY2tIZWlnaHQgPD0gdGhpcy5yZW5kZXJFbmdpbmUuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dFN0YXJ0ID0gdGhpcy5yZW5kZXJFbmdpbmUudGltZVRvUG9zaXRpb24odGV4dEJsb2NrLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0RW5kID0gdGhpcy5yZW5kZXJFbmdpbmUudGltZVRvUG9zaXRpb24odGV4dEJsb2NrLmVuZCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5hZGRUZXh0VG9SZW5kZXJRdWV1ZShuYW1lLCB0ZXh0U3RhcnQsIHksIHRleHRFbmQgLSB0ZXh0U3RhcnQpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgeyB4LCB3IH0gPSBpbnRlcnZhbHMucmVkdWNlPHsgeDogbnVtYmVyIHwgbnVsbDsgdzogbnVtYmVyIH0+KFxuICAgICAgICAgICAgICAgICAgICAoYWNjLCB7IGNvbG9yLCBzdGFydCwgZW5kLCB0eXBlIH0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHgsIHcgfSA9IHRoaXMuY2FsY1JlY3Qoc3RhcnQsIGVuZCAtIHN0YXJ0LCBpbmRleCA9PT0gaW50ZXJ2YWxzLmxlbmd0aCAtIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmFkZFJlY3RUb1JlbmRlclF1ZXVlKGNvbG9yLCB4LCB5LCB3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9EbyBhZGQgb3RoZXIgdHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBhY2MueCA9PT0gbnVsbCA/IHggOiBhY2MueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3OiB3ICsgYWNjLncsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IHg6IG51bGwsIHc6IDAgfVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZFJlZ2lvbiAmJiB0aGlzLnNlbGVjdGVkUmVnaW9uLnR5cGUgPT09ICd3YXRlcmZhbGwtbm9kZScpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IHRoaXMuc2VsZWN0ZWRSZWdpb24uZGF0YTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJbmRleCA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmFkZFN0cm9rZVRvUmVuZGVyUXVldWUoJ2dyZWVuJywgeCA/PyAwLCB5LCB3LCB0aGlzLnJlbmRlckVuZ2luZS5ibG9ja0hlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5hZGRIaXRSZWdpb24oXG4gICAgICAgICAgICAgICAgICAgIFJlZ2lvblR5cGVzLldBVEVSRkFMTF9OT0RFLFxuICAgICAgICAgICAgICAgICAgICBpbmRleCxcbiAgICAgICAgICAgICAgICAgICAgeCA/PyAwLFxuICAgICAgICAgICAgICAgICAgICB5LFxuICAgICAgICAgICAgICAgICAgICB3LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5ibG9ja0hlaWdodFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDApO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IG1lcmdlT2JqZWN0cyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IFNlcGFyYXRlZEludGVyYWN0aW9uc0VuZ2luZSB9IGZyb20gJy4uL2VuZ2luZXMvc2VwYXJhdGVkLWludGVyYWN0aW9ucy1lbmdpbmUnO1xuaW1wb3J0IHsgT2Zmc2NyZWVuUmVuZGVyRW5naW5lIH0gZnJvbSAnLi4vZW5naW5lcy9vZmZzY3JlZW4tcmVuZGVyLWVuZ2luZSc7XG5pbXBvcnQgVUlQbHVnaW4gZnJvbSAnLi91aS1wbHVnaW4nO1xuaW1wb3J0IHsgQ3Vyc29yVHlwZXMsIFJlZ2lvblR5cGVzIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgdHlwZSBUb2dnbGVQbHVnaW5TdHlsZXMgPSB7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgICBzdHJva2VDb2xvcjogc3RyaW5nO1xuICAgIGRvdHNDb2xvcjogc3RyaW5nO1xuICAgIGZvbnRDb2xvcjogc3RyaW5nO1xuICAgIGZvbnQ6IHN0cmluZztcbiAgICB0cmlhbmdsZVdpZHRoOiBudW1iZXI7XG4gICAgdHJpYW5nbGVIZWlnaHQ6IG51bWJlcjtcbiAgICB0cmlhbmdsZUNvbG9yOiBzdHJpbmc7XG4gICAgbGVmdFBhZGRpbmc6IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFRvZ2dsZVBsdWdpblNldHRpbmdzID0ge1xuICAgIHN0eWxlcz86IFBhcnRpYWw8VG9nZ2xlUGx1Z2luU3R5bGVzPjtcbn07XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0VG9nZ2xlUGx1Z2luU3R5bGVzOiBUb2dnbGVQbHVnaW5TdHlsZXMgPSB7XG4gICAgaGVpZ2h0OiAxNixcbiAgICBjb2xvcjogJ3JnYigyMDIsMjAyLDIwMiwgMC4yNSknLFxuICAgIHN0cm9rZUNvbG9yOiAncmdiKDEzOCwxMzgsMTM4LCAwLjUwKScsXG4gICAgZG90c0NvbG9yOiAncmdiKDk3LDk3LDk3KScsXG4gICAgZm9udENvbG9yOiAnYmxhY2snLFxuICAgIGZvbnQ6ICcxMHB4IHNhbnMtc2VyaWYnLFxuICAgIHRyaWFuZ2xlV2lkdGg6IDEwLFxuICAgIHRyaWFuZ2xlSGVpZ2h0OiA3LFxuICAgIHRyaWFuZ2xlQ29sb3I6ICdibGFjaycsXG4gICAgbGVmdFBhZGRpbmc6IDEwLFxufTtcblxuZXhwb3J0IGNsYXNzIFRvZ2dsZVBsdWdpbiBleHRlbmRzIFVJUGx1Z2luPFRvZ2dsZVBsdWdpblN0eWxlcz4ge1xuICAgIG92ZXJyaWRlIHN0eWxlczogVG9nZ2xlUGx1Z2luU3R5bGVzID0gZGVmYXVsdFRvZ2dsZVBsdWdpblN0eWxlcztcbiAgICBoZWlnaHQgPSAwO1xuXG4gICAgdGl0bGU6IHN0cmluZztcbiAgICByZXNpemVBY3RpdmUgPSBmYWxzZTtcbiAgICByZXNpemVTdGFydEhlaWdodCA9IDA7XG4gICAgcmVzaXplU3RhcnRQb3NpdGlvbiA9IDA7XG5cbiAgICBjb25zdHJ1Y3Rvcih0aXRsZTogc3RyaW5nLCBzZXR0aW5nczogVG9nZ2xlUGx1Z2luU2V0dGluZ3MpIHtcbiAgICAgICAgc3VwZXIoJ3RvZ2dsZVBsdWdpbicpO1xuICAgICAgICB0aGlzLnNldFNldHRpbmdzKHNldHRpbmdzKTtcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHNldFNldHRpbmdzKHsgc3R5bGVzIH06IFRvZ2dsZVBsdWdpblNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc3R5bGVzID0gbWVyZ2VPYmplY3RzKGRlZmF1bHRUb2dnbGVQbHVnaW5TdHlsZXMsIHN0eWxlcyk7XG5cbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLnN0eWxlcy5oZWlnaHQgKyAxO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIGluaXQocmVuZGVyRW5naW5lOiBPZmZzY3JlZW5SZW5kZXJFbmdpbmUsIGludGVyYWN0aW9uc0VuZ2luZTogU2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lKSB7XG4gICAgICAgIHN1cGVyLmluaXQocmVuZGVyRW5naW5lLCBpbnRlcmFjdGlvbnNFbmdpbmUpO1xuXG4gICAgICAgIGNvbnN0IG5leHRFbmdpbmUgPSB0aGlzLmdldE5leHRFbmdpbmUoKTtcbiAgICAgICAgbmV4dEVuZ2luZS5zZXRGbGV4aWJsZSgpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLm9uKCdjbGljaycsIChyZWdpb24pID0+IHtcbiAgICAgICAgICAgIGlmIChyZWdpb24gJiYgcmVnaW9uLnR5cGUgPT09ICd0b2dnbGUnICYmIHJlZ2lvbi5kYXRhID09PSB0aGlzLnJlbmRlckVuZ2luZS5pZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHRFbmdpbmUgPSB0aGlzLmdldE5leHRFbmdpbmUoKTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0RW5naW5lLmNvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0RW5naW5lLmV4cGFuZCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRFbmdpbmUuY29sbGFwc2UoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQucmVjYWxjQ2hpbGRyZW5TaXplcygpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5yZW5kZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUub24oJ2Rvd24nLCAocmVnaW9uKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVnaW9uICYmIHJlZ2lvbi50eXBlID09PSAna25vYi1yZXNpemUnICYmIHJlZ2lvbi5kYXRhID09PSB0aGlzLnJlbmRlckVuZ2luZS5pZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZFbmdpbmUgPSB0aGlzLmdldFByZXZFbmdpbmUoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLnNldEN1cnNvcigncm93LXJlc2l6ZScpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzaXplQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2l6ZVN0YXJ0SGVpZ2h0ID0gcHJldkVuZ2luZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNpemVTdGFydFBvc2l0aW9uID0gdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuZ2V0R2xvYmFsTW91c2UoKS55O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5wYXJlbnQub24oJ21vdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZXNpemVBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2RW5naW5lID0gdGhpcy5nZXRQcmV2RW5naW5lKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbW91c2UgPSB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5nZXRHbG9iYWxNb3VzZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHByZXZFbmdpbmUuZmxleGlibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSB0aGlzLnJlc2l6ZVN0YXJ0SGVpZ2h0IC0gKHRoaXMucmVzaXplU3RhcnRQb3NpdGlvbiAtIG1vdXNlLnkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQb3NpdGlvbiA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2RW5naW5lLmNvbGxhcHNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2RW5naW5lLnJlc2l6ZSh7IGhlaWdodDogMCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2RW5naW5lLmNvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZFbmdpbmUuZXhwYW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZFbmdpbmUucmVzaXplKHsgaGVpZ2h0OiBuZXdQb3NpdGlvbiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLnBhcmVudC5vbigndXAnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZS5jbGVhckN1cnNvcigpO1xuICAgICAgICAgICAgdGhpcy5yZXNpemVBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0UHJldkVuZ2luZSgpIHtcbiAgICAgICAgY29uc3QgcHJldlJlbmRlckVuZ2luZUlkID0gKHRoaXMucmVuZGVyRW5naW5lLmlkID8/IDApIC0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyRW5naW5lLnBhcmVudC5jaGlsZHJlbltwcmV2UmVuZGVyRW5naW5lSWRdO1xuICAgIH1cblxuICAgIGdldE5leHRFbmdpbmUoKSB7XG4gICAgICAgIGNvbnN0IG5leHRSZW5kZXJFbmdpbmVJZCA9ICh0aGlzLnJlbmRlckVuZ2luZS5pZCA/PyAwKSArIDE7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlckVuZ2luZS5wYXJlbnQuY2hpbGRyZW5bbmV4dFJlbmRlckVuZ2luZUlkXTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IG5leHRFbmdpbmUgPSB0aGlzLmdldE5leHRFbmdpbmUoKTtcbiAgICAgICAgY29uc3QgcHJldkVuZ2luZSA9IHRoaXMuZ2V0UHJldkVuZ2luZSgpO1xuICAgICAgICBjb25zdCB0cmlhbmdsZUZ1bGxXaWR0aCA9IHRoaXMuc3R5bGVzLmxlZnRQYWRkaW5nICsgdGhpcy5zdHlsZXMudHJpYW5nbGVXaWR0aDtcbiAgICAgICAgY29uc3QgY2VudGVyVyA9IHRoaXMucmVuZGVyRW5naW5lLndpZHRoIC8gMjtcbiAgICAgICAgY29uc3QgY2VudGVySCA9IHRoaXMuc3R5bGVzLmhlaWdodCAvIDI7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuc2V0Q3R4Rm9udCh0aGlzLnN0eWxlcy5mb250KTtcblxuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5zZXRDdHhDb2xvcih0aGlzLnN0eWxlcy5jb2xvcik7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnNldFN0cm9rZUNvbG9yKHRoaXMuc3R5bGVzLnN0cm9rZUNvbG9yKTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuZmlsbFJlY3QoMCwgMCwgdGhpcy5yZW5kZXJFbmdpbmUud2lkdGgsIHRoaXMuc3R5bGVzLmhlaWdodCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuc2V0Q3R4Q29sb3IodGhpcy5zdHlsZXMuZm9udENvbG9yKTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuYWRkVGV4dFRvUmVuZGVyUXVldWUodGhpcy50aXRsZSwgdHJpYW5nbGVGdWxsV2lkdGgsIDAsIHRoaXMucmVuZGVyRW5naW5lLndpZHRoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVuZGVyVHJpYW5nbGUoXG4gICAgICAgICAgICB0aGlzLnN0eWxlcy50cmlhbmdsZUNvbG9yLFxuICAgICAgICAgICAgdGhpcy5zdHlsZXMubGVmdFBhZGRpbmcsXG4gICAgICAgICAgICB0aGlzLnN0eWxlcy5oZWlnaHQgLyAyLFxuICAgICAgICAgICAgdGhpcy5zdHlsZXMudHJpYW5nbGVXaWR0aCxcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzLnRyaWFuZ2xlSGVpZ2h0LFxuICAgICAgICAgICAgbmV4dEVuZ2luZS5jb2xsYXBzZWQgPyAncmlnaHQnIDogJ2JvdHRvbSdcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB7IHdpZHRoOiB0aXRsZVdpZHRoIH0gPSB0aGlzLnJlbmRlckVuZ2luZS5jdHgubWVhc3VyZVRleHQodGhpcy50aXRsZSk7XG4gICAgICAgIGNvbnN0IGJ1dHRvbldpZHRoID0gdGl0bGVXaWR0aCArIHRyaWFuZ2xlRnVsbFdpZHRoO1xuXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLmFkZEhpdFJlZ2lvbihcbiAgICAgICAgICAgIFJlZ2lvblR5cGVzLlRPR0dMRSxcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmlkLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBidXR0b25XaWR0aCxcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzLmhlaWdodCxcbiAgICAgICAgICAgIEN1cnNvclR5cGVzLlBPSU5URVJcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAocHJldkVuZ2luZS5mbGV4aWJsZSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVuZGVyQ2lyY2xlKHRoaXMuc3R5bGVzLmRvdHNDb2xvciwgY2VudGVyVywgY2VudGVySCwgMS41KTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlckNpcmNsZSh0aGlzLnN0eWxlcy5kb3RzQ29sb3IsIGNlbnRlclcgLSAxMCwgY2VudGVySCwgMS41KTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlckNpcmNsZSh0aGlzLnN0eWxlcy5kb3RzQ29sb3IsIGNlbnRlclcgKyAxMCwgY2VudGVySCwgMS41KTtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbnNFbmdpbmUuYWRkSGl0UmVnaW9uKFxuICAgICAgICAgICAgICAgIFJlZ2lvblR5cGVzLktOT0JfUkVTSVpFLFxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmlkLFxuICAgICAgICAgICAgICAgIGJ1dHRvbldpZHRoLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUud2lkdGggLSBidXR0b25XaWR0aCxcbiAgICAgICAgICAgICAgICB0aGlzLnN0eWxlcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgQ3Vyc29yVHlwZXMuUk9XX1JFU0laRVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBtZXJnZU9iamVjdHMgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBEb3RzLCBNb3VzZSwgUmVjdFJlbmRlclF1ZXVlLCBTdHJva2UsIFRleHQsIFRvb2x0aXBGaWVsZCB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IE9mZnNjcmVlblJlbmRlckVuZ2luZSB9IGZyb20gJy4vb2Zmc2NyZWVuLXJlbmRlci1lbmdpbmUnO1xuaW1wb3J0IHsgUmVuZGVyRW5naW5lIH0gZnJvbSAnLi9yZW5kZXItZW5naW5lJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZXR0aWVyL3ByZXR0aWVyIC0tIHByZXR0aWVyIGNvbXBsYWlucyBhYm91dCBlc2NhcGluZyBvZiB0aGUgXCIgY2hhcmFjdGVyXG5jb25zdCBhbGxDaGFycyA9ICdRV0VSVFlVSU9QQVNERkdISktMWlhDVkJOTXF3ZXJ0eXVpb3Bhc2RmZ2hqa2x6eGN2Ym5tMTIzNDU2Nzg5MF8tKygpW117fVxcXFwvfFxcJ1wiOzouLD9+JztcblxuY29uc3QgY2hlY2tTYWZhcmkgPSAoKSA9PiB7XG4gICAgY29uc3QgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIHVhLmluY2x1ZGVzKCdzYWZhcmknKSA/ICF1YS5pbmNsdWRlcygnY2hyb21lJykgOiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIGdldFBpeGVsUmF0aW8oY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XG4gICAgLy8gVW5mb3J0dW5hdGVseSB1c2luZyBhbnkgaGVyZSwgc2luY2UgdHlwZXNjcmlwdCBpcyBub3QgYXdhcmUgb2YgYWxsIG9mIHRoZSBicm93c2VyIHByZWZpeGVzXG4gICAgY29uc3QgY3R4ID0gY29udGV4dCBhcyBhbnk7XG4gICAgY29uc3QgZHByID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBjb25zdCBic3IgPVxuICAgICAgICBjdHgud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgICBjdHgubW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgICBjdHgubXNCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICAgIGN0eC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgICBjdHguYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgICAxO1xuXG4gICAgcmV0dXJuIGRwciAvIGJzcjtcbn1cblxuZXhwb3J0IHR5cGUgUmVuZGVyT3B0aW9ucyA9IHtcbiAgICB0b29sdGlwPzpcbiAgICAgICAgfCAoKGRhdGE6IGFueSwgcmVuZGVyRW5naW5lOiBSZW5kZXJFbmdpbmUgfCBPZmZzY3JlZW5SZW5kZXJFbmdpbmUsIG1vdXNlOiBNb3VzZSB8IG51bGwpID0+IGJvb2xlYW4gfCB2b2lkKVxuICAgICAgICB8IGJvb2xlYW47XG4gICAgdGltZVVuaXRzOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBSZW5kZXJTdHlsZXMgPSB7XG4gICAgYmxvY2tIZWlnaHQ6IG51bWJlcjtcbiAgICBibG9ja1BhZGRpbmdMZWZ0UmlnaHQ6IG51bWJlcjtcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IHN0cmluZztcbiAgICBmb250OiBzdHJpbmc7XG4gICAgZm9udENvbG9yOiBzdHJpbmc7XG4gICAgdG9vbHRpcEhlYWRlckZvbnRDb2xvcjogc3RyaW5nO1xuICAgIHRvb2x0aXBCb2R5Rm9udENvbG9yOiBzdHJpbmc7XG4gICAgdG9vbHRpcEJhY2tncm91bmRDb2xvcjogc3RyaW5nO1xuICAgIGhlYWRlckhlaWdodDogbnVtYmVyO1xuICAgIGhlYWRlckNvbG9yOiBzdHJpbmc7XG4gICAgaGVhZGVyU3Ryb2tlQ29sb3I6IHN0cmluZztcbiAgICBoZWFkZXJUaXRsZUxlZnRQYWRkaW5nOiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBSZW5kZXJTZXR0aW5ncyA9IHtcbiAgICBvcHRpb25zPzogUGFydGlhbDxSZW5kZXJPcHRpb25zPjtcbiAgICBzdHlsZXM/OiBQYXJ0aWFsPFJlbmRlclN0eWxlcz47XG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFJlbmRlclNldHRpbmdzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgIHRvb2x0aXA6IHVuZGVmaW5lZCxcbiAgICB0aW1lVW5pdHM6ICdtcycsXG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFJlbmRlclN0eWxlczogUmVuZGVyU3R5bGVzID0ge1xuICAgIGJsb2NrSGVpZ2h0OiAxNixcbiAgICBibG9ja1BhZGRpbmdMZWZ0UmlnaHQ6IDQsXG4gICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgIGZvbnQ6ICcxMHB4IHNhbnMtc2VyaWYnLFxuICAgIGZvbnRDb2xvcjogJ2JsYWNrJyxcbiAgICB0b29sdGlwSGVhZGVyRm9udENvbG9yOiAnYmxhY2snLFxuICAgIHRvb2x0aXBCb2R5Rm9udENvbG9yOiAnIzY4OGY0NScsXG4gICAgdG9vbHRpcEJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICBoZWFkZXJIZWlnaHQ6IDE0LFxuICAgIGhlYWRlckNvbG9yOiAncmdiYSgxMTIsIDExMiwgMTEyLCAwLjI1KScsXG4gICAgaGVhZGVyU3Ryb2tlQ29sb3I6ICdyZ2JhKDExMiwgMTEyLCAxMTIsIDAuNSknLFxuICAgIGhlYWRlclRpdGxlTGVmdFBhZGRpbmc6IDE2LFxufTtcblxuZXhwb3J0IGNsYXNzIEJhc2ljUmVuZGVyRW5naW5lIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIGlzU2FmYXJpOiBib29sZWFuO1xuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcGl4ZWxSYXRpbzogbnVtYmVyO1xuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgPSBkZWZhdWx0UmVuZGVyU2V0dGluZ3M7XG4gICAgdGltZVVuaXRzID0gJ21zJztcbiAgICBzdHlsZXM6IFJlbmRlclN0eWxlcyA9IGRlZmF1bHRSZW5kZXJTdHlsZXM7XG4gICAgYmxvY2tQYWRkaW5nTGVmdFJpZ2h0ID0gMDtcbiAgICBibG9ja0hlaWdodCA9IDA7XG4gICAgYmxvY2tQYWRkaW5nVG9wQm90dG9tID0gMDtcbiAgICBjaGFySGVpZ2h0ID0gMDtcbiAgICBwbGFjZWhvbGRlcldpZHRoID0gMDtcbiAgICBhdmdDaGFyV2lkdGggPSAwO1xuICAgIG1pblRleHRXaWR0aCA9IDA7XG4gICAgdGV4dFJlbmRlclF1ZXVlOiBUZXh0W10gPSBbXTtcbiAgICBzdHJva2VSZW5kZXJRdWV1ZTogU3Ryb2tlW10gPSBbXTtcbiAgICByZWN0UmVuZGVyUXVldWU6IFJlY3RSZW5kZXJRdWV1ZSA9IHt9O1xuICAgIGxhc3RVc2VkQ29sb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIGxhc3RVc2VkU3Ryb2tlQ29sb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgIHpvb206IG51bWJlciA9IDA7XG4gICAgcG9zaXRpb25YID0gMDtcbiAgICBtaW4gPSAwO1xuICAgIG1heCA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcihjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBzZXR0aW5nczogUmVuZGVyU2V0dGluZ3MpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLndpZHRoID0gY2FudmFzLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5pc1NhZmFyaSA9IGNoZWNrU2FmYXJpKCk7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgICB0aGlzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcsIHsgYWxwaGE6IGZhbHNlIH0pITtcbiAgICAgICAgdGhpcy5waXhlbFJhdGlvID0gZ2V0UGl4ZWxSYXRpbyh0aGlzLmN0eCk7XG5cbiAgICAgICAgdGhpcy5zZXRTZXR0aW5ncyhzZXR0aW5ncyk7XG5cbiAgICAgICAgdGhpcy5hcHBseUNhbnZhc1NpemUoKTtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIHNldFNldHRpbmdzKHsgb3B0aW9ucywgc3R5bGVzIH06IFJlbmRlclNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlT2JqZWN0cyhkZWZhdWx0UmVuZGVyU2V0dGluZ3MsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnN0eWxlcyA9IG1lcmdlT2JqZWN0cyhkZWZhdWx0UmVuZGVyU3R5bGVzLCBzdHlsZXMpO1xuXG4gICAgICAgIHRoaXMudGltZVVuaXRzID0gdGhpcy5vcHRpb25zLnRpbWVVbml0cztcblxuICAgICAgICB0aGlzLmJsb2NrSGVpZ2h0ID0gdGhpcy5zdHlsZXMuYmxvY2tIZWlnaHQ7XG4gICAgICAgIHRoaXMuY3R4LmZvbnQgPSB0aGlzLnN0eWxlcy5mb250O1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGFjdHVhbEJvdW5kaW5nQm94QXNjZW50OiBmb250QXNjZW50LFxuICAgICAgICAgICAgYWN0dWFsQm91bmRpbmdCb3hEZXNjZW50OiBmb250RGVzY2VudCxcbiAgICAgICAgICAgIHdpZHRoOiBhbGxDaGFyc1dpZHRoLFxuICAgICAgICB9ID0gdGhpcy5jdHgubWVhc3VyZVRleHQoYWxsQ2hhcnMpO1xuICAgICAgICBjb25zdCB7IHdpZHRoOiBwbGFjZWhvbGRlcldpZHRoIH0gPSB0aGlzLmN0eC5tZWFzdXJlVGV4dCgn4oCmJyk7XG4gICAgICAgIGNvbnN0IGZvbnRIZWlnaHQgPSBmb250QXNjZW50ICsgZm9udERlc2NlbnQ7XG5cbiAgICAgICAgdGhpcy5ibG9ja1BhZGRpbmdMZWZ0UmlnaHQgPSB0aGlzLnN0eWxlcy5ibG9ja1BhZGRpbmdMZWZ0UmlnaHQ7XG4gICAgICAgIHRoaXMuYmxvY2tQYWRkaW5nVG9wQm90dG9tID0gTWF0aC5jZWlsKCh0aGlzLmJsb2NrSGVpZ2h0IC0gZm9udEhlaWdodCkgLyAyKTtcbiAgICAgICAgdGhpcy5jaGFySGVpZ2h0ID0gZm9udEhlaWdodCArIDE7XG4gICAgICAgIHRoaXMucGxhY2Vob2xkZXJXaWR0aCA9IHBsYWNlaG9sZGVyV2lkdGg7XG4gICAgICAgIHRoaXMuYXZnQ2hhcldpZHRoID0gYWxsQ2hhcnNXaWR0aCAvIGFsbENoYXJzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5taW5UZXh0V2lkdGggPSB0aGlzLmF2Z0NoYXJXaWR0aCArIHRoaXMucGxhY2Vob2xkZXJXaWR0aDtcbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy50ZXh0UmVuZGVyUXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5zdHJva2VSZW5kZXJRdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLnJlY3RSZW5kZXJRdWV1ZSA9IHt9O1xuICAgIH1cblxuICAgIHNldEN0eENvbG9yKGNvbG9yOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKGNvbG9yICYmIHRoaXMubGFzdFVzZWRDb2xvciAhPT0gY29sb3IpIHtcbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZENvbG9yID0gY29sb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRTdHJva2VDb2xvcihjb2xvcjogc3RyaW5nKSB7XG4gICAgICAgIGlmIChjb2xvciAmJiB0aGlzLmxhc3RVc2VkU3Ryb2tlQ29sb3IgIT09IGNvbG9yKSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZFN0cm9rZUNvbG9yID0gY29sb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRDdHhGb250KGZvbnQ6IHN0cmluZykge1xuICAgICAgICBpZiAoZm9udCAmJiB0aGlzLmN0eC5mb250ICE9PSBmb250KSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5mb250ID0gZm9udDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbGxSZWN0KHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcbiAgICB9XG5cbiAgICBmaWxsVGV4dCh0ZXh0OiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KHRleHQsIHgsIHkpO1xuICAgIH1cblxuICAgIHJlbmRlckJsb2NrKGNvbG9yOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zZXRDdHhDb2xvcihjb2xvcik7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHgsIHksIHcsIHRoaXMuYmxvY2tIZWlnaHQpO1xuICAgIH1cblxuICAgIHJlbmRlclN0cm9rZShjb2xvcjogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zZXRTdHJva2VDb2xvcihjb2xvcik7XG4gICAgICAgIHRoaXMuY3R4LnNldExpbmVEYXNoKFtdKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdCh4LCB5LCB3LCBoKTtcbiAgICB9XG5cbiAgICBjbGVhcih3ID0gdGhpcy53aWR0aCwgaCA9IHRoaXMuaGVpZ2h0LCB4ID0gMCwgeSA9IDApIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KHgsIHksIHcsIGggLSAxKTtcbiAgICAgICAgdGhpcy5zZXRDdHhDb2xvcih0aGlzLnN0eWxlcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcblxuICAgICAgICB0aGlzLmVtaXQoJ2NsZWFyJyk7XG4gICAgfVxuXG4gICAgdGltZVRvUG9zaXRpb24odGltZTogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aW1lICogdGhpcy56b29tIC0gdGhpcy5wb3NpdGlvblggKiB0aGlzLnpvb207XG4gICAgfVxuXG4gICAgcGl4ZWxUb1RpbWUod2lkdGg6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gd2lkdGggLyB0aGlzLnpvb207XG4gICAgfVxuXG4gICAgc2V0Wm9vbSh6b29tOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy56b29tID0gem9vbTtcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvblgoeDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQb3MgPSB0aGlzLnBvc2l0aW9uWDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uWCA9IHg7XG5cbiAgICAgICAgcmV0dXJuIHggLSBjdXJyZW50UG9zO1xuICAgIH1cblxuICAgIGFkZFJlY3RUb1JlbmRlclF1ZXVlKGNvbG9yOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlY3RSZW5kZXJRdWV1ZVtjb2xvcl0pIHtcbiAgICAgICAgICAgIHRoaXMucmVjdFJlbmRlclF1ZXVlW2NvbG9yXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZWN0UmVuZGVyUXVldWVbY29sb3JdLnB1c2goeyB4LCB5LCB3IH0pO1xuICAgIH1cblxuICAgIGFkZFRleHRUb1JlbmRlclF1ZXVlKHRleHQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlcikge1xuICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgY29uc3QgdGV4dE1heFdpZHRoID0gdyAtICh0aGlzLmJsb2NrUGFkZGluZ0xlZnRSaWdodCAqIDIgLSAoeCA8IDAgPyB4IDogMCkpO1xuXG4gICAgICAgICAgICBpZiAodGV4dE1heFdpZHRoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dFJlbmRlclF1ZXVlLnB1c2goeyB0ZXh0LCB4LCB5LCB3LCB0ZXh0TWF4V2lkdGggfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRTdHJva2VUb1JlbmRlclF1ZXVlKGNvbG9yOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgICAgICB0aGlzLnN0cm9rZVJlbmRlclF1ZXVlLnB1c2goeyBjb2xvciwgeCwgeSwgdywgaCB9KTtcbiAgICB9XG5cbiAgICByZXNvbHZlUmVjdFJlbmRlclF1ZXVlKCkge1xuICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlY3RSZW5kZXJRdWV1ZSkuZm9yRWFjaCgoW2NvbG9yLCBpdGVtc10pID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0Q3R4Q29sb3IoY29sb3IpO1xuXG4gICAgICAgICAgICBpdGVtcy5mb3JFYWNoKCh7IHgsIHksIHcgfSkgPT4gdGhpcy5yZW5kZXJCbG9jayhjb2xvciwgeCwgeSwgdykpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlY3RSZW5kZXJRdWV1ZSA9IHt9O1xuICAgIH1cblxuICAgIHJlc29sdmVUZXh0UmVuZGVyUXVldWUoKSB7XG4gICAgICAgIHRoaXMuc2V0Q3R4Q29sb3IodGhpcy5zdHlsZXMuZm9udENvbG9yKTtcblxuICAgICAgICB0aGlzLnRleHRSZW5kZXJRdWV1ZS5mb3JFYWNoKCh7IHRleHQsIHgsIHksIHRleHRNYXhXaWR0aCB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IHdpZHRoOiB0ZXh0V2lkdGggfSA9IHRoaXMuY3R4Lm1lYXN1cmVUZXh0KHRleHQpO1xuXG4gICAgICAgICAgICBpZiAodGV4dFdpZHRoID4gdGV4dE1heFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZnQ2hhcldpZHRoID0gdGV4dFdpZHRoIC8gdGV4dC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF4Q2hhcnMgPSBNYXRoLmZsb29yKCh0ZXh0TWF4V2lkdGggLSB0aGlzLnBsYWNlaG9sZGVyV2lkdGgpIC8gYXZnQ2hhcldpZHRoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBoYWxmQ2hhcnMgPSAobWF4Q2hhcnMgLSAxKSAvIDI7XG5cbiAgICAgICAgICAgICAgICBpZiAoaGFsZkNoYXJzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQuc2xpY2UoMCwgTWF0aC5jZWlsKGhhbGZDaGFycykpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICfigKYnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQuc2xpY2UodGV4dC5sZW5ndGggLSBNYXRoLmZsb29yKGhhbGZDaGFycyksIHRleHQubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFxuICAgICAgICAgICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgICAgICAgICAoeCA8IDAgPyAwIDogeCkgKyB0aGlzLmJsb2NrUGFkZGluZ0xlZnRSaWdodCxcbiAgICAgICAgICAgICAgICAgICAgeSArIHRoaXMuYmxvY2tIZWlnaHQgLSB0aGlzLmJsb2NrUGFkZGluZ1RvcEJvdHRvbVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudGV4dFJlbmRlclF1ZXVlID0gW107XG4gICAgfVxuXG4gICAgcmVzb2x2ZVN0cm9rZVJlbmRlclF1ZXVlKCkge1xuICAgICAgICB0aGlzLnN0cm9rZVJlbmRlclF1ZXVlLmZvckVhY2goKHsgY29sb3IsIHgsIHksIHcsIGggfSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJTdHJva2UoY29sb3IsIHgsIHksIHcsIGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnN0cm9rZVJlbmRlclF1ZXVlID0gW107XG4gICAgfVxuXG4gICAgc2V0TWluTWF4KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgICAgICBjb25zdCBoYXNDaGFuZ2VzID0gbWluICE9PSB0aGlzLm1pbiB8fCBtYXggIT09IHRoaXMubWF4O1xuXG4gICAgICAgIHRoaXMubWluID0gbWluO1xuICAgICAgICB0aGlzLm1heCA9IG1heDtcblxuICAgICAgICBpZiAoaGFzQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdtaW4tbWF4LWNoYW5nZScsIG1pbiwgbWF4KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldFRpbWVVbml0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZVVuaXRzO1xuICAgIH1cblxuICAgIHRyeVRvQ2hhbmdlUG9zaXRpb24ocG9zaXRpb25EZWx0YTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHJlYWxWaWV3ID0gdGhpcy5nZXRSZWFsVmlldygpO1xuXG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uWCArIHBvc2l0aW9uRGVsdGEgKyByZWFsVmlldyA8PSB0aGlzLm1heCAmJiB0aGlzLnBvc2l0aW9uWCArIHBvc2l0aW9uRGVsdGEgPj0gdGhpcy5taW4pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb25YKHRoaXMucG9zaXRpb25YICsgcG9zaXRpb25EZWx0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wb3NpdGlvblggKyBwb3NpdGlvbkRlbHRhIDw9IHRoaXMubWluKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uWCh0aGlzLm1pbik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wb3NpdGlvblggKyBwb3NpdGlvbkRlbHRhICsgcmVhbFZpZXcgPj0gdGhpcy5tYXgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb25YKHRoaXMubWF4IC0gcmVhbFZpZXcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SW5pdGlhbFpvb20oKSB7XG4gICAgICAgIGlmICh0aGlzLm1heCAtIHRoaXMubWluID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lkdGggLyAodGhpcy5tYXggLSB0aGlzLm1pbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgZ2V0UmVhbFZpZXcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZHRoIC8gdGhpcy56b29tO1xuICAgIH1cblxuICAgIHJlc2V0VmlldygpIHtcbiAgICAgICAgdGhpcy5zZXRab29tKHRoaXMuZ2V0SW5pdGlhbFpvb20oKSk7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb25YKHRoaXMubWluKTtcbiAgICB9XG5cbiAgICByZXNpemUod2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlcikge1xuICAgICAgICBjb25zdCBpc1dpZHRoQ2hhbmdlZCA9IHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicgJiYgdGhpcy53aWR0aCAhPT0gd2lkdGg7XG4gICAgICAgIGNvbnN0IGlzSGVpZ2h0Q2hhbmdlZCA9IHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIHRoaXMuaGVpZ2h0ICE9PSBoZWlnaHQ7XG5cbiAgICAgICAgaWYgKGlzV2lkdGhDaGFuZ2VkIHx8IGlzSGVpZ2h0Q2hhbmdlZCkge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IGlzV2lkdGhDaGFuZ2VkID8gd2lkdGggOiB0aGlzLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBpc0hlaWdodENoYW5nZWQgPyBoZWlnaHQgOiB0aGlzLmhlaWdodDtcblxuICAgICAgICAgICAgdGhpcy5hcHBseUNhbnZhc1NpemUoKTtcblxuICAgICAgICAgICAgdGhpcy5lbWl0KCdyZXNpemUnLCB7IHdpZHRoOiB0aGlzLndpZHRoLCBoZWlnaHQ6IHRoaXMuaGVpZ2h0IH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gaXNIZWlnaHRDaGFuZ2VkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhcHBseUNhbnZhc1NpemUoKSB7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aCArICdweCc7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLndpZHRoICogdGhpcy5waXhlbFJhdGlvO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmhlaWdodCAqIHRoaXMucGl4ZWxSYXRpbztcbiAgICAgICAgdGhpcy5jdHguc2V0VHJhbnNmb3JtKHRoaXMucGl4ZWxSYXRpbywgMCwgMCwgdGhpcy5waXhlbFJhdGlvLCAwLCAwKTtcbiAgICAgICAgdGhpcy5jdHguZm9udCA9IHRoaXMuc3R5bGVzLmZvbnQ7XG4gICAgICAgIHRoaXMubGFzdFVzZWRDb2xvciA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdFVzZWRTdHJva2VDb2xvciA9IG51bGw7XG4gICAgfVxuXG4gICAgY29weShlbmdpbmU6IE9mZnNjcmVlblJlbmRlckVuZ2luZSkge1xuICAgICAgICBjb25zdCByYXRpbyA9IHRoaXMuaXNTYWZhcmkgPyAxIDogZW5naW5lLnBpeGVsUmF0aW87XG5cbiAgICAgICAgaWYgKGVuZ2luZS5jYW52YXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICAgICAgZW5naW5lLmNhbnZhcyxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgZW5naW5lLmNhbnZhcy53aWR0aCAqIHJhdGlvLFxuICAgICAgICAgICAgICAgIGVuZ2luZS5jYW52YXMuaGVpZ2h0ICogcmF0aW8sXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBlbmdpbmUucG9zaXRpb24gfHwgMCxcbiAgICAgICAgICAgICAgICBlbmdpbmUud2lkdGggKiByYXRpbyxcbiAgICAgICAgICAgICAgICBlbmdpbmUuaGVpZ2h0ICogcmF0aW9cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXJUb29sdGlwRnJvbURhdGEoZmllbGRzOiBUb29sdGlwRmllbGRbXSwgbW91c2U6IE1vdXNlKSB7XG4gICAgICAgIGNvbnN0IG1vdXNlWCA9IG1vdXNlLnggKyAxMDtcbiAgICAgICAgY29uc3QgbW91c2VZID0gbW91c2UueSArIDEwO1xuXG4gICAgICAgIGNvbnN0IG1heFdpZHRoID0gZmllbGRzXG4gICAgICAgICAgICAubWFwKCh7IHRleHQgfSkgPT4gdGV4dClcbiAgICAgICAgICAgIC5tYXAoKHRleHQpID0+IHRoaXMuY3R4Lm1lYXN1cmVUZXh0KHRleHQpKVxuICAgICAgICAgICAgLnJlZHVjZSgoYWNjLCB7IHdpZHRoIH0pID0+IE1hdGgubWF4KGFjYywgd2lkdGgpLCAwKTtcbiAgICAgICAgY29uc3QgZnVsbFdpZHRoID0gbWF4V2lkdGggKyB0aGlzLmJsb2NrUGFkZGluZ0xlZnRSaWdodCAqIDI7XG5cbiAgICAgICAgdGhpcy5jdHguc2hhZG93Q29sb3IgPSAnYmxhY2snO1xuICAgICAgICB0aGlzLmN0eC5zaGFkb3dCbHVyID0gNTtcblxuICAgICAgICB0aGlzLnNldEN0eENvbG9yKHRoaXMuc3R5bGVzLnRvb2x0aXBCYWNrZ3JvdW5kQ29sb3IpO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdChcbiAgICAgICAgICAgIG1vdXNlWCxcbiAgICAgICAgICAgIG1vdXNlWSxcbiAgICAgICAgICAgIGZ1bGxXaWR0aCArIHRoaXMuYmxvY2tQYWRkaW5nTGVmdFJpZ2h0ICogMixcbiAgICAgICAgICAgICh0aGlzLmNoYXJIZWlnaHQgKyAyKSAqIGZpZWxkcy5sZW5ndGggKyB0aGlzLmJsb2NrUGFkZGluZ0xlZnRSaWdodCAqIDJcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmN0eC5zaGFkb3dDb2xvciA9ICd0cmFuc3BhcmVudCc7XG4gICAgICAgIHRoaXMuY3R4LnNoYWRvd0JsdXIgPSAwO1xuXG4gICAgICAgIGZpZWxkcy5mb3JFYWNoKCh7IHRleHQsIGNvbG9yIH0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEN0eENvbG9yKGNvbG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDdHhDb2xvcih0aGlzLnN0eWxlcy50b29sdGlwSGVhZGVyRm9udENvbG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDdHhDb2xvcih0aGlzLnN0eWxlcy50b29sdGlwQm9keUZvbnRDb2xvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFxuICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgbW91c2VYICsgdGhpcy5ibG9ja1BhZGRpbmdMZWZ0UmlnaHQsXG4gICAgICAgICAgICAgICAgbW91c2VZICsgdGhpcy5ibG9ja0hlaWdodCAtIHRoaXMuYmxvY2tQYWRkaW5nVG9wQm90dG9tICsgKHRoaXMuY2hhckhlaWdodCArIDIpICogaW5kZXhcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlclNoYXBlKGNvbG9yOiBzdHJpbmcsIGRvdHM6IERvdHMsIHBvc1g6IG51bWJlciwgcG9zWTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2V0Q3R4Q29sb3IoY29sb3IpO1xuXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhkb3RzWzBdLnggKyBwb3NYLCBkb3RzWzBdLnkgKyBwb3NZKTtcblxuICAgICAgICBkb3RzLnNsaWNlKDEpLmZvckVhY2goKHsgeCwgeSB9KSA9PiB0aGlzLmN0eC5saW5lVG8oeCArIHBvc1gsIHkgKyBwb3NZKSk7XG5cbiAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgIH1cblxuICAgIHJlbmRlclRyaWFuZ2xlKFxuICAgICAgICBjb2xvcjogc3RyaW5nLFxuICAgICAgICB4OiBudW1iZXIsXG4gICAgICAgIHk6IG51bWJlcixcbiAgICAgICAgd2lkdGg6IG51bWJlcixcbiAgICAgICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgICAgIGRpcmVjdGlvbjogJ2JvdHRvbScgfCAnbGVmdCcgfCAncmlnaHQnIHwgJ3RvcCdcbiAgICApIHtcbiAgICAgICAgY29uc3QgaGFsZkhlaWdodCA9IGhlaWdodCAvIDI7XG4gICAgICAgIGNvbnN0IGhhbGZXaWR0aCA9IHdpZHRoIC8gMjtcbiAgICAgICAgbGV0IGRvdHM6IERvdHM7XG5cbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgICAgICAgZG90cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgeyB4OiAwIC0gaGFsZldpZHRoLCB5OiBoYWxmSGVpZ2h0IH0sXG4gICAgICAgICAgICAgICAgICAgIHsgeDogMCwgeTogMCAtIGhhbGZIZWlnaHQgfSxcbiAgICAgICAgICAgICAgICAgICAgeyB4OiBoYWxmV2lkdGgsIHk6IGhhbGZIZWlnaHQgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgICAgIGRvdHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHsgeDogMCAtIGhhbGZIZWlnaHQsIHk6IDAgLSBoYWxmV2lkdGggfSxcbiAgICAgICAgICAgICAgICAgICAgeyB4OiAwIC0gaGFsZkhlaWdodCwgeTogaGFsZldpZHRoIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgeDogaGFsZkhlaWdodCwgeTogMCB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxuICAgICAgICAgICAgICAgIGRvdHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHsgeDogMCAtIGhhbGZXaWR0aCwgeTogMCAtIGhhbGZIZWlnaHQgfSxcbiAgICAgICAgICAgICAgICAgICAgeyB4OiBoYWxmV2lkdGgsIHk6IDAgLSBoYWxmSGVpZ2h0IH0sXG4gICAgICAgICAgICAgICAgICAgIHsgeDogMCwgeTogaGFsZkhlaWdodCB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICAgICAgICBkb3RzID0gW1xuICAgICAgICAgICAgICAgICAgICB7IHg6IGhhbGZIZWlnaHQsIHk6IDAgLSBoYWxmV2lkdGggfSxcbiAgICAgICAgICAgICAgICAgICAgeyB4OiBoYWxmSGVpZ2h0LCB5OiBoYWxmV2lkdGggfSxcbiAgICAgICAgICAgICAgICAgICAgeyB4OiAwIC0gaGFsZkhlaWdodCwgeTogMCB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlbmRlclNoYXBlKGNvbG9yLCBkb3RzLCB4LCB5KTtcbiAgICB9XG5cbiAgICByZW5kZXJDaXJjbGUoY29sb3I6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5hcmMoeCwgeSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnNldEN0eENvbG9yKGNvbG9yKTtcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IG1lcmdlT2JqZWN0cyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IFJlbmRlclNldHRpbmdzLCBCYXNpY1JlbmRlckVuZ2luZSB9IGZyb20gJy4vYmFzaWMtcmVuZGVyLWVuZ2luZSc7XG5pbXBvcnQgeyBSZW5kZXJFbmdpbmUgfSBmcm9tICcuL3JlbmRlci1lbmdpbmUnO1xuaW1wb3J0IHsgTW91c2UsIFRvb2x0aXBGaWVsZCB9IGZyb20gJy4uL3R5cGVzJztcblxuaW50ZXJmYWNlIE9mZnNjcmVlblJlbmRlckVuZ2luZU9wdGlvbnMge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgcGFyZW50OiBSZW5kZXJFbmdpbmU7XG4gICAgaWQ6IG51bWJlciB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNsYXNzIE9mZnNjcmVlblJlbmRlckVuZ2luZSBleHRlbmRzIEJhc2ljUmVuZGVyRW5naW5lIHtcbiAgICBwYXJlbnQ6IFJlbmRlckVuZ2luZTtcbiAgICBpZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIGNoaWxkcmVuOiBPZmZzY3JlZW5SZW5kZXJFbmdpbmVbXTtcbiAgICBmbGV4aWJsZSA9IGZhbHNlO1xuICAgIGNvbGxhcHNlZCA9IGZhbHNlO1xuICAgIHBvc2l0aW9uID0gMDtcblxuICAgIGNvbnN0cnVjdG9yKHsgd2lkdGgsIGhlaWdodCwgcGFyZW50LCBpZCB9OiBPZmZzY3JlZW5SZW5kZXJFbmdpbmVPcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHN1cGVyKGNhbnZhcywgeyBvcHRpb25zOiBwYXJlbnQub3B0aW9ucywgc3R5bGVzOiBwYXJlbnQuc3R5bGVzIH0pO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgICAgICB0aGlzLmFwcGx5Q2FudmFzU2l6ZSgpO1xuICAgIH1cblxuICAgIG1ha2VDaGlsZCgpIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBuZXcgT2Zmc2NyZWVuUmVuZGVyRW5naW5lKHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgIHBhcmVudDogdGhpcy5wYXJlbnQsXG4gICAgICAgICAgICBpZDogdm9pZCAwLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuXG4gICAgICAgIGNoaWxkLnNldE1pbk1heCh0aGlzLm1pbiwgdGhpcy5tYXgpO1xuICAgICAgICBjaGlsZC5yZXNldFZpZXcoKTtcblxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuXG4gICAgc2V0RmxleGlibGUoKSB7XG4gICAgICAgIHRoaXMuZmxleGlibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbGxhcHNlKCkge1xuICAgICAgICB0aGlzLmNvbGxhcHNlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBleHBhbmQoKSB7XG4gICAgICAgIHRoaXMuY29sbGFwc2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc2V0U2V0dGluZ3NPdmVycmlkZXMoc2V0dGluZ3M6IFJlbmRlclNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuc2V0U2V0dGluZ3Moe1xuICAgICAgICAgICAgc3R5bGVzOiBtZXJnZU9iamVjdHModGhpcy5zdHlsZXMsIHNldHRpbmdzLnN0eWxlcyksXG4gICAgICAgICAgICBvcHRpb25zOiBtZXJnZU9iamVjdHModGhpcy5vcHRpb25zLCBzZXR0aW5ncy5vcHRpb25zKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLnNldFNldHRpbmdzT3ZlcnJpZGVzKHNldHRpbmdzKSk7XG4gICAgfVxuXG4gICAgLy8gQHRzLWlnbm9yZSAtIG92ZXJyaWRlcyBhIHBhcmVudCBmdW5jdGlvbiB3aGljaCBoYXMgZGlmZmVyZW50IHNpZ25hdHVyZVxuICAgIG92ZXJyaWRlIHJlc2l6ZShcbiAgICAgICAgeyB3aWR0aCwgaGVpZ2h0LCBwb3NpdGlvbiB9OiB7IHdpZHRoPzogbnVtYmVyOyBoZWlnaHQ/OiBudW1iZXI7IHBvc2l0aW9uPzogbnVtYmVyIH0sXG4gICAgICAgIGlzUGFyZW50Q2FsbD86IGJvb2xlYW5cbiAgICApIHtcbiAgICAgICAgY29uc3QgaXNIZWlnaHRDaGFuZ2VkID0gc3VwZXIucmVzaXplKHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIGlmICghaXNQYXJlbnRDYWxsICYmIGlzSGVpZ2h0Q2hhbmdlZCkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVjYWxjQ2hpbGRyZW5TaXplcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwb3NpdGlvbiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLnJlc2l6ZSh7IHdpZHRoLCBoZWlnaHQsIHBvc2l0aW9uIH0pKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBzZXRNaW5NYXgobWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyLnNldE1pbk1heChtaW4sIG1heCk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLnNldE1pbk1heChtaW4sIG1heCkpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHNldFNldHRpbmdzKHNldHRpbmdzOiBSZW5kZXJTZXR0aW5ncykge1xuICAgICAgICBzdXBlci5zZXRTZXR0aW5ncyhzZXR0aW5ncyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IGNoaWxkLnNldFNldHRpbmdzKHNldHRpbmdzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvdmVycmlkZSB0cnlUb0NoYW5nZVBvc2l0aW9uKHBvc2l0aW9uRGVsdGE6IG51bWJlcikge1xuICAgICAgICB0aGlzLnBhcmVudC50cnlUb0NoYW5nZVBvc2l0aW9uKHBvc2l0aW9uRGVsdGEpO1xuICAgIH1cblxuICAgIHJlY2FsY01pbk1heCgpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuY2FsY01pbk1heCgpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIGdldFRpbWVVbml0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldFRpbWVVbml0cygpO1xuICAgIH1cblxuICAgIGdldEFjY3VyYWN5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQudGltZUdyaWQuYWNjdXJhY3k7XG4gICAgfVxuXG4gICAgcmVuZGVyVGltZUdyaWQoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LnRpbWVHcmlkLnJlbmRlckxpbmVzKDAsIHRoaXMuaGVpZ2h0LCB0aGlzKTtcbiAgICB9XG5cbiAgICByZW5kZXJUaW1lR3JpZFRpbWVzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC50aW1lR3JpZC5yZW5kZXJUaW1lcyh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGFuZGFyZFJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5yZXNvbHZlUmVjdFJlbmRlclF1ZXVlKCk7XG4gICAgICAgIHRoaXMucmVzb2x2ZVRleHRSZW5kZXJRdWV1ZSgpO1xuICAgICAgICB0aGlzLnJlc29sdmVTdHJva2VSZW5kZXJRdWV1ZSgpO1xuICAgICAgICB0aGlzLnJlbmRlclRpbWVHcmlkKCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgcmVuZGVyVG9vbHRpcEZyb21EYXRhKGZpZWxkczogVG9vbHRpcEZpZWxkW10sIG1vdXNlOiBNb3VzZSkge1xuICAgICAgICB0aGlzLnBhcmVudC5yZW5kZXJUb29sdGlwRnJvbURhdGEoZmllbGRzLCBtb3VzZSk7XG4gICAgfVxuXG4gICAgcmVzZXRQYXJlbnRWaWV3KCkge1xuICAgICAgICB0aGlzLnBhcmVudC5yZXNldFZpZXcoKTtcbiAgICAgICAgdGhpcy5wYXJlbnQucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJ0aWFsUmVuZGVyKHRoaXMuaWQpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFRpbWVHcmlkIH0gZnJvbSAnLi90aW1lLWdyaWQnO1xuaW1wb3J0IHsgQmFzaWNSZW5kZXJFbmdpbmUsIFJlbmRlclNldHRpbmdzIH0gZnJvbSAnLi9iYXNpYy1yZW5kZXItZW5naW5lJztcbmltcG9ydCB7IE9mZnNjcmVlblJlbmRlckVuZ2luZSB9IGZyb20gJy4vb2Zmc2NyZWVuLXJlbmRlci1lbmdpbmUnO1xuaW1wb3J0IHsgaXNOdW1iZXIgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgVUlQbHVnaW4gZnJvbSAnLi4vcGx1Z2lucy91aS1wbHVnaW4nO1xuXG5jb25zdCBNQVhfQUNDVVJBQ1kgPSA2O1xuXG5leHBvcnQgdHlwZSBSZW5kZXJFbmdpbmVBcmdzID0ge1xuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgc2V0dGluZ3M6IFJlbmRlclNldHRpbmdzO1xuICAgIHRpbWVHcmlkOiBUaW1lR3JpZDtcbiAgICBwbHVnaW5zOiBVSVBsdWdpbltdO1xufTtcblxuaW50ZXJmYWNlIENoaWxkcmVuU2l6ZXMge1xuICAgIHBvc2l0aW9uOiBudW1iZXI7XG4gICAgcmVzdWx0OiB7IHdpZHRoOiBudW1iZXI7IHBvc2l0aW9uOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH1bXTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlbmRlckVuZ2luZSBleHRlbmRzIEJhc2ljUmVuZGVyRW5naW5lIHtcbiAgICBwbHVnaW5zOiBVSVBsdWdpbltdO1xuICAgIGNoaWxkcmVuOiBPZmZzY3JlZW5SZW5kZXJFbmdpbmVbXTtcbiAgICByZXF1ZXN0ZWRSZW5kZXJzOiBudW1iZXJbXTtcbiAgICB0aW1lR3JpZDogVGltZUdyaWQ7XG4gICAgZnJlZVNwYWNlID0gMDtcbiAgICBsYXN0UGFydGlhbEFuaW1hdGlvbkZyYW1lOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICBsYXN0R2xvYmFsQW5pbWF0aW9uRnJhbWU6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoeyBjYW52YXMsIHNldHRpbmdzLCB0aW1lR3JpZCwgcGx1Z2lucyB9OiBSZW5kZXJFbmdpbmVBcmdzKSB7XG4gICAgICAgIHN1cGVyKGNhbnZhcywgc2V0dGluZ3MpO1xuXG4gICAgICAgIHRoaXMucGx1Z2lucyA9IHBsdWdpbnM7XG5cbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgICAgICB0aGlzLnJlcXVlc3RlZFJlbmRlcnMgPSBbXTtcblxuICAgICAgICB0aGlzLnRpbWVHcmlkID0gdGltZUdyaWQ7XG4gICAgICAgIHRoaXMudGltZUdyaWQuc2V0RGVmYXVsdFJlbmRlckVuZ2luZSh0aGlzKTtcbiAgICB9XG5cbiAgICBtYWtlSW5zdGFuY2UoKSB7XG4gICAgICAgIGNvbnN0IG9mZnNjcmVlblJlbmRlckVuZ2luZSA9IG5ldyBPZmZzY3JlZW5SZW5kZXJFbmdpbmUoe1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgICAgICBpZDogdGhpcy5jaGlsZHJlbi5sZW5ndGgsXG4gICAgICAgICAgICBwYXJlbnQ6IHRoaXMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9mZnNjcmVlblJlbmRlckVuZ2luZS5zZXRNaW5NYXgodGhpcy5taW4sIHRoaXMubWF4KTtcbiAgICAgICAgb2Zmc2NyZWVuUmVuZGVyRW5naW5lLnJlc2V0VmlldygpO1xuXG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChvZmZzY3JlZW5SZW5kZXJFbmdpbmUpO1xuXG4gICAgICAgIHJldHVybiBvZmZzY3JlZW5SZW5kZXJFbmdpbmU7XG4gICAgfVxuXG4gICAgY2FsY01pbk1heCgpIHtcbiAgICAgICAgY29uc3QgbWluID0gdGhpcy5wbHVnaW5zXG4gICAgICAgICAgICAubWFwKCh7IG1pbiB9KSA9PiBtaW4pXG4gICAgICAgICAgICAuZmlsdGVyKGlzTnVtYmVyKVxuICAgICAgICAgICAgLnJlZHVjZSgoYWNjLCBtaW4pID0+IE1hdGgubWluKGFjYywgbWluKSk7XG5cbiAgICAgICAgY29uc3QgbWF4ID0gdGhpcy5wbHVnaW5zXG4gICAgICAgICAgICAubWFwKCh7IG1heCB9KSA9PiBtYXgpXG4gICAgICAgICAgICAuZmlsdGVyKGlzTnVtYmVyKVxuICAgICAgICAgICAgLnJlZHVjZSgoYWNjLCBtYXgpID0+IE1hdGgubWF4KGFjYywgbWF4KSk7XG5cbiAgICAgICAgdGhpcy5zZXRNaW5NYXgobWluLCBtYXgpO1xuICAgIH1cblxuICAgIGNhbGNUaW1lR3JpZCgpIHtcbiAgICAgICAgdGhpcy50aW1lR3JpZC5yZWNhbGMoKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBzZXRNaW5NYXgobWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgICAgIHN1cGVyLnNldE1pbk1heChtaW4sIG1heCk7XG5cbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChlbmdpbmUpID0+IGVuZ2luZS5zZXRNaW5NYXgobWluLCBtYXgpKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBzZXRTZXR0aW5ncyhkYXRhOiBSZW5kZXJTZXR0aW5ncykge1xuICAgICAgICBzdXBlci5zZXRTZXR0aW5ncyhkYXRhKTtcblxuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChlbmdpbmUpID0+IGVuZ2luZS5zZXRTZXR0aW5ncyhkYXRhKSk7XG4gICAgICAgICAgICB0aGlzLnJlY2FsY0NoaWxkcmVuU2l6ZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG92ZXJyaWRlIHJlc2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBjdXJyZW50V2lkdGggPSB0aGlzLndpZHRoO1xuXG4gICAgICAgIHN1cGVyLnJlc2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5yZWNhbGNDaGlsZHJlblNpemVzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ2V0SW5pdGlhbFpvb20oKSA+IHRoaXMuem9vbSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldFZpZXcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBvc2l0aW9uWCA+IHRoaXMubWluKSB7XG4gICAgICAgICAgICB0aGlzLnRyeVRvQ2hhbmdlUG9zaXRpb24oLXRoaXMucGl4ZWxUb1RpbWUoKHdpZHRoIC0gY3VycmVudFdpZHRoKSAvIDIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJlY2FsY0NoaWxkcmVuU2l6ZXMoKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuU2l6ZXMgPSB0aGlzLmdldENoaWxkcmVuU2l6ZXMoKTtcblxuICAgICAgICB0aGlzLmZyZWVTcGFjZSA9IGNoaWxkcmVuU2l6ZXMucmVkdWNlKChhY2MsIHsgaGVpZ2h0IH0pID0+IGFjYyAtIGhlaWdodCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGVuZ2luZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGVuZ2luZS5yZXNpemUoY2hpbGRyZW5TaXplc1tpbmRleF0sIHRydWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRDaGlsZHJlblNpemVzKCkge1xuICAgICAgICBjb25zdCBpbmRleGVzID0gdGhpcy5jaGlsZHJlbi5tYXAoKF8sIGluZGV4KSA9PiBpbmRleCk7XG5cbiAgICAgICAgY29uc3QgZW5naW5lc1R5cGVzID0gaW5kZXhlcy5tYXAoKGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwbHVnaW4gPSB0aGlzLnBsdWdpbnNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgZW5naW5lID0gdGhpcy5jaGlsZHJlbltpbmRleF07XG5cbiAgICAgICAgICAgIGlmIChlbmdpbmUuZmxleGlibGUgJiYgcGx1Z2luLmhlaWdodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxleGlibGVTdGF0aWMnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghcGx1Z2luLmhlaWdodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnZmxleGlibGVHcm93aW5nJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnc3RhdGljJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZnJlZVNwYWNlID0gZW5naW5lc1R5cGVzLnJlZHVjZSgoYWNjLCB0eXBlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGx1Z2luID0gdGhpcy5wbHVnaW5zW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuY2hpbGRyZW5baW5kZXhdO1xuXG4gICAgICAgICAgICBpZiAoZW5naW5lLmNvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmbGV4aWJsZUdyb3dpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYyAtIChlbmdpbmUuaGVpZ2h0IHx8IDApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZmxleGlibGVTdGF0aWMnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYyAtIChlbmdpbmU/LmhlaWdodCB8fCBwbHVnaW4/LmhlaWdodCB8fCAwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjIC0gKHRoaXMucGx1Z2luc1tpbmRleF0/LmhlaWdodCA/PyAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICBjb25zdCBmbGV4aWJsZUdyb3dpbmdDb3VudCA9IGVuZ2luZXNUeXBlcy5maWx0ZXIoKHR5cGUpID0+IHR5cGUgPT09ICdmbGV4aWJsZUdyb3dpbmcnKS5sZW5ndGg7XG5cbiAgICAgICAgY29uc3QgZnJlZVNwYWNlUGFydCA9IE1hdGguZmxvb3IoZnJlZVNwYWNlIC8gZmxleGlibGVHcm93aW5nQ291bnQpO1xuXG4gICAgICAgIHJldHVybiBlbmdpbmVzVHlwZXMucmVkdWNlPENoaWxkcmVuU2l6ZXM+KFxuICAgICAgICAgICAgKGFjYywgdHlwZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmdpbmUgPSB0aGlzLmNoaWxkcmVuW2luZGV4XTtcbiAgICAgICAgICAgICAgICBjb25zdCBwbHVnaW4gPSB0aGlzLnBsdWdpbnNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIGxldCBoZWlnaHQgPSAwO1xuXG4gICAgICAgICAgICAgICAgaWYgKGVuZ2luZS5jb2xsYXBzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3N0YXRpYyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gcGx1Z2luLmhlaWdodCA/PyAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZmxleGlibGVHcm93aW5nJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSAoZW5naW5lLmhlaWdodCB8fCAwKSArIGZyZWVTcGFjZVBhcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdmbGV4aWJsZVN0YXRpYyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gKGVuZ2luZS5oZWlnaHQgfHwgdGhpcy5wbHVnaW5zW2luZGV4XS5oZWlnaHQpID8/IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhY2MucmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGFjYy5wb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgYWNjLnBvc2l0aW9uICs9IGhlaWdodDtcblxuICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAwLFxuICAgICAgICAgICAgICAgIHJlc3VsdDogW10sXG4gICAgICAgICAgICB9XG4gICAgICAgICkucmVzdWx0O1xuICAgIH1cblxuICAgIGdldEFjY3VyYWN5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aW1lR3JpZC5hY2N1cmFjeTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSBzZXRab29tKHpvb206IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5nZXRBY2N1cmFjeSgpIDwgTUFYX0FDQ1VSQUNZIHx8IHpvb20gPD0gdGhpcy56b29tKSB7XG4gICAgICAgICAgICBzdXBlci5zZXRab29tKHpvb20pO1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChlbmdpbmUpID0+IGVuZ2luZS5zZXRab29tKHpvb20pKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgc2V0UG9zaXRpb25YKHg6IG51bWJlcikge1xuICAgICAgICBjb25zdCByZXMgPSBzdXBlci5zZXRQb3NpdGlvblgoeCk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoZW5naW5lKSA9PiBlbmdpbmUuc2V0UG9zaXRpb25YKHgpKTtcblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIHJlbmRlclBsdWdpbihpbmRleDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHBsdWdpbiA9IHRoaXMucGx1Z2luc1tpbmRleF07XG4gICAgICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuY2hpbGRyZW5baW5kZXhdO1xuXG4gICAgICAgIGVuZ2luZT8uY2xlYXIoKTtcblxuICAgICAgICBpZiAoIWVuZ2luZS5jb2xsYXBzZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzRnVsbFJlbmRlcmVkID0gcGx1Z2luPy5yZW5kZXI/LigpO1xuXG4gICAgICAgICAgICBpZiAoIWlzRnVsbFJlbmRlcmVkKSB7XG4gICAgICAgICAgICAgICAgZW5naW5lLnN0YW5kYXJkUmVuZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJ0aWFsUmVuZGVyKGlkPzogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaWQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RlZFJlbmRlcnMucHVzaChpZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMubGFzdFBhcnRpYWxBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgdGhpcy5sYXN0UGFydGlhbEFuaW1hdGlvbkZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlcXVlc3RlZFJlbmRlcnMuZm9yRWFjaCgoaW5kZXgpID0+IHRoaXMucmVuZGVyUGx1Z2luKGluZGV4KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNoYWxsb3dSZW5kZXIoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVxdWVzdGVkUmVuZGVycyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0UGFydGlhbEFuaW1hdGlvbkZyYW1lID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hhbGxvd1JlbmRlcigpIHtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuXG4gICAgICAgIHRoaXMudGltZUdyaWQucmVuZGVyTGluZXModGhpcy5oZWlnaHQgLSB0aGlzLmZyZWVTcGFjZSwgdGhpcy5mcmVlU3BhY2UpO1xuXG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoZW5naW5lKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWVuZ2luZS5jb2xsYXBzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvcHkoZW5naW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGxldCB0b29sdGlwUmVuZGVyZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wbHVnaW5zLmZvckVhY2goKHBsdWdpbikgPT4ge1xuICAgICAgICAgICAgaWYgKHBsdWdpbi5wb3N0UmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luLnBvc3RSZW5kZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBsdWdpbi5yZW5kZXJUb29sdGlwKSB7XG4gICAgICAgICAgICAgICAgdG9vbHRpcFJlbmRlcmVkID0gdG9vbHRpcFJlbmRlcmVkIHx8IEJvb2xlYW4ocGx1Z2luLnJlbmRlclRvb2x0aXAoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghdG9vbHRpcFJlbmRlcmVkICYmIHR5cGVvZiB0aGlzLm9wdGlvbnMudG9vbHRpcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gbm90aWZ5IHRvb2x0aXAgb2Ygbm90aGluZyB0byByZW5kZXJcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50b29sdGlwKG51bGwsIHRoaXMsIG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMubGFzdFBhcnRpYWxBbmltYXRpb25GcmFtZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMubGFzdFBhcnRpYWxBbmltYXRpb25GcmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlcXVlc3RlZFJlbmRlcnMgPSBbXTtcbiAgICAgICAgdGhpcy5sYXN0UGFydGlhbEFuaW1hdGlvbkZyYW1lID0gbnVsbDtcblxuICAgICAgICBpZiAoIXRoaXMubGFzdEdsb2JhbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RHbG9iYWxBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lR3JpZC5yZWNhbGMoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoXywgaW5kZXgpID0+IHRoaXMucmVuZGVyUGx1Z2luKGluZGV4KSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNoYWxsb3dSZW5kZXIoKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEdsb2JhbEFuaW1hdGlvbkZyYW1lID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiZXhwb3J0IGNvbnN0IEVWRU5UX05BTUVTID0gWydkb3duJywgJ3VwJywgJ21vdmUnLCAnY2xpY2snLCAnc2VsZWN0J10gYXMgY29uc3Q7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWFyayB7XG4gICAgc2hvcnROYW1lOiBzdHJpbmc7XG4gICAgZnVsbE5hbWU6IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IG51bWJlcjtcbiAgICBjb2xvcjogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBNYXJrcyA9IEFycmF5PE1hcms+O1xuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGUge1xuICAgIG5hbWU6IHN0cmluZzsgLy8gbm9kZSBuYW1lXG4gICAgc3RhcnQ6IG51bWJlcjsgLy8gbm9kZSBzdGFydCB0aW1lXG4gICAgZHVyYXRpb246IG51bWJlcjsgLy8gbm9kZSBkdXJhdGlvblxuICAgIHR5cGU/OiBzdHJpbmc7IC8vIG5vZGUgdHlwZSAodXNlIGl0IGZvciBjdXN0b20gY29sb3JpemF0aW9uKVxuICAgIGNvbG9yPzogc3RyaW5nOyAvLyBub2RlIGNvbG9yICh1c2UgaXQgZm9yIGN1cnJlbnQgbm9kZSBjb2xvcml6YXRpb24pXG4gICAgY2hpbGRyZW4/OiBOb2RlW107IC8vIG5vZGUgY2hpbGRyZW4gKHNhbWUgc3RydWN0dXJlIGFzIGZvciBub2RlKVxufVxuXG5leHBvcnQgdHlwZSBEYXRhID0gQXJyYXk8Tm9kZT47XG5cbmV4cG9ydCB0eXBlIFdhdGVyZmFsbEl0ZW1zID0gQXJyYXk8e1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBpbnRlcnZhbHM6IFdhdGVyZmFsbEludGVydmFsW10gfCBzdHJpbmc7XG4gICAgdGltaW5nOiB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IG51bWJlcjtcbiAgICB9O1xufT47XG5cbmV4cG9ydCB0eXBlIFdhdGVyZmFsbEludGVydmFsID0ge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBjb2xvcjogc3RyaW5nO1xuICAgIHR5cGU6ICdibG9jaycgfCAnbGluZSc7XG4gICAgc3RhcnQ6IHN0cmluZyB8IG51bWJlcjsgLy8gdGltaW5nIG5hbWUgb3IgdGltZXN0YW1wXG4gICAgZW5kOiBzdHJpbmcgfCBudW1iZXI7IC8vIHRpbWluZyBuYW1lIG9yIHRpbWVzdGFtcFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBXYXRlcmZhbGxJbnRlcnZhbHMge1xuICAgIFtpbnRlcnZhbE5hbWU6IHN0cmluZ106IFdhdGVyZmFsbEludGVydmFsW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV2F0ZXJmYWxsIHtcbiAgICBpdGVtczogV2F0ZXJmYWxsSXRlbXM7XG4gICAgaW50ZXJ2YWxzOiBXYXRlcmZhbGxJbnRlcnZhbHM7XG59XG5cbmV4cG9ydCB0eXBlIENvbG9ycyA9IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5leHBvcnQgaW50ZXJmYWNlIE1vdXNlIHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgRG90IHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xufVxuZXhwb3J0IHR5cGUgRG90cyA9IFtEb3QsIERvdCwgRG90XTtcblxuaW50ZXJmYWNlIFJlY3Qge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgdzogbnVtYmVyO1xufVxuZXhwb3J0IGludGVyZmFjZSBSZWN0UmVuZGVyUXVldWUge1xuICAgIFtjb2xvcjogc3RyaW5nXTogUmVjdFtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRleHQge1xuICAgIHRleHQ6IHN0cmluZztcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIHc6IG51bWJlcjtcbiAgICB0ZXh0TWF4V2lkdGg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdHJva2Uge1xuICAgIGNvbG9yOiBzdHJpbmc7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB3OiBudW1iZXI7XG4gICAgaDogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBGbGF0VHJlZU5vZGUgPSB7XG4gICAgc291cmNlOiBOb2RlO1xuICAgIGVuZDogbnVtYmVyO1xuICAgIHBhcmVudDogRmxhdFRyZWVOb2RlIHwgbnVsbDtcbiAgICBsZXZlbDogbnVtYmVyO1xuICAgIGluZGV4OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBGbGF0VHJlZSA9IEZsYXRUcmVlTm9kZVtdO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFDbHVzdGVyaXplZEZsYXRUcmVlTm9kZSB7XG4gICAgbm9kZXM6IEZsYXRUcmVlTm9kZVtdO1xufVxuXG5leHBvcnQgdHlwZSBNZXRhQ2x1c3Rlcml6ZWRGbGF0VHJlZSA9IE1ldGFDbHVzdGVyaXplZEZsYXRUcmVlTm9kZVtdO1xuXG5leHBvcnQgaW50ZXJmYWNlIENsdXN0ZXJpemVkRmxhdFRyZWVOb2RlIHtcbiAgICBzdGFydDogbnVtYmVyO1xuICAgIGVuZDogbnVtYmVyO1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gICAgdHlwZT86IHN0cmluZztcbiAgICBjb2xvcj86IHN0cmluZztcbiAgICBsZXZlbDogbnVtYmVyO1xuICAgIG5vZGVzOiBGbGF0VHJlZU5vZGVbXTtcbn1cblxuZXhwb3J0IHR5cGUgQ2x1c3Rlcml6ZWRGbGF0VHJlZSA9IENsdXN0ZXJpemVkRmxhdFRyZWVOb2RlW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG9vbHRpcEZpZWxkIHtcbiAgICBjb2xvcj86IHN0cmluZztcbiAgICB0ZXh0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFJlZ2lvblR5cGVzIHtcbiAgICBXQVRFUkZBTExfTk9ERSA9ICd3YXRlcmZhbGwtbm9kZScsXG4gICAgQ0xVU1RFUiA9ICdjbHVzdGVyJyxcbiAgICBUSU1FRlJBTUVfQVJFQSA9ICd0aW1lZnJhbWVBcmVhJyxcbiAgICBUSU1FRlJBTUVfS05PQiA9ICd0aW1lZnJhbWVLbm9iJyxcbiAgICBLTk9CX1JFU0laRSA9ICdrbm9iLXJlc2l6ZScsXG4gICAgVE9HR0xFID0gJ3RvZ2dsZScsXG4gICAgVElNRVNUQU1QID0gJ3RpbWVzdGFtcCcsXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIEN1cnNvclR5cGVzIHtcbiAgICBURVhUID0gJ3RleHQnLFxuICAgIFJPV19SRVNJWkUgPSAncm93LXJlc2l6ZScsXG4gICAgUE9JTlRFUiA9ICdwb2ludGVyJyxcbiAgICBFV19SRVNJWkUgPSAnZXctcmVzaXplJyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIaXRSZWdpb248UyA9IGFueT4ge1xuICAgIHR5cGU6IFJlZ2lvblR5cGVzO1xuICAgIGRhdGE6IFM7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB3OiBudW1iZXI7XG4gICAgaDogbnVtYmVyO1xuICAgIGN1cnNvcj86IEN1cnNvclR5cGVzO1xuICAgIGlkPzogbnVtYmVyO1xufVxuIiwiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IE9mZnNjcmVlblJlbmRlckVuZ2luZSB9IGZyb20gJy4vb2Zmc2NyZWVuLXJlbmRlci1lbmdpbmUnO1xuaW1wb3J0IHsgQ3Vyc29yVHlwZXMsIEVWRU5UX05BTUVTLCBIaXRSZWdpb24sIE1vdXNlLCBSZWdpb25UeXBlcyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IEludGVyYWN0aW9uc0VuZ2luZSB9IGZyb20gJy4vaW50ZXJhY3Rpb25zLWVuZ2luZSc7XG5cbmV4cG9ydCBjbGFzcyBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIHN0YXRpYyBjb3VudCA9IDA7XG4gICAgcGFyZW50OiBJbnRlcmFjdGlvbnNFbmdpbmU7XG4gICAgcmVuZGVyRW5naW5lOiBPZmZzY3JlZW5SZW5kZXJFbmdpbmU7XG4gICAgcHJpdmF0ZSByZWFkb25seSBpZDogbnVtYmVyO1xuICAgIGhpdFJlZ2lvbnM6IEhpdFJlZ2lvbltdO1xuXG4gICAgc3RhdGljIGdldElkKCkge1xuICAgICAgICByZXR1cm4gU2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lLmNvdW50Kys7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocGFyZW50OiBJbnRlcmFjdGlvbnNFbmdpbmUsIHJlbmRlckVuZ2luZTogT2Zmc2NyZWVuUmVuZGVyRW5naW5lKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5pZCA9IFNlcGFyYXRlZEludGVyYWN0aW9uc0VuZ2luZS5nZXRJZCgpO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUgPSByZW5kZXJFbmdpbmU7XG5cbiAgICAgICAgcmVuZGVyRW5naW5lLm9uKCdjbGVhcicsICgpID0+IHRoaXMuY2xlYXJIaXRSZWdpb25zKCkpO1xuXG4gICAgICAgIEVWRU5UX05BTUVTLmZvckVhY2goKGV2ZW50TmFtZSkgPT5cbiAgICAgICAgICAgIHBhcmVudC5vbihldmVudE5hbWUsIChyZWdpb24sIG1vdXNlLCBpc0NsaWNrKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdpb24gfHwgcmVnaW9uLmlkID09PSB0aGlzLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZW5kKGV2ZW50TmFtZSwgcmVnaW9uLCBtb3VzZSwgaXNDbGljayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBbJ2hvdmVyJ10uZm9yRWFjaCgoZXZlbnROYW1lKSA9PlxuICAgICAgICAgICAgcGFyZW50Lm9uKGV2ZW50TmFtZSwgKHJlZ2lvbiwgbW91c2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlZ2lvbiB8fCByZWdpb24uaWQgPT09IHRoaXMuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KGV2ZW50TmFtZSwgcmVnaW9uLCBtb3VzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcblxuICAgICAgICBwYXJlbnQub24oJ2NoYW5nZS1wb3NpdGlvbicsIChkYXRhLCBzdGFydE1vdXNlLCBlbmRNb3VzZSwgaW5zdGFuY2UpID0+IHtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZSA9PT0gdGhpcykge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnY2hhbmdlLXBvc2l0aW9uJywgZGF0YSwgc3RhcnRNb3VzZSwgZW5kTW91c2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmhpdFJlZ2lvbnMgPSBbXTtcbiAgICB9XG5cbiAgICByZXNlbmQoZXZlbnQ6IHN0cmluZywgLi4uYXJnczogW0hpdFJlZ2lvbiwgTW91c2UsIGJvb2xlYW5dKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uIDw9IHRoaXMucGFyZW50Lm1vdXNlLnkgJiZcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmhlaWdodCArIHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uID49IHRoaXMucGFyZW50Lm1vdXNlLnlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoZXZlbnQsIC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0TW91c2UoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSB9ID0gdGhpcy5wYXJlbnQubW91c2U7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHgsXG4gICAgICAgICAgICB5OiB5IC0gdGhpcy5yZW5kZXJFbmdpbmUucG9zaXRpb24sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0R2xvYmFsTW91c2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmVudC5tb3VzZTtcbiAgICB9XG5cbiAgICBjbGVhckhpdFJlZ2lvbnMoKSB7XG4gICAgICAgIHRoaXMuaGl0UmVnaW9ucyA9IFtdO1xuICAgIH1cblxuICAgIGFkZEhpdFJlZ2lvbjxUPih0eXBlOiBSZWdpb25UeXBlcywgZGF0YTogVCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyLCBjdXJzb3I/OiBDdXJzb3JUeXBlcykge1xuICAgICAgICB0aGlzLmhpdFJlZ2lvbnMucHVzaCh7XG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHgsXG4gICAgICAgICAgICB5LFxuICAgICAgICAgICAgdyxcbiAgICAgICAgICAgIGgsXG4gICAgICAgICAgICBjdXJzb3IsXG4gICAgICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0Q3Vyc29yKGN1cnNvcjogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucGFyZW50LnNldEN1cnNvcihjdXJzb3IpO1xuICAgIH1cblxuICAgIGNsZWFyQ3Vyc29yKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5jbGVhckN1cnNvcigpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBSZW5kZXJFbmdpbmUgfSBmcm9tICcuL3JlbmRlci1lbmdpbmUnO1xuaW1wb3J0IHsgT2Zmc2NyZWVuUmVuZGVyRW5naW5lIH0gZnJvbSAnLi9vZmZzY3JlZW4tcmVuZGVyLWVuZ2luZSc7XG5pbXBvcnQgeyBDdXJzb3JUeXBlcywgSGl0UmVnaW9uLCBNb3VzZSwgUmVnaW9uVHlwZXMgfSBmcm9tICcuLi90eXBlcyc7XG5pbXBvcnQgeyBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUgfSBmcm9tICcuL3NlcGFyYXRlZC1pbnRlcmFjdGlvbnMtZW5naW5lJztcblxuZXhwb3J0IGNsYXNzIEludGVyYWN0aW9uc0VuZ2luZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgcHJpdmF0ZSByZW5kZXJFbmdpbmU6IFJlbmRlckVuZ2luZTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcHJpdmF0ZSBoaXRSZWdpb25zOiBIaXRSZWdpb25bXTtcbiAgICBwcml2YXRlIGluc3RhbmNlczogU2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lW107XG4gICAgbW91c2U6IE1vdXNlO1xuICAgIHNlbGVjdGVkUmVnaW9uOiBIaXRSZWdpb24gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIGhvdmVyZWRSZWdpb246IEhpdFJlZ2lvbiB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgbW92ZUFjdGl2ZSA9IGZhbHNlO1xuICAgIHByaXZhdGUgbW91c2VEb3duUG9zaXRpb246IE1vdXNlO1xuICAgIHByaXZhdGUgbW91c2VEb3duSG92ZXJlZEluc3RhbmNlOiBTZXBhcmF0ZWRJbnRlcmFjdGlvbnNFbmdpbmUgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBob3ZlcmVkSW5zdGFuY2U6IFNlcGFyYXRlZEludGVyYWN0aW9uc0VuZ2luZSB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIGN1cnJlbnRDdXJzb3I6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgcmVuZGVyRW5naW5lOiBSZW5kZXJFbmdpbmUpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZSA9IHJlbmRlckVuZ2luZTtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG5cbiAgICAgICAgdGhpcy5oaXRSZWdpb25zID0gW107XG4gICAgICAgIHRoaXMuaW5zdGFuY2VzID0gW107XG4gICAgICAgIHRoaXMubW91c2UgPSB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMCxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhhbmRsZU1vdXNlV2hlZWwgPSB0aGlzLmhhbmRsZU1vdXNlV2hlZWwuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kbGVNb3VzZURvd24gPSB0aGlzLmhhbmRsZU1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmhhbmRsZU1vdXNlVXAgPSB0aGlzLmhhbmRsZU1vdXNlVXAuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYW5kbGVNb3VzZU1vdmUgPSB0aGlzLmhhbmRsZU1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuaW5pdExpc3RlbmVycygpO1xuXG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9XG5cbiAgICBtYWtlSW5zdGFuY2UocmVuZGVyRW5naW5lOiBPZmZzY3JlZW5SZW5kZXJFbmdpbmUpIHtcbiAgICAgICAgY29uc3Qgc2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lID0gbmV3IFNlcGFyYXRlZEludGVyYWN0aW9uc0VuZ2luZSh0aGlzLCByZW5kZXJFbmdpbmUpO1xuXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzLnB1c2goc2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lKTtcblxuICAgICAgICByZXR1cm4gc2VwYXJhdGVkSW50ZXJhY3Rpb25zRW5naW5lO1xuICAgIH1cblxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkUmVnaW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5ob3ZlcmVkUmVnaW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5oaXRSZWdpb25zID0gW107XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICBpbml0TGlzdGVuZXJzKCkge1xuICAgICAgICBpZiAodGhpcy5jYW52YXMpIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgdGhpcy5oYW5kbGVNb3VzZVdoZWVsKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuaGFuZGxlTW91c2VEb3duKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmhhbmRsZU1vdXNlVXApO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuaGFuZGxlTW91c2VVcCk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZU1vdXNlTW92ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmVMaXN0ZW5lcnMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNhbnZhcykge1xuICAgICAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCB0aGlzLmhhbmRsZU1vdXNlV2hlZWwpO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5oYW5kbGVNb3VzZURvd24pO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuaGFuZGxlTW91c2VVcCk7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5oYW5kbGVNb3VzZVVwKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuaGFuZGxlTW91c2VNb3ZlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlV2hlZWwoZTogV2hlZWxFdmVudCkge1xuICAgICAgICBjb25zdCB7IGRlbHRhWSwgZGVsdGFYIH0gPSBlO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgcmVhbFZpZXcgPSB0aGlzLnJlbmRlckVuZ2luZS5nZXRSZWFsVmlldygpO1xuICAgICAgICBjb25zdCBpbml0aWFsWm9vbSA9IHRoaXMucmVuZGVyRW5naW5lLmdldEluaXRpYWxab29tKCk7XG4gICAgICAgIGNvbnN0IHN0YXJ0UG9zaXRpb24gPSB0aGlzLnJlbmRlckVuZ2luZS5wb3NpdGlvblg7XG4gICAgICAgIGNvbnN0IHN0YXJ0Wm9vbSA9IHRoaXMucmVuZGVyRW5naW5lLnpvb207XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uU2Nyb2xsRGVsdGEgPSBkZWx0YVggLyB0aGlzLnJlbmRlckVuZ2luZS56b29tO1xuICAgICAgICBsZXQgem9vbURlbHRhID0gKGRlbHRhWSAvIDEwMDApICogdGhpcy5yZW5kZXJFbmdpbmUuem9vbTtcblxuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS50cnlUb0NoYW5nZVBvc2l0aW9uKHBvc2l0aW9uU2Nyb2xsRGVsdGEpO1xuXG4gICAgICAgIHpvb21EZWx0YSA9XG4gICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS56b29tIC0gem9vbURlbHRhID49IGluaXRpYWxab29tID8gem9vbURlbHRhIDogdGhpcy5yZW5kZXJFbmdpbmUuem9vbSAtIGluaXRpYWxab29tO1xuXG4gICAgICAgIGlmICh6b29tRGVsdGEgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHpvb21lZCA9IHRoaXMucmVuZGVyRW5naW5lLnNldFpvb20odGhpcy5yZW5kZXJFbmdpbmUuem9vbSAtIHpvb21EZWx0YSk7XG5cbiAgICAgICAgICAgIGlmICh6b29tZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wb3J0aW9uID0gdGhpcy5tb3VzZS54IC8gdGhpcy5yZW5kZXJFbmdpbmUud2lkdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZURlbHRhID0gcmVhbFZpZXcgLSB0aGlzLnJlbmRlckVuZ2luZS53aWR0aCAvIHRoaXMucmVuZGVyRW5naW5lLnpvb207XG4gICAgICAgICAgICAgICAgY29uc3QgcG9zaXRpb25EZWx0YSA9IHRpbWVEZWx0YSAqIHByb3BvcnRpb247XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS50cnlUb0NoYW5nZVBvc2l0aW9uKHBvc2l0aW9uRGVsdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaGVja1JlZ2lvbkhvdmVyKCk7XG5cbiAgICAgICAgaWYgKHN0YXJ0UG9zaXRpb24gIT09IHRoaXMucmVuZGVyRW5naW5lLnBvc2l0aW9uWCB8fCBzdGFydFpvb20gIT09IHRoaXMucmVuZGVyRW5naW5lLnpvb20pIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VEb3duKCkge1xuICAgICAgICB0aGlzLm1vdmVBY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLm1vdXNlRG93blBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogdGhpcy5tb3VzZS54LFxuICAgICAgICAgICAgeTogdGhpcy5tb3VzZS55LFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm1vdXNlRG93bkhvdmVyZWRJbnN0YW5jZSA9IHRoaXMuaG92ZXJlZEluc3RhbmNlO1xuXG4gICAgICAgIHRoaXMuZW1pdCgnZG93bicsIHRoaXMuaG92ZXJlZFJlZ2lvbiwgdGhpcy5tb3VzZSk7XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VVcCgpIHtcbiAgICAgICAgdGhpcy5tb3ZlQWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgaXNDbGljayA9XG4gICAgICAgICAgICB0aGlzLm1vdXNlRG93blBvc2l0aW9uICYmXG4gICAgICAgICAgICB0aGlzLm1vdXNlRG93blBvc2l0aW9uLnggPT09IHRoaXMubW91c2UueCAmJlxuICAgICAgICAgICAgdGhpcy5tb3VzZURvd25Qb3NpdGlvbi55ID09PSB0aGlzLm1vdXNlLnk7XG5cbiAgICAgICAgaWYgKGlzQ2xpY2spIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUmVnaW9uSGl0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVtaXQoJ3VwJywgdGhpcy5ob3ZlcmVkUmVnaW9uLCB0aGlzLm1vdXNlLCBpc0NsaWNrKTtcblxuICAgICAgICBpZiAoaXNDbGljaykge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdjbGljaycsIHRoaXMuaG92ZXJlZFJlZ2lvbiwgdGhpcy5tb3VzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZU1vdmUoZTogTW91c2VFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5tb3ZlQWN0aXZlKSB7XG4gICAgICAgICAgICBjb25zdCBtb3VzZURlbHRhWSA9IHRoaXMubW91c2UueSAtIGUub2Zmc2V0WTtcbiAgICAgICAgICAgIGNvbnN0IG1vdXNlRGVsdGFYID0gKHRoaXMubW91c2UueCAtIGUub2Zmc2V0WCkgLyB0aGlzLnJlbmRlckVuZ2luZS56b29tO1xuXG4gICAgICAgICAgICBpZiAobW91c2VEZWx0YVkgfHwgbW91c2VEZWx0YVgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXG4gICAgICAgICAgICAgICAgICAgICdjaGFuZ2UtcG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWx0YVg6IG1vdXNlRGVsdGFYLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFZOiBtb3VzZURlbHRhWSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZURvd25Qb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZURvd25Ib3ZlcmVkSW5zdGFuY2VcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb3VzZS54ID0gZS5vZmZzZXRYO1xuICAgICAgICB0aGlzLm1vdXNlLnkgPSBlLm9mZnNldFk7XG5cbiAgICAgICAgdGhpcy5jaGVja1JlZ2lvbkhvdmVyKCk7XG5cbiAgICAgICAgdGhpcy5lbWl0KCdtb3ZlJywgdGhpcy5ob3ZlcmVkUmVnaW9uLCB0aGlzLm1vdXNlKTtcbiAgICB9XG5cbiAgICBoYW5kbGVSZWdpb25IaXQoKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkUmVnaW9uID0gdGhpcy5nZXRIb3ZlcmVkUmVnaW9uKCk7XG5cbiAgICAgICAgdGhpcy5lbWl0KCdzZWxlY3QnLCBzZWxlY3RlZFJlZ2lvbiwgdGhpcy5tb3VzZSk7XG4gICAgfVxuXG4gICAgY2hlY2tSZWdpb25Ib3ZlcigpIHtcbiAgICAgICAgY29uc3QgaG92ZXJlZFJlZ2lvbiA9IHRoaXMuZ2V0SG92ZXJlZFJlZ2lvbigpO1xuXG4gICAgICAgIGlmIChob3ZlcmVkUmVnaW9uKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudEN1cnNvciAmJiBob3ZlcmVkUmVnaW9uLmN1cnNvcikge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBob3ZlcmVkUmVnaW9uLmN1cnNvcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuY3VycmVudEN1cnNvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJDdXJzb3IoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5ob3ZlcmVkUmVnaW9uID0gaG92ZXJlZFJlZ2lvbjtcbiAgICAgICAgICAgIHRoaXMuZW1pdCgnaG92ZXInLCBob3ZlcmVkUmVnaW9uLCB0aGlzLm1vdXNlKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnBhcnRpYWxSZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhvdmVyZWRSZWdpb24gJiYgIWhvdmVyZWRSZWdpb24pIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50Q3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckN1cnNvcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmhvdmVyZWRSZWdpb24gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdob3ZlcicsIG51bGwsIHRoaXMubW91c2UpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucGFydGlhbFJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SG92ZXJlZFJlZ2lvbigpIHtcbiAgICAgICAgY29uc3QgaG92ZXJlZFJlZ2lvbiA9IHRoaXMuaGl0UmVnaW9ucy5maW5kKFxuICAgICAgICAgICAgKHsgeCwgeSwgdywgaCB9KSA9PiB0aGlzLm1vdXNlLnggPj0geCAmJiB0aGlzLm1vdXNlLnggPD0geCArIHcgJiYgdGhpcy5tb3VzZS55ID49IHkgJiYgdGhpcy5tb3VzZS55IDw9IHkgKyBoXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGhvdmVyZWRSZWdpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBob3ZlcmVkUmVnaW9uO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhvdmVyZWRJbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VzLmZpbmQoXG4gICAgICAgICAgICAoeyByZW5kZXJFbmdpbmUgfSkgPT5cbiAgICAgICAgICAgICAgICByZW5kZXJFbmdpbmUucG9zaXRpb24gPD0gdGhpcy5tb3VzZS55ICYmIHJlbmRlckVuZ2luZS5oZWlnaHQgKyByZW5kZXJFbmdpbmUucG9zaXRpb24gPj0gdGhpcy5tb3VzZS55XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5ob3ZlcmVkSW5zdGFuY2UgPSBob3ZlcmVkSW5zdGFuY2U7XG5cbiAgICAgICAgaWYgKGhvdmVyZWRJbnN0YW5jZSkge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0VG9wID0gaG92ZXJlZEluc3RhbmNlLnJlbmRlckVuZ2luZS5wb3NpdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIGhvdmVyZWRJbnN0YW5jZS5oaXRSZWdpb25zLmZpbmQoXG4gICAgICAgICAgICAgICAgKHsgeCwgeSwgdywgaCB9KSA9PlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdXNlLnggPj0geCAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdXNlLnggPD0geCArIHcgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZS55ID49IHkgKyBvZmZzZXRUb3AgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZS55IDw9IHkgKyBoICsgb2Zmc2V0VG9wXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNsZWFySGl0UmVnaW9ucygpIHtcbiAgICAgICAgdGhpcy5oaXRSZWdpb25zID0gW107XG4gICAgfVxuXG4gICAgYWRkSGl0UmVnaW9uPFQ+KHR5cGU6IFJlZ2lvblR5cGVzLCBkYXRhOiBULCB4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIsIGN1cnNvcjogQ3Vyc29yVHlwZXMpIHtcbiAgICAgICAgdGhpcy5oaXRSZWdpb25zLnB1c2goe1xuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB4LFxuICAgICAgICAgICAgeSxcbiAgICAgICAgICAgIHcsXG4gICAgICAgICAgICBoLFxuICAgICAgICAgICAgY3Vyc29yLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRDdXJzb3IoY3Vyc29yOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuY2FudmFzLnN0eWxlLmN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgdGhpcy5jdXJyZW50Q3Vyc29yID0gY3Vyc29yO1xuICAgIH1cblxuICAgIGNsZWFyQ3Vyc29yKCkge1xuICAgICAgICBjb25zdCBob3ZlcmVkUmVnaW9uID0gdGhpcy5nZXRIb3ZlcmVkUmVnaW9uKCk7XG4gICAgICAgIHRoaXMuY3VycmVudEN1cnNvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKGhvdmVyZWRSZWdpb24/LmN1cnNvcikge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuY2FudmFzLnN0eWxlLmN1cnNvciA9IGhvdmVyZWRSZWdpb24uY3Vyc29yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuY2FudmFzLnN0eWxlLmN1cnNvciA9ICcnO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgUmVuZGVyRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL3JlbmRlci1lbmdpbmUnO1xuaW1wb3J0IHsgSW50ZXJhY3Rpb25zRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2ludGVyYWN0aW9ucy1lbmdpbmUnO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IFRpbWVHcmlkLCBUaW1lR3JpZFN0eWxlcyB9IGZyb20gJy4vZW5naW5lcy90aW1lLWdyaWQnO1xuaW1wb3J0IHsgUmVuZGVyT3B0aW9ucywgUmVuZGVyU3R5bGVzIH0gZnJvbSAnLi9lbmdpbmVzL2Jhc2ljLXJlbmRlci1lbmdpbmUnO1xuaW1wb3J0IFVJUGx1Z2luIGZyb20gJy4vcGx1Z2lucy91aS1wbHVnaW4nO1xuXG5leHBvcnQgdHlwZSBGbGFtZUNoYXJ0Q29udGFpbmVyU3R5bGVzPFN0eWxlcz4gPSB7XG4gICAgdGltZUdyaWQ/OiBQYXJ0aWFsPFRpbWVHcmlkU3R5bGVzPjtcbiAgICBtYWluPzogUGFydGlhbDxSZW5kZXJTdHlsZXM+O1xufSAmIFN0eWxlcztcblxuZXhwb3J0IGludGVyZmFjZSBGbGFtZUNoYXJ0Q29udGFpbmVyU2V0dGluZ3M8U3R5bGVzPiB7XG4gICAgb3B0aW9ucz86IFBhcnRpYWw8UmVuZGVyT3B0aW9ucz47XG4gICAgc3R5bGVzPzogRmxhbWVDaGFydENvbnRhaW5lclN0eWxlczxTdHlsZXM+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZsYW1lQ2hhcnRDb250YWluZXJPcHRpb25zPFN0eWxlcz4ge1xuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgcGx1Z2luczogYW55W107XG4gICAgc2V0dGluZ3M6IEZsYW1lQ2hhcnRDb250YWluZXJTZXR0aW5nczxTdHlsZXM+O1xufVxuXG5leHBvcnQgY2xhc3MgRmxhbWVDaGFydENvbnRhaW5lcjxTdHlsZXM+IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICByZW5kZXJFbmdpbmU6IFJlbmRlckVuZ2luZTtcbiAgICBpbnRlcmFjdGlvbnNFbmdpbmU6IEludGVyYWN0aW9uc0VuZ2luZTtcbiAgICBwbHVnaW5zOiBVSVBsdWdpbltdO1xuICAgIHRpbWVHcmlkOiBUaW1lR3JpZDtcblxuICAgIGNvbnN0cnVjdG9yKHsgY2FudmFzLCBwbHVnaW5zLCBzZXR0aW5ncyB9OiBGbGFtZUNoYXJ0Q29udGFpbmVyT3B0aW9uczxTdHlsZXM+KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgY29uc3Qgc3R5bGVzID0gc2V0dGluZ3M/LnN0eWxlcyA/PyAoe30gYXMgdHlwZW9mIHNldHRpbmdzLnN0eWxlcyk7XG5cbiAgICAgICAgdGhpcy50aW1lR3JpZCA9IG5ldyBUaW1lR3JpZCh7IHN0eWxlczogc3R5bGVzPy50aW1lR3JpZCB9KTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUgPSBuZXcgUmVuZGVyRW5naW5lKHtcbiAgICAgICAgICAgIGNhbnZhcyxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgICAgc3R5bGVzOiBzdHlsZXM/Lm1haW4sXG4gICAgICAgICAgICAgICAgb3B0aW9uczogc2V0dGluZ3Mub3B0aW9ucyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwbHVnaW5zLFxuICAgICAgICAgICAgdGltZUdyaWQ6IHRoaXMudGltZUdyaWQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmludGVyYWN0aW9uc0VuZ2luZSA9IG5ldyBJbnRlcmFjdGlvbnNFbmdpbmUoY2FudmFzLCB0aGlzLnJlbmRlckVuZ2luZSk7XG4gICAgICAgIHRoaXMucGx1Z2lucyA9IHBsdWdpbnM7XG5cbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBBcnJheSh0aGlzLnBsdWdpbnMubGVuZ3RoKVxuICAgICAgICAgICAgLmZpbGwobnVsbClcbiAgICAgICAgICAgIC5tYXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbmRlckVuZ2luZSA9IHRoaXMucmVuZGVyRW5naW5lLm1ha2VJbnN0YW5jZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGludGVyYWN0aW9uc0VuZ2luZSA9IHRoaXMuaW50ZXJhY3Rpb25zRW5naW5lLm1ha2VJbnN0YW5jZShyZW5kZXJFbmdpbmUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgcmVuZGVyRW5naW5lLCBpbnRlcmFjdGlvbnNFbmdpbmUgfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucGx1Z2lucy5mb3JFYWNoKChwbHVnaW4sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBwbHVnaW4uaW5pdChjaGlsZHJlbltpbmRleF0ucmVuZGVyRW5naW5lLCBjaGlsZHJlbltpbmRleF0uaW50ZXJhY3Rpb25zRW5naW5lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuY2FsY01pbk1heCgpO1xuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZXNldFZpZXcoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVjYWxjQ2hpbGRyZW5TaXplcygpO1xuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5jYWxjVGltZUdyaWQoKTtcblxuICAgICAgICB0aGlzLnBsdWdpbnMuZm9yRWFjaCgocGx1Z2luKSA9PiBwbHVnaW4ucG9zdEluaXQ/LigpKTtcblxuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlc2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZXNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlcigpO1xuICAgIH1cblxuICAgIGV4ZWNPblBsdWdpbnMoZm5OYW1lOiBzdHJpbmcsIC4uLmFyZ3MpIHtcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcblxuICAgICAgICB3aGlsZSAoaW5kZXggPCB0aGlzLnBsdWdpbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wbHVnaW5zW2luZGV4XVtmbk5hbWVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW5zW2luZGV4XVtmbk5hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0U2V0dGluZ3Moc2V0dGluZ3M6IEZsYW1lQ2hhcnRDb250YWluZXJTZXR0aW5nczxTdHlsZXM+KSB7XG4gICAgICAgIHRoaXMudGltZUdyaWQuc2V0U2V0dGluZ3MoeyBzdHlsZXM6IHNldHRpbmdzLnN0eWxlcz8udGltZUdyaWQgfSk7XG4gICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnNldFNldHRpbmdzKHsgb3B0aW9uczogc2V0dGluZ3Mub3B0aW9ucywgc3R5bGVzOiBzZXR0aW5ncy5zdHlsZXM/Lm1haW4gfSk7XG4gICAgICAgIHRoaXMucGx1Z2lucy5mb3JFYWNoKChwbHVnaW4pID0+IHBsdWdpbi5zZXRTZXR0aW5ncz8uKHsgc3R5bGVzOiBzZXR0aW5ncy5zdHlsZXM/LltwbHVnaW4ubmFtZV0gfSkpO1xuICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBzZXRab29tKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHpvb20gPSB0aGlzLnJlbmRlckVuZ2luZS53aWR0aCAvIChlbmQgLSBzdGFydCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuc2V0UG9zaXRpb25YKHN0YXJ0KTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUuc2V0Wm9vbSh6b29tKTtcbiAgICAgICAgdGhpcy5yZW5kZXJFbmdpbmUucmVuZGVyKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGbGFtZUNoYXJ0Q29udGFpbmVyO1xuIiwiaW1wb3J0IHsgRmxhbWVDaGFydENvbnRhaW5lciwgRmxhbWVDaGFydENvbnRhaW5lclNldHRpbmdzIH0gZnJvbSAnLi9mbGFtZS1jaGFydC1jb250YWluZXInO1xuaW1wb3J0IHsgVGltZUdyaWRQbHVnaW4sIFRpbWVHcmlkUGx1Z2luU3R5bGVzIH0gZnJvbSAnLi9wbHVnaW5zL3RpbWUtZ3JpZC1wbHVnaW4nO1xuaW1wb3J0IHsgVGltZWZyYW1lU2VsZWN0b3JQbHVnaW4sIFRpbWVmcmFtZVNlbGVjdG9yUGx1Z2luU3R5bGVzIH0gZnJvbSAnLi9wbHVnaW5zL3RpbWVmcmFtZS1zZWxlY3Rvci1wbHVnaW4nO1xuaW1wb3J0IHsgV2F0ZXJmYWxsUGx1Z2luLCBXYXRlcmZhbGxQbHVnaW5TdHlsZXMgfSBmcm9tICcuL3BsdWdpbnMvd2F0ZXJmYWxsLXBsdWdpbic7XG5pbXBvcnQgeyBUb2dnbGVQbHVnaW4sIFRvZ2dsZVBsdWdpblN0eWxlcyB9IGZyb20gJy4vcGx1Z2lucy90b2dnbGUtcGx1Z2luJztcbmltcG9ydCB7IEZsYW1lQ2hhcnRQbHVnaW4gfSBmcm9tICcuL3BsdWdpbnMvZmxhbWUtY2hhcnQtcGx1Z2luJztcbmltcG9ydCB7IE1hcmtzUGx1Z2luIH0gZnJvbSAnLi9wbHVnaW5zL21hcmtzLXBsdWdpbic7XG5pbXBvcnQgeyBDb2xvcnMsIERhdGEsIE1hcmtzLCBXYXRlcmZhbGwgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFVJUGx1Z2luIH0gZnJvbSAnLi9wbHVnaW5zL3VpLXBsdWdpbic7XG5cbmV4cG9ydCB0eXBlIEZsYW1lQ2hhcnRTdHlsZXMgPSB7XG4gICAgdGltZUdyaWRQbHVnaW4/OiBQYXJ0aWFsPFRpbWVHcmlkUGx1Z2luU3R5bGVzPjtcbiAgICB0aW1lZnJhbWVTZWxlY3RvclBsdWdpbj86IFBhcnRpYWw8VGltZWZyYW1lU2VsZWN0b3JQbHVnaW5TdHlsZXM+O1xuICAgIHdhdGVyZmFsbFBsdWdpbj86IFBhcnRpYWw8V2F0ZXJmYWxsUGx1Z2luU3R5bGVzPjtcbiAgICB0b2dnbGVQbHVnaW4/OiBQYXJ0aWFsPFRvZ2dsZVBsdWdpblN0eWxlcz47XG59O1xuXG5leHBvcnQgdHlwZSBGbGFtZUNoYXJ0U2V0dGluZ3MgPSB7XG4gICAgaGVhZGVycz86IFBhcnRpYWw8e1xuICAgICAgICB3YXRlcmZhbGw6IHN0cmluZztcbiAgICAgICAgZmxhbWVDaGFydDogc3RyaW5nO1xuICAgIH0+O1xufSAmIEZsYW1lQ2hhcnRDb250YWluZXJTZXR0aW5nczxGbGFtZUNoYXJ0U3R5bGVzPjtcblxuZXhwb3J0IHR5cGUgRmxhbWVDaGFydE9wdGlvbnMgPSB7XG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBkYXRhPzogRGF0YTtcbiAgICBtYXJrcz86IE1hcmtzO1xuICAgIHdhdGVyZmFsbD86IFdhdGVyZmFsbDtcbiAgICBjb2xvcnM/OiBDb2xvcnM7XG4gICAgc2V0dGluZ3M/OiBGbGFtZUNoYXJ0U2V0dGluZ3M7XG4gICAgcGx1Z2lucz86IFVJUGx1Z2luW107XG59O1xuXG5jb25zdCBkZWZhdWx0U2V0dGluZ3M6IEZsYW1lQ2hhcnRTZXR0aW5ncyA9IHt9O1xuXG5leHBvcnQgY2xhc3MgRmxhbWVDaGFydCBleHRlbmRzIEZsYW1lQ2hhcnRDb250YWluZXI8RmxhbWVDaGFydFN0eWxlcz4ge1xuICAgIHNldERhdGE6IChkYXRhOiBEYXRhKSA9PiB2b2lkO1xuICAgIHNldE1hcmtzOiAoZGF0YTogTWFya3MpID0+IHZvaWQ7XG4gICAgc2V0V2F0ZXJmYWxsOiAoZGF0YTogV2F0ZXJmYWxsKSA9PiB2b2lkO1xuICAgIHNldEZsYW1lQ2hhcnRQb3NpdGlvbjogKHsgeCwgeSB9OiB7IHg/OiBudW1iZXI7IHk/OiBudW1iZXIgfSkgPT4gdm9pZDtcblxuICAgIGNvbnN0cnVjdG9yKHtcbiAgICAgICAgY2FudmFzLFxuICAgICAgICBkYXRhLFxuICAgICAgICBtYXJrcyxcbiAgICAgICAgd2F0ZXJmYWxsLFxuICAgICAgICBjb2xvcnMsXG4gICAgICAgIHNldHRpbmdzID0gZGVmYXVsdFNldHRpbmdzLFxuICAgICAgICBwbHVnaW5zID0gW10sXG4gICAgfTogRmxhbWVDaGFydE9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgYWN0aXZlUGx1Z2luczogVUlQbHVnaW5bXSA9IFtdO1xuICAgICAgICBjb25zdCB7IGhlYWRlcnM6IHsgd2F0ZXJmYWxsOiB3YXRlcmZhbGxOYW1lID0gJ3dhdGVyZmFsbCcsIGZsYW1lQ2hhcnQ6IGZsYW1lQ2hhcnROYW1lID0gJ2ZsYW1lIGNoYXJ0JyB9ID0ge30gfSA9XG4gICAgICAgICAgICBzZXR0aW5ncztcbiAgICAgICAgY29uc3Qgc3R5bGVzID0gc2V0dGluZ3M/LnN0eWxlcyA/PyAoe30gYXMgRmxhbWVDaGFydFNldHRpbmdzWydzdHlsZXMnXSk7XG5cbiAgICAgICAgY29uc3QgdGltZUdyaWRQbHVnaW4gPSBuZXcgVGltZUdyaWRQbHVnaW4oeyBzdHlsZXM6IHN0eWxlcz8udGltZUdyaWRQbHVnaW4gfSk7XG5cbiAgICAgICAgYWN0aXZlUGx1Z2lucy5wdXNoKHRpbWVHcmlkUGx1Z2luKTtcblxuICAgICAgICBsZXQgbWFya3NQbHVnaW46IE1hcmtzUGx1Z2luIHwgdW5kZWZpbmVkO1xuICAgICAgICBsZXQgd2F0ZXJmYWxsUGx1Z2luOiBXYXRlcmZhbGxQbHVnaW4gfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCB0aW1lZnJhbWVTZWxlY3RvclBsdWdpbjogVGltZWZyYW1lU2VsZWN0b3JQbHVnaW4gfCB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBmbGFtZUNoYXJ0UGx1Z2luOiBGbGFtZUNoYXJ0UGx1Z2luIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChtYXJrcykge1xuICAgICAgICAgICAgbWFya3NQbHVnaW4gPSBuZXcgTWFya3NQbHVnaW4oeyBkYXRhOiBtYXJrcyB9KTtcbiAgICAgICAgICAgIG1hcmtzUGx1Z2luLm9uKCdzZWxlY3QnLCAobm9kZSwgdHlwZSkgPT4gdGhpcy5lbWl0KCdzZWxlY3QnLCBub2RlLCB0eXBlKSk7XG5cbiAgICAgICAgICAgIGFjdGl2ZVBsdWdpbnMucHVzaChtYXJrc1BsdWdpbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2F0ZXJmYWxsKSB7XG4gICAgICAgICAgICB3YXRlcmZhbGxQbHVnaW4gPSBuZXcgV2F0ZXJmYWxsUGx1Z2luKHsgZGF0YTogd2F0ZXJmYWxsLCBzZXR0aW5nczogeyBzdHlsZXM6IHN0eWxlcz8ud2F0ZXJmYWxsUGx1Z2luIH0gfSk7XG4gICAgICAgICAgICB3YXRlcmZhbGxQbHVnaW4ub24oJ3NlbGVjdCcsIChub2RlLCB0eXBlKSA9PiB0aGlzLmVtaXQoJ3NlbGVjdCcsIG5vZGUsIHR5cGUpKTtcblxuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVQbHVnaW5zLnB1c2gobmV3IFRvZ2dsZVBsdWdpbih3YXRlcmZhbGxOYW1lLCB7IHN0eWxlczogc3R5bGVzPy50b2dnbGVQbHVnaW4gfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhY3RpdmVQbHVnaW5zLnB1c2god2F0ZXJmYWxsUGx1Z2luKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aW1lZnJhbWVTZWxlY3RvclBsdWdpbiA9IG5ldyBUaW1lZnJhbWVTZWxlY3RvclBsdWdpbih7XG4gICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogeyBzdHlsZXM6IHN0eWxlcz8udGltZWZyYW1lU2VsZWN0b3JQbHVnaW4gfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZmxhbWVDaGFydFBsdWdpbiA9IG5ldyBGbGFtZUNoYXJ0UGx1Z2luKHsgZGF0YSwgY29sb3JzIH0pO1xuICAgICAgICAgICAgZmxhbWVDaGFydFBsdWdpbi5vbignc2VsZWN0JywgKG5vZGUsIHR5cGUpID0+IHRoaXMuZW1pdCgnc2VsZWN0Jywgbm9kZSwgdHlwZSkpO1xuXG4gICAgICAgICAgICBpZiAod2F0ZXJmYWxsKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlUGx1Z2lucy5wdXNoKG5ldyBUb2dnbGVQbHVnaW4oZmxhbWVDaGFydE5hbWUsIHsgc3R5bGVzOiBzdHlsZXM/LnRvZ2dsZVBsdWdpbiB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFjdGl2ZVBsdWdpbnMucHVzaChmbGFtZUNoYXJ0UGx1Z2luKTtcbiAgICAgICAgICAgIGFjdGl2ZVBsdWdpbnMudW5zaGlmdCh0aW1lZnJhbWVTZWxlY3RvclBsdWdpbik7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBjYW52YXMsXG4gICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgIHBsdWdpbnM6IFsuLi5hY3RpdmVQbHVnaW5zLCAuLi5wbHVnaW5zXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGZsYW1lQ2hhcnRQbHVnaW4gJiYgdGltZWZyYW1lU2VsZWN0b3JQbHVnaW4pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YSA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZsYW1lQ2hhcnRQbHVnaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhbWVDaGFydFBsdWdpbi5zZXREYXRhKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aW1lZnJhbWVTZWxlY3RvclBsdWdpbikge1xuICAgICAgICAgICAgICAgICAgICB0aW1lZnJhbWVTZWxlY3RvclBsdWdpbi5zZXREYXRhKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuc2V0RmxhbWVDaGFydFBvc2l0aW9uID0gKHsgeCwgeSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckVuZ2luZS5zZXRQb3NpdGlvblgoeCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB5ID09PSAnbnVtYmVyJyAmJiBmbGFtZUNoYXJ0UGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYW1lQ2hhcnRQbHVnaW4uc2V0UG9zaXRpb25ZKHkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5naW5lLnJlbmRlcigpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXJrc1BsdWdpbikge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXJrcyA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG1hcmtzUGx1Z2luKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtzUGx1Z2luLnNldE1hcmtzKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2F0ZXJmYWxsUGx1Z2luKSB7XG4gICAgICAgICAgICB0aGlzLnNldFdhdGVyZmFsbCA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHdhdGVyZmFsbFBsdWdpbikge1xuICAgICAgICAgICAgICAgICAgICB3YXRlcmZhbGxQbHVnaW4uc2V0RGF0YShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGbGFtZUNoYXJ0O1xuIiwiaW1wb3J0IHsgTm9kZSwgV2F0ZXJmYWxsSW50ZXJ2YWxzIH0gZnJvbSAnLi4vLi4vc3JjJztcblxuY29uc3QgY2hhcnMgPSAncXdlcnR5dWlvcGFzZGZnaGprbHp4Y3Zibm1RV0VSVFlVSU9QQVNERkdISktMWlhDVkJOTSc7XG5cbmNvbnN0IHJhbmRvbVN0cmluZyA9IChsZW5ndGgsIG1pbkxlbmd0aCA9IDQpID0+IHtcbiAgICBjb25zdCBybmRMZW5ndGggPSBybmQobGVuZ3RoLCBtaW5MZW5ndGgpO1xuICAgIGxldCBzdHIgPSAnJztcblxuICAgIGZvciAobGV0IGkgPSBybmRMZW5ndGg7IGktLTsgKSB7XG4gICAgICAgIHN0ciArPSBjaGFyc1tybmQoY2hhcnMubGVuZ3RoIC0gMSldO1xuICAgIH1cblxuICAgIHJldHVybiBzdHI7XG59O1xuXG5jb25zdCBybmQgPSAobWF4LCBtaW4gPSAwKSA9PiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG5jb25zdCBybmRGbG9hdCA9IChtYXgsIG1pbiA9IDApID0+IE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcblxudHlwZSBMZXZlbCA9IHtcbiAgICBjaGlsZHJlbj86IExldmVsW107XG59O1xuXG50eXBlIExheWVyID0geyByZXN0OiBudW1iZXI7IGNoaWxkcmVuOiBMZXZlbFtdIH07XG5cbmNvbnN0IGdlbmVyYXRlUmFuZG9tTGV2ZWwgPSAoY291bnQ6IG51bWJlciwgbWluQ2hpbGQgPSAxLCBtYXhDaGlsZCA9IDEwKTogTGF5ZXIgPT4ge1xuICAgIGNvbnN0IGNoaWxkcmVuQ291bnQgPSBjb3VudCA/IHJuZChNYXRoLm1pbihjb3VudCwgbWF4Q2hpbGQpLCBNYXRoLm1pbihjb3VudCwgbWluQ2hpbGQpKSA6IDA7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBBcnJheShjaGlsZHJlbkNvdW50KVxuICAgICAgICAuZmlsbChudWxsKVxuICAgICAgICAubWFwKCgpOiBMZXZlbCA9PiAoeyBjaGlsZHJlbjogW10gfSkpO1xuICAgIGNvbnN0IHJlc3QgPSBjb3VudCAtIGNoaWxkcmVuQ291bnQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0LFxuICAgICAgICBjaGlsZHJlbixcbiAgICB9O1xufTtcblxuY29uc3QgZ2VuZXJhdGVSYW5kb21OZXN0aW5nID0gKGNvdW50OiBudW1iZXIsIG1pbkNoaWxkOiBudW1iZXIsIG1heENoaWxkOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBsZXZlbHM6IExldmVsW11bXVtdID0gW107XG5cbiAgICBsZXQgcmVzdCA9IGNvdW50O1xuICAgIGxldCBpc1N0b3BwZWQgPSBmYWxzZTtcblxuICAgIHdoaWxlIChyZXN0ID4gMCAmJiAhaXNTdG9wcGVkKSB7XG4gICAgICAgIGlmICghbGV2ZWxzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgbGF5ZXIgPSBnZW5lcmF0ZVJhbmRvbUxldmVsKHJlc3QsIE1hdGgubWluKG1pbkNoaWxkLCAxKSwgbWF4Q2hpbGQpO1xuXG4gICAgICAgICAgICBsZXZlbHMucHVzaChbbGF5ZXIuY2hpbGRyZW5dKTtcbiAgICAgICAgICAgIHJlc3QgPSBsYXllci5yZXN0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbGV2ZWw6IExldmVsW11bXSA9IGxldmVsc1tsZXZlbHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb25zdCBpbm5lckxldmVsOiBMZXZlbFtdW10gPSBbXTtcblxuICAgICAgICAgICAgbGV2ZWwuZm9yRWFjaCgoc3ViTGV2ZWwpID0+IHtcbiAgICAgICAgICAgICAgICBzdWJMZXZlbC5mb3JFYWNoKChzdWJTdWJMZXZlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXllciA9IGdlbmVyYXRlUmFuZG9tTGV2ZWwocmVzdCwgbWluQ2hpbGQsIG1heENoaWxkKTtcblxuICAgICAgICAgICAgICAgICAgICBzdWJTdWJMZXZlbC5jaGlsZHJlbiA9IGxheWVyLmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgICAgICByZXN0ID0gbGF5ZXIucmVzdDtcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJMZXZlbC5wdXNoKGxheWVyLmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIWlubmVyTGV2ZWwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaXNTdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV2ZWxzLnB1c2goaW5uZXJMZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgJ1RvdGFsIGNvdW50OicsXG4gICAgICAgIGxldmVscy5yZWR1Y2UoKGFjYywgbGV2ZWwpID0+IGxldmVsLnJlZHVjZSgoYWNjLCBzdWJMZXZlbCkgPT4gYWNjICsgc3ViTGV2ZWwubGVuZ3RoLCBhY2MpLCAwKVxuICAgICk7XG5cbiAgICByZXR1cm4gbGV2ZWxzWzBdWzBdO1xufTtcblxuY29uc3QgbWFwID0gPFQgZXh0ZW5kcyB7IGNoaWxkcmVuPzogVFtdIH0+KG5vZGVzOiBUW10sIGNiOiAobm9kZXM6IFRbXSwgcGFyZW50PzogVCkgPT4gVFtdLCBwYXJlbnQ/OiBUKTogVFtdID0+IHtcbiAgICByZXR1cm4gY2Iobm9kZXMsIHBhcmVudCkubWFwKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW0uY2hpbGRyZW4gPSBpdGVtLmNoaWxkcmVuID8gbWFwKGl0ZW0uY2hpbGRyZW4sIGNiLCBpdGVtKSA6IFtdO1xuXG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xufTtcblxudHlwZSBUcmVlQ29uZmlnID0ge1xuICAgIGNvdW50OiBudW1iZXI7XG4gICAgc3RhcnQ6IG51bWJlcjtcbiAgICBlbmQ6IG51bWJlcjtcbiAgICBtaW5DaGlsZDogbnVtYmVyO1xuICAgIHRoaW5uaW5nOiBudW1iZXI7XG4gICAgbWF4Q2hpbGQ6IG51bWJlcjtcbiAgICBjb2xvcnNNb25vdG9ueTogbnVtYmVyO1xuICAgIGNvbG9yc0NvdW50OiBudW1iZXI7XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVSYW5kb21UcmVlID0gKHtcbiAgICBjb3VudCxcbiAgICBzdGFydCxcbiAgICBlbmQsXG4gICAgbWluQ2hpbGQsXG4gICAgbWF4Q2hpbGQsXG4gICAgdGhpbm5pbmcsXG4gICAgY29sb3JzTW9ub3RvbnksXG4gICAgY29sb3JzQ291bnQsXG59OiBUcmVlQ29uZmlnKTogTm9kZVtdID0+IHtcbiAgICBjb25zdCByb290Tm9kZXMgPSBnZW5lcmF0ZVJhbmRvbU5lc3RpbmcoY291bnQsIG1pbkNoaWxkLCBtYXhDaGlsZCkgYXMgTm9kZVtdO1xuICAgIGNvbnN0IHR5cGVzID0gQXJyYXkoY29sb3JzQ291bnQpXG4gICAgICAgIC5maWxsKG51bGwpXG4gICAgICAgIC5tYXAoKCkgPT4gcmFuZG9tU3RyaW5nKDEwKSk7XG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIGxldCB0eXBlc0NvdW50ZXIgPSAwO1xuICAgIGxldCBjdXJyZW50VHlwZSA9IHR5cGVzW3R5cGVzQ291bnRlcl07XG5cbiAgICBjb25zdCBtYXBwZWROZXN0aW5nQXJyYXlzID0gbWFwKHJvb3ROb2RlcywgKG5vZGVzOiBOb2RlW10sIHBhcmVudD86IE5vZGUpID0+IHtcbiAgICAgICAgY29uc3QgaXRlbXNDb3VudCA9IG5vZGVzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgaW5uZXJTdGFydCA9IHBhcmVudD8uc3RhcnQgPyBwYXJlbnQuc3RhcnQgOiBzdGFydDtcbiAgICAgICAgY29uc3QgaW5uZXJFbmQgPSB0eXBlb2YgcGFyZW50Py5kdXJhdGlvbiA9PT0gJ251bWJlcicgPyBpbm5lclN0YXJ0ICsgcGFyZW50Py5kdXJhdGlvbiA6IGVuZDtcblxuICAgICAgICBjb25zdCB0aW1lc3RhbXBzID1cbiAgICAgICAgICAgIGl0ZW1zQ291bnQgPiAxXG4gICAgICAgICAgICAgICAgPyBBcnJheShpdGVtc0NvdW50IC0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAuZmlsbChudWxsKVxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKCkgPT4gcm5kRmxvYXQoaW5uZXJTdGFydCwgaW5uZXJFbmQpKVxuICAgICAgICAgICAgICAgICAgICAgIC5jb25jYXQoaW5uZXJTdGFydCwgaW5uZXJFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEgLSBiKVxuICAgICAgICAgICAgICAgIDogW2lubmVyU3RhcnQsIGlubmVyRW5kXTtcblxuICAgICAgICBub2Rlcy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFdpbmRvdyA9IHRpbWVzdGFtcHNbaW5kZXggKyAxXSAtIHRpbWVzdGFtcHNbaW5kZXhdO1xuXG4gICAgICAgICAgICBpZiAoY291bnRlciA+IGNvbG9yc01vbm90b255KSB7XG4gICAgICAgICAgICAgICAgY291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgY3VycmVudFR5cGUgPSB0eXBlc1t0eXBlc0NvdW50ZXJdO1xuICAgICAgICAgICAgICAgIHR5cGVzQ291bnRlcisrO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVzQ291bnRlciA+PSB0eXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZXNDb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gdGltZXN0YW1wc1tpbmRleF0gKyBybmRGbG9hdChjdXJyZW50V2luZG93LCAwKSAqIChybmRGbG9hdCh0aGlubmluZykgLyAxMDApO1xuICAgICAgICAgICAgY29uc3QgZW5kID0gdGltZXN0YW1wc1tpbmRleCArIDFdIC0gcm5kRmxvYXQoY3VycmVudFdpbmRvdywgMCkgKiAocm5kRmxvYXQodGhpbm5pbmcpIC8gMTAwKTtcblxuICAgICAgICAgICAgaXRlbS5zdGFydCA9IHN0YXJ0O1xuICAgICAgICAgICAgaXRlbS5kdXJhdGlvbiA9IGVuZCAtIHN0YXJ0O1xuICAgICAgICAgICAgaXRlbS5uYW1lID0gcmFuZG9tU3RyaW5nKDE0KTtcbiAgICAgICAgICAgIGl0ZW0udHlwZSA9IGN1cnJlbnRUeXBlO1xuXG4gICAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKCdbZ2VuZXJhdGVSYW5kb21UcmVlXScsIG1hcHBlZE5lc3RpbmdBcnJheXMpO1xuXG4gICAgcmV0dXJuIG1hcHBlZE5lc3RpbmdBcnJheXM7XG59O1xuXG5leHBvcnQgY29uc3Qgd2F0ZXJmYWxsSXRlbXMgPSBbXG4gICAge1xuICAgICAgICBuYW1lOiAnZm9vJyxcbiAgICAgICAgaW50ZXJ2YWxzOiAnZGVmYXVsdCcsXG4gICAgICAgIHRpbWluZzoge1xuICAgICAgICAgICAgcmVxdWVzdFN0YXJ0OiAyMDUwLFxuICAgICAgICAgICAgcmVzcG9uc2VTdGFydDogMjUwMCxcbiAgICAgICAgICAgIHJlc3BvbnNlRW5kOiAyNjAwLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnYmFyJyxcbiAgICAgICAgaW50ZXJ2YWxzOiAnZGVmYXVsdCcsXG4gICAgICAgIHRpbWluZzoge1xuICAgICAgICAgICAgcmVxdWVzdFN0YXJ0OiAyMTIwLFxuICAgICAgICAgICAgcmVzcG9uc2VTdGFydDogMjE4MCxcbiAgICAgICAgICAgIHJlc3BvbnNlRW5kOiAyMzAwLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnYmFyMicsXG4gICAgICAgIGludGVydmFsczogJ2RlZmF1bHQnLFxuICAgICAgICB0aW1pbmc6IHtcbiAgICAgICAgICAgIHJlcXVlc3RTdGFydDogMjEyMCxcbiAgICAgICAgICAgIHJlc3BvbnNlU3RhcnQ6IDIxODAsXG4gICAgICAgICAgICByZXNwb25zZUVuZDogMjMwMCxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ2JhcjMnLFxuICAgICAgICBpbnRlcnZhbHM6ICdkZWZhdWx0JyxcbiAgICAgICAgdGltaW5nOiB7XG4gICAgICAgICAgICByZXF1ZXN0U3RhcnQ6IDIxMzAsXG4gICAgICAgICAgICByZXNwb25zZVN0YXJ0OiAyMTgwLFxuICAgICAgICAgICAgcmVzcG9uc2VFbmQ6IDIzMjAsXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdiYXI0JyxcbiAgICAgICAgaW50ZXJ2YWxzOiAnZGVmYXVsdCcsXG4gICAgICAgIHRpbWluZzoge1xuICAgICAgICAgICAgcmVxdWVzdFN0YXJ0OiAyMzAwLFxuICAgICAgICAgICAgcmVzcG9uc2VTdGFydDogMjM1MCxcbiAgICAgICAgICAgIHJlc3BvbnNlRW5kOiAyNDAwLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnYmFyNScsXG4gICAgICAgIGludGVydmFsczogJ2RlZmF1bHQnLFxuICAgICAgICB0aW1pbmc6IHtcbiAgICAgICAgICAgIHJlcXVlc3RTdGFydDogMjUwMCxcbiAgICAgICAgICAgIHJlc3BvbnNlU3RhcnQ6IDI1MjAsXG4gICAgICAgICAgICByZXNwb25zZUVuZDogMjU1MCxcbiAgICAgICAgfSxcbiAgICB9LFxuXTtcbmV4cG9ydCBjb25zdCB3YXRlcmZhbGxJbnRlcnZhbHM6IFdhdGVyZmFsbEludGVydmFscyA9IHtcbiAgICBkZWZhdWx0OiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICd3YWl0aW5nJyxcbiAgICAgICAgICAgIGNvbG9yOiAncmdiKDIwNywxOTYsMTUyKScsXG4gICAgICAgICAgICB0eXBlOiAnYmxvY2snLFxuICAgICAgICAgICAgc3RhcnQ6ICdyZXF1ZXN0U3RhcnQnLFxuICAgICAgICAgICAgZW5kOiAncmVzcG9uc2VTdGFydCcsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdkb3dubG9hZGluZycsXG4gICAgICAgICAgICBjb2xvcjogJ3JnYigyMDcsMTgwLDgxKScsXG4gICAgICAgICAgICB0eXBlOiAnYmxvY2snLFxuICAgICAgICAgICAgc3RhcnQ6ICdyZXNwb25zZVN0YXJ0JyxcbiAgICAgICAgICAgIGVuZDogJ3Jlc3BvbnNlRW5kJyxcbiAgICAgICAgfSxcbiAgICBdLFxufTtcblxuZXhwb3J0IGNvbnN0IG1hcmtzID0gW1xuICAgIHtcbiAgICAgICAgc2hvcnROYW1lOiAnRENMJyxcbiAgICAgICAgZnVsbE5hbWU6ICdET01Db250ZW50TG9hZGVkJyxcbiAgICAgICAgdGltZXN0YW1wOiAyMDAwLFxuICAgICAgICBjb2xvcjogJyNkN2M0NGMnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBzaG9ydE5hbWU6ICdMRScsXG4gICAgICAgIGZ1bGxOYW1lOiAnTG9hZEV2ZW50JyxcbiAgICAgICAgdGltZXN0YW1wOiAyMTAwLFxuICAgICAgICBjb2xvcjogJyM0ZmQyNGEnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBzaG9ydE5hbWU6ICdUVEknLFxuICAgICAgICBmdWxsTmFtZTogJ1RpbWUgVG8gSW50ZXJhY3RpdmUnLFxuICAgICAgICB0aW1lc3RhbXA6IDMwMDAsXG4gICAgICAgIGNvbG9yOiAnIzRiN2FkNycsXG4gICAgfSxcbl07XG4iLCJpbXBvcnQgeyBGbGFtZUNoYXJ0IH0gZnJvbSAnLi4vLi4vc3JjL2ZsYW1lLWNoYXJ0JztcblxuZXhwb3J0IGNvbnN0IHF1ZXJ5ID0gbG9jYXRpb24uc2VhcmNoO1xuXG5leHBvcnQgY29uc3QgaW5pdFF1ZXJ5ID0gKGZsYW1lQ2hhcnQ6IEZsYW1lQ2hhcnQpID0+IHtcbiAgICBpZiAocXVlcnkpIHtcbiAgICAgICAgY29uc3QgYXJnczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHF1ZXJ5XG4gICAgICAgICAgICAuc3BsaXQoJz8nKVxuICAgICAgICAgICAgLm1hcCgoYXJnKSA9PiBhcmcuc3BsaXQoJz0nKSlcbiAgICAgICAgICAgIC5yZWR1Y2UoKGFjYywgW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICAgICAgYWNjW2tleV0gPSB2YWx1ZTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9LCB7fSk7XG5cbiAgICAgICAgaWYgKGFyZ3NbJ2ZpbGUnXSkge1xuICAgICAgICAgICAgZmV0Y2goZGVjb2RlVVJJQ29tcG9uZW50KGFyZ3NbJ2ZpbGUnXSksIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgIG1vZGU6ICduby1jb3JzJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4gcmVzLnRleHQoKSlcbiAgICAgICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmbGFtZUNoYXJ0LnNldERhdGEoSlNPTi5wYXJzZShkYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgIGZsYW1lQ2hhcnQucmVuZGVyRW5naW5lLnJlc2V0VmlldygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsImNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd3JhcHBlcicpO1xuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuXG5jb25zdCBub2RlVmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RlZC1ub2RlJyk7XG5jb25zdCBkYXRhSW5wdXRzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RhdGEtaW5wdXRzJyk7XG5jb25zdCBzdHlsZXNJbnB1dHNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3R5bGVzLWlucHV0cycpO1xuXG5jb25zdCB1cGRhdGVTdHlsZXNCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXBkYXRlLXN0eWxlcy1idXR0b24nKTtcbmNvbnN0IHVwZGF0ZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1cGRhdGUtYnV0dG9uJyk7XG5jb25zdCBleHBvcnRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhwb3J0LWJ1dHRvbicpO1xuY29uc3QgaW1wb3J0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1idXR0b24nKTtcbmNvbnN0IGltcG9ydElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ltcG9ydC1pbnB1dCcpO1xuXG5jb25zdCBjdXN0b21TdHlsZXMgPSB7fTtcblxuY29uc3QgY3JlYXRlSW5wdXQgPSAoeyBuYW1lLCB1bml0cywgdmFsdWUsIHR5cGUgPSAnbnVtYmVyJyB9LCBwcmVmaXg/OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgY29uc3QgaWQgPSAocHJlZml4ID8gcHJlZml4ICsgJy0nIDogJycpICsgbmFtZTtcblxuICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdpbnB1dFdyYXBwZXInKTtcblxuICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoJ2lucHV0TGFiZWwnKTtcbiAgICBsYWJlbC5zZXRBdHRyaWJ1dGUoJ2ZvcicsIGlkKTtcbiAgICBsYWJlbC5pbm5lckhUTUwgPSBgJHtuYW1lfSR7dW5pdHMgPyBgKCR7dW5pdHN9KWAgOiAnJ306YDtcblxuICAgIGlucHV0LmlkID0gaWQ7XG4gICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICBpbnB1dC5jbGFzc0xpc3QuYWRkKCdpbnB1dCcpO1xuICAgIGlucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsIHR5cGUpO1xuXG4gICAgZGl2LmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGl2LFxuICAgICAgICBpbnB1dCxcbiAgICAgICAgbGFiZWwsXG4gICAgfTtcbn07XG5cbmNvbnN0IGFkZElucHV0cyA9IChpbnB1dHNDb250YWluZXIsIGlucHV0c0RpY3QpID0+IHtcbiAgICBjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgIGlucHV0c0RpY3QuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgeyBkaXYsIGlucHV0IH0gPSBjcmVhdGVJbnB1dChpdGVtKTtcblxuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NoYW5nZScsXG4gICAgICAgICAgICAoZTogRXZlbnQpID0+IChpbnB1dHNEaWN0W2luZGV4XS52YWx1ZSA9IHBhcnNlSW50KChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSkpXG4gICAgICAgICk7XG5cbiAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB9KTtcblxuICAgIGlucHV0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG59O1xuXG5jb25zdCBhZGRTdHlsZXNJbnB1dHMgPSAoaW5wdXRzQ29udGFpbmVyLCBzdHlsZXM6IFJlY29yZDxzdHJpbmcsIHt9PikgPT4ge1xuICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgT2JqZWN0LmVudHJpZXMoc3R5bGVzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY3VzdG9tU3R5bGVzW2tleV0gPSB7XG4gICAgICAgICAgICAuLi52YWx1ZSxcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIE9iamVjdC5lbnRyaWVzKHN0eWxlcykuZm9yRWFjaCgoW2NvbXBvbmVudCwgc3R5bGVzQmxvY2tdKSA9PiB7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRpdGxlLmlubmVySFRNTCA9IGNvbXBvbmVudDtcbiAgICAgICAgdGl0bGUuY2xhc3NMaXN0LmFkZCgnaW5wdXRzVGl0bGUnKTtcblxuICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAgICAgT2JqZWN0LmVudHJpZXMoc3R5bGVzQmxvY2spLmZvckVhY2goKFtzdHlsZU5hbWUsIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNOdW1iZXIgPSB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInO1xuICAgICAgICAgICAgY29uc3QgeyBpbnB1dCwgZGl2IH0gPSBjcmVhdGVJbnB1dChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHN0eWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdW5pdHM6ICcnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaXNOdW1iZXIgPyAnbnVtYmVyJyA6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZTtcbiAgICAgICAgICAgICAgICBjdXN0b21TdHlsZXNbY29tcG9uZW50XVtzdHlsZU5hbWVdID0gaXNOdW1iZXIgPyBwYXJzZUludCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlucHV0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG59O1xuXG5pbXBvcnRCdXR0b24/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGltcG9ydElucHV0Py5jbGljaygpO1xufSk7XG5cbmNvbnN0IGRvd25sb2FkID0gKGNvbnRlbnQsIGZpbGVOYW1lLCBjb250ZW50VHlwZSkgPT4ge1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgY29uc3QgZmlsZSA9IG5ldyBCbG9iKFtjb250ZW50XSwgeyB0eXBlOiBjb250ZW50VHlwZSB9KTtcblxuICAgIGEuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XG4gICAgYS5kb3dubG9hZCA9IGZpbGVOYW1lO1xuXG4gICAgYS5jbGljaygpO1xufTtcblxuZXhwb3J0IGNvbnN0IGluaXRWaWV3ID0gKGNvbmZpZywgc3R5bGVzOiBSZWNvcmQ8c3RyaW5nLCB7fT4pID0+IHtcbiAgICBhZGRJbnB1dHMoZGF0YUlucHV0c0NvbnRhaW5lciwgY29uZmlnKTtcbiAgICBhZGRTdHlsZXNJbnB1dHMoc3R5bGVzSW5wdXRzQ29udGFpbmVyLCBzdHlsZXMpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldElucHV0VmFsdWVzID0gKGNvbmZpZykgPT4ge1xuICAgIHJldHVybiBjb25maWcucmVkdWNlKChhY2MsIHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuICAgICAgICBhY2NbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0Tm9kZVZpZXcgPSAodGV4dCkgPT4ge1xuICAgIGlmIChub2RlVmlldyAhPT0gbnVsbCkge1xuICAgICAgICBub2RlVmlldy5pbm5lckhUTUwgPSB0ZXh0O1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBvbkFwcGx5U3R5bGVzID0gKGNiKSA9PiB7XG4gICAgdXBkYXRlU3R5bGVzQnV0dG9uPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY2IoY3VzdG9tU3R5bGVzKTtcbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBvblVwZGF0ZSA9IChjYikgPT4ge1xuICAgIHVwZGF0ZUJ1dHRvbj8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZUJ1dHRvbi5pbm5lckhUTUwgPSAnR2VuZXJhdGluZy4uLic7XG4gICAgICAgIHVwZGF0ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ3RydWUnKTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNiKCk7XG4gICAgICAgICAgICB1cGRhdGVCdXR0b24ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgdXBkYXRlQnV0dG9uLmlubmVySFRNTCA9ICdHZW5lcmF0ZSByYW5kb20gdHJlZSc7XG4gICAgICAgIH0sIDEpO1xuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IG9uRXhwb3J0ID0gKGNiKSA9PiB7XG4gICAgZXhwb3J0QnV0dG9uPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGNiKCk7XG5cbiAgICAgICAgZG93bmxvYWQoZGF0YSwgJ2RhdGEuanNvbicsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3Qgb25JbXBvcnQgPSAoY2IpID0+IHtcbiAgICBpbXBvcnRJbnB1dD8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICBpZiAoaW5wdXQ/LmZpbGVzPy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlucHV0LmZpbGVzWzBdLnRleHQoKS50aGVuKGNiKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFdyYXBwZXJXSCA9ICgpID0+IHtcbiAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHdyYXBwZXIgYXMgYW55IGFzIEVsZW1lbnQsIG51bGwpO1xuXG4gICAgcmV0dXJuIFtwYXJzZUludChzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd3aWR0aCcpKSwgcGFyc2VJbnQoc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnaGVpZ2h0JykpIC0gM107XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q2FudmFzID0gKCkgPT4ge1xuICAgIHJldHVybiBjYW52YXM7XG59O1xuIiwiaW1wb3J0IHsgRGF0YSwgRmxhbWVDaGFydCB9IGZyb20gJy4uLy4uL3NyYyc7XG5pbXBvcnQgeyBkZWZhdWx0VGltZUdyaWRTdHlsZXMgfSBmcm9tICcuLi8uLi9zcmMvZW5naW5lcy90aW1lLWdyaWQnO1xuaW1wb3J0IHsgZGVmYXVsdFJlbmRlclN0eWxlcyB9IGZyb20gJy4uLy4uL3NyYy9lbmdpbmVzL2Jhc2ljLXJlbmRlci1lbmdpbmUnO1xuaW1wb3J0IHsgZGVmYXVsdFRpbWVHcmlkUGx1Z2luU3R5bGVzIH0gZnJvbSAnLi4vLi4vc3JjL3BsdWdpbnMvdGltZS1ncmlkLXBsdWdpbic7XG5pbXBvcnQgeyBkZWZhdWx0VGltZWZyYW1lU2VsZWN0b3JQbHVnaW5TdHlsZXMgfSBmcm9tICcuLi8uLi9zcmMvcGx1Z2lucy90aW1lZnJhbWUtc2VsZWN0b3ItcGx1Z2luJztcbmltcG9ydCB7IGRlZmF1bHRUb2dnbGVQbHVnaW5TdHlsZXMgfSBmcm9tICcuLi8uLi9zcmMvcGx1Z2lucy90b2dnbGUtcGx1Z2luJztcbmltcG9ydCB7IGRlZmF1bHRXYXRlcmZhbGxQbHVnaW5TdHlsZXMgfSBmcm9tICcuLi8uLi9zcmMvcGx1Z2lucy93YXRlcmZhbGwtcGx1Z2luJztcblxuaW1wb3J0IHsgZ2VuZXJhdGVSYW5kb21UcmVlLCBtYXJrcywgd2F0ZXJmYWxsSW50ZXJ2YWxzLCB3YXRlcmZhbGxJdGVtcyB9IGZyb20gJy4vdGVzdC1kYXRhJztcbmltcG9ydCB7IHF1ZXJ5LCBpbml0UXVlcnkgfSBmcm9tICcuL3F1ZXJ5JztcbmltcG9ydCB7XG4gICAgaW5pdFZpZXcsXG4gICAgZ2V0SW5wdXRWYWx1ZXMsXG4gICAgc2V0Tm9kZVZpZXcsXG4gICAgb25BcHBseVN0eWxlcyxcbiAgICBvblVwZGF0ZSxcbiAgICBvbkV4cG9ydCxcbiAgICBvbkltcG9ydCxcbiAgICBnZXRXcmFwcGVyV0gsXG4gICAgZ2V0Q2FudmFzLFxufSBmcm9tICcuL3ZpZXcnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVDb25maWdJdGVtIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgdmFsdWU6IG51bWJlcjtcbiAgICB1bml0cz86IHN0cmluZztcbn1cblxuY29uc3QgdHJlZUNvbmZpZzogVHJlZUNvbmZpZ0l0ZW1bXSA9IFtcbiAgICB7IG5hbWU6ICdjb3VudCcsIHZhbHVlOiAxMDAwMDAgfSxcbiAgICB7IG5hbWU6ICdzdGFydCcsIHZhbHVlOiA1MDAgfSxcbiAgICB7IG5hbWU6ICdlbmQnLCB2YWx1ZTogNTAwMCB9LFxuICAgIHsgbmFtZTogJ21pbkNoaWxkJywgdmFsdWU6IDEgfSxcbiAgICB7IG5hbWU6ICdtYXhDaGlsZCcsIHZhbHVlOiAzIH0sXG4gICAgeyBuYW1lOiAndGhpbm5pbmcnLCB1bml0czogJyUnLCB2YWx1ZTogMTIgfSxcbiAgICB7IG5hbWU6ICdjb2xvcnNNb25vdG9ueScsIHZhbHVlOiA0MCB9LFxuICAgIHsgbmFtZTogJ2NvbG9yc0NvdW50JywgdmFsdWU6IDEwIH0sXG5dO1xuXG5jb25zdCBjb2xvcnMgPSB7XG4gICAgdGFzazogJyM2OTY5NjknLFxuICAgIGV2ZW50OiAnI2E0Nzc1YicsXG59O1xuXG5jb25zdCBnZW5lcmF0ZURhdGEgPSAoKSA9PiB7XG4gICAgY29uc3QgaW5wdXRzID0gZ2V0SW5wdXRWYWx1ZXModHJlZUNvbmZpZyk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdGVSYW5kb21UcmVlKGlucHV0cyk7XG59O1xuXG5sZXQgY3VycmVudERhdGE6IERhdGEgPSBxdWVyeSA/IFtdIDogZ2VuZXJhdGVEYXRhKCk7XG5cbmNvbnN0IFt3aWR0aCwgaGVpZ2h0XSA9IGdldFdyYXBwZXJXSCgpO1xuY29uc3QgY2FudmFzID0gZ2V0Q2FudmFzKCk7XG5cbmNhbnZhcy53aWR0aCA9IHdpZHRoO1xuY2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuY29uc3QgZmxhbWVDaGFydCA9IG5ldyBGbGFtZUNoYXJ0KHtcbiAgICBjYW52YXMsXG4gICAgZGF0YTogY3VycmVudERhdGEsXG4gICAgbWFya3MsXG4gICAgd2F0ZXJmYWxsOiB7XG4gICAgICAgIGl0ZW1zOiB3YXRlcmZhbGxJdGVtcyxcbiAgICAgICAgaW50ZXJ2YWxzOiB3YXRlcmZhbGxJbnRlcnZhbHMsXG4gICAgfSxcbiAgICBjb2xvcnMsXG59KTtcblxuZmxhbWVDaGFydC5vbignc2VsZWN0JywgKG5vZGUsIHR5cGUpID0+IHtcbiAgICBjb25zb2xlLmxvZygnc2VsZWN0Jywgbm9kZSwgdHlwZSk7XG4gICAgc2V0Tm9kZVZpZXcoXG4gICAgICAgIG5vZGVcbiAgICAgICAgICAgID8gYCR7dHlwZX1cXHJcXG4ke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIC4uLm5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgc291cmNlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC4uLm5vZGUuc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogJy4uLicsXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgJyAgJ1xuICAgICAgICAgICAgICApfWBcbiAgICAgICAgICAgIDogJydcbiAgICApO1xufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgY29uc3QgW3dpZHRoLCBoZWlnaHRdID0gZ2V0V3JhcHBlcldIKCk7XG5cbiAgICBmbGFtZUNoYXJ0LnJlc2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbn0pO1xuXG5vbkFwcGx5U3R5bGVzKChzdHlsZXMpID0+IHtcbiAgICBmbGFtZUNoYXJ0LnNldFNldHRpbmdzKHtcbiAgICAgICAgc3R5bGVzLFxuICAgIH0pO1xufSk7XG5cbm9uVXBkYXRlKCgpID0+IHtcbiAgICBjdXJyZW50RGF0YSA9IGdlbmVyYXRlRGF0YSgpO1xuXG4gICAgZmxhbWVDaGFydC5zZXREYXRhKGN1cnJlbnREYXRhKTtcbn0pO1xuXG5vbkltcG9ydCgoZGF0YSkgPT4ge1xuICAgIGN1cnJlbnREYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcblxuICAgIGZsYW1lQ2hhcnQuc2V0RGF0YShjdXJyZW50RGF0YSk7XG59KTtcblxub25FeHBvcnQoKCkgPT4ge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShjdXJyZW50RGF0YSk7XG59KTtcblxuaW5pdFF1ZXJ5KGZsYW1lQ2hhcnQpO1xuaW5pdFZpZXcodHJlZUNvbmZpZywge1xuICAgIG1haW46IGRlZmF1bHRSZW5kZXJTdHlsZXMsXG4gICAgdGltZUdyaWQ6IGRlZmF1bHRUaW1lR3JpZFN0eWxlcyxcbiAgICB0aW1lR3JpZFBsdWdpbjogZGVmYXVsdFRpbWVHcmlkUGx1Z2luU3R5bGVzLFxuICAgIHRpbWVmcmFtZVNlbGVjdG9yUGx1Z2luOiBkZWZhdWx0VGltZWZyYW1lU2VsZWN0b3JQbHVnaW5TdHlsZXMsXG4gICAgd2F0ZXJmYWxsUGx1Z2luOiBkZWZhdWx0V2F0ZXJmYWxsUGx1Z2luU3R5bGVzLFxuICAgIHRvZ2dsZVBsdWdpbjogZGVmYXVsdFRvZ2dsZVBsdWdpblN0eWxlcyxcbn0pO1xuIl0sIm5hbWVzIjpbImlzQXJyYXlpc2giLCJyZXF1aXJlJCQwIiwic3dpenpsZSIsInNpbXBsZVN3aXp6bGVNb2R1bGUiLCJyZXF1aXJlJCQxIiwiY29sb3JTdHJpbmdNb2R1bGUiLCJjb252ZXJ0IiwiY29udmVyc2lvbnNNb2R1bGUiLCJjb252ZXJzaW9ucyIsInJvdXRlIiwiQ29sb3IiLCJjb2xvciIsImNhbnZhcyJdLCJtYXBwaW5ncyI6Ijs7O0VBRUEsSUFBSSxNQUFNLENBQUM7QUFDWDtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVMsYUFBYSxHQUFHLEVBQUU7RUFDM0IsYUFBYSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlDO0VBQ0EsU0FBUyxZQUFZLEdBQUc7RUFDeEIsRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUMvQixDQUFDO0FBR0Q7RUFDQTtFQUNBO0VBQ0EsWUFBWSxDQUFDLFlBQVksR0FBRyxhQUFZO0FBQ3hDO0VBQ0EsWUFBWSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDbEM7RUFDQSxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7RUFDMUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0VBQzNDLFlBQVksQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztBQUNqRDtFQUNBO0VBQ0E7RUFDQSxZQUFZLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0FBQ3RDO0VBQ0EsWUFBWSxDQUFDLElBQUksR0FBRyxXQUFXO0VBQy9CLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7RUFDckIsRUFBRSxJQUFJLFlBQVksQ0FBQyxZQUFZLEVBQUU7RUFDakM7RUFDQSxJQUFJLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBb0MsRUFBRSxDQUV0RDtFQUNMLEdBQUc7QUFDSDtFQUNBLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FB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QUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUN2QixDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQzlCLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDaEMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztFQUMvQixDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBQzlCLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7RUFDOUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUMvQixDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDO0VBQzVCLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7RUFDM0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUM3QixDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQzNCLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDM0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUM3QixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBQzNCLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDL0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztFQUM3QixDQUFDLFNBQVMsRUFBRSxD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QUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBQ3hCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDMUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUMzQixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO0VBQzVCLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDN0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUM3QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQ3hCLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDN0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUM1QixDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQ3ZCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDdEIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUMzQixDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0VBQ3hCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7RUFDNUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUMxQixDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQ3pCLENBQUMsT0FBTyxFQUFFLENBQUMs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QUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7RUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7RUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7RUFDbEMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3BDLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUM1QyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDMUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBQzVDLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQzVDLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQ3BELENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUN0QyxDQUFDLENBQUM7QUFDRjtFQUNBO0VBQ0EsS0FBSyxJQUFJLEtBQUssSUFBSUQsU0FBTyxFQUFFO0VBQzNCLENBQUMsSUFBSUEsU0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtFQUNwQyxFQUFFLElBQUksRUFBRSxVQUFVLElBQUlBLFNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0VBQ3ZDLEdBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsR0FBRyxLQUFLLENBQUMsQ0FBQztFQUMxRCxHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksRUFBRSxRQUFRLElBQUlBLFNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0VBQ3JDLEdBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsR0FBRyxLQUFLLENBQUMsQ0FBQztFQUNoRSxHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUlBLFNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLQSxTQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxFQUFFO0VBQ2hFLEdBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsR0FBRyxLQUFLLENBQUMsQ0FBQztFQUNsRSxHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksUUFBUSxHQUFHQSxTQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDO0VBQ3pDLEVBQUUsSUFBSSxNQUFNLEdBQUdBLFNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7RUFDckMsRUFBRSxPQUFPQSxTQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDO0VBQ2pDLEVBQUUsT0FBT0EsU0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztFQUMvQixFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUNBLFNBQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztFQUN2RSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUNBLFNBQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztFQUNuRSxFQUFFO0VBQ0YsQ0FBQztBQUNEO0FBQ0FBLFdBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0VBQ2pDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3RCLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQzdCLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQzdCLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUN2QixDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtFQUNBLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxFQUFFO0VBQ2xCLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNSLEVBQUUsTUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7RUFDdkIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztFQUN0QixFQUFFLE1BQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO0VBQ3ZCLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO0VBQzFCLEVBQUUsTUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7RUFDdkIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUM7RUFDMUIsRUFBRTtBQUNGO0VBQ0EsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcs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LENBQUMsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0VBQ3BELENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7RUFDcEQsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztBQUNwRDtFQUNBLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7RUFDcEMsQ0FBQyxDQUFDO0FBQ0Y7QUFDQUEsV0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7RUFDakMsQ0FBQyxJQUFJLEdBQUcsR0FBR0EsU0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDaEMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1A7RUFDQSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUM7RUFDYixDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7RUFDVixDQUFDLENBQUMsSUFBSSxPQUFPLENBQUM7QUFDZDtFQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7RUFDbEUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztFQUNsRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2xFO0VBQ0EsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUNwQixDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ25CLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkI7RUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ2xCLENBQUMsQ0FBQztBQUNGO0FBQ0FBLFdBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0VBQ2pDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3RCLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDUixD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QUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDM0IsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztFQUNyQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ2pCLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9EO0VBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0VBQy9CLENBQUMsQ0FBQztBQUNGO0FBQ0FBLFdBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxFQUFFO0VBQ2pDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNyQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3RCLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUI7RUFDQSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzNCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDM0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNqQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3ZDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUNWO0VBQ0EsQ0FBQyxRQUFRLEVBQUU7RUFDWCxFQUFFLEtBQUssQ0FBQztFQUNSLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDcEIsRUFBRSxLQUFLLENBQUM7RUFDUixHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3BCLEVBQUUsS0FBSyxDQUFDO0VBQ1IsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNwQixFQUFFLEtBQUssQ0FBQztFQUNSLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDcEIsRUFBRSxLQUFLLENBQUM7RUFDUixHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3BCLEVBQUUsS0FBSyxDQUFDO0VBQ1IsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNwQixFQUFFO0VBQ0YsQ0FBQyxDQUFDO0FBQ0Y7QUFDQUEsV0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7RUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUN0QixDQUFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQzlCLENBQUMsSUFBSSxJQUFJLENBQUM7RUFDVixDQUFDLElBQUksRUFBRSxDQUFDO0VBQ1IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNQO0VBQ0EsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNqQixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDO0VBQ3ZCLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7RUFDZixDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7RUFDckMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNSO0VBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0VBQy9CLENBQUMsQ0FBQztBQUNGO0VBQ0E7QUFDQUEsV0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7RUFDakMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3RCLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUN2QixDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDdkIsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0VBQ3JCLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDUCxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtFQUNBO0VBQ0EsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7RUFDaEIsRUFBRSxFQUFFLElBQUksS0FBSyxDQUFDO0VBQ2QsRUFBRSxFQUFFLElBQUksS0FBSyxDQUFDO0VBQ2QsRUFBRTtBQUNGO0VBQ0EsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDdkIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUNaLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2Y7RUFDQSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRTtFQUN2QixFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ1osRUFBRTtBQUNGO0VBQ0EsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdkI7RUFDQSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDUCxDQUFDLFFBQVEsQ0FBQztFQUNWLEVBQUUsUUFBUTtFQUNWLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDVCxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU07RUFDdEMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNO0VBQ3RDLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtFQUN0QyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07RUFDdEMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNO0VBQ3RDLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTTtFQUN0QyxFQUFFO0FBQ0Y7RUFDQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0VBQ3BDLENBQUMsQ0FBQztBQUNGO0FBQ0FBLFdBQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLFVBQVUsSUFBSSxFQUFFO0VBQ25DLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUN2QixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDdkIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3ZCLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUN2QixDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtFQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ3RDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ3RDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDO0VBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztFQUNwQyxDQUFDLENBQUM7QUFDRjtBQUNBQSxXQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsRUFBRTtFQUNqQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3RCLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUN0QixDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ1AsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUDtFQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNsRCxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0VBQ2pELENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDakQ7RUFDQTtFQUNBLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTO0VBQ2xCLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEtBQUs7RUFDN0MsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ2Q7RUFDQSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUztFQUNsQixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxLQUFLO0VBQzdDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUNkO0VBQ0EsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVM7RUFDbEIsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksS0FBSztFQUM3QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDZDtFQUNBLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDakMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNqQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElB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QSxXQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxVQUFVLElBQUksRUFBRTtFQUN0QztFQUNBLENBQUMsSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFO0VBQ2xCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDaEMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNuQixFQUFFO0FBQ0Y7RUFDQSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDWjtFQUNBLENBQUMsSUFBSSxHQUFHLENBQUM7RUFDVCxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDekMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUNyRCxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzdCO0VBQ0EsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNsQixDQUFDLENBQUM7QUFDRjtBQUNBQSxXQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxVQUFVLElBQUksRUFBRTtFQUNsQyxDQUFDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFO0VBQ2xELEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUM7RUFDdkMsS0FBSyxJ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LEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztFQUN0QixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3RCO0VBQ0EsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7RUFDaEIsRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztFQUNyQyxFQUFFO0FBQ0Y7RUFDQSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUN0QixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDdEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQ2hCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNmLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ1o7RUFDQSxDQUFDLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7RUFDdkIsRUFBRSxLQUFLLENBQUM7RUFDUixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07RUFDaEQsRUFBRSxLQUFLLENBQUM7RUFDUixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07RUFDaEQsRUFBRSxLQUFLLENBQUM7RUFDUixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07RUFDaEQsRUFBRSxLQUFLLENBQUM7RUFDUixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07RUFDaEQsRUFBRSxLQUFLLENBQUM7RUFDUixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07RUFDaEQsRUFBRTtFQUNGLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3pDLEVBQUU7QUFDRjtFQUNBLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEI7RUFDQSxDQUFDLE9BQU87RUFDUixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksR0FBRztFQUMxQixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksR0FBRztFQUMxQixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxF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Q0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDekYsRUFBRTtBQUNGO0VBQ0EsQ0FBQyxLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUU7RUFDdkIsRUFBRSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7RUFDeEIsR0FBRyxPQUFPLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDbEYsR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7RUFDckIsRUFBRTtBQUNGO0VBQ0E7RUFDQSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbEMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3BDLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQztFQUNBLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzFHO0VBQ0EsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQzFDLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QztFQUNBLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUMxQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEM7RUFDQSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDckMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DO0VBQ0EsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3BDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQztFQUNBLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNwQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDdkMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3RDLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQztFQUNBLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFL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
