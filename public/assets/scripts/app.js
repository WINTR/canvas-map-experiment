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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9ub2RlX21vZHVsZXMvaGFuZGxlaWZ5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9oYW5kbGVpZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvbGliL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvbm9kZV9tb2R1bGVzL2hhbmRsZWlmeS9ydW50aW1lLmpzIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvY29uZmlnL01hcENvbmZpZy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvZXZlbnRzL01hcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdXRpbHMvV2ludHJHcmFkaWVudC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvQ2FudmFzVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvVGhyZWVTY2VuZS5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvdGVtcGxhdGVzL3NjZW5lLXRlbXBsYXRlLmhicyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LEVBQWlDLENBQWpDLEVBQW9DLENBQXBDLEVBQXVDLENBQXZDLENBQWhCLENBQUE7QUFBQSxJQUVBLE9BQUEsR0FBZSxJQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUF0QixDQUFkLENBRmYsQ0FBQTtBQUFBLElBR0EsT0FBTyxDQUFDLFdBQVIsR0FBc0IsSUFIdEIsQ0FBQTtBQUFBLElBS0EsUUFBQSxHQUFlLElBQUEsS0FBSyxDQUFDLGlCQUFOLENBQXlCO0FBQUEsTUFBRSxHQUFBLEVBQUssT0FBUDtBQUFBLE1BQWdCLFFBQUEsRUFBVSxHQUExQjtLQUF6QixDQUxmLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxJQUFELEdBQVksSUFBQSxLQUFLLENBQUMsSUFBTixDQUFZLElBQUMsQ0FBQSxRQUFiLEVBQXVCLFFBQXZCLENBTlosQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixHQUFtQixFQVBuQixDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLEdBQW1CLEVBUm5CLENBQUE7QUFVQSxXQUFPLElBQUMsQ0FBQSxJQUFSLENBWGlCO0VBQUEsQ0FoTHBCLENBQUE7O29CQUFBOztHQU5zQixLQWJ6QixDQUFBOztBQUFBLE1BcU5NLENBQUMsT0FBUCxHQUFpQixVQXJOakIsQ0FBQTs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypqc2hpbnQgZXFudWxsOiB0cnVlICovXG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuXG52YXIgSGFuZGxlYmFycyA9IHt9O1xuXG4vLyBCRUdJTihCUk9XU0VSKVxuXG5IYW5kbGViYXJzLlZFUlNJT04gPSBcIjEuMC4wXCI7XG5IYW5kbGViYXJzLkNPTVBJTEVSX1JFVklTSU9OID0gNDtcblxuSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTID0ge1xuICAxOiAnPD0gMS4wLnJjLjInLCAvLyAxLjAucmMuMiBpcyBhY3R1YWxseSByZXYyIGJ1dCBkb2Vzbid0IHJlcG9ydCBpdFxuICAyOiAnPT0gMS4wLjAtcmMuMycsXG4gIDM6ICc9PSAxLjAuMC1yYy40JyxcbiAgNDogJz49IDEuMC4wJ1xufTtcblxuSGFuZGxlYmFycy5oZWxwZXJzICA9IHt9O1xuSGFuZGxlYmFycy5wYXJ0aWFscyA9IHt9O1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGZ1bmN0aW9uVHlwZSA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgSGFuZGxlYmFycy5FeGNlcHRpb24oJ0FyZyBub3Qgc3VwcG9ydGVkIHdpdGggbXVsdGlwbGUgaGVscGVycycpOyB9XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5oZWxwZXJzLCBuYW1lKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgdGhpcy5oZWxwZXJzW25hbWVdID0gZm47XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsID0gZnVuY3Rpb24obmFtZSwgc3RyKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucGFydGlhbHNbbmFtZV0gPSBzdHI7XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgaWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcblxuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKGNvbnRleHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgIGlmKGNvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIEhhbmRsZWJhcnMuaGVscGVycy5lYWNoKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5LID0gZnVuY3Rpb24oKSB7fTtcblxuSGFuZGxlYmFycy5jcmVhdGVGcmFtZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24ob2JqZWN0KSB7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBvYmplY3Q7XG4gIHZhciBvYmogPSBuZXcgSGFuZGxlYmFycy5LKCk7XG4gIEhhbmRsZWJhcnMuSy5wcm90b3R5cGUgPSBudWxsO1xuICByZXR1cm4gb2JqO1xufTtcblxuSGFuZGxlYmFycy5sb2dnZXIgPSB7XG4gIERFQlVHOiAwLCBJTkZPOiAxLCBXQVJOOiAyLCBFUlJPUjogMywgbGV2ZWw6IDMsXG5cbiAgbWV0aG9kTWFwOiB7MDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcid9LFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChIYW5kbGViYXJzLmxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IEhhbmRsZWJhcnMubG9nZ2VyLm1ldGhvZE1hcFtsZXZlbF07XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICBjb25zb2xlW21ldGhvZF0uY2FsbChjb25zb2xlLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy5sb2cgPSBmdW5jdGlvbihsZXZlbCwgb2JqKSB7IEhhbmRsZWJhcnMubG9nZ2VyLmxvZyhsZXZlbCwgb2JqKTsgfTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgdmFyIGkgPSAwLCByZXQgPSBcIlwiLCBkYXRhO1xuXG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb250ZXh0KTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgZGF0YSA9IEhhbmRsZWJhcnMuY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgfVxuXG4gIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgaWYoY29udGV4dCBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgIGZvcih2YXIgaiA9IGNvbnRleHQubGVuZ3RoOyBpPGo7IGkrKykge1xuICAgICAgICBpZiAoZGF0YSkgeyBkYXRhLmluZGV4ID0gaTsgfVxuICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaWYoZGF0YSkgeyBkYXRhLmtleSA9IGtleTsgfVxuICAgICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRba2V5XSwge2RhdGE6IGRhdGF9KTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZihpID09PSAwKXtcbiAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gdG9TdHJpbmcuY2FsbChjb25kaXRpb25hbCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICBpZighY29uZGl0aW9uYWwgfHwgSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd1bmxlc3MnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzWydpZiddLmNhbGwodGhpcywgY29uZGl0aW9uYWwsIHtmbjogb3B0aW9ucy5pbnZlcnNlLCBpbnZlcnNlOiBvcHRpb25zLmZufSk7XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmICghSGFuZGxlYmFycy5VdGlscy5pc0VtcHR5KGNvbnRleHQpKSByZXR1cm4gb3B0aW9ucy5mbihjb250ZXh0KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgSGFuZGxlYmFycy5sb2cobGV2ZWwsIGNvbnRleHQpO1xufSk7XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxuLy8gQkVHSU4oQlJPV1NFUilcblxuSGFuZGxlYmFycy5WTSA9IHtcbiAgdGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlU3BlYykge1xuICAgIC8vIEp1c3QgYWRkIHdhdGVyXG4gICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgIGVzY2FwZUV4cHJlc3Npb246IEhhbmRsZWJhcnMuVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICAgIGludm9rZVBhcnRpYWw6IEhhbmRsZWJhcnMuVk0uaW52b2tlUGFydGlhbCxcbiAgICAgIHByb2dyYW1zOiBbXSxcbiAgICAgIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IEhhbmRsZWJhcnMuVk0ucHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSB0aGlzLnByb2dyYW1zW2ldID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvZ3JhbVdyYXBwZXI7XG4gICAgICB9LFxuICAgICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgICAgdmFyIHJldCA9IHBhcmFtIHx8IGNvbW1vbjtcblxuICAgICAgICBpZiAocGFyYW0gJiYgY29tbW9uKSB7XG4gICAgICAgICAgcmV0ID0ge307XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICAgIEhhbmRsZWJhcnMuVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9LFxuICAgICAgcHJvZ3JhbVdpdGhEZXB0aDogSGFuZGxlYmFycy5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgICAgbm9vcDogSGFuZGxlYmFycy5WTS5ub29wLFxuICAgICAgY29tcGlsZXJJbmZvOiBudWxsXG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChjb250YWluZXIsIEhhbmRsZWJhcnMsIGNvbnRleHQsIG9wdGlvbnMuaGVscGVycywgb3B0aW9ucy5wYXJ0aWFscywgb3B0aW9ucy5kYXRhKTtcblxuICAgICAgdmFyIGNvbXBpbGVySW5mbyA9IGNvbnRhaW5lci5jb21waWxlckluZm8gfHwgW10sXG4gICAgICAgICAgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IEhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT047XG5cbiAgICAgIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gPCBjdXJyZW50UmV2aXNpb24pIHtcbiAgICAgICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gSGFuZGxlYmFycy5SRVZJU0lPTl9DSEFOR0VTW2N1cnJlbnRSZXZpc2lvbl0sXG4gICAgICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY29tcGlsZXJSZXZpc2lvbl07XG4gICAgICAgICAgdGhyb3cgXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBwcmVjb21waWxlciB0byBhIG5ld2VyIHZlcnNpb24gKFwiK3J1bnRpbWVWZXJzaW9ucytcIikgb3IgZG93bmdyYWRlIHlvdXIgcnVudGltZSB0byBhbiBvbGRlciB2ZXJzaW9uIChcIitjb21waWxlclZlcnNpb25zK1wiKS5cIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGEgbmV3ZXIgdmVyc2lvbiBvZiBIYW5kbGViYXJzIHRoYW4gdGhlIGN1cnJlbnQgcnVudGltZS4gXCIrXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9LFxuXG4gIHByb2dyYW1XaXRoRGVwdGg6IGZ1bmN0aW9uKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG5cbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgW2NvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhXS5jb25jYXQoYXJncykpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gYXJncy5sZW5ndGg7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIHByb2dyYW06IGZ1bmN0aW9uKGksIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByb2dyYW0gPSBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgICB9O1xuICAgIHByb2dyYW0ucHJvZ3JhbSA9IGk7XG4gICAgcHJvZ3JhbS5kZXB0aCA9IDA7XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH0sXG4gIG5vb3A6IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJcIjsgfSxcbiAgaW52b2tlUGFydGlhbDogZnVuY3Rpb24ocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHsgaGVscGVyczogaGVscGVycywgcGFydGlhbHM6IHBhcnRpYWxzLCBkYXRhOiBkYXRhIH07XG5cbiAgICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBmb3VuZFwiKTtcbiAgICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCFIYW5kbGViYXJzLmNvbXBpbGUpIHtcbiAgICAgIHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gSGFuZGxlYmFycy5jb21waWxlKHBhcnRpYWwsIHtkYXRhOiBkYXRhICE9PSB1bmRlZmluZWR9KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn07XG5cbkhhbmRsZWJhcnMudGVtcGxhdGUgPSBIYW5kbGViYXJzLlZNLnRlbXBsYXRlO1xuXG4vLyBFTkQoQlJPV1NFUilcblxucmV0dXJuIEhhbmRsZWJhcnM7XG5cbn07XG4iLCJleHBvcnRzLmF0dGFjaCA9IGZ1bmN0aW9uKEhhbmRsZWJhcnMpIHtcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gQkVHSU4oQlJPV1NFUilcblxudmFyIGVycm9yUHJvcHMgPSBbJ2Rlc2NyaXB0aW9uJywgJ2ZpbGVOYW1lJywgJ2xpbmVOdW1iZXInLCAnbWVzc2FnZScsICduYW1lJywgJ251bWJlcicsICdzdGFjayddO1xuXG5IYW5kbGViYXJzLkV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxufTtcbkhhbmRsZWJhcnMuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuSGFuZGxlYmFycy5TYWZlU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufTtcbkhhbmRsZWJhcnMuU2FmZVN0cmluZy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc3RyaW5nLnRvU3RyaW5nKCk7XG59O1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxudmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn07XG5cbkhhbmRsZWJhcnMuVXRpbHMgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgIGZvcih2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICBpZih2YWx1ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXNjYXBlRXhwcmVzc2lvbjogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgLy8gZG9uJ3QgZXNjYXBlIFNhZmVTdHJpbmdzLCBzaW5jZSB0aGV5J3JlIGFscmVhZHkgc2FmZVxuICAgIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBIYW5kbGViYXJzLlNhZmVTdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudG9TdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKHN0cmluZyA9PSBudWxsIHx8IHN0cmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAgIC8vIHRoZSByZWdleCB0ZXN0IHdpbGwgZG8gdGhpcyB0cmFuc3BhcmVudGx5IGJlaGluZCB0aGUgc2NlbmVzLCBjYXVzaW5nIGlzc3VlcyBpZlxuICAgIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICAgIHN0cmluZyA9IHN0cmluZy50b1N0cmluZygpO1xuXG4gICAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGJhZENoYXJzLCBlc2NhcGVDaGFyKTtcbiAgfSxcblxuICBpc0VtcHR5OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUgJiYgdmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZih0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEVORChCUk9XU0VSKVxuXG5yZXR1cm4gSGFuZGxlYmFycztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCdoYW5kbGViYXJzL2xpYi9oYW5kbGViYXJzL2Jhc2UuanMnKS5jcmVhdGUoKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy91dGlscy5qcycpLmF0dGFjaChleHBvcnRzKVxucmVxdWlyZSgnaGFuZGxlYmFycy9saWIvaGFuZGxlYmFycy9ydW50aW1lLmpzJykuYXR0YWNoKGV4cG9ydHMpIiwiIyMjKlxuICogTWFwIENhbnZhcyBhcHBsaWNhdGlvbiBib290c3RyYXBwZXJyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBFdmVudCAgID0gcmVxdWlyZSAnLi9ldmVudHMvTWFwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuTWFwVmlldyAgICA9IHJlcXVpcmUgJy4vdmlld3MvTWFwVmlldy5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBBcHAgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBNYXBCb3ggbWFwIHZpZXcgY29udGFpbmluZyBhbGwgbWFwIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eVxuICAgIyBAdHlwZSB7TC5NYXBCb3h9XG5cbiAgIG1hcFZpZXc6IG51bGxcblxuXG4gICAjIENhbnZhcyB2aWV3IGNvbnRhaW5pbmcgYWxsIGNhbnZhcyByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0NhbnZhc1ZpZXd9XG5cbiAgIGNhbnZhc1ZpZXc6IG51bGxcblxuXG4gICAjIEpTT04gRGF0YSBvZiB3YWdlcyBhbmQgbGF0LCBsbmcgYnkgc3RhdGVcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICB3YWdlRGF0YTogbnVsbFxuXG5cblxuXG4gICAjIEluaXRpYWxpemUgYXBwIGJ5IGNyZWF0aW5nIGEgY2FudmFzIHZpZXcgYW5kIGEgbWFwdmlld1xuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXdcbiAgICAgICAgIHdhZ2VEYXRhOiBAd2FnZURhdGFcblxuICAgICAgQG1hcFZpZXcgPSBuZXcgTWFwVmlld1xuICAgICAgICAgJGNhbnZhczogQGNhbnZhc1ZpZXcuJGVsXG4gICAgICAgICBjYW52YXNVcGRhdGVNZXRob2Q6IEBjYW52YXNWaWV3LnVwZGF0ZVxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQG1hcFZpZXcucmVuZGVyKClcblxuXG5cblxuXG5cbiAgICMgQWRkIGFwcC13aWRlIGV2ZW50IGxpc3RlbmVyc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAbWFwVmlldywgICAgTWFwRXZlbnQuSU5JVElBTElaRUQsICBAb25NYXBJbml0aWFsaXplZFxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCAgICBNYXBFdmVudC5aT09NX0NIQU5HRUQsIEBvbk1hcFpvb21DaGFuZ2VkXG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsICAgIE1hcEV2ZW50LkRSQUcsICAgICAgICAgQG9uTWFwRHJhZ1xuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbWFwIGluaXRpYWxpemF0aW9uIGV2ZW50cy4gIFJlY2VpdmVkIGZyb20gdGhlIE1hcFZpZXcgd2hpY2hcbiAgICMga2lja3Mgb2ZmIGNhbnZhcyByZW5kZXJpbmcgYW5kIDMuanMgaW5zdGFudGlhdGlvblxuXG4gICBvbk1hcEluaXRpYWxpemVkOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcucmVuZGVyKClcbiAgICAgIF8uZGVsYXkgPT5cbiAgICAgICAgIEBjYW52YXNWaWV3LnVwZGF0ZUNhbWVyYUFuZ2xlKClcbiAgICAgICwgNTAwXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB6b29tIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IHpvb20gVGhlIGN1cnJlbnQgbWFwIHpvb21cblxuICAgb25NYXBab29tQ2hhbmdlZDogKHpvb20pIC0+XG5cblxuXG5cblxuICAgb25NYXBEcmFnOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcub25NYXBEcmFnKClcblxuXG5cblxuXG4gICBvbk1vdXNlTW92ZTogKGV2ZW50KSA9PlxuICAgICAgQGNhbnZhc1ZpZXcub25Nb3VzZU1vdmVcbiAgICAgICAgIHg6IGV2ZW50LmNsaWVudFhcbiAgICAgICAgIHk6IGV2ZW50LmNsaWVuWVxuXG5cblxuXG4jIEtpY2sgb2ZmIEFwcCBhbmQgbG9hZCBleHRlcm5hbCB3YWdlIGRhdGFcblxuJCAtPlxuICAgJC5nZXRKU09OICdhc3NldHMvZGF0YS93YWdlcy5qc29uJywgKHdhZ2VEYXRhKSAtPlxuICAgICAgbmV3IEFwcFxuICAgICAgICAgd2FnZURhdGE6IHdhZ2VEYXRhXG4iLCIjIyMqXG4gKiBNYXAgYXBwIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBDb25maWcgPVxuXG5cbiAgICMgV2lkdGggb2YgZWFjaCBpbmRpdmlkdWFsIGNhbnZhcyBzcXVhcmVcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQ0FOVkFTX1NJWkU6IDMwMFxuXG4gICAjIFVuaXF1ZSBpZGVudGlmaWVyIGZvciBNYXBCb3ggYXBwXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIElEOiAnZGFtYXNzaS5jb250cm9sLXJvb20nXG5cblxuICAgIyBNYXAgbGFuZHMgb24gU2VhdHRsZSBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBJTklUOlxuICAgICAgbG9jYXRpb246IFs0MS4wOTAyNCwgLTk1LjcxMjg5MV1cbiAgICAgIHpvb206IDRcblxuXG5cbiAgIE1BUF9PUFRJT05TOlxuICAgICAgbWluWm9vbTogNFxuICAgICAgbWF4Wm9vbTogOVxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDb25maWciLCIjIyMqXG4gKiBMZWFmbGV0LXJlbGF0ZWQgTWFwIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBFdmVudCA9XG5cbiAgIERSQUdfU1RBUlQ6ICAgICAgICdkcmFnc3RhcnQnXG4gICBEUkFHOiAgICAgICAgICAgICAnZHJhZydcbiAgIERSQUdfRU5EOiAgICAgICAgICdkcmFnZW5kJ1xuXG4gICAjIFRyaWdnZXJlZCBvbmNlIHRoZSBNYXBCb3ggbWFwIGlzIGluaXRpYWxpemVkIGFuZCByZW5kZXJlZCB0byB0aGUgRE9NXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIElOSVRJQUxJWkVEOiAgICAgICdpbml0aWFsaXplZCdcbiAgIFVQREFURTogICAgICAgICAgICd1cGRhdGUnXG4gICBaT09NX1NUQVJUOiAgICAgICAnem9vbXN0YXJ0J1xuICAgWk9PTV9DSEFOR0VEOiAgICAgJ3pvb21lbmQnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBFdmVudCIsIiMjIypcbiAqIFZpZXcgc3VwZXJjbGFzcyBmb3Igc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbmNsYXNzIFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cblxuICAgIyBWaWV3IGNvbnN0cnVjdG9yIHdoaWNoIGFjY2VwdHMgcGFyYW1ldGVycyBhbmQgbWVyZ2VzIHRoZW1cbiAgICMgaW50byB0aGUgdmlldyBwcm90b3R5cGUgZm9yIGVhc3kgYWNjZXNzLlxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgICAgIyBNZXJnZSBwYXNzZWQgcHJvcHMgb3IgaW5zdGFuY2UgZGVmYXVsdHNcbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXciLCIjIyMqXG4gKiBHZW5lcmF0ZSBhIFdJTlRSIGdyYWRpZW50IGJhc2VkIHVwb24gb3VyIHN0eWxlZ3VpZGVcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuOS4xNFxuIyMjXG5cblxuV2ludHJHcmFkaWVudCA9XG5cbiAgICMgRGVmYXVsdCBzaXplIG9mIHRoZSBjYW52YXMgdG8gYmUgZHJhd24gdXBvblxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBERUZBVUxUX1NJWkU6IDUxMlxuXG5cbiAgICMgQmFzZSBjb2xvcnMgZm9yIGNvbXBvc2luZyBncmFkaWVudHNcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgQ09MT1JTOlxuICAgICAgcGx1bTpcbiAgICAgICAgIGxpZ2h0OiAnI0ExNEY0OSdcbiAgICAgICAgIGRhcms6ICAnIzViMTkxNSdcblxuICAgICAgZ3JlZW46XG4gICAgICAgICBsaWdodDogJyNBREQ0QkYnXG4gICAgICAgICBkYXJrOiAgJyM0RTgyNzMnXG5cbiAgICAgIGdyZXk6XG4gICAgICAgICBsaWdodDogJyM5RjlGOUYnXG4gICAgICAgICBkYXJrOiAgJyM3Nzc3NzcnXG5cbiAgICAgIHBpbms6ICAgICAnI0ZENjY4NSdcbiAgICAgIHllbGxvdzogICAnI0Y4RTk5RSdcbiAgICAgIGFxdWE6ICAgICAnI0E2RkNFQidcbiAgICAgIG9yYW5nZTogICAnI0ZDOTE3MCdcblxuXG5cbiAgIHllbGxvd1Bpbms6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy55ZWxsb3csIHN0b3A6IEBDT0xPUlMucGluayB9XG5cbiAgIHllbGxvd0FxdWE6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy55ZWxsb3csIHN0b3A6IEBDT0xPUlMuYXF1YSB9XG5cbiAgIHBpbmtBcXVhOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMucGluaywgc3RvcDogQENPTE9SUy5hcXVhIH1cblxuICAgeWVsbG93T3JhbmdlOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMueWVsbG93LCBzdG9wOiBAQ09MT1JTLm9yYW5nZSB9XG5cbiAgIG9yYW5nZVBpbms6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy5vcmFuZ2UsIHN0b3A6IEBDT0xPUlMucGluayB9XG5cbiAgIHllbGxvd0dyZWVuOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMueWVsbG93LCBzdG9wOiBAQ09MT1JTLmdyZWVuLmxpZ2h0IH1cblxuICAgb3JhbmdlQXF1YTogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLm9yYW5nZSwgc3RvcDogQENPTE9SUy5hcXVhIH1cblxuXG5cbiAgICMgR2VuZXJhdGVzIGEgY29sb3IgZ3JhZGllbnQgYnkgdGFraW5nIGFuIG9iamVjdCBjb25zaXN0aW5nIG9mXG4gICAjIGBzdGFydGAgYW5kIGBzdG9wYCBhbmQgYmVsZW5kaW5nIHRoZW0gdG9nZXRoZXIgd2l0aGluIGEgY3R4XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBjb2xvclJhbmdlXG4gICAjIEByZXR1cm4ge0NvbnRleHR9XG5cbiAgIGdlbmVyYXRlOiAoY29sb3JSYW5nZSkgLT5cbiAgICAgIHtzdGFydCwgc3RvcH0gPSBjb2xvclJhbmdlXG5cbiAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICAgIGNhbnZhcy53aWR0aCAgPSBAREVGQVVMVF9TSVpFXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gQERFRkFVTFRfU0laRVxuXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQgJzJkJ1xuXG4gICAgICBjb250ZXh0LnJlY3QgMCwgMCwgQERFRkFVTFRfU0laRSwgQERFRkFVTFRfU0laRVxuICAgICAgZ3JhZGllbnQgPSBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50IDAsIDAsIEBERUZBVUxUX1NJWkUsIEBERUZBVUxUX1NJWkVcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCAwLCBzdGFydFxuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wIDEsIHN0b3BcblxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBncmFkaWVudFxuICAgICAgY29udGV4dC5maWxsKClcblxuICAgICAgcmV0dXJuIGNhbnZhc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gV2ludHJHcmFkaWVudCIsIiMjIypcbiAqIENhbnZhcyBMYXllciB3aGljaCByZXByZXNlbnRzIGRhdGEgdG8gYmUgZGlzcGxheWVkIG9uIHRoZSBNYXBWaWV3XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBDb25maWcgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuVGhyZWVTY2VuZSA9IHJlcXVpcmUgJy4vVGhyZWVTY2VuZS5jb2ZmZWUnXG5cblxuY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICAjIElEIG9mIERPTSBjb250YWluZXIgZm9yIGNhbnZhcyBsYXllclxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBpZDogJ2NhbnZhcy1sYXllcidcblxuXG5cbiAgICMgSW5zdGFudGlhdGUgVGhyZWUuanMgc2NlbmVzIGJhc2VkIHVwb24gbnVtYmVyIG9mIGRhdGFwb2ludHMgaW4gdGhlIEpTT05cblxuICAgcmVuZGVyOiAtPlxuXG4gICAgICAjIENyZWF0ZSBzY2VuZXNcbiAgICAgIEBzY2VuZXMgPSAoXy5yYW5nZSBAd2FnZURhdGEubGVuZ3RoKS5tYXAgKHNjZW5lLCBpbmRleCkgPT5cbiAgICAgICAgIHNjZW5lID0gbmV3IFRocmVlU2NlbmVcbiAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICAgICAgd2FnZTogQHdhZ2VEYXRhW2luZGV4XVxuXG4gICAgICAjIEFwcGVuZCB0byBkb20gYW5kIHN0YXJ0IHRpY2tlclxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSkgPT5cbiAgICAgICAgIEAkZWwuYXBwZW5kIHNjZW5lLnJlbmRlcigpLiRlbFxuXG4gICAgICAjIFdhaXQgZm9yIGFwcGVuZGluZyBhbmQgdGhlbiBzb3J0IC8gcmVuZGVyXG4gICAgICBfLmRlZmVyID0+XG5cbiAgICAgICAgIHNvcnRlZCA9IF8uc29ydEJ5IEBzY2VuZXMsIChhLCBiKSAtPlxuICAgICAgICAgICAgcmV0dXJuIGEuJGVsLnBvc2l0aW9uKCkudG9wXG5cbiAgICAgICAgIHNvcnRlZC5mb3JFYWNoIChzY2VuZSwgaW5kZXgpIC0+XG4gICAgICAgICAgICBzY2VuZS4kZWwuY3NzICd6LWluZGV4JywgaW5kZXhcblxuICAgICAgICAgQG9uVGljaygpXG5cblxuXG5cblxuICAgIyBVcGRhdGUgdGhlIGNhbnZhcyBsYXllciB3aGVuZXZlciB0aGVyZSBpcyBhIHpvb20gYWN0aW9uXG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGNhbnZhc092ZXJsYXlcbiAgICMgQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuXG4gICB1cGRhdGU6IChjYW52YXNPdmVybGF5LCBwYXJhbXMpID0+XG4gICAgICB7bGVmdCwgdG9wfSA9IEAkZWwub2Zmc2V0KClcblxuICAgICAgQHdhZ2VEYXRhLmZvckVhY2ggKHN0YXRlLCBpbmRleCkgPT5cbiAgICAgICAgIHt4LCB5fSA9IGNhbnZhc092ZXJsYXkuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50IFtzdGF0ZS5sYXRpdHVkZSwgc3RhdGUubG9uZ2l0dWRlXVxuXG4gICAgICAgICBpZiBAc2NlbmVzIGFuZCBpbmRleCA8IEB3YWdlRGF0YS5sZW5ndGhcbiAgICAgICAgICAgIHNjZW5lICA9IEBzY2VuZXNbaW5kZXhdXG4gICAgICAgICAgICAkZWwgICAgPSBzY2VuZS4kZWxcbiAgICAgICAgICAgICRzdGF0ID0gc2NlbmUuJHN0YXRcblxuICAgICAgICAgICAgeCA9IHggLSBsZWZ0IC0gKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KVxuICAgICAgICAgICAgeSA9IHkgLSB0b3AgIC0gKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KVxuXG4gICAgICAgICAgICBUd2Vlbk1heC50byAkZWwsICAgLjYsIHg6IHgsIHk6IHksIGVhc2U6IEV4cG8uZWFzZU91dFxuICAgICAgICAgICAgVHdlZW5NYXgudG8gJHN0YXQsIC42LCB4OiB4LCB5OiB5LCBlYXNlOiBFeHBvLmVhc2VPdXQgaWYgJHN0YXQ/Lmxlbmd0aFxuXG5cblxuXG5cbiAgIHVwZGF0ZUNhbWVyYUFuZ2xlOiA9PlxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSwgaW5kZXgpID0+XG4gICAgICAgICBzY2VuZSAgPSBAc2NlbmVzW2luZGV4XVxuICAgICAgICAgb2Zmc2V0ID0gc2NlbmUuJGVsLm9mZnNldCgpXG5cbiAgICAgICAgICMgQ29tcHV0ZSB0aGUgZGlzdGFuY2UgdG8gdGhlIGNlbnRlciBvZiB0aGUgd2luZG93LiAgVXNlZCB0byBjcmVhdGVcbiAgICAgICAgICMgc3dheSBtdWx0aXBsZXMgZm9yIHBlcnNwZWN0aXZlIGNhbWVyYSBhbmdsZVxuXG4gICAgICAgICBkaXN0ID1cbiAgICAgICAgICAgIHg6ICgod2luZG93LmlubmVyV2lkdGggICogLjUpIC0gKG9mZnNldC5sZWZ0ICsgKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KSkpICogLjAxXG4gICAgICAgICAgICB5OiAoKHdpbmRvdy5pbm5lckhlaWdodCAqIC41KSAtIChvZmZzZXQudG9wICArIChNYXBDb25maWcuQ0FOVkFTX1NJWkUgKiAuNSkpKSAqIC4wMVxuXG4gICAgICAgICBzY2VuZS51cGRhdGVDYW1lcmFBbmdsZSggZGlzdC54LCAtZGlzdC55IClcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIFRIUkVFLmpzIHJlcXVlc3RBbmltYXRpb25GcmFtZSBldmVudCBsb29wLiAgVXBkYXRlcyBlYWNoXG4gICAjIGludmlkaXZpZHVhbCBjYW52YXMgbGF5ZXIgaW4gc2NlbmVzIGFycmF5XG5cbiAgIG9uVGljazogKGV2ZW50KSA9PlxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSkgLT4gc2NlbmUudGljaygpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQG9uVGlja1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBsYXllciBhbmQgYmVnaW4gVEhSRUUuanMgdGlja2VyXG4gICAjIEBwdWJsaWNcblxuICAgb25VcGRhdGVab29tOiAoem9vbSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIHpvb21cblxuXG5cblxuXG4gICBvbk1hcERyYWc6IC0+XG4gICAgICBAdXBkYXRlQ2FtZXJhQW5nbGUoKVxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSkgLT4gc2NlbmUudGljaygpXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzVmlldyIsIiMjIypcbiAqIE1hcEJveCBtYXAgbGF5ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcENvbmZpZyAgPSByZXF1aXJlICcuLi9jb25maWcvTWFwQ29uZmlnLmNvZmZlZSdcbk1hcEV2ZW50ICAgPSByZXF1aXJlICcuLi9ldmVudHMvTWFwRXZlbnQuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vQ2FudmFzVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIE1hcFZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBJRCBvZiB0aGUgdmlld1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBpZDogJ21hcCdcblxuXG4gICAjIFByb3h5IEwubWFwYm94IG5hbWVzcGFjZSBmb3IgZWFzeSBhY2Nlc3NcbiAgICMgQHR5cGUge0wubWFwYm94fVxuXG4gICBtYXBib3g6IG51bGxcblxuXG4gICAjIE1hcEJveCBtYXAgbGF5ZXJcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICBtYXBMYXllcjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBMZWFmbGV0IGxheWVyIHRvIGluc2VydCBtYXAgYmVmb3JlXG4gICAjIEB0eXBlIHskfVxuXG4gICAkbGVhZmxldFBhbmU6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgY2FudmFzIERPTSBlbGVtZW50XG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgJGNhbnZhczogbnVsbFxuXG5cblxuICAgIyBJbml0aWFsaXplIHRoZSBNYXBMYXllciBhbmQga2ljayBvZmYgQ2FudmFzIGxheWVyIHJlcG9zaXRpb25pbmdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgRGVmYXVsdCBvcHRpb25zIHRvIHBhc3MgaW50byB0aGUgYXBwXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG1hcGJveCA9IEwubWFwYm94XG4gICAgICBAbWFwICAgID0gQG1hcGJveC5tYXBcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBieSBjcmVhdGluZyB0aGUgTWFwIGxheWVyIGFuZCBpbnNlcnRpbmcgdGhlXG4gICAjIGNhbnZhcyBET00gbGF5ZXIgaW50byBMZWFmbGV0J3MgaGlhcmNoeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAJG1hcCA9ICQgJyNtYXAnXG5cbiAgICAgIEBtYXBMYXllciA9IEBtYXBib3gubWFwIEBpZCwgTWFwQ29uZmlnLklELCBNYXBDb25maWcuTUFQX09QVElPTlNcbiAgICAgICAgIC5zZXRWaWV3ICAgIE1hcENvbmZpZy5JTklULmxvY2F0aW9uLCBNYXBDb25maWcuSU5JVC56b29tXG4gICAgICAgICAuYWRkQ29udHJvbCBAbWFwYm94Lmdlb2NvZGVyQ29udHJvbCBNYXBDb25maWcuSURcblxuICAgICAgIyBBZGQgYSBjYW52YXMgb3ZlcmxheSBhbmQgcGFzcyBpbiBhbiB1cGRhdGUgbWV0aG9kXG4gICAgICBMLmNhbnZhc092ZXJsYXkoKVxuICAgICAgICAgLmRyYXdpbmcgQGNhbnZhc1VwZGF0ZU1ldGhvZFxuICAgICAgICAgLmFkZFRvIEBtYXBMYXllclxuICAgICAgICAgLnJlZHJhdygpXG5cbiAgICAgIFR3ZWVuTWF4LnNldCBAJG1hcCwgYXV0b0FscGhhOiAwXG5cbiAgICAgIF8uZGVmZXIgPT5cbiAgICAgICAgIEBtYXBMYXllci5zZXRWaWV3IE1hcENvbmZpZy5JTklULmxvY2F0aW9uLCBNYXBDb25maWcuSU5JVC56b29tICsgMVxuXG4gICAgICAgICBUd2Vlbk1heC50byBAJG1hcCwgLjcsXG4gICAgICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgICAgIGRlbGF5OiAuNVxuICAgICAgICAgICAgZWFzZTogTGluZWFyLmVhc2VOb25lXG5cbiAgICAgIEBpbnNlcnRDYW52YXNMYXllcigpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBtYXBMYXllci5vbiBNYXBFdmVudC5aT09NX0NIQU5HRUQsIEBvblpvb21DaGFuZ2VkXG4gICAgICBAbWFwTGF5ZXIub24gTWFwRXZlbnQuRFJBRywgICAgICAgICBAb25NYXBEcmFnXG5cblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIyBIYW5kbGVyIGZvciB6b29tIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cbiAgIG9uWm9vbUNoYW5nZWQ6IChldmVudCkgPT5cbiAgICAgIEB0cmlnZ2VyIE1hcEV2ZW50LlpPT01fQ0hBTkdFRCwgQG1hcExheWVyLmdldFpvb20oKVxuXG5cblxuXG5cbiAgIG9uTWFwRHJhZzogKGV2ZW50KSA9PlxuICAgICAgQHRyaWdnZXIgTWFwRXZlbnQuRFJBR1xuXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIE1vdmVzIHRoZSBjYW52YXMgbGF5ZXIgaW50byB0aGUgTGVhZmxldCBET01cblxuICAgaW5zZXJ0Q2FudmFzTGF5ZXI6IC0+XG4gICAgICBAJGxlYWZsZXRQYW5lID0gJCBcIi5sZWFmbGV0LW9iamVjdHMtcGFuZVwiXG4gICAgICBAJGNhbnZhcy5wcmVwZW5kVG8gQCRsZWFmbGV0UGFuZVxuICAgICAgQCRjYW52YXMuY3NzICd6LWluZGV4JywgNVxuXG4gICAgICBAdHJpZ2dlciBNYXBFdmVudC5JTklUSUFMSVpFRFxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFZpZXciLCIjIyMqXG4gKiBJbmRpdmlkdWFsIFRocmVlLmpzIFNjZW5lc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS44LjE0XG4jIyNcblxuV2ludHJHcmFkaWVudCA9IHJlcXVpcmUgJy4uL3V0aWxzL1dpbnRyR3JhZGllbnQuY29mZmVlJ1xuTWFwQ29uZmlnICAgICA9IHJlcXVpcmUgJy4uL2NvbmZpZy9NYXBDb25maWcuY29mZmVlJ1xuVmlldyAgICAgICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcbnRlbXBsYXRlICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlcy9zY2VuZS10ZW1wbGF0ZS5oYnMnXG5cblxuY2xhc3MgVGhyZWVTY2VuZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIENsYXNzIG5hbWUgb2YgRE9NIGNvbnRhaW5lciBmb3IgaW5kaXZpZHVhbCBUaHJlZS5qcyBzY2VuZXNcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnc2NlbmUnXG5cblxuXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQHNldHVwVGhyZWVKU1JlbmRlcmVyKClcblxuXG5cblxuICAgcmVuZGVyOiAtPlxuICAgICAgc2l6ZSA9IE1hcENvbmZpZy5DQU5WQVNfU0laRVxuXG4gICAgICAjIEFkZCBTY2VuZSBjYW52YXMgdG8gdGhlIGRvbVxuICAgICAgXy5kZWZlciA9PlxuXG4gICAgICAgICBAcmVuZGVyZXIuc2V0U2l6ZSBzaXplLCBzaXplXG5cbiAgICAgICAgICMgQXBwZW5kIHRocmVlLmpzIGNhbnZhc1xuICAgICAgICAgQCRlbC5hcHBlbmQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcblxuICAgICAgICAgIyBEYXRhIC8gc3RhdHNcbiAgICAgICAgIEAkZWwucGFyZW50KCkuYXBwZW5kIHRlbXBsYXRlXG4gICAgICAgICAgICBpbmRleDogQGluZGV4XG4gICAgICAgICAgICBzdGF0ZTogQHdhZ2Uuc3RhdGVcbiAgICAgICAgICAgIHdhZ2U6IFwiJCN7QHdhZ2Uud2FnZX1cIlxuXG4gICAgICAgICBAJHN0YXQgPSBAJGVsLnBhcmVudCgpLmZpbmQgXCIjc3RhdC0je0BpbmRleH1cIlxuXG4gICAgICAgICBUd2Vlbk1heC5mcm9tVG8gQCRzdGF0LCAuOCwgYXV0b0FscGhhOiAwLCBzY2FsZTogMSwgdG9wOiAxMDAsXG4gICAgICAgICAgICBpbW1lZGlhdGVSZW5kZXI6IHRydWVcbiAgICAgICAgICAgIHRvcDogMTQwXG4gICAgICAgICAgICBhdXRvQWxwaGE6IDFcbiAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcbiAgICAgICAgICAgIGRlbGF5OiAuNyArIE1hdGgucmFuZG9tKCkgKiAuNlxuXG4gICAgICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG4gICAgICBAXG5cblxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEAkc3RhdC5vbiAnbW91c2VvdmVyJywgQG9uTW91c2VPdmVyXG4gICAgICBAJHN0YXQub24gJ21vdXNlb3V0JywgIEBvbk1vdXNlT3V0XG5cblxuXG5cbiAgIHRpY2s6IC0+XG4gICAgICBAY3ViZS5yb3RhdGlvbi55ICs9IC4wMSBpZiBAY3ViZVxuICAgICAgQHJlbmRlcmVyLnJlbmRlciBAc2NlbmUsIEBjYW1lcmFcblxuXG5cblxuICAgdXBkYXRlQ2FtZXJhQW5nbGU6ICh4LCB5KSAtPlxuICAgICAgQGNhbWVyYS5wb3NpdGlvbi54ID0geFxuICAgICAgQGNhbWVyYS5wb3NpdGlvbi55ID0geVxuXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgb25Nb3VzZU92ZXI6IChldmVudCkgPT5cbiAgICAgIEAkZWwucGFyZW50KCkuYXBwZW5kIEAkc3RhdFxuXG4gICAgICBUd2Vlbk1heC50byBAJHN0YXQsIC40LFxuICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZidcbiAgICAgICAgIHNjYWxlOiAxLjNcbiAgICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuXG4gICAgICBUd2Vlbk1heC50byBAJHN0YXQuZmluZCgnLndhZ2UnKSwgLjQsXG4gICAgICAgICBjb2xvcjogJyMwMDAnXG5cblxuXG5cbiAgIG9uTW91c2VPdXQ6IChldmVudCkgPT5cbiAgICAgIFR3ZWVuTWF4LnRvIEAkc3RhdCwgLjQsXG4gICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMzMzJ1xuICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuXG4gICAgICBUd2Vlbk1heC50byBAJHN0YXQuZmluZCgnLndhZ2UnKSwgLjQsXG4gICAgICAgICBjb2xvcjogJyNmZmYnXG5cbiAgICAgIFR3ZWVuTWF4LnRvIEAkc3RhdC5maW5kKCcuc3RhdGUnKSwgLjQsXG4gICAgICAgICBjb2xvcjogJyM2MGEzZDcnXG4gICAgICAgICBvdmVyd3JpdGU6ICdhbGwnXG5cblxuXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgIHNldHVwVGhyZWVKU1JlbmRlcmVyOiAtPlxuICAgICAgQGhlaWdodCA9IGlmIEB3YWdlLndhZ2UgaXNudCAwIHRoZW4gQHdhZ2Uud2FnZSAqIDMgZWxzZSAyXG5cbiAgICAgIGNhbWVyYUF0dHJpYnV0ZXMgPVxuICAgICAgICAgYW5nbGU6IDQ1XG4gICAgICAgICBhc3BlY3Q6IE1hcENvbmZpZy5DQU5WQVNfU0laRSAvIE1hcENvbmZpZy5DQU5WQVNfU0laRVxuICAgICAgICAgbmVhcjogLjFcbiAgICAgICAgIGZhcjogMTAwXG5cbiAgICAgICMgU2NlbmUgcGFyYW1ldGVyc1xuICAgICAgQHNjZW5lICAgID0gbmV3IFRIUkVFLlNjZW5lXG4gICAgICBAY2FtZXJhICAgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEgY2FtZXJhQXR0cmlidXRlcy5hbmdsZSwgY2FtZXJhQXR0cmlidXRlcy5hc3BlY3QsIGNhbWVyYUF0dHJpYnV0ZXMubmVhciwgY2FtZXJhQXR0cmlidXRlcy5mYXJcbiAgICAgIEByZW5kZXJlciA9IG5ldyBUSFJFRS5DYW52YXNSZW5kZXJlciBhbHBoYTogdHJ1ZVxuXG4gICAgICBAc2NlbmUuYWRkIEByZXR1cm5SYW5kb21Db2xvckN1YmUoKVxuXG4gICAgICAjIFVwZGF0ZSB2aWV3XG4gICAgICBAcmVuZGVyZXIuc2V0Q2xlYXJDb2xvciAweDAwMDAwMCwgMFxuICAgICAgQGNhbWVyYS5wb3NpdGlvbi56ID0gNTBcblxuXG5cblxuICAgcmV0dXJuR3JhZGllbnQ6ICh3YWdlKSA9PlxuICAgICAgaWYgd2FnZSA8IDUgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIFdpbnRyR3JhZGllbnQuZ2VuZXJhdGUgV2ludHJHcmFkaWVudC55ZWxsb3dQaW5rKClcbiAgICAgIGlmIHdhZ2UgPCA2ICAgYW5kIHdhZ2UgPiA1ICB0aGVuIHJldHVybiBXaW50ckdyYWRpZW50LmdlbmVyYXRlIFdpbnRyR3JhZGllbnQueWVsbG93UGluaygpXG4gICAgICBpZiB3YWdlIDwgNyAgIGFuZCB3YWdlID4gNiAgdGhlbiByZXR1cm4gV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd0FxdWEoKVxuICAgICAgaWYgd2FnZSA8IDggICBhbmQgd2FnZSA+IDcgIHRoZW4gcmV0dXJuIFdpbnRyR3JhZGllbnQuZ2VuZXJhdGUgV2ludHJHcmFkaWVudC55ZWxsb3dQaW5rKClcbiAgICAgIGlmIHdhZ2UgPCA5ICAgYW5kIHdhZ2UgPiA4ICB0aGVuIHJldHVybiBXaW50ckdyYWRpZW50LmdlbmVyYXRlIFdpbnRyR3JhZGllbnQub3JhbmdlUGluaygpXG4gICAgICBpZiB3YWdlIDwgMjUgIGFuZCB3YWdlID4gOSAgdGhlbiByZXR1cm4gV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd0dyZWVuKClcblxuXG5cblxuICAgcmFuZG9tQ29sb3I6IC0+XG4gICAgICBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0ICcnXG4gICAgICBjb2xvciA9ICcjJ1xuICAgICAgZm9yIGkgaW4gWzAuLjVdXG4gICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV1cblxuICAgICAgcmV0dXJuIGNvbG9yXG5cblxuXG5cbiAgIHJldHVyblJhbmRvbUNvbG9yQ3ViZTogLT5cbiAgICAgIEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSAyLCBAaGVpZ2h0LCAyXG5cbiAgICAgIGZvciBpIGluIFswLi5AZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMV0gYnkgKzJcbiAgICAgICAgIGhleCA9IE1hdGgucmFuZG9tKCkgKiAweGZmZmZmZlxuICAgICAgICAgQGdlb21ldHJ5LmZhY2VzW2ldLmNvbG9yLnNldEhleCBoZXhcbiAgICAgICAgIEBnZW9tZXRyeS5mYWNlc1tpICsgMV0uY29sb3Iuc2V0SGV4IGhleFxuXG4gICAgICBAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwgdmVydGV4Q29sb3JzOiBUSFJFRS5GYWNlQ29sb3JzLCBvdmVyZHJhdzogMC41XG4gICAgICBAY3ViZSA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgQG1hdGVyaWFsXG4gICAgICBAY3ViZS5yb3RhdGlvbi54ID0gMjBcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgPSAyMFxuXG4gICAgICByZXR1cm4gQGN1YmVcblxuXG5cblxuICAgcmV0dXJuR3JhZGllbnRDdWJlOiAtPlxuICAgICAgQGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5IDIsIEBoZWlnaHQsIDIsIDIsIDIsIDJcblxuICAgICAgdGV4dHVyZSAgPSBuZXcgVEhSRUUuVGV4dHVyZSBAcmV0dXJuR3JhZGllbnQgQHdhZ2Uud2FnZVxuICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWVcblxuICAgICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgbWFwOiB0ZXh0dXJlLCBvdmVyZHJhdzogMC41IH0gKVxuICAgICAgQGN1YmUgPSBuZXcgVEhSRUUuTWVzaCggQGdlb21ldHJ5LCBtYXRlcmlhbCApXG4gICAgICBAY3ViZS5yb3RhdGlvbi54ID0gMjBcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgPSAyMFxuXG4gICAgICByZXR1cm4gQGN1YmVcblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGhyZWVTY2VuZSIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCJoYW5kbGVpZnlcIikudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPSdzdGF0cycgaWQ9J3N0YXQtXCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLmluZGV4KSB7IHN0YWNrMSA9IHN0YWNrMS5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IHN0YWNrMSA9IGRlcHRoMC5pbmRleDsgc3RhY2sxID0gdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazE7IH1cbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIic+XFxuXHQ8ZGl2IGNsYXNzPSd3YWdlJz5cXG5cdFx0PHNwYW4gY2xhc3M9J3N0YXRlJz5cIjtcbiAgaWYgKHN0YWNrMSA9IGhlbHBlcnMuc3RhdGUpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLnN0YXRlOyBzdGFjazEgPSB0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMTsgfVxuICBpZihzdGFjazEgfHwgc3RhY2sxID09PSAwKSB7IGJ1ZmZlciArPSBzdGFjazE7IH1cbiAgYnVmZmVyICs9IFwiPC9zcGFuPiA8c3BhbiBjbGFzcz0nd2FnZSc+XCI7XG4gIGlmIChzdGFjazEgPSBoZWxwZXJzLndhZ2UpIHsgc3RhY2sxID0gc3RhY2sxLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgc3RhY2sxID0gZGVwdGgwLndhZ2U7IHN0YWNrMSA9IHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxOyB9XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCI8L3NwYW4+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSkiXX0=
