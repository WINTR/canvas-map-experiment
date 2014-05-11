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
    return this.canvasView.render();
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
    location: [40.09024, -95.712891],
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
          TweenMax.set($el, {
            x: x,
            y: y
          });
          if ($stat != null ? $stat.length : void 0) {
            return TweenMax.set($stat, {
              x: x,
              y: y
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
    this.mapLayer = this.mapbox.map(this.id, MapConfig.ID, MapConfig.MAP_OPTIONS).setView(MapConfig.INIT.location, MapConfig.INIT.zoom).addControl(this.mapbox.geocoderControl(MapConfig.ID));
    L.canvasOverlay().drawing(this.canvasUpdateMethod).addTo(this.mapLayer).redraw();
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
    this.onClick = __bind(this.onClick, this);
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

  ThreeScene.prototype.onClick = function(event) {
    return console.log(this.wage.wage);
  };

  ThreeScene.prototype.onMouseOver = function(event) {
    return this.$el.parent().append(this.$stat);
  };

  ThreeScene.prototype.onMouseOut = function(event) {};

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
  buffer += "</span> ";
  if (stack1 = helpers.wage) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.wage; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</div>\n</div>";
  return buffer;
  })
},{"handleify":4}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ydW50aW1lLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvY29uZmlnL01hcENvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvZXZlbnRzL01hcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdXRpbHMvV2ludHJHcmFkaWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvQ2FudmFzVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvVGhyZWVTY2VuZS5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvdGVtcGxhdGVzL3NjZW5lLXRlbXBsYXRlLmhicyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0FBQSxNQUF0QixFQUE4QixDQUE5QixFQUFpQyxDQUFqQyxFQUFvQyxDQUFwQyxFQUF1QyxDQUF2QyxDQUFoQixDQUFBO0FBQUEsSUFFQSxPQUFBLEdBQWUsSUFBQSxLQUFLLENBQUMsT0FBTixDQUFjLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBdEIsQ0FBZCxDQUZmLENBQUE7QUFBQSxJQUdBLE9BQU8sQ0FBQyxXQUFSLEdBQXNCLElBSHRCLENBQUE7QUFBQSxJQUtBLFFBQUEsR0FBZSxJQUFBLEtBQUssQ0FBQyxpQkFBTixDQUF5QjtBQUFBLE1BQUUsR0FBQSxFQUFLLE9BQVA7QUFBQSxNQUFnQixRQUFBLEVBQVUsR0FBMUI7S0FBekIsQ0FMZixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBWSxJQUFDLENBQUEsUUFBYixFQUF1QixRQUF2QixDQU5aLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsRUFQbkIsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixHQUFtQixFQVJuQixDQUFBO0FBVUEsV0FBTyxJQUFDLENBQUEsSUFBUixDQVhpQjtFQUFBLENBeEpwQixDQUFBOztvQkFBQTs7R0FOc0IsS0FiekIsQ0FBQTs7QUFBQSxNQTZMTSxDQUFDLE9BQVAsR0FBaUIsVUE3TGpCLENBQUE7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qanNoaW50IGVxbnVsbDogdHJ1ZSAqL1xuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGUgPSBmdW5jdGlvbigpIHtcblxudmFyIEhhbmRsZWJhcnMgPSB7fTtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WRVJTSU9OID0gXCIxLjAuMFwiO1xuSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTiA9IDQ7XG5cbkhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc+PSAxLjAuMCdcbn07XG5cbkhhbmRsZWJhcnMuaGVscGVycyAgPSB7fTtcbkhhbmRsZWJhcnMucGFydGlhbHMgPSB7fTtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcbiAgICBmdW5jdGlvblR5cGUgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciA9IGZ1bmN0aW9uKG5hbWUsIGZuLCBpbnZlcnNlKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgaWYgKGludmVyc2UgfHwgZm4pIHsgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGludmVyc2UpIHsgZm4ubm90ID0gaW52ZXJzZTsgfVxuICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICB9XG59O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCA9IGZ1bmN0aW9uKG5hbWUsIHN0cikge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsICBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gc3RyO1xuICB9XG59O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdoZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oYXJnKSB7XG4gIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgaGVscGVyOiAnXCIgKyBhcmcgKyBcIidcIik7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlIHx8IGZ1bmN0aW9uKCkge30sIGZuID0gb3B0aW9ucy5mbjtcblxuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG5cbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZihjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuKHRoaXMpO1xuICB9IGVsc2UgaWYoY29udGV4dCA9PT0gZmFsc2UgfHwgY29udGV4dCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gIH0gZWxzZSBpZih0eXBlID09PSBcIltvYmplY3QgQXJyYXldXCIpIHtcbiAgICBpZihjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmbihjb250ZXh0KTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMuSyA9IGZ1bmN0aW9uKCkge307XG5cbkhhbmRsZWJhcnMuY3JlYXRlRnJhbWUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uKG9iamVjdCkge1xuICBIYW5kbGViYXJzLksucHJvdG90eXBlID0gb2JqZWN0O1xuICB2YXIgb2JqID0gbmV3IEhhbmRsZWJhcnMuSygpO1xuICBIYW5kbGViYXJzLksucHJvdG90eXBlID0gbnVsbDtcbiAgcmV0dXJuIG9iajtcbn07XG5cbkhhbmRsZWJhcnMubG9nZ2VyID0ge1xuICBERUJVRzogMCwgSU5GTzogMSwgV0FSTjogMiwgRVJST1I6IDMsIGxldmVsOiAzLFxuXG4gIG1ldGhvZE1hcDogezA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InfSxcblxuICAvLyBjYW4gYmUgb3ZlcnJpZGRlbiBpbiB0aGUgaG9zdCBlbnZpcm9ubWVudFxuICBsb2c6IGZ1bmN0aW9uKGxldmVsLCBvYmopIHtcbiAgICBpZiAoSGFuZGxlYmFycy5sb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBIYW5kbGViYXJzLmxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlW21ldGhvZF0pIHtcbiAgICAgICAgY29uc29sZVttZXRob2RdLmNhbGwoY29uc29sZSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMubG9nID0gZnVuY3Rpb24obGV2ZWwsIG9iaikgeyBIYW5kbGViYXJzLmxvZ2dlci5sb2cobGV2ZWwsIG9iaik7IH07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBmbiA9IG9wdGlvbnMuZm4sIGludmVyc2UgPSBvcHRpb25zLmludmVyc2U7XG4gIHZhciBpID0gMCwgcmV0ID0gXCJcIiwgZGF0YTtcblxuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKG9wdGlvbnMuZGF0YSkge1xuICAgIGRhdGEgPSBIYW5kbGViYXJzLmNyZWF0ZUZyYW1lKG9wdGlvbnMuZGF0YSk7XG4gIH1cblxuICBpZihjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgIGlmKGNvbnRleHQgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICBmb3IodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgICAgaWYgKGRhdGEpIHsgZGF0YS5pbmRleCA9IGk7IH1cbiAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtpXSwgeyBkYXRhOiBkYXRhIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgIGlmKGNvbnRleHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGlmKGRhdGEpIHsgZGF0YS5rZXkgPSBrZXk7IH1cbiAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2tleV0sIHtkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYoaSA9PT0gMCl7XG4gICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29uZGl0aW9uYWwpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29uZGl0aW9uYWwgPSBjb25kaXRpb25hbC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoIWNvbmRpdGlvbmFsIHx8IEhhbmRsZWJhcnMuVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5pbnZlcnNlKHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7Zm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbn0pO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3dpdGgnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAoIUhhbmRsZWJhcnMuVXRpbHMuaXNFbXB0eShjb250ZXh0KSkgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgbGV2ZWwgPSBvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmxldmVsICE9IG51bGwgPyBwYXJzZUludChvcHRpb25zLmRhdGEubGV2ZWwsIDEwKSA6IDE7XG4gIEhhbmRsZWJhcnMubG9nKGxldmVsLCBjb250ZXh0KTtcbn0pO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG59O1xuIiwiZXhwb3J0cy5hdHRhY2ggPSBmdW5jdGlvbihIYW5kbGViYXJzKSB7XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbkhhbmRsZWJhcnMuVk0gPSB7XG4gIHRlbXBsYXRlOiBmdW5jdGlvbih0ZW1wbGF0ZVNwZWMpIHtcbiAgICAvLyBKdXN0IGFkZCB3YXRlclxuICAgIHZhciBjb250YWluZXIgPSB7XG4gICAgICBlc2NhcGVFeHByZXNzaW9uOiBIYW5kbGViYXJzLlV0aWxzLmVzY2FwZUV4cHJlc3Npb24sXG4gICAgICBpbnZva2VQYXJ0aWFsOiBIYW5kbGViYXJzLlZNLmludm9rZVBhcnRpYWwsXG4gICAgICBwcm9ncmFtczogW10sXG4gICAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgICAgICB2YXIgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldO1xuICAgICAgICBpZihkYXRhKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4sIGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgICAgfSxcbiAgICAgIG1lcmdlOiBmdW5jdGlvbihwYXJhbSwgY29tbW9uKSB7XG4gICAgICAgIHZhciByZXQgPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgICAgaWYgKHBhcmFtICYmIGNvbW1vbikge1xuICAgICAgICAgIHJldCA9IHt9O1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgY29tbW9uKTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIHBhcmFtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfSxcbiAgICAgIHByb2dyYW1XaXRoRGVwdGg6IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbVdpdGhEZXB0aCxcbiAgICAgIG5vb3A6IEhhbmRsZWJhcnMuVk0ubm9vcCxcbiAgICAgIGNvbXBpbGVySW5mbzogbnVsbFxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICB2YXIgcmVzdWx0ID0gdGVtcGxhdGVTcGVjLmNhbGwoY29udGFpbmVyLCBIYW5kbGViYXJzLCBjb250ZXh0LCBvcHRpb25zLmhlbHBlcnMsIG9wdGlvbnMucGFydGlhbHMsIG9wdGlvbnMuZGF0YSk7XG5cbiAgICAgIHZhciBjb21waWxlckluZm8gPSBjb250YWluZXIuY29tcGlsZXJJbmZvIHx8IFtdLFxuICAgICAgICAgIGNvbXBpbGVyUmV2aXNpb24gPSBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgICAgICBjdXJyZW50UmV2aXNpb24gPSBIYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OO1xuXG4gICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiAhPT0gY3VycmVudFJldmlzaW9uKSB7XG4gICAgICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICAgICAgdmFyIHJ1bnRpbWVWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYW4gb2xkZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitydW50aW1lVmVyc2lvbnMrXCIpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJWZXJzaW9ucytcIikuXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitjb21waWxlckluZm9bMV0rXCIpLlwiO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfSxcblxuICBwcm9ncmFtV2l0aERlcHRoOiBmdW5jdGlvbihpLCBmbiwgZGF0YSAvKiwgJGRlcHRoICovKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDMpO1xuXG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIFtjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YV0uY29uY2F0KGFyZ3MpKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IGFyZ3MubGVuZ3RoO1xuICAgIHJldHVybiBwcm9ncmFtO1xuICB9LFxuICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSAwO1xuICAgIHJldHVybiBwcm9ncmFtO1xuICB9LFxuICBub29wOiBmdW5jdGlvbigpIHsgcmV0dXJuIFwiXCI7IH0sXG4gIGludm9rZVBhcnRpYWw6IGZ1bmN0aW9uKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB7IGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuXG4gICAgaWYocGFydGlhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgZm91bmRcIik7XG4gICAgfSBlbHNlIGlmKHBhcnRpYWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIGlmICghSGFuZGxlYmFycy5jb21waWxlKSB7XG4gICAgICB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgY29tcGlsZWQgd2hlbiBydW5uaW5nIGluIHJ1bnRpbWUtb25seSBtb2RlXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWFsc1tuYW1lXSA9IEhhbmRsZWJhcnMuY29tcGlsZShwYXJ0aWFsLCB7ZGF0YTogZGF0YSAhPT0gdW5kZWZpbmVkfSk7XG4gICAgICByZXR1cm4gcGFydGlhbHNbbmFtZV0oY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLnRlbXBsYXRlID0gSGFuZGxlYmFycy5WTS50ZW1wbGF0ZTtcblxuLy8gRU5EKEJST1dTRVIpXG5cbnJldHVybiBIYW5kbGViYXJzO1xuXG59O1xuIiwiZXhwb3J0cy5hdHRhY2ggPSBmdW5jdGlvbihIYW5kbGViYXJzKSB7XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8vIEJFR0lOKEJST1dTRVIpXG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuSGFuZGxlYmFycy5FeGNlcHRpb24gPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cbn07XG5IYW5kbGViYXJzLkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbkhhbmRsZWJhcnMuU2FmZVN0cmluZyA9IGZ1bmN0aW9uKHN0cmluZykge1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcbn07XG5IYW5kbGViYXJzLlNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmluZy50b1N0cmluZygpO1xufTtcblxudmFyIGVzY2FwZSA9IHtcbiAgXCImXCI6IFwiJmFtcDtcIixcbiAgXCI8XCI6IFwiJmx0O1wiLFxuICBcIj5cIjogXCImZ3Q7XCIsXG4gICdcIic6IFwiJnF1b3Q7XCIsXG4gIFwiJ1wiOiBcIiYjeDI3O1wiLFxuICBcImBcIjogXCImI3g2MDtcIlxufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nO1xudmFyIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbnZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24oY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXSB8fCBcIiZhbXA7XCI7XG59O1xuXG5IYW5kbGViYXJzLlV0aWxzID0ge1xuICBleHRlbmQ6IGZ1bmN0aW9uKG9iaiwgdmFsdWUpIHtcbiAgICBmb3IodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgaWYodmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGVzY2FwZUV4cHJlc3Npb246IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgICBpZiAoc3RyaW5nIGluc3RhbmNlb2YgSGFuZGxlYmFycy5TYWZlU3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcgPT0gbnVsbCB8fCBzdHJpbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSBzdHJpbmcudG9TdHJpbmcoKTtcblxuICAgIGlmKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHsgcmV0dXJuIHN0cmluZzsgfVxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG4gIH0sXG5cbiAgaXNFbXB0eTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYodG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09IFwiW29iamVjdCBBcnJheV1cIiAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gcmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9iYXNlLmpzJykuY3JlYXRlKClcbnJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMnKS5hdHRhY2goZXhwb3J0cylcbnJlcXVpcmUoJ2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvcnVudGltZS5qcycpLmF0dGFjaChleHBvcnRzKSIsIiMjIypcbiAqIE1hcCBDYW52YXMgYXBwbGljYXRpb24gYm9vdHN0cmFwcGVyclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuTWFwRXZlbnQgICA9IHJlcXVpcmUgJy4vZXZlbnRzL01hcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuL3N1cGVycy9WaWV3LmNvZmZlZSdcbk1hcFZpZXcgICAgPSByZXF1aXJlICcuL3ZpZXdzL01hcFZpZXcuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvQ2FudmFzVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgTWFwQm94IG1hcCB2aWV3IGNvbnRhaW5pbmcgYWxsIG1hcCByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0wuTWFwQm94fVxuXG4gICBtYXBWaWV3OiBudWxsXG5cblxuICAgIyBDYW52YXMgdmlldyBjb250YWluaW5nIGFsbCBjYW52YXMgcmVsYXRlZCBmdW5jdGlvbmFsaXR5XG4gICAjIEB0eXBlIHtDYW52YXNWaWV3fVxuXG4gICBjYW52YXNWaWV3OiBudWxsXG5cblxuICAgIyBKU09OIERhdGEgb2Ygd2FnZXMgYW5kIGxhdCwgbG5nIGJ5IHN0YXRlXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgd2FnZURhdGE6IG51bGxcblxuXG5cblxuICAgIyBJbml0aWFsaXplIGFwcCBieSBjcmVhdGluZyBhIGNhbnZhcyB2aWV3IGFuZCBhIG1hcHZpZXdcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAY2FudmFzVmlldyA9IG5ldyBDYW52YXNWaWV3XG4gICAgICAgICB3YWdlRGF0YTogQHdhZ2VEYXRhXG5cbiAgICAgIEBtYXBWaWV3ID0gbmV3IE1hcFZpZXdcbiAgICAgICAgICRjYW52YXM6IEBjYW52YXNWaWV3LiRlbFxuICAgICAgICAgY2FudmFzVXBkYXRlTWV0aG9kOiBAY2FudmFzVmlldy51cGRhdGVcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcbiAgICAgIEBtYXBWaWV3LnJlbmRlcigpXG5cblxuXG5cblxuXG4gICAjIEFkZCBhcHAtd2lkZSBldmVudCBsaXN0ZW5lcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsICAgIE1hcEV2ZW50LklOSVRJQUxJWkVELCAgQG9uTWFwSW5pdGlhbGl6ZWRcbiAgICAgIEBsaXN0ZW5UbyBAbWFwVmlldywgICAgTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAb25NYXBab29tQ2hhbmdlZFxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCAgICBNYXBFdmVudC5EUkFHLCAgICAgICAgIEBvbk1hcERyYWdcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG1hcCBpbml0aWFsaXphdGlvbiBldmVudHMuICBSZWNlaXZlZCBmcm9tIHRoZSBNYXBWaWV3IHdoaWNoXG4gICAjIGtpY2tzIG9mZiBjYW52YXMgcmVuZGVyaW5nIGFuZCAzLmpzIGluc3RhbnRpYXRpb25cblxuICAgb25NYXBJbml0aWFsaXplZDogLT5cbiAgICAgIEBjYW52YXNWaWV3LnJlbmRlcigpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB6b29tIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IHpvb20gVGhlIGN1cnJlbnQgbWFwIHpvb21cblxuICAgb25NYXBab29tQ2hhbmdlZDogKHpvb20pIC0+XG5cblxuXG5cblxuICAgb25NYXBEcmFnOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcub25NYXBEcmFnKClcblxuXG5cblxuXG4gICBvbk1vdXNlTW92ZTogKGV2ZW50KSA9PlxuICAgICAgQGNhbnZhc1ZpZXcub25Nb3VzZU1vdmVcbiAgICAgICAgIHg6IGV2ZW50LmNsaWVudFhcbiAgICAgICAgIHk6IGV2ZW50LmNsaWVuWVxuXG5cblxuXG4jIEtpY2sgb2ZmIEFwcCBhbmQgbG9hZCBleHRlcm5hbCB3YWdlIGRhdGFcblxuJCAtPlxuICAgJC5nZXRKU09OICdhc3NldHMvZGF0YS93YWdlcy5qc29uJywgKHdhZ2VEYXRhKSAtPlxuICAgICAgbmV3IEFwcFxuICAgICAgICAgd2FnZURhdGE6IHdhZ2VEYXRhXG4iLCIjIyMqXG4gKiBNYXAgYXBwIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBDb25maWcgPVxuXG5cbiAgICMgV2lkdGggb2YgZWFjaCBpbmRpdmlkdWFsIGNhbnZhcyBzcXVhcmVcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQ0FOVkFTX1NJWkU6IDMwMFxuXG4gICAjIFVuaXF1ZSBpZGVudGlmaWVyIGZvciBNYXBCb3ggYXBwXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIElEOiAnZGFtYXNzaS5jb250cm9sLXJvb20nXG5cblxuICAgIyBNYXAgbGFuZHMgb24gU2VhdHRsZSBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBJTklUOlxuICAgICAgbG9jYXRpb246IFs0MC4wOTAyNCwgLTk1LjcxMjg5MV1cbiAgICAgIHpvb206IDRcblxuXG4gICBNQVBfT1BUSU9OUzpcbiAgICAgIG1pblpvb206IDRcbiAgICAgIG1heFpvb206IDlcblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ29uZmlnIiwiIyMjKlxuICogTGVhZmxldC1yZWxhdGVkIE1hcCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuTWFwRXZlbnQgPVxuXG4gICBEUkFHX1NUQVJUOiAgICAgICAnZHJhZ3N0YXJ0J1xuICAgRFJBRzogICAgICAgICAgICAgJ2RyYWcnXG4gICBEUkFHX0VORDogICAgICAgICAnZHJhZ2VuZCdcblxuICAgIyBUcmlnZ2VyZWQgb25jZSB0aGUgTWFwQm94IG1hcCBpcyBpbml0aWFsaXplZCBhbmQgcmVuZGVyZWQgdG8gdGhlIERPTVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBJTklUSUFMSVpFRDogICAgICAnaW5pdGlhbGl6ZWQnXG4gICBVUERBVEU6ICAgICAgICAgICAndXBkYXRlJ1xuICAgWk9PTV9TVEFSVDogICAgICAgJ3pvb21zdGFydCdcbiAgIFpPT01fQ0hBTkdFRDogICAgICd6b29tZW5kJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwRXZlbnQiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgZm9yIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5jbGFzcyBWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG5cbiAgICMgVmlldyBjb25zdHJ1Y3RvciB3aGljaCBhY2NlcHRzIHBhcmFtZXRlcnMgYW5kIG1lcmdlcyB0aGVtXG4gICAjIGludG8gdGhlIHZpZXcgcHJvdG90eXBlIGZvciBlYXN5IGFjY2Vzcy5cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICAgICMgTWVyZ2UgcGFzc2VkIHByb3BzIG9yIGluc3RhbmNlIGRlZmF1bHRzXG4gICAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiIyMjKlxuICogR2VuZXJhdGUgYSBXSU5UUiBncmFkaWVudCBiYXNlZCB1cG9uIG91ciBzdHlsZWd1aWRlXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjkuMTRcbiMjI1xuXG5cbldpbnRyR3JhZGllbnQgPVxuXG4gICAjIERlZmF1bHQgc2l6ZSBvZiB0aGUgY2FudmFzIHRvIGJlIGRyYXduIHVwb25cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgREVGQVVMVF9TSVpFOiA1MTJcblxuXG4gICAjIEJhc2UgY29sb3JzIGZvciBjb21wb3NpbmcgZ3JhZGllbnRzXG4gICAjIEB0eXBlIHtPYmplY3R9XG5cbiAgIENPTE9SUzpcbiAgICAgIHBsdW06XG4gICAgICAgICBsaWdodDogJyNBMTRGNDknXG4gICAgICAgICBkYXJrOiAgJyM1YjE5MTUnXG5cbiAgICAgIGdyZWVuOlxuICAgICAgICAgbGlnaHQ6ICcjQURENEJGJ1xuICAgICAgICAgZGFyazogICcjNEU4MjczJ1xuXG4gICAgICBncmV5OlxuICAgICAgICAgbGlnaHQ6ICcjOUY5RjlGJ1xuICAgICAgICAgZGFyazogICcjNzc3Nzc3J1xuXG4gICAgICBwaW5rOiAgICAgJyNGRDY2ODUnXG4gICAgICB5ZWxsb3c6ICAgJyNGOEU5OUUnXG4gICAgICBhcXVhOiAgICAgJyNBNkZDRUInXG4gICAgICBvcmFuZ2U6ICAgJyNGQzkxNzAnXG5cblxuXG4gICB5ZWxsb3dQaW5rOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMueWVsbG93LCBzdG9wOiBAQ09MT1JTLnBpbmsgfVxuXG4gICB5ZWxsb3dBcXVhOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMueWVsbG93LCBzdG9wOiBAQ09MT1JTLmFxdWEgfVxuXG4gICBwaW5rQXF1YTogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLnBpbmssIHN0b3A6IEBDT0xPUlMuYXF1YSB9XG5cbiAgIHllbGxvd09yYW5nZTogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLnllbGxvdywgc3RvcDogQENPTE9SUy5vcmFuZ2UgfVxuXG4gICBvcmFuZ2VQaW5rOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMub3JhbmdlLCBzdG9wOiBAQ09MT1JTLnBpbmsgfVxuXG4gICB5ZWxsb3dHcmVlbjogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLnllbGxvdywgc3RvcDogQENPTE9SUy5ncmVlbi5saWdodCB9XG5cbiAgIG9yYW5nZUFxdWE6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy5vcmFuZ2UsIHN0b3A6IEBDT0xPUlMuYXF1YSB9XG5cblxuXG4gICAjIEdlbmVyYXRlcyBhIGNvbG9yIGdyYWRpZW50IGJ5IHRha2luZyBhbiBvYmplY3QgY29uc2lzdGluZyBvZlxuICAgIyBgc3RhcnRgIGFuZCBgc3RvcGAgYW5kIGJlbGVuZGluZyB0aGVtIHRvZ2V0aGVyIHdpdGhpbiBhIGN0eFxuICAgIyBAcGFyYW0ge09iamVjdH0gY29sb3JSYW5nZVxuICAgIyBAcmV0dXJuIHtDb250ZXh0fVxuXG4gICBnZW5lcmF0ZTogKGNvbG9yUmFuZ2UpIC0+XG4gICAgICB7c3RhcnQsIHN0b3B9ID0gY29sb3JSYW5nZVxuXG4gICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG4gICAgICBjYW52YXMud2lkdGggID0gQERFRkFVTFRfU0laRVxuICAgICAgY2FudmFzLmhlaWdodCA9IEBERUZBVUxUX1NJWkVcblxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcblxuICAgICAgY29udGV4dC5yZWN0IDAsIDAsIEBERUZBVUxUX1NJWkUsIEBERUZBVUxUX1NJWkVcbiAgICAgIGdyYWRpZW50ID0gY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudCAwLCAwLCBAREVGQVVMVF9TSVpFLCBAREVGQVVMVF9TSVpFXG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AgMCwgc3RhcnRcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCAxLCBzdG9wXG5cbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnRcbiAgICAgIGNvbnRleHQuZmlsbCgpXG5cbiAgICAgIHJldHVybiBjYW52YXNcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFdpbnRyR3JhZGllbnQiLCIjIyMqXG4gKiBDYW52YXMgTGF5ZXIgd2hpY2ggcmVwcmVzZW50cyBkYXRhIHRvIGJlIGRpc3BsYXllZCBvbiB0aGUgTWFwVmlld1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuTWFwQ29uZmlnICA9IHJlcXVpcmUgJy4uL2NvbmZpZy9NYXBDb25maWcuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblRocmVlU2NlbmUgPSByZXF1aXJlICcuL1RocmVlU2NlbmUuY29mZmVlJ1xuXG5cbmNsYXNzIENhbnZhc1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBJRCBvZiBET00gY29udGFpbmVyIGZvciBjYW52YXMgbGF5ZXJcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgaWQ6ICdjYW52YXMtbGF5ZXInXG5cblxuXG4gICAjIEluc3RhbnRpYXRlIFRocmVlLmpzIHNjZW5lcyBiYXNlZCB1cG9uIG51bWJlciBvZiBkYXRhcG9pbnRzIGluIHRoZSBKU09OXG5cbiAgIHJlbmRlcjogLT5cblxuICAgICAgIyBDcmVhdGUgc2NlbmVzXG4gICAgICBAc2NlbmVzID0gKF8ucmFuZ2UgQHdhZ2VEYXRhLmxlbmd0aCkubWFwIChzY2VuZSwgaW5kZXgpID0+XG4gICAgICAgICBzY2VuZSA9IG5ldyBUaHJlZVNjZW5lXG4gICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgICAgIHdhZ2U6IEB3YWdlRGF0YVtpbmRleF1cblxuICAgICAgIyBBcHBlbmQgdG8gZG9tIGFuZCBzdGFydCB0aWNrZXJcbiAgICAgIEBzY2VuZXMuZm9yRWFjaCAoc2NlbmUpID0+XG4gICAgICAgICBAJGVsLmFwcGVuZCBzY2VuZS5yZW5kZXIoKS4kZWxcblxuICAgICAgIyBXYWl0IGZvciBhcHBlbmRpbmcgYW5kIHRoZW4gc29ydCAvIHJlbmRlclxuICAgICAgXy5kZWZlciA9PlxuXG4gICAgICAgICBzb3J0ZWQgPSBfLnNvcnRCeSBAc2NlbmVzLCAoYSwgYikgLT5cbiAgICAgICAgICAgIHJldHVybiBhLiRlbC5wb3NpdGlvbigpLnRvcFxuXG4gICAgICAgICBzb3J0ZWQuZm9yRWFjaCAoc2NlbmUsIGluZGV4KSAtPlxuICAgICAgICAgICAgc2NlbmUuJGVsLmNzcyAnei1pbmRleCcsIGluZGV4XG5cbiAgICAgICAgIEBvblRpY2soKVxuXG5cblxuXG5cbiAgICMgVXBkYXRlIHRoZSBjYW52YXMgbGF5ZXIgd2hlbmV2ZXIgdGhlcmUgaXMgYSB6b29tIGFjdGlvblxuICAgIyBAcGFyYW0ge0hUTUxEb21FbGVtZW50fSBjYW52YXNPdmVybGF5XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcblxuICAgdXBkYXRlOiAoY2FudmFzT3ZlcmxheSwgcGFyYW1zKSA9PlxuICAgICAge2xlZnQsIHRvcH0gPSBAJGVsLm9mZnNldCgpXG5cbiAgICAgIEB3YWdlRGF0YS5mb3JFYWNoIChzdGF0ZSwgaW5kZXgpID0+XG4gICAgICAgICB7eCwgeX0gPSBjYW52YXNPdmVybGF5Ll9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludCBbc3RhdGUubGF0aXR1ZGUsIHN0YXRlLmxvbmdpdHVkZV1cblxuICAgICAgICAgaWYgQHNjZW5lcyBhbmQgaW5kZXggPCBAd2FnZURhdGEubGVuZ3RoXG4gICAgICAgICAgICBzY2VuZSAgPSBAc2NlbmVzW2luZGV4XVxuICAgICAgICAgICAgJGVsICAgID0gc2NlbmUuJGVsXG4gICAgICAgICAgICAkc3RhdCA9IHNjZW5lLiRzdGF0XG5cbiAgICAgICAgICAgIHggPSB4IC0gbGVmdCAtIChNYXBDb25maWcuQ0FOVkFTX1NJWkUgKiAuNSlcbiAgICAgICAgICAgIHkgPSB5IC0gdG9wICAtIChNYXBDb25maWcuQ0FOVkFTX1NJWkUgKiAuNSlcblxuICAgICAgICAgICAgVHdlZW5NYXguc2V0ICRlbCwgICB4OiB4LCB5OiB5XG4gICAgICAgICAgICBUd2Vlbk1heC5zZXQgJHN0YXQsIHg6IHgsIHk6IHkgaWYgJHN0YXQ/Lmxlbmd0aFxuXG5cblxuXG5cbiAgIHVwZGF0ZUNhbWVyYUFuZ2xlOiA9PlxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSwgaW5kZXgpID0+XG4gICAgICAgICBzY2VuZSAgPSBAc2NlbmVzW2luZGV4XVxuICAgICAgICAgb2Zmc2V0ID0gc2NlbmUuJGVsLm9mZnNldCgpXG5cbiAgICAgICAgICMgQ29tcHV0ZSB0aGUgZGlzdGFuY2UgdG8gdGhlIGNlbnRlciBvZiB0aGUgd2luZG93LiAgVXNlZCB0byBjcmVhdGVcbiAgICAgICAgICMgc3dheSBtdWx0aXBsZXMgZm9yIHBlcnNwZWN0aXZlIGNhbWVyYSBhbmdsZVxuXG4gICAgICAgICBkaXN0ID1cbiAgICAgICAgICAgIHg6ICgod2luZG93LmlubmVyV2lkdGggICogLjUpIC0gKG9mZnNldC5sZWZ0ICsgKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KSkpICogLjAxXG4gICAgICAgICAgICB5OiAoKHdpbmRvdy5pbm5lckhlaWdodCAqIC41KSAtIChvZmZzZXQudG9wICArIChNYXBDb25maWcuQ0FOVkFTX1NJWkUgKiAuNSkpKSAqIC4wMVxuXG4gICAgICAgICBzY2VuZS51cGRhdGVDYW1lcmFBbmdsZSggZGlzdC54LCAtZGlzdC55IClcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIFRIUkVFLmpzIHJlcXVlc3RBbmltYXRpb25GcmFtZSBldmVudCBsb29wLiAgVXBkYXRlcyBlYWNoXG4gICAjIGludmlkaXZpZHVhbCBjYW52YXMgbGF5ZXIgaW4gc2NlbmVzIGFycmF5XG5cbiAgIG9uVGljazogKGV2ZW50KSA9PlxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSkgLT4gc2NlbmUudGljaygpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQG9uVGlja1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBsYXllciBhbmQgYmVnaW4gVEhSRUUuanMgdGlja2VyXG4gICAjIEBwdWJsaWNcblxuICAgb25VcGRhdGVab29tOiAoem9vbSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIHpvb21cblxuXG5cblxuXG4gICBvbk1hcERyYWc6IC0+XG4gICAgICBAdXBkYXRlQ2FtZXJhQW5nbGUoKVxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSkgLT4gc2NlbmUudGljaygpXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzVmlldyIsIiMjIypcbiAqIE1hcEJveCBtYXAgbGF5ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcENvbmZpZyAgPSByZXF1aXJlICcuLi9jb25maWcvTWFwQ29uZmlnLmNvZmZlZSdcbk1hcEV2ZW50ICAgPSByZXF1aXJlICcuLi9ldmVudHMvTWFwRXZlbnQuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vQ2FudmFzVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIE1hcFZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBJRCBvZiB0aGUgdmlld1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBpZDogJ21hcCdcblxuXG4gICAjIFByb3h5IEwubWFwYm94IG5hbWVzcGFjZSBmb3IgZWFzeSBhY2Nlc3NcbiAgICMgQHR5cGUge0wubWFwYm94fVxuXG4gICBtYXBib3g6IG51bGxcblxuXG4gICAjIE1hcEJveCBtYXAgbGF5ZXJcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICBtYXBMYXllcjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBMZWFmbGV0IGxheWVyIHRvIGluc2VydCBtYXAgYmVmb3JlXG4gICAjIEB0eXBlIHskfVxuXG4gICAkbGVhZmxldFBhbmU6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgY2FudmFzIERPTSBlbGVtZW50XG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgJGNhbnZhczogbnVsbFxuXG5cblxuICAgIyBJbml0aWFsaXplIHRoZSBNYXBMYXllciBhbmQga2ljayBvZmYgQ2FudmFzIGxheWVyIHJlcG9zaXRpb25pbmdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgRGVmYXVsdCBvcHRpb25zIHRvIHBhc3MgaW50byB0aGUgYXBwXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG1hcGJveCA9IEwubWFwYm94XG4gICAgICBAbWFwICAgID0gQG1hcGJveC5tYXBcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBieSBjcmVhdGluZyB0aGUgTWFwIGxheWVyIGFuZCBpbnNlcnRpbmcgdGhlXG4gICAjIGNhbnZhcyBET00gbGF5ZXIgaW50byBMZWFmbGV0J3MgaGlhcmNoeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAbWFwTGF5ZXIgPSBAbWFwYm94Lm1hcCBAaWQsIE1hcENvbmZpZy5JRCwgTWFwQ29uZmlnLk1BUF9PUFRJT05TXG4gICAgICAgICAuc2V0VmlldyAgICBNYXBDb25maWcuSU5JVC5sb2NhdGlvbiwgTWFwQ29uZmlnLklOSVQuem9vbVxuICAgICAgICAgLmFkZENvbnRyb2wgQG1hcGJveC5nZW9jb2RlckNvbnRyb2wgTWFwQ29uZmlnLklEXG5cbiAgICAgICMgQWRkIGEgY2FudmFzIG92ZXJsYXkgYW5kIHBhc3MgaW4gYW4gdXBkYXRlIG1ldGhvZFxuICAgICAgTC5jYW52YXNPdmVybGF5KClcbiAgICAgICAgIC5kcmF3aW5nIEBjYW52YXNVcGRhdGVNZXRob2RcbiAgICAgICAgIC5hZGRUbyBAbWFwTGF5ZXJcbiAgICAgICAgIC5yZWRyYXcoKVxuXG4gICAgICBAaW5zZXJ0Q2FudmFzTGF5ZXIoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbWFwTGF5ZXIub24gTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAb25ab29tQ2hhbmdlZFxuICAgICAgQG1hcExheWVyLm9uIE1hcEV2ZW50LkRSQUcsICAgICAgICAgQG9uTWFwRHJhZ1xuXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgSGFuZGxlciBmb3Igem9vbSBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXG4gICBvblpvb21DaGFuZ2VkOiAoZXZlbnQpID0+XG4gICAgICBAdHJpZ2dlciBNYXBFdmVudC5aT09NX0NIQU5HRUQsIEBtYXBMYXllci5nZXRab29tKClcblxuXG5cblxuXG4gICBvbk1hcERyYWc6IChldmVudCkgPT5cbiAgICAgIEB0cmlnZ2VyIE1hcEV2ZW50LkRSQUdcblxuXG5cblxuXG5cbiAgICMgUFJJVkFURSBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIyBNb3ZlcyB0aGUgY2FudmFzIGxheWVyIGludG8gdGhlIExlYWZsZXQgRE9NXG5cbiAgIGluc2VydENhbnZhc0xheWVyOiAtPlxuICAgICAgQCRsZWFmbGV0UGFuZSA9ICQgXCIubGVhZmxldC1vYmplY3RzLXBhbmVcIlxuICAgICAgQCRjYW52YXMucHJlcGVuZFRvIEAkbGVhZmxldFBhbmVcbiAgICAgIEAkY2FudmFzLmNzcyAnei1pbmRleCcsIDVcblxuICAgICAgQHRyaWdnZXIgTWFwRXZlbnQuSU5JVElBTElaRURcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBWaWV3IiwiIyMjKlxuICogSW5kaXZpZHVhbCBUaHJlZS5qcyBTY2VuZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuOC4xNFxuIyMjXG5cbldpbnRyR3JhZGllbnQgPSByZXF1aXJlICcuLi91dGlscy9XaW50ckdyYWRpZW50LmNvZmZlZSdcbk1hcENvbmZpZyAgICAgPSByZXF1aXJlICcuLi9jb25maWcvTWFwQ29uZmlnLmNvZmZlZSdcblZpZXcgICAgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG50ZW1wbGF0ZSAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMvc2NlbmUtdGVtcGxhdGUuaGJzJ1xuXG5cbmNsYXNzIFRocmVlU2NlbmUgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBDbGFzcyBuYW1lIG9mIERPTSBjb250YWluZXIgZm9yIGluZGl2aWR1YWwgVGhyZWUuanMgc2NlbmVzXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGNsYXNzTmFtZTogJ3NjZW5lJ1xuXG5cblxuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBzZXR1cFRocmVlSlNSZW5kZXJlcigpXG5cblxuXG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIHNpemUgPSBNYXBDb25maWcuQ0FOVkFTX1NJWkVcblxuICAgICAgIyBBZGQgU2NlbmUgY2FudmFzIHRvIHRoZSBkb21cbiAgICAgIF8uZGVmZXIgPT5cblxuICAgICAgICAgQHJlbmRlcmVyLnNldFNpemUgc2l6ZSwgc2l6ZVxuXG4gICAgICAgICAjIEFwcGVuZCB0aHJlZS5qcyBjYW52YXNcbiAgICAgICAgIEAkZWwuYXBwZW5kIEByZW5kZXJlci5kb21FbGVtZW50XG5cbiAgICAgICAgICMgRGF0YSAvIHN0YXRzXG4gICAgICAgICBAJGVsLnBhcmVudCgpLmFwcGVuZCB0ZW1wbGF0ZVxuICAgICAgICAgICAgaW5kZXg6IEBpbmRleFxuICAgICAgICAgICAgc3RhdGU6IEB3YWdlLnN0YXRlXG4gICAgICAgICAgICB3YWdlOiBcIiQje0B3YWdlLndhZ2V9XCJcblxuICAgICAgICAgQCRzdGF0ID0gQCRlbC5wYXJlbnQoKS5maW5kIFwiI3N0YXQtI3tAaW5kZXh9XCJcblxuICAgICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuICAgICAgQFxuXG5cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAJHN0YXQub24gJ21vdXNlb3ZlcicsIEBvbk1vdXNlT3ZlclxuICAgICAgQCRzdGF0Lm9uICdtb3VzZW91dCcsICBAb25Nb3VzZU91dFxuXG5cblxuXG4gICB0aWNrOiAtPlxuICAgICAgQGN1YmUucm90YXRpb24ueSArPSAuMDEgaWYgQGN1YmVcbiAgICAgIEByZW5kZXJlci5yZW5kZXIgQHNjZW5lLCBAY2FtZXJhXG5cblxuXG5cbiAgIHVwZGF0ZUNhbWVyYUFuZ2xlOiAoeCwgeSkgLT5cbiAgICAgIEBjYW1lcmEucG9zaXRpb24ueCA9IHhcbiAgICAgIEBjYW1lcmEucG9zaXRpb24ueSA9IHlcblxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICBvbkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICBjb25zb2xlLmxvZyBAd2FnZS53YWdlXG5cblxuXG4gICBvbk1vdXNlT3ZlcjogKGV2ZW50KSA9PlxuICAgICAgQCRlbC5wYXJlbnQoKS5hcHBlbmQgQCRzdGF0XG5cblxuXG4gICBvbk1vdXNlT3V0OiAoZXZlbnQpID0+XG5cblxuXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgIHNldHVwVGhyZWVKU1JlbmRlcmVyOiAtPlxuICAgICAgQGhlaWdodCA9IGlmIEB3YWdlLndhZ2UgaXNudCAwIHRoZW4gQHdhZ2Uud2FnZSAqIDMgZWxzZSAyXG5cbiAgICAgIGNhbWVyYUF0dHJpYnV0ZXMgPVxuICAgICAgICAgYW5nbGU6IDQ1XG4gICAgICAgICBhc3BlY3Q6IE1hcENvbmZpZy5DQU5WQVNfU0laRSAvIE1hcENvbmZpZy5DQU5WQVNfU0laRVxuICAgICAgICAgbmVhcjogLjFcbiAgICAgICAgIGZhcjogMTAwXG5cbiAgICAgICMgU2NlbmUgcGFyYW1ldGVyc1xuICAgICAgQHNjZW5lICAgID0gbmV3IFRIUkVFLlNjZW5lXG4gICAgICBAY2FtZXJhICAgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEgY2FtZXJhQXR0cmlidXRlcy5hbmdsZSwgY2FtZXJhQXR0cmlidXRlcy5hc3BlY3QsIGNhbWVyYUF0dHJpYnV0ZXMubmVhciwgY2FtZXJhQXR0cmlidXRlcy5mYXJcbiAgICAgIEByZW5kZXJlciA9IG5ldyBUSFJFRS5DYW52YXNSZW5kZXJlciBhbHBoYTogdHJ1ZVxuXG4gICAgICBAc2NlbmUuYWRkIEByZXR1cm5SYW5kb21Db2xvckN1YmUoKVxuXG4gICAgICAjIFVwZGF0ZSB2aWV3XG4gICAgICBAcmVuZGVyZXIuc2V0Q2xlYXJDb2xvciAweDAwMDAwMCwgMFxuICAgICAgQGNhbWVyYS5wb3NpdGlvbi56ID0gNTBcblxuXG5cblxuICAgcmV0dXJuR3JhZGllbnQ6ICh3YWdlKSA9PlxuICAgICAgaWYgd2FnZSA8IDUgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIFdpbnRyR3JhZGllbnQuZ2VuZXJhdGUgV2ludHJHcmFkaWVudC55ZWxsb3dQaW5rKClcbiAgICAgIGlmIHdhZ2UgPCA2ICAgYW5kIHdhZ2UgPiA1ICB0aGVuIHJldHVybiBXaW50ckdyYWRpZW50LmdlbmVyYXRlIFdpbnRyR3JhZGllbnQueWVsbG93UGluaygpXG4gICAgICBpZiB3YWdlIDwgNyAgIGFuZCB3YWdlID4gNiAgdGhlbiByZXR1cm4gV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd0FxdWEoKVxuICAgICAgaWYgd2FnZSA8IDggICBhbmQgd2FnZSA+IDcgIHRoZW4gcmV0dXJuIFdpbnRyR3JhZGllbnQuZ2VuZXJhdGUgV2ludHJHcmFkaWVudC55ZWxsb3dQaW5rKClcbiAgICAgIGlmIHdhZ2UgPCA5ICAgYW5kIHdhZ2UgPiA4ICB0aGVuIHJldHVybiBXaW50ckdyYWRpZW50LmdlbmVyYXRlIFdpbnRyR3JhZGllbnQub3JhbmdlUGluaygpXG4gICAgICBpZiB3YWdlIDwgMjUgIGFuZCB3YWdlID4gOSAgdGhlbiByZXR1cm4gV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd0dyZWVuKClcblxuXG5cblxuICAgcmFuZG9tQ29sb3I6IC0+XG4gICAgICBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0ICcnXG4gICAgICBjb2xvciA9ICcjJ1xuICAgICAgZm9yIGkgaW4gWzAuLjVdXG4gICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV1cblxuICAgICAgcmV0dXJuIGNvbG9yXG5cblxuXG5cbiAgIHJldHVyblJhbmRvbUNvbG9yQ3ViZTogLT5cbiAgICAgIEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSAyLCBAaGVpZ2h0LCAyXG5cbiAgICAgIGZvciBpIGluIFswLi5AZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMV0gYnkgKzJcbiAgICAgICAgIGhleCA9IE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZlxuICAgICAgICAgQGdlb21ldHJ5LmZhY2VzW2ldLmNvbG9yLnNldEhleCBoZXhcbiAgICAgICAgIEBnZW9tZXRyeS5mYWNlc1tpICsgMV0uY29sb3Iuc2V0SGV4IGhleFxuXG4gICAgICBAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwgdmVydGV4Q29sb3JzOiBUSFJFRS5GYWNlQ29sb3JzLCBvdmVyZHJhdzogMC41XG4gICAgICBAY3ViZSA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgQG1hdGVyaWFsXG4gICAgICBAY3ViZS5yb3RhdGlvbi54ID0gMjBcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgPSAyMFxuXG4gICAgICByZXR1cm4gQGN1YmVcblxuXG5cblxuICAgcmV0dXJuR3JhZGllbnRDdWJlOiAtPlxuICAgICAgQGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5IDIsIEBoZWlnaHQsIDIsIDIsIDIsIDJcblxuICAgICAgdGV4dHVyZSAgPSBuZXcgVEhSRUUuVGV4dHVyZSBAcmV0dXJuR3JhZGllbnQgQHdhZ2Uud2FnZVxuICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWVcblxuICAgICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgbWFwOiB0ZXh0dXJlLCBvdmVyZHJhdzogMC41IH0gKVxuICAgICAgQGN1YmUgPSBuZXcgVEhSRUUuTWVzaCggQGdlb21ldHJ5LCBtYXRlcmlhbCApXG4gICAgICBAY3ViZS5yb3RhdGlvbi54ID0gMjBcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgPSAyMFxuXG4gICAgICByZXR1cm4gQGN1YmVcblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGhyZWVTY2VuZSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdzdGF0cycgaWQ9J3N0YXQtXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmluZGV4KSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pbmRleDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIic+XFxuXHQ8ZGl2IGNsYXNzPSd3YWdlJz5cXG5cdFx0PHNwYW4gY2xhc3M9J3N0YXRlJz5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuc3RhdGUpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLnN0YXRlOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9zcGFuPiBcIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMud2FnZSkgeyBzdGFjazEgPSBzdGFjazEuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBzdGFjazEgPSBkZXB0aDAud2FnZTsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pIl19
