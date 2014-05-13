(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint eqnull: true */

module.exports.create = function() {

var Handlebars = {};

// BEGIN(BROWSER)

Handlebars.VERSION = "1.0.0";
Handlebars.COMPILER_REVISION = 4;

Handlebars.REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};

Handlebars.helpers  = {};
Handlebars.partials = {};

var toString = Object.prototype.toString,
    functionType = '[object Function]',
    objectType = '[object Object]';

Handlebars.registerHelper = function(name, fn, inverse) {
  if (toString.call(name) === objectType) {
    if (inverse || fn) { throw new Handlebars.Exception('Arg not supported with multiple helpers'); }
    Handlebars.Utils.extend(this.helpers, name);
  } else {
    if (inverse) { fn.not = inverse; }
    this.helpers[name] = fn;
  }
};

Handlebars.registerPartial = function(name, str) {
  if (toString.call(name) === objectType) {
    Handlebars.Utils.extend(this.partials,  name);
  } else {
    this.partials[name] = str;
  }
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Missing helper: '" + arg + "'");
  }
});

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;

  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(conditional, options) {
  var type = toString.call(conditional);
  if(type === functionType) { conditional = conditional.call(this); }

  if(!conditional || Handlebars.Utils.isEmpty(conditional)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(conditional, options) {
  return Handlebars.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn});
});

Handlebars.registerHelper('with', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
});

Handlebars.registerHelper('log', function(context, options) {
  var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
  Handlebars.log(level, context);
});

// END(BROWSER)

return Handlebars;
};

},{}],2:[function(require,module,exports){
exports.attach = function(Handlebars) {

// BEGIN(BROWSER)

Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = Handlebars.VM.program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = Handlebars.VM.program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common) {
          ret = {};
          Handlebars.Utils.extend(ret, common);
          Handlebars.Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);

      var compilerInfo = container.compilerInfo || [],
          compilerRevision = compilerInfo[0] || 1,
          currentRevision = Handlebars.COMPILER_REVISION;

      if (compilerRevision !== currentRevision) {
        if (compilerRevision < currentRevision) {
          var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision],
              compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
          throw "Template was precompiled with an older version of Handlebars than the current runtime. "+
                "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").";
        } else {
          // Use the embedded version info since the runtime doesn't know about this revision yet
          throw "Template was precompiled with a newer version of Handlebars than the current runtime. "+
                "Please update your runtime to a newer version ("+compilerInfo[1]+").";
        }
      }

      return result;
    };
  },

  programWithDepth: function(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var program = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    program.program = i;
    program.depth = args.length;
    return program;
  },
  program: function(i, fn, data) {
    var program = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    program.program = i;
    program.depth = 0;
    return program;
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;

// END(BROWSER)

return Handlebars;

};

},{}],3:[function(require,module,exports){
exports.attach = function(Handlebars) {

var toString = Object.prototype.toString;

// BEGIN(BROWSER)

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

var escapeChar = function(chr) {
  return escape[chr] || "&amp;";
};

Handlebars.Utils = {
  extend: function(obj, value) {
    for(var key in value) {
      if(value.hasOwnProperty(key)) {
        obj[key] = value[key];
      }
    }
  },

  escapeExpression: function(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof Handlebars.SafeString) {
      return string.toString();
    } else if (string == null || string === false) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = string.toString();

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  },

  isEmpty: function(value) {
    if (!value && value !== 0) {
      return true;
    } else if(toString.call(value) === "[object Array]" && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
};

// END(BROWSER)

return Handlebars;
};

},{}],4:[function(require,module,exports){
module.exports = exports = require('handlebars/lib/handlebars/base.js').create()
require('handlebars/lib/handlebars/utils.js').attach(exports)
require('handlebars/lib/handlebars/runtime.js').attach(exports)
},{"handlebars/lib/handlebars/base.js":1,"handlebars/lib/handlebars/runtime.js":2,"handlebars/lib/handlebars/utils.js":3}],5:[function(require,module,exports){

/**
 * Map Canvas application bootstrapperr
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var App, CanvasView, MapEvent, MapView, View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapEvent = require('./events/MapEvent.coffee');

View = require('./supers/View.coffee');

MapView = require('./views/MapView.coffee');

CanvasView = require('./views/CanvasView.coffee');

App = (function(_super) {
  __extends(App, _super);

  App.prototype.mapView = null;

  App.prototype.canvasView = null;

  App.prototype.wageData = null;

  function App(options) {
    this.onMouseMove = __bind(this.onMouseMove, this);
    App.__super__.constructor.call(this, options);
    this.canvasView = new CanvasView({
      wageData: this.wageData
    });
    this.mapView = new MapView({
      $canvas: this.canvasView.$el,
      canvasUpdateMethod: this.canvasView.update
    });
    this.addEventListeners();
    this.mapView.render();
  }

  App.prototype.addEventListeners = function() {
    this.listenTo(this.mapView, MapEvent.INITIALIZED, this.onMapInitialized);
    this.listenTo(this.mapView, MapEvent.ZOOM_CHANGED, this.onMapZoomChanged);
    return this.listenTo(this.mapView, MapEvent.DRAG, this.onMapDrag);
  };

  App.prototype.onMapInitialized = function() {
    this.canvasView.render();
    return _.delay((function(_this) {
      return function() {
        return _this.canvasView.updateCameraAngle();
      };
    })(this), 500);
  };

  App.prototype.onMapZoomChanged = function(zoom) {};

  App.prototype.onMapDrag = function() {
    return this.canvasView.onMapDrag();
  };

  App.prototype.onMouseMove = function(event) {
    return this.canvasView.onMouseMove({
      x: event.clientX,
      y: event.clienY
    });
  };

  return App;

})(View);

$(function() {
  return $.getJSON('assets/data/wages.json', function(wageData) {
    return new App({
      wageData: wageData
    });
  });
});


},{"./events/MapEvent.coffee":7,"./supers/View.coffee":8,"./views/CanvasView.coffee":10,"./views/MapView.coffee":11}],6:[function(require,module,exports){

/**
 * Map app configuration options
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapConfig;

MapConfig = {
  CANVAS_SIZE: 300,
  ID: 'damassi.control-room',
  INIT: {
    location: [41.09024, -95.712891],
    zoom: 4
  },
  MAP_OPTIONS: {
    minZoom: 4,
    maxZoom: 9
  }
};

module.exports = MapConfig;


},{}],7:[function(require,module,exports){

/**
 * Leaflet-related Map events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapEvent;

MapEvent = {
  DRAG_START: 'dragstart',
  DRAG: 'drag',
  DRAG_END: 'dragend',
  INITIALIZED: 'initialized',
  UPDATE: 'update',
  ZOOM_START: 'zoomstart',
  ZOOM_CHANGED: 'zoomend'
};

module.exports = MapEvent;


},{}],8:[function(require,module,exports){

/**
 * View superclass for shared functionality
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = (function(_super) {
  __extends(View, _super);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.initialize = function(options) {
    return _.extend(this, _.defaults(options = options || this.defaults, this.defaults || {}));
  };

  return View;

})(Backbone.View);

module.exports = View;


},{}],9:[function(require,module,exports){

/**
 * Generate a WINTR gradient based upon our styleguide
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.9.14
 */
var WintrGradient;

WintrGradient = {
  DEFAULT_SIZE: 512,
  COLORS: {
    plum: {
      light: '#A14F49',
      dark: '#5b1915'
    },
    green: {
      light: '#ADD4BF',
      dark: '#4E8273'
    },
    grey: {
      light: '#9F9F9F',
      dark: '#777777'
    },
    pink: '#FD6685',
    yellow: '#F8E99E',
    aqua: '#A6FCEB',
    orange: '#FC9170'
  },
  yellowPink: function() {
    return {
      start: this.COLORS.yellow,
      stop: this.COLORS.pink
    };
  },
  yellowAqua: function() {
    return {
      start: this.COLORS.yellow,
      stop: this.COLORS.aqua
    };
  },
  pinkAqua: function() {
    return {
      start: this.COLORS.pink,
      stop: this.COLORS.aqua
    };
  },
  yellowOrange: function() {
    return {
      start: this.COLORS.yellow,
      stop: this.COLORS.orange
    };
  },
  orangePink: function() {
    return {
      start: this.COLORS.orange,
      stop: this.COLORS.pink
    };
  },
  yellowGreen: function() {
    return {
      start: this.COLORS.yellow,
      stop: this.COLORS.green.light
    };
  },
  orangeAqua: function() {
    return {
      start: this.COLORS.orange,
      stop: this.COLORS.aqua
    };
  },
  generate: function(colorRange) {
    var canvas, context, gradient, start, stop;
    start = colorRange.start, stop = colorRange.stop;
    canvas = document.createElement('canvas');
    canvas.width = this.DEFAULT_SIZE;
    canvas.height = this.DEFAULT_SIZE;
    context = canvas.getContext('2d');
    context.rect(0, 0, this.DEFAULT_SIZE, this.DEFAULT_SIZE);
    gradient = context.createLinearGradient(0, 0, this.DEFAULT_SIZE, this.DEFAULT_SIZE);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, stop);
    context.fillStyle = gradient;
    context.fill();
    return canvas;
  }
};

module.exports = WintrGradient;


},{}],10:[function(require,module,exports){

/**
 * Canvas Layer which represents data to be displayed on the MapView
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var CanvasView, MapConfig, ThreeScene, View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapConfig = require('../config/MapConfig.coffee');

View = require('../supers/View.coffee');

ThreeScene = require('./ThreeScene.coffee');

CanvasView = (function(_super) {
  __extends(CanvasView, _super);

  function CanvasView() {
    this.onTick = __bind(this.onTick, this);
    this.updateCameraAngle = __bind(this.updateCameraAngle, this);
    this.update = __bind(this.update, this);
    return CanvasView.__super__.constructor.apply(this, arguments);
  }

  CanvasView.prototype.id = 'canvas-layer';

  CanvasView.prototype.render = function() {
    this.scenes = (_.range(this.wageData.length)).map((function(_this) {
      return function(scene, index) {
        return scene = new ThreeScene({
          index: index,
          wage: _this.wageData[index]
        });
      };
    })(this));
    this.scenes.forEach((function(_this) {
      return function(scene) {
        return _this.$el.append(scene.render().$el);
      };
    })(this));
    return _.defer((function(_this) {
      return function() {
        var sorted;
        sorted = _.sortBy(_this.scenes, function(a, b) {
          return a.$el.position().top;
        });
        sorted.forEach(function(scene, index) {
          return scene.$el.css('z-index', index);
        });
        return _this.onTick();
      };
    })(this));
  };

  CanvasView.prototype.update = function(canvasOverlay, params) {
    var left, top, _ref;
    _ref = this.$el.offset(), left = _ref.left, top = _ref.top;
    return this.wageData.forEach((function(_this) {
      return function(state, index) {
        var $el, $stat, scene, x, y, _ref1;
        _ref1 = canvasOverlay._map.latLngToContainerPoint([state.latitude, state.longitude]), x = _ref1.x, y = _ref1.y;
        if (_this.scenes && index < _this.wageData.length) {
          scene = _this.scenes[index];
          $el = scene.$el;
          $stat = scene.$stat;
          x = x - left - (MapConfig.CANVAS_SIZE * .5);
          y = y - top - (MapConfig.CANVAS_SIZE * .5);
          TweenMax.to($el, .6, {
            x: x,
            y: y,
            ease: Expo.easeOut
          });
          if ($stat != null ? $stat.length : void 0) {
            return TweenMax.to($stat, .6, {
              x: x,
              y: y,
              ease: Expo.easeOut
            });
          }
        }
      };
    })(this));
  };

  CanvasView.prototype.updateCameraAngle = function() {
    return this.scenes.forEach((function(_this) {
      return function(scene, index) {
        var dist, offset;
        scene = _this.scenes[index];
        offset = scene.$el.offset();
        dist = {
          x: ((window.innerWidth * .5) - (offset.left + (MapConfig.CANVAS_SIZE * .5))) * .01,
          y: ((window.innerHeight * .5) - (offset.top + (MapConfig.CANVAS_SIZE * .5))) * .01
        };
        return scene.updateCameraAngle(dist.x, -dist.y);
      };
    })(this));
  };

  CanvasView.prototype.onTick = function(event) {
    this.scenes.forEach(function(scene) {
      return scene.tick();
    });
    return requestAnimationFrame(this.onTick);
  };

  CanvasView.prototype.onUpdateZoom = function(zoom) {
    return console.log(zoom);
  };

  CanvasView.prototype.onMapDrag = function() {
    this.updateCameraAngle();
    return this.scenes.forEach(function(scene) {
      return scene.tick();
    });
  };

  return CanvasView;

})(View);

module.exports = CanvasView;


},{"../config/MapConfig.coffee":6,"../supers/View.coffee":8,"./ThreeScene.coffee":12}],11:[function(require,module,exports){

/**
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var CanvasView, MapConfig, MapEvent, MapView, View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapConfig = require('../config/MapConfig.coffee');

MapEvent = require('../events/MapEvent.coffee');

CanvasView = require('./CanvasView.coffee');

View = require('../supers/View.coffee');

MapView = (function(_super) {
  __extends(MapView, _super);

  MapView.prototype.id = 'map';

  MapView.prototype.mapbox = null;

  MapView.prototype.mapLayer = null;

  MapView.prototype.$leafletPane = null;

  MapView.prototype.$canvas = null;

  function MapView(options) {
    this.onMapDrag = __bind(this.onMapDrag, this);
    this.onZoomChanged = __bind(this.onZoomChanged, this);
    MapView.__super__.constructor.call(this, options);
    this.mapbox = L.mapbox;
    this.map = this.mapbox.map;
  }

  MapView.prototype.render = function() {
    this.$map = $('#map');
    this.mapLayer = this.mapbox.map(this.id, MapConfig.ID, MapConfig.MAP_OPTIONS).setView(MapConfig.INIT.location, MapConfig.INIT.zoom).addControl(this.mapbox.geocoderControl(MapConfig.ID));
    L.canvasOverlay().drawing(this.canvasUpdateMethod).addTo(this.mapLayer).redraw();
    TweenMax.set(this.$map, {
      autoAlpha: 0
    });
    _.defer((function(_this) {
      return function() {
        _this.mapLayer.setView(MapConfig.INIT.location, MapConfig.INIT.zoom + 1);
        return TweenMax.to(_this.$map, .7, {
          autoAlpha: 1,
          delay: .5,
          ease: Linear.easeNone
        });
      };
    })(this));
    this.insertCanvasLayer();
    return this.addEventListeners();
  };

  MapView.prototype.addEventListeners = function() {
    this.mapLayer.on(MapEvent.ZOOM_CHANGED, this.onZoomChanged);
    return this.mapLayer.on(MapEvent.DRAG, this.onMapDrag);
  };

  MapView.prototype.onZoomChanged = function(event) {
    return this.trigger(MapEvent.ZOOM_CHANGED, this.mapLayer.getZoom());
  };

  MapView.prototype.onMapDrag = function(event) {
    return this.trigger(MapEvent.DRAG);
  };

  MapView.prototype.insertCanvasLayer = function() {
    this.$leafletPane = $(".leaflet-objects-pane");
    this.$canvas.prependTo(this.$leafletPane);
    this.$canvas.css('z-index', 5);
    return this.trigger(MapEvent.INITIALIZED);
  };

  return MapView;

})(View);

module.exports = MapView;


},{"../config/MapConfig.coffee":6,"../events/MapEvent.coffee":7,"../supers/View.coffee":8,"./CanvasView.coffee":10}],12:[function(require,module,exports){

/**
 * Individual Three.js Scenes
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.8.14
 */
var MapConfig, ThreeScene, View, WintrGradient, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

WintrGradient = require('../utils/WintrGradient.coffee');

MapConfig = require('../config/MapConfig.coffee');

View = require('../supers/View.coffee');

template = require('./templates/scene-template.hbs');

ThreeScene = (function(_super) {
  __extends(ThreeScene, _super);

  ThreeScene.prototype.className = 'scene';

  function ThreeScene(options) {
    this.returnGradient = __bind(this.returnGradient, this);
    this.onMouseOut = __bind(this.onMouseOut, this);
    this.onMouseOver = __bind(this.onMouseOver, this);
    ThreeScene.__super__.constructor.call(this, options);
    this.setupThreeJSRenderer();
  }

  ThreeScene.prototype.render = function() {
    var size;
    size = MapConfig.CANVAS_SIZE;
    _.defer((function(_this) {
      return function() {
        _this.renderer.setSize(size, size);
        _this.$el.append(_this.renderer.domElement);
        _this.$el.parent().append(template({
          index: _this.index,
          state: _this.wage.state,
          wage: "$" + _this.wage.wage
        }));
        _this.$stat = _this.$el.parent().find("#stat-" + _this.index);
        TweenMax.fromTo(_this.$stat, .8, {
          autoAlpha: 0,
          scale: 1,
          top: 100
        }, {
          immediateRender: true,
          top: 140,
          autoAlpha: 1,
          scale: 1,
          ease: Expo.easeOut,
          delay: .7 + Math.random() * .6
        });
        return _this.addEventListeners();
      };
    })(this));
    return this;
  };

  ThreeScene.prototype.addEventListeners = function() {
    this.$stat.on('mouseover', this.onMouseOver);
    return this.$stat.on('mouseout', this.onMouseOut);
  };

  ThreeScene.prototype.tick = function() {
    if (this.cube) {
      this.cube.rotation.y += .01;
    }
    return this.renderer.render(this.scene, this.camera);
  };

  ThreeScene.prototype.updateCameraAngle = function(x, y) {
    this.camera.position.x = x;
    return this.camera.position.y = y;
  };

  ThreeScene.prototype.onMouseOver = function(event) {
    this.$el.parent().append(this.$stat);
    TweenMax.to(this.$stat, .4, {
      backgroundColor: '#fff',
      scale: 1.3,
      ease: Expo.easeOut
    });
    return TweenMax.to(this.$stat.find('.wage'), .4, {
      color: '#000'
    });
  };

  ThreeScene.prototype.onMouseOut = function(event) {
    TweenMax.to(this.$stat, .4, {
      backgroundColor: '#333',
      scale: 1,
      ease: Expo.easeOut
    });
    TweenMax.to(this.$stat.find('.wage'), .4, {
      color: '#fff'
    });
    return TweenMax.to(this.$stat.find('.state'), .4, {
      color: '#60a3d7',
      overwrite: 'all'
    });
  };

  ThreeScene.prototype.setupThreeJSRenderer = function() {
    var cameraAttributes;
    this.height = this.wage.wage !== 0 ? this.wage.wage * 3 : 2;
    cameraAttributes = {
      angle: 45,
      aspect: MapConfig.CANVAS_SIZE / MapConfig.CANVAS_SIZE,
      near: .1,
      far: 100
    };
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(cameraAttributes.angle, cameraAttributes.aspect, cameraAttributes.near, cameraAttributes.far);
    this.renderer = new THREE.CanvasRenderer({
      alpha: true
    });
    this.scene.add(this.returnRandomColorCube());
    this.renderer.setClearColor(0x000000, 0);
    return this.camera.position.z = 50;
  };

  ThreeScene.prototype.returnGradient = function(wage) {
    if (wage < 5) {
      return WintrGradient.generate(WintrGradient.yellowPink());
    }
    if (wage < 6 && wage > 5) {
      return WintrGradient.generate(WintrGradient.yellowPink());
    }
    if (wage < 7 && wage > 6) {
      return WintrGradient.generate(WintrGradient.yellowAqua());
    }
    if (wage < 8 && wage > 7) {
      return WintrGradient.generate(WintrGradient.yellowPink());
    }
    if (wage < 9 && wage > 8) {
      return WintrGradient.generate(WintrGradient.orangePink());
    }
    if (wage < 25 && wage > 9) {
      return WintrGradient.generate(WintrGradient.yellowGreen());
    }
  };

  ThreeScene.prototype.randomColor = function() {
    var color, i, letters, _i;
    letters = '0123456789ABCDEF'.split('');
    color = '#';
    for (i = _i = 0; _i <= 5; i = ++_i) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  ThreeScene.prototype.returnRandomColorCube = function() {
    var hex, i, _i, _ref;
    this.geometry = new THREE.BoxGeometry(2, this.height, 2);
    for (i = _i = 0, _ref = this.geometry.faces.length - 1; _i <= _ref; i = _i += +2) {
      hex = Math.random() * 0xffffff;
      this.geometry.faces[i].color.setHex(hex);
      this.geometry.faces[i + 1].color.setHex(hex);
    }
    this.material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
      overdraw: 0.5
    });
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.rotation.x = 20;
    this.cube.rotation.y = 20;
    return this.cube;
  };

  ThreeScene.prototype.returnGradientCube = function() {
    var material, texture;
    this.geometry = new THREE.BoxGeometry(2, this.height, 2, 2, 2, 2);
    texture = new THREE.Texture(this.returnGradient(this.wage.wage));
    texture.needsUpdate = true;
    material = new THREE.MeshBasicMaterial({
      map: texture,
      overdraw: 0.5
    });
    this.cube = new THREE.Mesh(this.geometry, material);
    this.cube.rotation.x = 20;
    this.cube.rotation.y = 20;
    return this.cube;
  };

  return ThreeScene;

})(View);

module.exports = ThreeScene;


},{"../config/MapConfig.coffee":6,"../supers/View.coffee":8,"../utils/WintrGradient.coffee":9,"./templates/scene-template.hbs":13}],13:[function(require,module,exports){
module.exports=require("handleify").template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function";


  buffer += "<div class='stats' id='stat-";
  if (stack1 = helpers.index) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.index; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n	<div class='wage'>\n		<span class='state'>";
  if (stack1 = helpers.state) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.state; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span> <span class='wage'>";
  if (stack1 = helpers.wage) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.wage; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n	</div>\n</div>";
  return buffer;
  })
},{"handleify":4}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcyIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9XSU5UUi9FeHBlcmltZW50cy9jYW52YXMtbWFwLWV4cGVyaW1lbnQvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L3J1bnRpbWUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvTWFwRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3V0aWxzL1dpbnRyR3JhZGllbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9XSU5UUi9FeHBlcmltZW50cy9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL1RocmVlU2NlbmUuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy90ZW1wbGF0ZXMvc2NlbmUtdGVtcGxhdGUuaGJzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7O0FDRkE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsd0NBQUE7RUFBQTs7aVNBQUE7O0FBQUEsUUFPQSxHQUFhLE9BQUEsQ0FBUSwwQkFBUixDQVBiLENBQUE7O0FBQUEsSUFRQSxHQUFhLE9BQUEsQ0FBUSxzQkFBUixDQVJiLENBQUE7O0FBQUEsT0FTQSxHQUFhLE9BQUEsQ0FBUSx3QkFBUixDQVRiLENBQUE7O0FBQUEsVUFVQSxHQUFhLE9BQUEsQ0FBUSwyQkFB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bnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmpzaGludCBlcW51bGw6IHRydWUgKi9cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG5cbnZhciBIYW5kbGViYXJzID0ge307XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcblxufTtcbiIsImV4cG9ydHMuYXR0YWNoID0gZnVuY3Rpb24oSGFuZGxlYmFycykge1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbkhhbmRsZWJhcnMuRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICB2YXIgdG1wID0gRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgLy8gVW5mb3J0dW5hdGVseSBlcnJvcnMgYXJlIG5vdCBlbnVtZXJhYmxlIGluIENocm9tZSAoYXQgbGVhc3QpLCBzbyBgZm9yIHByb3AgaW4gdG1wYCBkb2Vzbid0IHdvcmsuXG4gIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGVycm9yUHJvcHMubGVuZ3RoOyBpZHgrKykge1xuICAgIHRoaXNbZXJyb3JQcm9wc1tpZHhdXSA9IHRtcFtlcnJvclByb3BzW2lkeF1dO1xuICB9XG59O1xuSGFuZGxlYmFycy5FeGNlcHRpb24ucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5cbi8vIEJ1aWxkIG91dCBvdXIgYmFzaWMgU2FmZVN0cmluZyB0eXBlXG5IYW5kbGViYXJzLlNhZmVTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59O1xuSGFuZGxlYmFycy5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zdHJpbmcudG9TdHJpbmcoKTtcbn07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG52YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufTtcblxuSGFuZGxlYmFycy5VdGlscyA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbihvYmosIHZhbHVlKSB7XG4gICAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICAgIGlmKHZhbHVlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBlc2NhcGVFeHByZXNzaW9uOiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gICAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIEhhbmRsZWJhcnMuU2FmZVN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nID09IG51bGwgfHwgc3RyaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgLy8gRm9yY2UgYSBzdHJpbmcgY29udmVyc2lvbiBhcyB0aGlzIHdpbGwgYmUgZG9uZSBieSB0aGUgYXBwZW5kIHJlZ2FyZGxlc3MgYW5kXG4gICAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gICAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gICAgc3RyaW5nID0gc3RyaW5nLnRvU3RyaW5nKCk7XG5cbiAgICBpZighcG9zc2libGUudGVzdChzdHJpbmcpKSB7IHJldHVybiBzdHJpbmc7IH1cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmKHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IHJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvYmFzZS5qcycpLmNyZWF0ZSgpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3V0aWxzLmpzJykuYXR0YWNoKGV4cG9ydHMpXG5yZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL3J1bnRpbWUuanMnKS5hdHRhY2goZXhwb3J0cykiLCIjIyMqXG4gKiBNYXAgQ2FudmFzIGFwcGxpY2F0aW9uIGJvb3RzdHJhcHBlcnJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcEV2ZW50ICAgPSByZXF1aXJlICcuL2V2ZW50cy9NYXBFdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5NYXBWaWV3ICAgID0gcmVxdWlyZSAnLi92aWV3cy9NYXBWaWV3LmNvZmZlZSdcbkNhbnZhc1ZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcCBleHRlbmRzIFZpZXdcblxuXG4gICAjIE1hcEJveCBtYXAgdmlldyBjb250YWluaW5nIGFsbCBtYXAgcmVsYXRlZCBmdW5jdGlvbmFsaXR5XG4gICAjIEB0eXBlIHtMLk1hcEJveH1cblxuICAgbWFwVmlldzogbnVsbFxuXG5cbiAgICMgQ2FudmFzIHZpZXcgY29udGFpbmluZyBhbGwgY2FudmFzIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eVxuICAgIyBAdHlwZSB7Q2FudmFzVmlld31cblxuICAgY2FudmFzVmlldzogbnVsbFxuXG5cbiAgICMgSlNPTiBEYXRhIG9mIHdhZ2VzIGFuZCBsYXQsIGxuZyBieSBzdGF0ZVxuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIHdhZ2VEYXRhOiBudWxsXG5cblxuXG5cbiAgICMgSW5pdGlhbGl6ZSBhcHAgYnkgY3JlYXRpbmcgYSBjYW52YXMgdmlldyBhbmQgYSBtYXB2aWV3XG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQGNhbnZhc1ZpZXcgPSBuZXcgQ2FudmFzVmlld1xuICAgICAgICAgd2FnZURhdGE6IEB3YWdlRGF0YVxuXG4gICAgICBAbWFwVmlldyA9IG5ldyBNYXBWaWV3XG4gICAgICAgICAkY2FudmFzOiBAY2FudmFzVmlldy4kZWxcbiAgICAgICAgIGNhbnZhc1VwZGF0ZU1ldGhvZDogQGNhbnZhc1ZpZXcudXBkYXRlXG5cbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG4gICAgICBAbWFwVmlldy5yZW5kZXIoKVxuXG5cblxuXG5cblxuICAgIyBBZGQgYXBwLXdpZGUgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCAgICBNYXBFdmVudC5JTklUSUFMSVpFRCwgIEBvbk1hcEluaXRpYWxpemVkXG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsICAgIE1hcEV2ZW50LlpPT01fQ0hBTkdFRCwgQG9uTWFwWm9vbUNoYW5nZWRcbiAgICAgIEBsaXN0ZW5UbyBAbWFwVmlldywgICAgTWFwRXZlbnQuRFJBRywgICAgICAgICBAb25NYXBEcmFnXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtYXAgaW5pdGlhbGl6YXRpb24gZXZlbnRzLiAgUmVjZWl2ZWQgZnJvbSB0aGUgTWFwVmlldyB3aGljaFxuICAgIyBraWNrcyBvZmYgY2FudmFzIHJlbmRlcmluZyBhbmQgMy5qcyBpbnN0YW50aWF0aW9uXG5cbiAgIG9uTWFwSW5pdGlhbGl6ZWQ6IC0+XG4gICAgICBAY2FudmFzVmlldy5yZW5kZXIoKVxuICAgICAgXy5kZWxheSA9PlxuICAgICAgICAgQGNhbnZhc1ZpZXcudXBkYXRlQ2FtZXJhQW5nbGUoKVxuICAgICAgLCA1MDBcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHpvb20gY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge051bWJlcn0gem9vbSBUaGUgY3VycmVudCBtYXAgem9vbVxuXG4gICBvbk1hcFpvb21DaGFuZ2VkOiAoem9vbSkgLT5cblxuXG5cblxuXG4gICBvbk1hcERyYWc6IC0+XG4gICAgICBAY2FudmFzVmlldy5vbk1hcERyYWcoKVxuXG5cblxuXG5cbiAgIG9uTW91c2VNb3ZlOiAoZXZlbnQpID0+XG4gICAgICBAY2FudmFzVmlldy5vbk1vdXNlTW92ZVxuICAgICAgICAgeDogZXZlbnQuY2xpZW50WFxuICAgICAgICAgeTogZXZlbnQuY2xpZW5ZXG5cblxuXG5cbiMgS2ljayBvZmYgQXBwIGFuZCBsb2FkIGV4dGVybmFsIHdhZ2UgZGF0YVxuXG4kIC0+XG4gICAkLmdldEpTT04gJ2Fzc2V0cy9kYXRhL3dhZ2VzLmpzb24nLCAod2FnZURhdGEpIC0+XG4gICAgICBuZXcgQXBwXG4gICAgICAgICB3YWdlRGF0YTogd2FnZURhdGFcbiIsIiMjIypcbiAqIE1hcCBhcHAgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbk1hcENvbmZpZyA9XG5cblxuICAgIyBXaWR0aCBvZiBlYWNoIGluZGl2aWR1YWwgY2FudmFzIHNxdWFyZVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBDQU5WQVNfU0laRTogMzAwXG5cbiAgICMgVW5pcXVlIGlkZW50aWZpZXIgZm9yIE1hcEJveCBhcHBcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgSUQ6ICdkYW1hc3NpLmNvbnRyb2wtcm9vbSdcblxuXG4gICAjIE1hcCBsYW5kcyBvbiBTZWF0dGxlIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIElOSVQ6XG4gICAgICBsb2NhdGlvbjogWzQxLjA5MDI0LCAtOTUuNzEyODkxXVxuICAgICAgem9vbTogNFxuXG5cblxuICAgTUFQX09QVElPTlM6XG4gICAgICBtaW5ab29tOiA0XG4gICAgICBtYXhab29tOiA5XG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENvbmZpZyIsIiMjIypcbiAqIExlYWZsZXQtcmVsYXRlZCBNYXAgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbk1hcEV2ZW50ID1cblxuICAgRFJBR19TVEFSVDogICAgICAgJ2RyYWdzdGFydCdcbiAgIERSQUc6ICAgICAgICAgICAgICdkcmFnJ1xuICAgRFJBR19FTkQ6ICAgICAgICAgJ2RyYWdlbmQnXG5cbiAgICMgVHJpZ2dlcmVkIG9uY2UgdGhlIE1hcEJveCBtYXAgaXMgaW5pdGlhbGl6ZWQgYW5kIHJlbmRlcmVkIHRvIHRoZSBET01cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgSU5JVElBTElaRUQ6ICAgICAgJ2luaXRpYWxpemVkJ1xuICAgVVBEQVRFOiAgICAgICAgICAgJ3VwZGF0ZSdcbiAgIFpPT01fU1RBUlQ6ICAgICAgICd6b29tc3RhcnQnXG4gICBaT09NX0NIQU5HRUQ6ICAgICAnem9vbWVuZCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEV2ZW50IiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGZvciBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuY2xhc3MgVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuXG4gICAjIFZpZXcgY29uc3RydWN0b3Igd2hpY2ggYWNjZXB0cyBwYXJhbWV0ZXJzIGFuZCBtZXJnZXMgdGhlbVxuICAgIyBpbnRvIHRoZSB2aWV3IHByb3RvdHlwZSBmb3IgZWFzeSBhY2Nlc3MuXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgICAjIE1lcmdlIHBhc3NlZCBwcm9wcyBvciBpbnN0YW5jZSBkZWZhdWx0c1xuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlldyIsIiMjIypcbiAqIEdlbmVyYXRlIGEgV0lOVFIgZ3JhZGllbnQgYmFzZWQgdXBvbiBvdXIgc3R5bGVndWlkZVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS45LjE0XG4jIyNcblxuXG5XaW50ckdyYWRpZW50ID1cblxuICAgIyBEZWZhdWx0IHNpemUgb2YgdGhlIGNhbnZhcyB0byBiZSBkcmF3biB1cG9uXG4gICAjIEB0eXBlIHtOdW1iZXJ9XG5cbiAgIERFRkFVTFRfU0laRTogNTEyXG5cblxuICAgIyBCYXNlIGNvbG9ycyBmb3IgY29tcG9zaW5nIGdyYWRpZW50c1xuICAgIyBAdHlwZSB7T2JqZWN0fVxuXG4gICBDT0xPUlM6XG4gICAgICBwbHVtOlxuICAgICAgICAgbGlnaHQ6ICcjQTE0RjQ5J1xuICAgICAgICAgZGFyazogICcjNWIxOTE1J1xuXG4gICAgICBncmVlbjpcbiAgICAgICAgIGxpZ2h0OiAnI0FERDRCRidcbiAgICAgICAgIGRhcms6ICAnIzRFODI3MydcblxuICAgICAgZ3JleTpcbiAgICAgICAgIGxpZ2h0OiAnIzlGOUY5RidcbiAgICAgICAgIGRhcms6ICAnIzc3Nzc3NydcblxuICAgICAgcGluazogICAgICcjRkQ2Njg1J1xuICAgICAgeWVsbG93OiAgICcjRjhFOTlFJ1xuICAgICAgYXF1YTogICAgICcjQTZGQ0VCJ1xuICAgICAgb3JhbmdlOiAgICcjRkM5MTcwJ1xuXG5cblxuICAgeWVsbG93UGluazogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLnllbGxvdywgc3RvcDogQENPTE9SUy5waW5rIH1cblxuICAgeWVsbG93QXF1YTogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLnllbGxvdywgc3RvcDogQENPTE9SUy5hcXVhIH1cblxuICAgcGlua0FxdWE6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy5waW5rLCBzdG9wOiBAQ09MT1JTLmFxdWEgfVxuXG4gICB5ZWxsb3dPcmFuZ2U6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy55ZWxsb3csIHN0b3A6IEBDT0xPUlMub3JhbmdlIH1cblxuICAgb3JhbmdlUGluazogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLm9yYW5nZSwgc3RvcDogQENPTE9SUy5waW5rIH1cblxuICAgeWVsbG93R3JlZW46IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy55ZWxsb3csIHN0b3A6IEBDT0xPUlMuZ3JlZW4ubGlnaHQgfVxuXG4gICBvcmFuZ2VBcXVhOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMub3JhbmdlLCBzdG9wOiBAQ09MT1JTLmFxdWEgfVxuXG5cblxuICAgIyBHZW5lcmF0ZXMgYSBjb2xvciBncmFkaWVudCBieSB0YWtpbmcgYW4gb2JqZWN0IGNvbnNpc3Rpbmcgb2ZcbiAgICMgYHN0YXJ0YCBhbmQgYHN0b3BgIGFuZCBiZWxlbmRpbmcgdGhlbSB0b2dldGhlciB3aXRoaW4gYSBjdHhcbiAgICMgQHBhcmFtIHtPYmplY3R9IGNvbG9yUmFuZ2VcbiAgICMgQHJldHVybiB7Q29udGV4dH1cblxuICAgZ2VuZXJhdGU6IChjb2xvclJhbmdlKSAtPlxuICAgICAge3N0YXJ0LCBzdG9wfSA9IGNvbG9yUmFuZ2VcblxuICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnY2FudmFzJ1xuICAgICAgY2FudmFzLndpZHRoICA9IEBERUZBVUxUX1NJWkVcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBAREVGQVVMVF9TSVpFXG5cbiAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCAnMmQnXG5cbiAgICAgIGNvbnRleHQucmVjdCAwLCAwLCBAREVGQVVMVF9TSVpFLCBAREVGQVVMVF9TSVpFXG4gICAgICBncmFkaWVudCA9IGNvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQgMCwgMCwgQERFRkFVTFRfU0laRSwgQERFRkFVTFRfU0laRVxuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wIDAsIHN0YXJ0XG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AgMSwgc3RvcFxuXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyYWRpZW50XG4gICAgICBjb250ZXh0LmZpbGwoKVxuXG4gICAgICByZXR1cm4gY2FudmFzXG5cblxubW9kdWxlLmV4cG9ydHMgPSBXaW50ckdyYWRpZW50IiwiIyMjKlxuICogQ2FudmFzIExheWVyIHdoaWNoIHJlcHJlc2VudHMgZGF0YSB0byBiZSBkaXNwbGF5ZWQgb24gdGhlIE1hcFZpZXdcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcENvbmZpZyAgPSByZXF1aXJlICcuLi9jb25maWcvTWFwQ29uZmlnLmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5UaHJlZVNjZW5lID0gcmVxdWlyZSAnLi9UaHJlZVNjZW5lLmNvZmZlZSdcblxuXG5jbGFzcyBDYW52YXNWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgSUQgb2YgRE9NIGNvbnRhaW5lciBmb3IgY2FudmFzIGxheWVyXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGlkOiAnY2FudmFzLWxheWVyJ1xuXG5cblxuICAgIyBJbnN0YW50aWF0ZSBUaHJlZS5qcyBzY2VuZXMgYmFzZWQgdXBvbiBudW1iZXIgb2YgZGF0YXBvaW50cyBpbiB0aGUgSlNPTlxuXG4gICByZW5kZXI6IC0+XG5cbiAgICAgICMgQ3JlYXRlIHNjZW5lc1xuICAgICAgQHNjZW5lcyA9IChfLnJhbmdlIEB3YWdlRGF0YS5sZW5ndGgpLm1hcCAoc2NlbmUsIGluZGV4KSA9PlxuICAgICAgICAgc2NlbmUgPSBuZXcgVGhyZWVTY2VuZVxuICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICB3YWdlOiBAd2FnZURhdGFbaW5kZXhdXG5cbiAgICAgICMgQXBwZW5kIHRvIGRvbSBhbmQgc3RhcnQgdGlja2VyXG4gICAgICBAc2NlbmVzLmZvckVhY2ggKHNjZW5lKSA9PlxuICAgICAgICAgQCRlbC5hcHBlbmQgc2NlbmUucmVuZGVyKCkuJGVsXG5cbiAgICAgICMgV2FpdCBmb3IgYXBwZW5kaW5nIGFuZCB0aGVuIHNvcnQgLyByZW5kZXJcbiAgICAgIF8uZGVmZXIgPT5cblxuICAgICAgICAgc29ydGVkID0gXy5zb3J0QnkgQHNjZW5lcywgKGEsIGIpIC0+XG4gICAgICAgICAgICByZXR1cm4gYS4kZWwucG9zaXRpb24oKS50b3BcblxuICAgICAgICAgc29ydGVkLmZvckVhY2ggKHNjZW5lLCBpbmRleCkgLT5cbiAgICAgICAgICAgIHNjZW5lLiRlbC5jc3MgJ3otaW5kZXgnLCBpbmRleFxuXG4gICAgICAgICBAb25UaWNrKClcblxuXG5cblxuXG4gICAjIFVwZGF0ZSB0aGUgY2FudmFzIGxheWVyIHdoZW5ldmVyIHRoZXJlIGlzIGEgem9vbSBhY3Rpb25cbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gY2FudmFzT3ZlcmxheVxuICAgIyBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG5cbiAgIHVwZGF0ZTogKGNhbnZhc092ZXJsYXksIHBhcmFtcykgPT5cbiAgICAgIHtsZWZ0LCB0b3B9ID0gQCRlbC5vZmZzZXQoKVxuXG4gICAgICBAd2FnZURhdGEuZm9yRWFjaCAoc3RhdGUsIGluZGV4KSA9PlxuICAgICAgICAge3gsIHl9ID0gY2FudmFzT3ZlcmxheS5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQgW3N0YXRlLmxhdGl0dWRlLCBzdGF0ZS5sb25naXR1ZGVdXG5cbiAgICAgICAgIGlmIEBzY2VuZXMgYW5kIGluZGV4IDwgQHdhZ2VEYXRhLmxlbmd0aFxuICAgICAgICAgICAgc2NlbmUgID0gQHNjZW5lc1tpbmRleF1cbiAgICAgICAgICAgICRlbCAgICA9IHNjZW5lLiRlbFxuICAgICAgICAgICAgJHN0YXQgPSBzY2VuZS4kc3RhdFxuXG4gICAgICAgICAgICB4ID0geCAtIGxlZnQgLSAoTWFwQ29uZmlnLkNBTlZBU19TSVpFICogLjUpXG4gICAgICAgICAgICB5ID0geSAtIHRvcCAgLSAoTWFwQ29uZmlnLkNBTlZBU19TSVpFICogLjUpXG5cbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvICRlbCwgICAuNiwgeDogeCwgeTogeSwgZWFzZTogRXhwby5lYXNlT3V0XG4gICAgICAgICAgICBUd2Vlbk1heC50byAkc3RhdCwgLjYsIHg6IHgsIHk6IHksIGVhc2U6IEV4cG8uZWFzZU91dCBpZiAkc3RhdD8ubGVuZ3RoXG5cblxuXG5cblxuICAgdXBkYXRlQ2FtZXJhQW5nbGU6ID0+XG4gICAgICBAc2NlbmVzLmZvckVhY2ggKHNjZW5lLCBpbmRleCkgPT5cbiAgICAgICAgIHNjZW5lICA9IEBzY2VuZXNbaW5kZXhdXG4gICAgICAgICBvZmZzZXQgPSBzY2VuZS4kZWwub2Zmc2V0KClcblxuICAgICAgICAgIyBDb21wdXRlIHRoZSBkaXN0YW5jZSB0byB0aGUgY2VudGVyIG9mIHRoZSB3aW5kb3cuICBVc2VkIHRvIGNyZWF0ZVxuICAgICAgICAgIyBzd2F5IG11bHRpcGxlcyBmb3IgcGVyc3BlY3RpdmUgY2FtZXJhIGFuZ2xlXG5cbiAgICAgICAgIGRpc3QgPVxuICAgICAgICAgICAgeDogKCh3aW5kb3cuaW5uZXJXaWR0aCAgKiAuNSkgLSAob2Zmc2V0LmxlZnQgKyAoTWFwQ29uZmlnLkNBTlZBU19TSVpFICogLjUpKSkgKiAuMDFcbiAgICAgICAgICAgIHk6ICgod2luZG93LmlubmVySGVpZ2h0ICogLjUpIC0gKG9mZnNldC50b3AgICsgKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KSkpICogLjAxXG5cbiAgICAgICAgIHNjZW5lLnVwZGF0ZUNhbWVyYUFuZ2xlKCBkaXN0LngsIC1kaXN0LnkgKVxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgVEhSRUUuanMgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGV2ZW50IGxvb3AuICBVcGRhdGVzIGVhY2hcbiAgICMgaW52aWRpdmlkdWFsIGNhbnZhcyBsYXllciBpbiBzY2VuZXMgYXJyYXlcblxuICAgb25UaWNrOiAoZXZlbnQpID0+XG4gICAgICBAc2NlbmVzLmZvckVhY2ggKHNjZW5lKSAtPiBzY2VuZS50aWNrKClcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAb25UaWNrXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGxheWVyIGFuZCBiZWdpbiBUSFJFRS5qcyB0aWNrZXJcbiAgICMgQHB1YmxpY1xuXG4gICBvblVwZGF0ZVpvb206ICh6b29tKSAtPlxuICAgICAgY29uc29sZS5sb2cgem9vbVxuXG5cblxuXG5cbiAgIG9uTWFwRHJhZzogLT5cbiAgICAgIEB1cGRhdGVDYW1lcmFBbmdsZSgpXG4gICAgICBAc2NlbmVzLmZvckVhY2ggKHNjZW5lKSAtPiBzY2VuZS50aWNrKClcblxuXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNWaWV3IiwiIyMjKlxuICogTWFwQm94IG1hcCBsYXllclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuTWFwQ29uZmlnICA9IHJlcXVpcmUgJy4uL2NvbmZpZy9NYXBDb25maWcuY29mZmVlJ1xuTWFwRXZlbnQgICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9NYXBFdmVudC5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi9DYW52YXNWaWV3LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgTWFwVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICAjIElEIG9mIHRoZSB2aWV3XG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGlkOiAnbWFwJ1xuXG5cbiAgICMgUHJveHkgTC5tYXBib3ggbmFtZXNwYWNlIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAdHlwZSB7TC5tYXBib3h9XG5cbiAgIG1hcGJveDogbnVsbFxuXG5cbiAgICMgTWFwQm94IG1hcCBsYXllclxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgIG1hcExheWVyOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIExlYWZsZXQgbGF5ZXIgdG8gaW5zZXJ0IG1hcCBiZWZvcmVcbiAgICMgQHR5cGUgeyR9XG5cbiAgICRsZWFmbGV0UGFuZTogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjYW52YXMgRE9NIGVsZW1lbnRcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICAkY2FudmFzOiBudWxsXG5cblxuXG4gICAjIEluaXRpYWxpemUgdGhlIE1hcExheWVyIGFuZCBraWNrIG9mZiBDYW52YXMgbGF5ZXIgcmVwb3NpdGlvbmluZ1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBEZWZhdWx0IG9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBhcHBcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAbWFwYm94ID0gTC5tYXBib3hcbiAgICAgIEBtYXAgICAgPSBAbWFwYm94Lm1hcFxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGJ5IGNyZWF0aW5nIHRoZSBNYXAgbGF5ZXIgYW5kIGluc2VydGluZyB0aGVcbiAgICMgY2FudmFzIERPTSBsYXllciBpbnRvIExlYWZsZXQncyBoaWFyY2h5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEAkbWFwID0gJCAnI21hcCdcblxuICAgICAgQG1hcExheWVyID0gQG1hcGJveC5tYXAgQGlkLCBNYXBDb25maWcuSUQsIE1hcENvbmZpZy5NQVBfT1BUSU9OU1xuICAgICAgICAgLnNldFZpZXcgICAgTWFwQ29uZmlnLklOSVQubG9jYXRpb24sIE1hcENvbmZpZy5JTklULnpvb21cbiAgICAgICAgIC5hZGRDb250cm9sIEBtYXBib3guZ2VvY29kZXJDb250cm9sIE1hcENvbmZpZy5JRFxuXG4gICAgICAjIEFkZCBhIGNhbnZhcyBvdmVybGF5IGFuZCBwYXNzIGluIGFuIHVwZGF0ZSBtZXRob2RcbiAgICAgIEwuY2FudmFzT3ZlcmxheSgpXG4gICAgICAgICAuZHJhd2luZyBAY2FudmFzVXBkYXRlTWV0aG9kXG4gICAgICAgICAuYWRkVG8gQG1hcExheWVyXG4gICAgICAgICAucmVkcmF3KClcblxuICAgICAgVHdlZW5NYXguc2V0IEAkbWFwLCBhdXRvQWxwaGE6IDBcblxuICAgICAgXy5kZWZlciA9PlxuICAgICAgICAgQG1hcExheWVyLnNldFZpZXcgTWFwQ29uZmlnLklOSVQubG9jYXRpb24sIE1hcENvbmZpZy5JTklULnpvb20gKyAxXG5cbiAgICAgICAgIFR3ZWVuTWF4LnRvIEAkbWFwLCAuNyxcbiAgICAgICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICAgICAgZGVsYXk6IC41XG4gICAgICAgICAgICBlYXNlOiBMaW5lYXIuZWFzZU5vbmVcblxuICAgICAgQGluc2VydENhbnZhc0xheWVyKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQG1hcExheWVyLm9uIE1hcEV2ZW50LlpPT01fQ0hBTkdFRCwgQG9uWm9vbUNoYW5nZWRcbiAgICAgIEBtYXBMYXllci5vbiBNYXBFdmVudC5EUkFHLCAgICAgICAgIEBvbk1hcERyYWdcblxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIEhhbmRsZXIgZm9yIHpvb20gY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge09iamVjdH0gZXZlbnRcblxuICAgb25ab29tQ2hhbmdlZDogKGV2ZW50KSA9PlxuICAgICAgQHRyaWdnZXIgTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAbWFwTGF5ZXIuZ2V0Wm9vbSgpXG5cblxuXG5cblxuICAgb25NYXBEcmFnOiAoZXZlbnQpID0+XG4gICAgICBAdHJpZ2dlciBNYXBFdmVudC5EUkFHXG5cblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgTW92ZXMgdGhlIGNhbnZhcyBsYXllciBpbnRvIHRoZSBMZWFmbGV0IERPTVxuXG4gICBpbnNlcnRDYW52YXNMYXllcjogLT5cbiAgICAgIEAkbGVhZmxldFBhbmUgPSAkIFwiLmxlYWZsZXQtb2JqZWN0cy1wYW5lXCJcbiAgICAgIEAkY2FudmFzLnByZXBlbmRUbyBAJGxlYWZsZXRQYW5lXG4gICAgICBAJGNhbnZhcy5jc3MgJ3otaW5kZXgnLCA1XG5cbiAgICAgIEB0cmlnZ2VyIE1hcEV2ZW50LklOSVRJQUxJWkVEXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwVmlldyIsIiMjIypcbiAqIEluZGl2aWR1YWwgVGhyZWUuanMgU2NlbmVzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjguMTRcbiMjI1xuXG5XaW50ckdyYWRpZW50ID0gcmVxdWlyZSAnLi4vdXRpbHMvV2ludHJHcmFkaWVudC5jb2ZmZWUnXG5NYXBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5WaWV3ICAgICAgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xudGVtcGxhdGUgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzL3NjZW5lLXRlbXBsYXRlLmhicydcblxuXG5jbGFzcyBUaHJlZVNjZW5lIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgQ2xhc3MgbmFtZSBvZiBET00gY29udGFpbmVyIGZvciBpbmRpdmlkdWFsIFRocmVlLmpzIHNjZW5lc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdzY2VuZSdcblxuXG5cblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAc2V0dXBUaHJlZUpTUmVuZGVyZXIoKVxuXG5cblxuXG4gICByZW5kZXI6IC0+XG4gICAgICBzaXplID0gTWFwQ29uZmlnLkNBTlZBU19TSVpFXG5cbiAgICAgICMgQWRkIFNjZW5lIGNhbnZhcyB0byB0aGUgZG9tXG4gICAgICBfLmRlZmVyID0+XG5cbiAgICAgICAgIEByZW5kZXJlci5zZXRTaXplIHNpemUsIHNpemVcblxuICAgICAgICAgIyBBcHBlbmQgdGhyZWUuanMgY2FudmFzXG4gICAgICAgICBAJGVsLmFwcGVuZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG4gICAgICAgICAjIERhdGEgLyBzdGF0c1xuICAgICAgICAgQCRlbC5wYXJlbnQoKS5hcHBlbmQgdGVtcGxhdGVcbiAgICAgICAgICAgIGluZGV4OiBAaW5kZXhcbiAgICAgICAgICAgIHN0YXRlOiBAd2FnZS5zdGF0ZVxuICAgICAgICAgICAgd2FnZTogXCIkI3tAd2FnZS53YWdlfVwiXG5cbiAgICAgICAgIEAkc3RhdCA9IEAkZWwucGFyZW50KCkuZmluZCBcIiNzdGF0LSN7QGluZGV4fVwiXG5cbiAgICAgICAgIFR3ZWVuTWF4LmZyb21UbyBAJHN0YXQsIC44LCBhdXRvQWxwaGE6IDAsIHNjYWxlOiAxLCB0b3A6IDEwMCxcbiAgICAgICAgICAgIGltbWVkaWF0ZVJlbmRlcjogdHJ1ZVxuICAgICAgICAgICAgdG9wOiAxNDBcbiAgICAgICAgICAgIGF1dG9BbHBoYTogMVxuICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuICAgICAgICAgICAgZGVsYXk6IC43ICsgTWF0aC5yYW5kb20oKSAqIC42XG5cbiAgICAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cbiAgICAgIEBcblxuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQCRzdGF0Lm9uICdtb3VzZW92ZXInLCBAb25Nb3VzZU92ZXJcbiAgICAgIEAkc3RhdC5vbiAnbW91c2VvdXQnLCAgQG9uTW91c2VPdXRcblxuXG5cblxuICAgdGljazogLT5cbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgKz0gLjAxIGlmIEBjdWJlXG4gICAgICBAcmVuZGVyZXIucmVuZGVyIEBzY2VuZSwgQGNhbWVyYVxuXG5cblxuXG4gICB1cGRhdGVDYW1lcmFBbmdsZTogKHgsIHkpIC0+XG4gICAgICBAY2FtZXJhLnBvc2l0aW9uLnggPSB4XG4gICAgICBAY2FtZXJhLnBvc2l0aW9uLnkgPSB5XG5cblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICBvbk1vdXNlT3ZlcjogKGV2ZW50KSA9PlxuICAgICAgQCRlbC5wYXJlbnQoKS5hcHBlbmQgQCRzdGF0XG5cbiAgICAgIFR3ZWVuTWF4LnRvIEAkc3RhdCwgLjQsXG4gICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJ1xuICAgICAgICAgc2NhbGU6IDEuM1xuICAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cbiAgICAgIFR3ZWVuTWF4LnRvIEAkc3RhdC5maW5kKCcud2FnZScpLCAuNCxcbiAgICAgICAgIGNvbG9yOiAnIzAwMCdcblxuXG5cblxuICAgb25Nb3VzZU91dDogKGV2ZW50KSA9PlxuICAgICAgVHdlZW5NYXgudG8gQCRzdGF0LCAuNCxcbiAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMzMzMnXG4gICAgICAgICBzY2FsZTogMVxuICAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cbiAgICAgIFR3ZWVuTWF4LnRvIEAkc3RhdC5maW5kKCcud2FnZScpLCAuNCxcbiAgICAgICAgIGNvbG9yOiAnI2ZmZidcblxuICAgICAgVHdlZW5NYXgudG8gQCRzdGF0LmZpbmQoJy5zdGF0ZScpLCAuNCxcbiAgICAgICAgIGNvbG9yOiAnIzYwYTNkNydcbiAgICAgICAgIG92ZXJ3cml0ZTogJ2FsbCdcblxuXG5cblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgc2V0dXBUaHJlZUpTUmVuZGVyZXI6IC0+XG4gICAgICBAaGVpZ2h0ID0gaWYgQHdhZ2Uud2FnZSBpc250IDAgdGhlbiBAd2FnZS53YWdlICogMyBlbHNlIDJcblxuICAgICAgY2FtZXJhQXR0cmlidXRlcyA9XG4gICAgICAgICBhbmdsZTogNDVcbiAgICAgICAgIGFzcGVjdDogTWFwQ29uZmlnLkNBTlZBU19TSVpFIC8gTWFwQ29uZmlnLkNBTlZBU19TSVpFXG4gICAgICAgICBuZWFyOiAuMVxuICAgICAgICAgZmFyOiAxMDBcblxuICAgICAgIyBTY2VuZSBwYXJhbWV0ZXJzXG4gICAgICBAc2NlbmUgICAgPSBuZXcgVEhSRUUuU2NlbmVcbiAgICAgIEBjYW1lcmEgICA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSBjYW1lcmFBdHRyaWJ1dGVzLmFuZ2xlLCBjYW1lcmFBdHRyaWJ1dGVzLmFzcGVjdCwgY2FtZXJhQXR0cmlidXRlcy5uZWFyLCBjYW1lcmFBdHRyaWJ1dGVzLmZhclxuICAgICAgQHJlbmRlcmVyID0gbmV3IFRIUkVFLkNhbnZhc1JlbmRlcmVyIGFscGhhOiB0cnVlXG5cbiAgICAgIEBzY2VuZS5hZGQgQHJldHVyblJhbmRvbUNvbG9yQ3ViZSgpXG5cbiAgICAgICMgVXBkYXRlIHZpZXdcbiAgICAgIEByZW5kZXJlci5zZXRDbGVhckNvbG9yIDB4MDAwMDAwLCAwXG4gICAgICBAY2FtZXJhLnBvc2l0aW9uLnogPSA1MFxuXG5cblxuXG4gICByZXR1cm5HcmFkaWVudDogKHdhZ2UpID0+XG4gICAgICBpZiB3YWdlIDwgNSAgICAgICAgICAgICAgICAgdGhlbiByZXR1cm4gV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd1BpbmsoKVxuICAgICAgaWYgd2FnZSA8IDYgICBhbmQgd2FnZSA+IDUgIHRoZW4gcmV0dXJuIFdpbnRyR3JhZGllbnQuZ2VuZXJhdGUgV2ludHJHcmFkaWVudC55ZWxsb3dQaW5rKClcbiAgICAgIGlmIHdhZ2UgPCA3ICAgYW5kIHdhZ2UgPiA2ICB0aGVuIHJldHVybiBXaW50ckdyYWRpZW50LmdlbmVyYXRlIFdpbnRyR3JhZGllbnQueWVsbG93QXF1YSgpXG4gICAgICBpZiB3YWdlIDwgOCAgIGFuZCB3YWdlID4gNyAgdGhlbiByZXR1cm4gV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd1BpbmsoKVxuICAgICAgaWYgd2FnZSA8IDkgICBhbmQgd2FnZSA+IDggIHRoZW4gcmV0dXJuIFdpbnRyR3JhZGllbnQuZ2VuZXJhdGUgV2ludHJHcmFkaWVudC5vcmFuZ2VQaW5rKClcbiAgICAgIGlmIHdhZ2UgPCAyNSAgYW5kIHdhZ2UgPiA5ICB0aGVuIHJldHVybiBXaW50ckdyYWRpZW50LmdlbmVyYXRlIFdpbnRyR3JhZGllbnQueWVsbG93R3JlZW4oKVxuXG5cblxuXG4gICByYW5kb21Db2xvcjogLT5cbiAgICAgIGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQgJydcbiAgICAgIGNvbG9yID0gJyMnXG4gICAgICBmb3IgaSBpbiBbMC4uNV1cbiAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTYpXVxuXG4gICAgICByZXR1cm4gY29sb3JcblxuXG5cblxuICAgcmV0dXJuUmFuZG9tQ29sb3JDdWJlOiAtPlxuICAgICAgQGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5IDIsIEBoZWlnaHQsIDJcblxuICAgICAgZm9yIGkgaW4gWzAuLkBnZW9tZXRyeS5mYWNlcy5sZW5ndGggLSAxXSBieSArMlxuICAgICAgICAgaGV4ID0gTWF0aC5yYW5kb20oKSAqIDB4ZmZmZmZmXG4gICAgICAgICBAZ2VvbWV0cnkuZmFjZXNbaV0uY29sb3Iuc2V0SGV4IGhleFxuICAgICAgICAgQGdlb21ldHJ5LmZhY2VzW2kgKyAxXS5jb2xvci5zZXRIZXggaGV4XG5cbiAgICAgIEBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCB2ZXJ0ZXhDb2xvcnM6IFRIUkVFLkZhY2VDb2xvcnMsIG92ZXJkcmF3OiAwLjVcbiAgICAgIEBjdWJlID0gbmV3IFRIUkVFLk1lc2ggQGdlb21ldHJ5LCBAbWF0ZXJpYWxcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnggPSAyMFxuICAgICAgQGN1YmUucm90YXRpb24ueSA9IDIwXG5cbiAgICAgIHJldHVybiBAY3ViZVxuXG5cblxuXG4gICByZXR1cm5HcmFkaWVudEN1YmU6IC0+XG4gICAgICBAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkgMiwgQGhlaWdodCwgMiwgMiwgMiwgMlxuXG4gICAgICB0ZXh0dXJlICA9IG5ldyBUSFJFRS5UZXh0dXJlIEByZXR1cm5HcmFkaWVudCBAd2FnZS53YWdlXG4gICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZVxuXG4gICAgICBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBtYXA6IHRleHR1cmUsIG92ZXJkcmF3OiAwLjUgfSApXG4gICAgICBAY3ViZSA9IG5ldyBUSFJFRS5NZXNoKCBAZ2VvbWV0cnksIG1hdGVyaWFsIClcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnggPSAyMFxuICAgICAgQGN1YmUucm90YXRpb24ueSA9IDIwXG5cbiAgICAgIHJldHVybiBAY3ViZVxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUaHJlZVNjZW5lIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcImhhbmRsZWlmeVwiKS50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgZnVuY3Rpb25UeXBlPVwiZnVuY3Rpb25cIjtcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9J3N0YXRzJyBpZD0nc3RhdC1cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuaW5kZXgpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLmluZGV4OyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiJz5cXG5cdDxkaXYgY2xhc3M9J3dhZ2UnPlxcblx0XHQ8c3BhbiBjbGFzcz0nc3RhdGUnPlwiO1xuICBpZiAoc3RhY2sxID0gaGVscGVycy5zdGF0ZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAuc3RhdGU7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L3NwYW4+IDxzcGFuIGNsYXNzPSd3YWdlJz5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMud2FnZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAud2FnZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIjwvc3Bhbj5cXG5cdDwvZGl2PlxcbjwvZGl2PlwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9KSJdfQ==
