(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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


},{"./events/MapEvent.coffee":4,"./supers/View.coffee":5,"./views/CanvasView.coffee":7,"./views/MapView.coffee":8}],2:[function(require,module,exports){

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
    zoom: 5
  },
  MAP_OPTIONS: {
    minZoom: 5,
    maxZoom: 9
  }
};

module.exports = MapConfig;


},{}],3:[function(require,module,exports){

/**
 * Generic App-wide events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var Event;

Event = {
  TEST: 'onTesttt'
};

module.exports = Event;


},{}],4:[function(require,module,exports){

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


},{}],5:[function(require,module,exports){

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


},{}],6:[function(require,module,exports){

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


},{}],7:[function(require,module,exports){

/**
 * Canvas Layer which represents data to be displayed on the MapView
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var CanvasView, Event, MapConfig, ThreeScene, View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapConfig = require('../config/MapConfig.coffee');

Event = require('../events/Event.coffee');

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
          wage: _this.wageData[index]
        });
      };
    })(this));
    this.scenes.forEach((function(_this) {
      return function(scene) {
        return _this.$el.append(scene.render().$el);
      };
    })(this));
    return this.onTick();
  };

  CanvasView.prototype.update = function(canvasOverlay, params) {
    var left, top, _ref;
    _ref = this.$el.offset(), left = _ref.left, top = _ref.top;
    return this.wageData.forEach((function(_this) {
      return function(state, index) {
        var $el, x, y, _ref1;
        _ref1 = canvasOverlay._map.latLngToContainerPoint([state.latitude, state.longitude]), x = _ref1.x, y = _ref1.y;
        if (_this.scenes && index < _this.wageData.length) {
          $el = _this.scenes[index].$el;
          return TweenMax.to($el, .6, {
            x: x - left - (MapConfig.CANVAS_SIZE * .5),
            y: y - top - (MapConfig.CANVAS_SIZE * .5),
            ease: Expo.easeOut
          });
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
    return this.updateCameraAngle();
  };

  return CanvasView;

})(View);

module.exports = CanvasView;


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":5,"./ThreeScene.coffee":9}],8:[function(require,module,exports){

/**
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var CanvasView, Event, MapConfig, MapEvent, MapView, View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapConfig = require('../config/MapConfig.coffee');

Event = require('../events/Event.coffee');

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


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../events/MapEvent.coffee":4,"../supers/View.coffee":5,"./CanvasView.coffee":7}],9:[function(require,module,exports){

/**
 * Individual Three.js Scenes
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.8.14
 */
var Event, MapConfig, ThreeScene, View, WintrGradient,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

WintrGradient = require('../utils/WintrGradient.coffee');

MapConfig = require('../config/MapConfig.coffee');

Event = require('../events/Event.coffee');

View = require('../supers/View.coffee');

ThreeScene = (function(_super) {
  __extends(ThreeScene, _super);

  ThreeScene.prototype.className = 'scene';

  ThreeScene.prototype.events = {
    'click': 'onClick'
  };

  function ThreeScene(options) {
    this.returnGradient = __bind(this.returnGradient, this);
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
        return _.delay(function() {
          var delay, ease, time;
          time = 1;
          ease = Expo.easeInOut;
          delay = Math.random() * 5;
          return;
          TweenMax.fromTo(_this.cube.scale, time, {
            y: .1
          }, {
            y: 1,
            delay: delay,
            ease: ease
          });
          return TweenMax.fromTo(_this.cube.rotation, time, {
            x: 19.4
          }, {
            x: 20,
            delay: delay,
            ease: ease
          });
        });
      };
    })(this));
    return this;
  };

  ThreeScene.prototype.tick = function() {
    return this.renderer.render(this.scene, this.camera);
  };

  ThreeScene.prototype.updateCameraAngle = function(x, y) {
    this.camera.position.x = x;
    return this.camera.position.y = y;
  };

  ThreeScene.prototype.onClick = function(event) {
    return console.log(this.wage.wage);
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


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":5,"../utils/WintrGradient.coffee":6}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvTWFwRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3V0aWxzL1dpbnRyR3JhZGllbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9XSU5UUi9FeHBlcmltZW50cy9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL1RocmVlU2NlbmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsd0NBQUE7RUFBQTs7aVNBQUE7O0FBQUEsUUFPQSxHQUFhLE9BQUEsQ0FBUSwwQkFBUixDQVBiLENBQUE7O0FBQUEsSUFRQSxHQUFhLE9BQUEsQ0FBUSxzQkFBUixDQVJiLENBQUE7O0FBQUEsT0FTQSxHQUFhLE9BQUEsQ0FBUSx3QkFBUixDQVRiLENBQUE7O0FBQUEsVUFVQSxHQUFhLE9BQUEsQ0FBUSwyQkFBUixDQVZiLENBQUE7O0FBQUE7QUFtQkcsd0JBQUEsQ0FBQTs7QUFBQSxnQkFBQSxPQUFBLEdBQVMsSUFBVCxDQUFBOztBQUFBLGdCQU1BLFVBQUEsR0FBWSxJQU5aLENBQUE7O0FBQUEsZ0JBWUEsUUFBQSxHQUFVLElBWlYsQ0FBQTs7QUFtQmEsRUFBQSxhQUFDLE9BQUQsR0FBQTtBQUNWLHFEQUFBLENBQUE7QUFBQSxJQUFBLHFDQUFNLE9BQU4sQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FDZjtBQUFBLE1BQUEsUUFBQSxFQUFVLElBQUMsQ0FBQSxRQUFYO0tBRGUsQ0FGbEIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLE9BQUEsQ0FDWjtBQUFBLE1BQUEsT0FBQSxFQUFTLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBckI7QUFBQSxNQUNBLGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFEaEM7S0FEWSxDQUxmLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBVEEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLE9B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QUFnQixRQUFBLEVBQVUsR0FBMUI7S0FBekIsQ0FMZixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBWSxJQUFDLENBQUEsUUFBYixFQUF1QixRQUF2QixDQU5aLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQWYsR0FBbUIsRUFQbkIsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixHQUFtQixFQVJuQixDQUFBO1dBVUEsSUFBQyxDQUFBLEtBWGdCO0VBQUEsQ0F0SnBCLENBQUE7O29CQUFBOztHQU5zQixLQWJ6QixDQUFBOztBQUFBLE1BMkxNLENBQUMsT0FBUCxHQUFpQixVQTNMakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICogTWFwIENhbnZhcyBhcHBsaWNhdGlvbiBib290c3RyYXBwZXJyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBFdmVudCAgID0gcmVxdWlyZSAnLi9ldmVudHMvTWFwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuTWFwVmlldyAgICA9IHJlcXVpcmUgJy4vdmlld3MvTWFwVmlldy5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBBcHAgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBNYXBCb3ggbWFwIHZpZXcgY29udGFpbmluZyBhbGwgbWFwIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eVxuICAgIyBAdHlwZSB7TC5NYXBCb3h9XG5cbiAgIG1hcFZpZXc6IG51bGxcblxuXG4gICAjIENhbnZhcyB2aWV3IGNvbnRhaW5pbmcgYWxsIGNhbnZhcyByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0NhbnZhc1ZpZXd9XG5cbiAgIGNhbnZhc1ZpZXc6IG51bGxcblxuXG4gICAjIEpTT04gRGF0YSBvZiB3YWdlcyBhbmQgbGF0LCBsbmcgYnkgc3RhdGVcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICB3YWdlRGF0YTogbnVsbFxuXG5cblxuXG4gICAjIEluaXRpYWxpemUgYXBwIGJ5IGNyZWF0aW5nIGEgY2FudmFzIHZpZXcgYW5kIGEgbWFwdmlld1xuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXdcbiAgICAgICAgIHdhZ2VEYXRhOiBAd2FnZURhdGFcblxuICAgICAgQG1hcFZpZXcgPSBuZXcgTWFwVmlld1xuICAgICAgICAgJGNhbnZhczogQGNhbnZhc1ZpZXcuJGVsXG4gICAgICAgICBjYW52YXNVcGRhdGVNZXRob2Q6IEBjYW52YXNWaWV3LnVwZGF0ZVxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQG1hcFZpZXcucmVuZGVyKClcblxuXG5cblxuXG5cbiAgICMgQWRkIGFwcC13aWRlIGV2ZW50IGxpc3RlbmVyc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAbWFwVmlldywgICAgTWFwRXZlbnQuSU5JVElBTElaRUQsICBAb25NYXBJbml0aWFsaXplZFxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCAgICBNYXBFdmVudC5aT09NX0NIQU5HRUQsIEBvbk1hcFpvb21DaGFuZ2VkXG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsICAgIE1hcEV2ZW50LkRSQUcsICAgICAgICAgQG9uTWFwRHJhZ1xuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbWFwIGluaXRpYWxpemF0aW9uIGV2ZW50cy4gIFJlY2VpdmVkIGZyb20gdGhlIE1hcFZpZXcgd2hpY2hcbiAgICMga2lja3Mgb2ZmIGNhbnZhcyByZW5kZXJpbmcgYW5kIDMuanMgaW5zdGFudGlhdGlvblxuXG4gICBvbk1hcEluaXRpYWxpemVkOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcucmVuZGVyKClcblxuXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHpvb20gY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge051bWJlcn0gem9vbSBUaGUgY3VycmVudCBtYXAgem9vbVxuXG4gICBvbk1hcFpvb21DaGFuZ2VkOiAoem9vbSkgLT5cblxuXG5cblxuXG4gICBvbk1hcERyYWc6IC0+XG4gICAgICBAY2FudmFzVmlldy5vbk1hcERyYWcoKVxuXG5cblxuXG5cbiAgIG9uTW91c2VNb3ZlOiAoZXZlbnQpID0+XG4gICAgICBAY2FudmFzVmlldy5vbk1vdXNlTW92ZVxuICAgICAgICAgeDogZXZlbnQuY2xpZW50WFxuICAgICAgICAgeTogZXZlbnQuY2xpZW5ZXG5cblxuXG5cbiMgS2ljayBvZmYgQXBwIGFuZCBsb2FkIGV4dGVybmFsIHdhZ2UgZGF0YVxuXG4kIC0+XG4gICAkLmdldEpTT04gJ2Fzc2V0cy9kYXRhL3dhZ2VzLmpzb24nLCAod2FnZURhdGEpIC0+XG4gICAgICBuZXcgQXBwXG4gICAgICAgICB3YWdlRGF0YTogd2FnZURhdGFcbiIsIiMjIypcbiAqIE1hcCBhcHAgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbk1hcENvbmZpZyA9XG5cblxuICAgIyBXaWR0aCBvZiBlYWNoIGluZGl2aWR1YWwgY2FudmFzIHNxdWFyZVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBDQU5WQVNfU0laRTogMzAwXG5cbiAgICMgVW5pcXVlIGlkZW50aWZpZXIgZm9yIE1hcEJveCBhcHBcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgSUQ6ICdkYW1hc3NpLmNvbnRyb2wtcm9vbSdcblxuXG4gICAjIE1hcCBsYW5kcyBvbiBTZWF0dGxlIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIElOSVQ6XG4gICAgICBsb2NhdGlvbjogWzQwLjA5MDI0LCAtOTUuNzEyODkxXVxuICAgICAgem9vbTogNVxuXG5cbiAgIE1BUF9PUFRJT05TOlxuICAgICAgbWluWm9vbTogNVxuICAgICAgbWF4Wm9vbTogOVxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDb25maWciLCIjIyMqXG4gKiBHZW5lcmljIEFwcC13aWRlIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5FdmVudCA9XG5cbiAgIFRFU1Q6ICdvblRlc3R0dCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50IiwiIyMjKlxuICogTGVhZmxldC1yZWxhdGVkIE1hcCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuTWFwRXZlbnQgPVxuXG4gICBEUkFHX1NUQVJUOiAgICAgICAnZHJhZ3N0YXJ0J1xuICAgRFJBRzogICAgICAgICAgICAgJ2RyYWcnXG4gICBEUkFHX0VORDogICAgICAgICAnZHJhZ2VuZCdcblxuICAgIyBUcmlnZ2VyZWQgb25jZSB0aGUgTWFwQm94IG1hcCBpcyBpbml0aWFsaXplZCBhbmQgcmVuZGVyZWQgdG8gdGhlIERPTVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBJTklUSUFMSVpFRDogICAgICAnaW5pdGlhbGl6ZWQnXG4gICBVUERBVEU6ICAgICAgICAgICAndXBkYXRlJ1xuICAgWk9PTV9TVEFSVDogICAgICAgJ3pvb21zdGFydCdcbiAgIFpPT01fQ0hBTkdFRDogICAgICd6b29tZW5kJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwRXZlbnQiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgZm9yIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5jbGFzcyBWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG5cbiAgICMgVmlldyBjb25zdHJ1Y3RvciB3aGljaCBhY2NlcHRzIHBhcmFtZXRlcnMgYW5kIG1lcmdlcyB0aGVtXG4gICAjIGludG8gdGhlIHZpZXcgcHJvdG90eXBlIGZvciBlYXN5IGFjY2Vzcy5cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICAgICMgTWVyZ2UgcGFzc2VkIHByb3BzIG9yIGluc3RhbmNlIGRlZmF1bHRzXG4gICAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiIyMjKlxuICogR2VuZXJhdGUgYSBXSU5UUiBncmFkaWVudCBiYXNlZCB1cG9uIG91ciBzdHlsZWd1aWRlXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjkuMTRcbiMjI1xuXG5cbldpbnRyR3JhZGllbnQgPVxuXG4gICAjIERlZmF1bHQgc2l6ZSBvZiB0aGUgY2FudmFzIHRvIGJlIGRyYXduIHVwb25cbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgREVGQVVMVF9TSVpFOiA1MTJcblxuXG4gICAjIEJhc2UgY29sb3JzIGZvciBjb21wb3NpbmcgZ3JhZGllbnRzXG4gICAjIEB0eXBlIHtPYmplY3R9XG5cbiAgIENPTE9SUzpcbiAgICAgIHBsdW06XG4gICAgICAgICBsaWdodDogJyNBMTRGNDknXG4gICAgICAgICBkYXJrOiAgJyM1YjE5MTUnXG5cbiAgICAgIGdyZWVuOlxuICAgICAgICAgbGlnaHQ6ICcjQURENEJGJ1xuICAgICAgICAgZGFyazogICcjNEU4MjczJ1xuXG4gICAgICBncmV5OlxuICAgICAgICAgbGlnaHQ6ICcjOUY5RjlGJ1xuICAgICAgICAgZGFyazogICcjNzc3Nzc3J1xuXG4gICAgICBwaW5rOiAgICAgJyNGRDY2ODUnXG4gICAgICB5ZWxsb3c6ICAgJyNGOEU5OUUnXG4gICAgICBhcXVhOiAgICAgJyNBNkZDRUInXG4gICAgICBvcmFuZ2U6ICAgJyNGQzkxNzAnXG5cblxuXG4gICB5ZWxsb3dQaW5rOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMueWVsbG93LCBzdG9wOiBAQ09MT1JTLnBpbmsgfVxuXG4gICB5ZWxsb3dBcXVhOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMueWVsbG93LCBzdG9wOiBAQ09MT1JTLmFxdWEgfVxuXG4gICBwaW5rQXF1YTogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLnBpbmssIHN0b3A6IEBDT0xPUlMuYXF1YSB9XG5cbiAgIHllbGxvd09yYW5nZTogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLnllbGxvdywgc3RvcDogQENPTE9SUy5vcmFuZ2UgfVxuXG4gICBvcmFuZ2VQaW5rOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMub3JhbmdlLCBzdG9wOiBAQ09MT1JTLnBpbmsgfVxuXG4gICB5ZWxsb3dHcmVlbjogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLnllbGxvdywgc3RvcDogQENPTE9SUy5ncmVlbi5saWdodCB9XG5cbiAgIG9yYW5nZUFxdWE6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy5vcmFuZ2UsIHN0b3A6IEBDT0xPUlMuYXF1YSB9XG5cblxuXG4gICAjIEdlbmVyYXRlcyBhIGNvbG9yIGdyYWRpZW50IGJ5IHRha2luZyBhbiBvYmplY3QgY29uc2lzdGluZyBvZlxuICAgIyBgc3RhcnRgIGFuZCBgc3RvcGAgYW5kIGJlbGVuZGluZyB0aGVtIHRvZ2V0aGVyIHdpdGhpbiBhIGN0eFxuICAgIyBAcGFyYW0ge09iamVjdH0gY29sb3JSYW5nZVxuICAgIyBAcmV0dXJuIHtDb250ZXh0fVxuXG4gICBnZW5lcmF0ZTogKGNvbG9yUmFuZ2UpIC0+XG4gICAgICB7c3RhcnQsIHN0b3B9ID0gY29sb3JSYW5nZVxuXG4gICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG4gICAgICBjYW52YXMud2lkdGggID0gQERFRkFVTFRfU0laRVxuICAgICAgY2FudmFzLmhlaWdodCA9IEBERUZBVUxUX1NJWkVcblxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcblxuICAgICAgY29udGV4dC5yZWN0IDAsIDAsIEBERUZBVUxUX1NJWkUsIEBERUZBVUxUX1NJWkVcbiAgICAgIGdyYWRpZW50ID0gY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudCAwLCAwLCBAREVGQVVMVF9TSVpFLCBAREVGQVVMVF9TSVpFXG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AgMCwgc3RhcnRcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCAxLCBzdG9wXG5cbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnRcbiAgICAgIGNvbnRleHQuZmlsbCgpXG5cbiAgICAgIHJldHVybiBjYW52YXNcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFdpbnRyR3JhZGllbnQiLCIjIyMqXG4gKiBDYW52YXMgTGF5ZXIgd2hpY2ggcmVwcmVzZW50cyBkYXRhIHRvIGJlIGRpc3BsYXllZCBvbiB0aGUgTWFwVmlld1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuTWFwQ29uZmlnICA9IHJlcXVpcmUgJy4uL2NvbmZpZy9NYXBDb25maWcuY29mZmVlJ1xuRXZlbnQgICAgICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9FdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuVGhyZWVTY2VuZSA9IHJlcXVpcmUgJy4vVGhyZWVTY2VuZS5jb2ZmZWUnXG5cblxuY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICAjIElEIG9mIERPTSBjb250YWluZXIgZm9yIGNhbnZhcyBsYXllclxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBpZDogJ2NhbnZhcy1sYXllcidcblxuXG5cbiAgICMgSW5zdGFudGlhdGUgVGhyZWUuanMgc2NlbmVzIGJhc2VkIHVwb24gbnVtYmVyIG9mIGRhdGFwb2ludHMgaW4gdGhlIEpTT05cblxuICAgcmVuZGVyOiAtPlxuXG4gICAgICBAc2NlbmVzID0gKF8ucmFuZ2UgQHdhZ2VEYXRhLmxlbmd0aCkubWFwIChzY2VuZSwgaW5kZXgpID0+XG4gICAgICAgICBzY2VuZSA9IG5ldyBUaHJlZVNjZW5lXG4gICAgICAgICAgICB3YWdlOiBAd2FnZURhdGFbaW5kZXhdXG5cbiAgICAgICMgQXBwZW5kIHRvIGRvbSBhbmQgc3RhcnQgdGlja2VyXG4gICAgICBAc2NlbmVzLmZvckVhY2ggKHNjZW5lKSA9PiBAJGVsLmFwcGVuZCBzY2VuZS5yZW5kZXIoKS4kZWxcbiAgICAgIEBvblRpY2soKVxuXG5cblxuXG4gICAjIFVwZGF0ZSB0aGUgY2FudmFzIGxheWVyIHdoZW5ldmVyIHRoZXJlIGlzIGEgem9vbSBhY3Rpb25cbiAgICMgQHBhcmFtIHtIVE1MRG9tRWxlbWVudH0gY2FudmFzT3ZlcmxheVxuICAgIyBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG5cbiAgIHVwZGF0ZTogKGNhbnZhc092ZXJsYXksIHBhcmFtcykgPT5cbiAgICAgIHtsZWZ0LCB0b3B9ID0gQCRlbC5vZmZzZXQoKVxuXG4gICAgICBAd2FnZURhdGEuZm9yRWFjaCAoc3RhdGUsIGluZGV4KSA9PlxuICAgICAgICAge3gsIHl9ID0gY2FudmFzT3ZlcmxheS5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQgW3N0YXRlLmxhdGl0dWRlLCBzdGF0ZS5sb25naXR1ZGVdXG5cbiAgICAgICAgIGlmIEBzY2VuZXMgYW5kIGluZGV4IDwgQHdhZ2VEYXRhLmxlbmd0aFxuICAgICAgICAgICAgeyRlbH0gPSBAc2NlbmVzW2luZGV4XVxuXG4gICAgICAgICAgICBUd2Vlbk1heC50byAkZWwsIC42LFxuICAgICAgICAgICAgICAgeDogeCAtIGxlZnQgLSAoTWFwQ29uZmlnLkNBTlZBU19TSVpFICogLjUpXG4gICAgICAgICAgICAgICB5OiB5IC0gdG9wICAtIChNYXBDb25maWcuQ0FOVkFTX1NJWkUgKiAuNSlcbiAgICAgICAgICAgICAgIGVhc2U6IEV4cG8uZWFzZU91dFxuXG5cblxuXG4gICB1cGRhdGVDYW1lcmFBbmdsZTogPT5cbiAgICAgIEBzY2VuZXMuZm9yRWFjaCAoc2NlbmUsIGluZGV4KSA9PlxuICAgICAgICAgc2NlbmUgID0gQHNjZW5lc1tpbmRleF1cbiAgICAgICAgIG9mZnNldCA9IHNjZW5lLiRlbC5vZmZzZXQoKVxuXG4gICAgICAgICAjIENvbXB1dGUgdGhlIGRpc3RhbmNlIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHdpbmRvdy4gIFVzZWQgdG8gY3JlYXRlXG4gICAgICAgICAjIHN3YXkgbXVsdGlwbGVzIGZvciBwZXJzcGVjdGl2ZSBjYW1lcmEgYW5nbGVcblxuICAgICAgICAgZGlzdCA9XG4gICAgICAgICAgICB4OiAoKHdpbmRvdy5pbm5lcldpZHRoICAqIC41KSAtIChvZmZzZXQubGVmdCArIChNYXBDb25maWcuQ0FOVkFTX1NJWkUgKiAuNSkpKSAqIC4wMVxuICAgICAgICAgICAgeTogKCh3aW5kb3cuaW5uZXJIZWlnaHQgKiAuNSkgLSAob2Zmc2V0LnRvcCAgKyAoTWFwQ29uZmlnLkNBTlZBU19TSVpFICogLjUpKSkgKiAuMDFcblxuICAgICAgICAgc2NlbmUudXBkYXRlQ2FtZXJhQW5nbGUoIGRpc3QueCwgLWRpc3QueSApXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBUSFJFRS5qcyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgZXZlbnQgbG9vcC4gIFVwZGF0ZXMgZWFjaFxuICAgIyBpbnZpZGl2aWR1YWwgY2FudmFzIGxheWVyIGluIHNjZW5lcyBhcnJheVxuXG4gICBvblRpY2s6IChldmVudCkgPT5cbiAgICAgIEBzY2VuZXMuZm9yRWFjaCAoc2NlbmUpIC0+IHNjZW5lLnRpY2soKVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBvblRpY2tcblxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgbGF5ZXIgYW5kIGJlZ2luIFRIUkVFLmpzIHRpY2tlclxuICAgIyBAcHVibGljXG5cbiAgIG9uVXBkYXRlWm9vbTogKHpvb20pIC0+XG4gICAgICBjb25zb2xlLmxvZyB6b29tXG5cblxuXG5cblxuICAgb25NYXBEcmFnOiAtPlxuICAgICAgQHVwZGF0ZUNhbWVyYUFuZ2xlKClcblxuXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNWaWV3IiwiIyMjKlxuICogTWFwQm94IG1hcCBsYXllclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuTWFwQ29uZmlnICA9IHJlcXVpcmUgJy4uL2NvbmZpZy9NYXBDb25maWcuY29mZmVlJ1xuRXZlbnQgICAgICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9FdmVudC5jb2ZmZWUnXG5NYXBFdmVudCAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL01hcEV2ZW50LmNvZmZlZSdcbkNhbnZhc1ZpZXcgPSByZXF1aXJlICcuL0NhbnZhc1ZpZXcuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBNYXBWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgSUQgb2YgdGhlIHZpZXdcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgaWQ6ICdtYXAnXG5cblxuICAgIyBQcm94eSBMLm1hcGJveCBuYW1lc3BhY2UgZm9yIGVhc3kgYWNjZXNzXG4gICAjIEB0eXBlIHtMLm1hcGJveH1cblxuICAgbWFwYm94OiBudWxsXG5cblxuICAgIyBNYXBCb3ggbWFwIGxheWVyXG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgbWFwTGF5ZXI6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgTGVhZmxldCBsYXllciB0byBpbnNlcnQgbWFwIGJlZm9yZVxuICAgIyBAdHlwZSB7JH1cblxuICAgJGxlYWZsZXRQYW5lOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIGNhbnZhcyBET00gZWxlbWVudFxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgICRjYW52YXM6IG51bGxcblxuXG5cbiAgICMgSW5pdGlhbGl6ZSB0aGUgTWFwTGF5ZXIgYW5kIGtpY2sgb2ZmIENhbnZhcyBsYXllciByZXBvc2l0aW9uaW5nXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIERlZmF1bHQgb3B0aW9ucyB0byBwYXNzIGludG8gdGhlIGFwcFxuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBtYXBib3ggPSBMLm1hcGJveFxuICAgICAgQG1hcCAgICA9IEBtYXBib3gubWFwXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgYnkgY3JlYXRpbmcgdGhlIE1hcCBsYXllciBhbmQgaW5zZXJ0aW5nIHRoZVxuICAgIyBjYW52YXMgRE9NIGxheWVyIGludG8gTGVhZmxldCdzIGhpYXJjaHlcblxuICAgcmVuZGVyOiAtPlxuICAgICAgQG1hcExheWVyID0gQG1hcGJveC5tYXAgQGlkLCBNYXBDb25maWcuSUQsIE1hcENvbmZpZy5NQVBfT1BUSU9OU1xuICAgICAgICAgLnNldFZpZXcgICAgTWFwQ29uZmlnLklOSVQubG9jYXRpb24sIE1hcENvbmZpZy5JTklULnpvb21cbiAgICAgICAgIC5hZGRDb250cm9sIEBtYXBib3guZ2VvY29kZXJDb250cm9sIE1hcENvbmZpZy5JRFxuXG4gICAgICAjIEFkZCBhIGNhbnZhcyBvdmVybGF5IGFuZCBwYXNzIGluIGFuIHVwZGF0ZSBtZXRob2RcbiAgICAgIEwuY2FudmFzT3ZlcmxheSgpXG4gICAgICAgICAuZHJhd2luZyBAY2FudmFzVXBkYXRlTWV0aG9kXG4gICAgICAgICAuYWRkVG8gQG1hcExheWVyXG4gICAgICAgICAucmVkcmF3KClcblxuICAgICAgQGluc2VydENhbnZhc0xheWVyKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQG1hcExheWVyLm9uIE1hcEV2ZW50LlpPT01fQ0hBTkdFRCwgQG9uWm9vbUNoYW5nZWRcbiAgICAgIEBtYXBMYXllci5vbiBNYXBFdmVudC5EUkFHLCAgICAgICAgIEBvbk1hcERyYWdcblxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIEhhbmRsZXIgZm9yIHpvb20gY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge09iamVjdH0gZXZlbnRcblxuICAgb25ab29tQ2hhbmdlZDogKGV2ZW50KSA9PlxuICAgICAgQHRyaWdnZXIgTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAbWFwTGF5ZXIuZ2V0Wm9vbSgpXG5cblxuXG5cblxuICAgb25NYXBEcmFnOiAoZXZlbnQpID0+XG4gICAgICBAdHJpZ2dlciBNYXBFdmVudC5EUkFHXG5cblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgTW92ZXMgdGhlIGNhbnZhcyBsYXllciBpbnRvIHRoZSBMZWFmbGV0IERPTVxuXG4gICBpbnNlcnRDYW52YXNMYXllcjogLT5cbiAgICAgIEAkbGVhZmxldFBhbmUgPSAkIFwiLmxlYWZsZXQtb2JqZWN0cy1wYW5lXCJcbiAgICAgIEAkY2FudmFzLnByZXBlbmRUbyBAJGxlYWZsZXRQYW5lXG4gICAgICBAJGNhbnZhcy5jc3MgJ3otaW5kZXgnLCA1XG5cbiAgICAgIEB0cmlnZ2VyIE1hcEV2ZW50LklOSVRJQUxJWkVEXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwVmlldyIsIiMjIypcbiAqIEluZGl2aWR1YWwgVGhyZWUuanMgU2NlbmVzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjguMTRcbiMjI1xuXG5XaW50ckdyYWRpZW50ID0gcmVxdWlyZSAnLi4vdXRpbHMvV2ludHJHcmFkaWVudC5jb2ZmZWUnXG5NYXBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5FdmVudCAgICAgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgVGhyZWVTY2VuZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIENsYXNzIG5hbWUgb2YgRE9NIGNvbnRhaW5lciBmb3IgaW5kaXZpZHVhbCBUaHJlZS5qcyBzY2VuZXNcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnc2NlbmUnXG5cblxuXG4gICBldmVudHM6XG4gICAgICAnY2xpY2snOiAnb25DbGljaydcblxuXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQHNldHVwVGhyZWVKU1JlbmRlcmVyKClcblxuXG5cblxuICAgcmVuZGVyOiAtPlxuICAgICAgc2l6ZSA9IE1hcENvbmZpZy5DQU5WQVNfU0laRVxuXG4gICAgICAjIEFkZCBTY2VuZSBjYW52YXMgdG8gdGhlIGRvbVxuICAgICAgXy5kZWZlciA9PlxuXG4gICAgICAgICBAcmVuZGVyZXIuc2V0U2l6ZSBzaXplLCBzaXplXG4gICAgICAgICBAJGVsLmFwcGVuZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG4gICAgICAgICAjIEFuaW1hdGUgaW4gdGhlIGN1YmVcbiAgICAgICAgIF8uZGVsYXkgPT5cblxuICAgICAgICAgICAgdGltZSAgPSAxXG4gICAgICAgICAgICBlYXNlICA9IEV4cG8uZWFzZUluT3V0XG4gICAgICAgICAgICBkZWxheSA9IE1hdGgucmFuZG9tKCkgKiA1XG5cbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICBUd2Vlbk1heC5mcm9tVG8gQGN1YmUuc2NhbGUsIHRpbWUsIHk6IC4xLFxuICAgICAgICAgICAgICAgeTogMVxuICAgICAgICAgICAgICAgZGVsYXk6IGRlbGF5XG4gICAgICAgICAgICAgICBlYXNlOiBlYXNlXG5cbiAgICAgICAgICAgIFR3ZWVuTWF4LmZyb21UbyBAY3ViZS5yb3RhdGlvbiwgdGltZSwgeDogMTkuNCxcbiAgICAgICAgICAgICAgIHg6IDIwXG4gICAgICAgICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgICAgICAgICAgIGVhc2U6IGVhc2VcblxuICAgICAgQFxuXG5cblxuXG4gICB0aWNrOiAtPlxuICAgICAgI0BjdWJlLnJvdGF0aW9uLnkgKz0gLjEgaWYgQGN1YmVcbiAgICAgIEByZW5kZXJlci5yZW5kZXIgQHNjZW5lLCBAY2FtZXJhXG5cblxuXG5cbiAgIHVwZGF0ZUNhbWVyYUFuZ2xlOiAoeCwgeSkgLT5cbiAgICAgIEBjYW1lcmEucG9zaXRpb24ueCA9IHhcbiAgICAgIEBjYW1lcmEucG9zaXRpb24ueSA9IHlcblxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICBvbkNsaWNrOiAoZXZlbnQpID0+XG4gICAgICBjb25zb2xlLmxvZyBAd2FnZS53YWdlXG5cblxuXG5cblxuXG5cbiAgICMgUFJJVkFURSBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICBzZXR1cFRocmVlSlNSZW5kZXJlcjogLT5cbiAgICAgIEBoZWlnaHQgPSBpZiBAd2FnZS53YWdlIGlzbnQgMCB0aGVuIEB3YWdlLndhZ2UgKiAzIGVsc2UgMlxuXG4gICAgICBjYW1lcmFBdHRyaWJ1dGVzID1cbiAgICAgICAgIGFuZ2xlOiA0NVxuICAgICAgICAgYXNwZWN0OiBNYXBDb25maWcuQ0FOVkFTX1NJWkUgLyBNYXBDb25maWcuQ0FOVkFTX1NJWkVcbiAgICAgICAgIG5lYXI6IC4xXG4gICAgICAgICBmYXI6IDEwMFxuXG4gICAgICAjIFNjZW5lIHBhcmFtZXRlcnNcbiAgICAgIEBzY2VuZSAgICA9IG5ldyBUSFJFRS5TY2VuZVxuICAgICAgQGNhbWVyYSAgID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhIGNhbWVyYUF0dHJpYnV0ZXMuYW5nbGUsIGNhbWVyYUF0dHJpYnV0ZXMuYXNwZWN0LCBjYW1lcmFBdHRyaWJ1dGVzLm5lYXIsIGNhbWVyYUF0dHJpYnV0ZXMuZmFyXG4gICAgICBAcmVuZGVyZXIgPSBuZXcgVEhSRUUuQ2FudmFzUmVuZGVyZXIgYWxwaGE6IHRydWVcblxuXG4gICAgICBAc2NlbmUuYWRkIEByZXR1cm5SYW5kb21Db2xvckN1YmUoKVxuICAgICAgI0BzY2VuZS5hZGQgQHJldHVybkdyYWRpZW50Q3ViZSgpXG5cbiAgICAgICMgVXBkYXRlIHZpZXdcbiAgICAgIEByZW5kZXJlci5zZXRDbGVhckNvbG9yIDB4MDAwMDAwLCAwXG4gICAgICBAY2FtZXJhLnBvc2l0aW9uLnogPSA1MFxuXG5cblxuXG4gICByZXR1cm5HcmFkaWVudDogKHdhZ2UpID0+XG4gICAgICBpZiB3YWdlIDwgNSAgICAgICAgICAgICAgICAgdGhlbiByZXR1cm4gV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd1BpbmsoKVxuICAgICAgaWYgd2FnZSA8IDYgICBhbmQgd2FnZSA+IDUgIHRoZW4gcmV0dXJuIFdpbnRyR3JhZGllbnQuZ2VuZXJhdGUgV2ludHJHcmFkaWVudC55ZWxsb3dQaW5rKClcbiAgICAgIGlmIHdhZ2UgPCA3ICAgYW5kIHdhZ2UgPiA2ICB0aGVuIHJldHVybiBXaW50ckdyYWRpZW50LmdlbmVyYXRlIFdpbnRyR3JhZGllbnQueWVsbG93QXF1YSgpXG4gICAgICBpZiB3YWdlIDwgOCAgIGFuZCB3YWdlID4gNyAgdGhlbiByZXR1cm4gV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd1BpbmsoKVxuICAgICAgaWYgd2FnZSA8IDkgICBhbmQgd2FnZSA+IDggIHRoZW4gcmV0dXJuIFdpbnRyR3JhZGllbnQuZ2VuZXJhdGUgV2ludHJHcmFkaWVudC5vcmFuZ2VQaW5rKClcbiAgICAgIGlmIHdhZ2UgPCAyNSAgYW5kIHdhZ2UgPiA5ICB0aGVuIHJldHVybiBXaW50ckdyYWRpZW50LmdlbmVyYXRlIFdpbnRyR3JhZGllbnQueWVsbG93R3JlZW4oKVxuXG5cblxuXG4gICByYW5kb21Db2xvcjogLT5cbiAgICAgIGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xuICAgICAgY29sb3IgPSAnIyc7XG4gICAgICBmb3IgaSBpbiBbMC4uNV1cbiAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTYpXVxuXG4gICAgICBjb2xvclxuXG5cblxuXG4gICByZXR1cm5SYW5kb21Db2xvckN1YmU6IC0+XG4gICAgICBAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkgMiwgQGhlaWdodCwgMlxuXG4gICAgICBmb3IgaSBpbiBbMC4uQGdlb21ldHJ5LmZhY2VzLmxlbmd0aCAtIDFdIGJ5ICsyXG4gICAgICAgICBoZXggPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmZcbiAgICAgICAgIEBnZW9tZXRyeS5mYWNlc1tpXS5jb2xvci5zZXRIZXggaGV4XG4gICAgICAgICBAZ2VvbWV0cnkuZmFjZXNbaSArIDFdLmNvbG9yLnNldEhleCBoZXhcblxuXG4gICAgICBAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwgdmVydGV4Q29sb3JzOiBUSFJFRS5GYWNlQ29sb3JzLCBvdmVyZHJhdzogMC41XG4gICAgICBAY3ViZSA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgQG1hdGVyaWFsXG4gICAgICBAY3ViZS5yb3RhdGlvbi54ID0gMjBcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgPSAyMFxuXG4gICAgICByZXR1cm4gQGN1YmVcblxuXG5cblxuICAgcmV0dXJuR3JhZGllbnRDdWJlOiAtPlxuICAgICAgQGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5IDIsIEBoZWlnaHQsIDIsIDIsIDIsIDJcblxuICAgICAgdGV4dHVyZSAgPSBuZXcgVEhSRUUuVGV4dHVyZSBAcmV0dXJuR3JhZGllbnQgQHdhZ2Uud2FnZVxuICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWVcblxuICAgICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgbWFwOiB0ZXh0dXJlLCBvdmVyZHJhdzogMC41IH0gKVxuICAgICAgQGN1YmUgPSBuZXcgVEhSRUUuTWVzaCggQGdlb21ldHJ5LCBtYXRlcmlhbCApXG4gICAgICBAY3ViZS5yb3RhdGlvbi54ID0gMjBcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgPSAyMFxuXG4gICAgICBAY3ViZVxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUaHJlZVNjZW5lIl19
