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
  ID: 'damassi.i6mpgfa0',
  INIT: {
    location: [40.09024, -95.712891],
    zoom: 5
  },
  CANVAS_SIZE: 300
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
    this.mapLayer = this.mapbox.map(this.id, MapConfig.ID).setView(MapConfig.INIT.location, MapConfig.INIT.zoom).addControl(this.mapbox.geocoderControl(MapConfig.ID));
    $('.leaflet-control-grid').remove();
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
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

WintrGradient = require('../utils/WintrGradient.coffee');

MapConfig = require('../config/MapConfig.coffee');

Event = require('../events/Event.coffee');

View = require('../supers/View.coffee');

ThreeScene = (function(_super) {
  __extends(ThreeScene, _super);

  ThreeScene.prototype.className = 'scene';

  function ThreeScene(options) {
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
    if (this.cube) {
      this.cube.rotation.y += .1;
    }
    return this.renderer.render(this.scene, this.camera);
  };

  ThreeScene.prototype.updateCameraAngle = function(x, y) {
    this.camera.position.x = x;
    return this.camera.position.y = y;
  };

  ThreeScene.prototype.setupThreeJSRenderer = function() {
    var cameraAttributes, height, material, texture;
    height = this.wage.wage !== 0 ? this.wage.wage * 3 : 2;
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
    this.geometry = new THREE.BoxGeometry(2, height, 2, 2, 2, 2);
    texture = new THREE.Texture(WintrGradient.generate(WintrGradient.yellowGreen()));
    texture.needsUpdate = true;
    material = new THREE.MeshBasicMaterial({
      map: texture,
      overdraw: 0.5
    });
    this.cube = new THREE.Mesh(this.geometry, material);
    this.cube.rotation.x = 20;
    this.cube.rotation.y = 20;
    this.scene.add(this.cube);
    this.renderer.setClearColor(0x000000, 0);
    return this.camera.position.z = 50;
  };

  ThreeScene.prototype.generateTexture = function(startHex, stopHex) {
    var canvas, context, gradient, size;
    size = 512;
    canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    context = canvas.getContext('2d');
    context.rect(0, 0, size, size);
    gradient = context.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, startHex);
    gradient.addColorStop(1, stopHex);
    context.fillStyle = gradient;
    context.fill();
    return canvas;
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

  ThreeScene.prototype.returnRandomColorCube = function() {};

  return ThreeScene;

})(View);

module.exports = ThreeScene;


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":5,"../utils/WintrGradient.coffee":6}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvTWFwRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3V0aWxzL1dpbnRyR3JhZGllbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9XSU5UUi9FeHBlcmltZW50cy9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL1RocmVlU2NlbmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsd0NBQUE7RUFBQTs7aVNBQUE7O0FBQUEsUUFPQSxHQUFhLE9BQUEsQ0FBUSwwQkFBUixDQVBiLENBQUE7O0FBQUEsSUFRQSxHQUFhLE9BQUEsQ0FBUSxzQkFBUixDQVJiLENBQUE7O0FBQUEsT0FTQSxHQUFhLE9BQUEsQ0FBUSx3QkFBUixDQVRiLENBQUE7O0FBQUEsVUFVQSxHQUFhLE9BQUEsQ0FBUSwyQkFBUixDQVZiLENBQUE7O0FBQUE7QUFtQkcsd0JBQUEsQ0FBQTs7QUFBQSxnQkFBQSxPQUFBLEdBQVMsSUFBVCxDQUFBOztBQUFBLGdCQU1BLFVBQUEsR0FBWSxJQU5aLENBQUE7O0FBQUEsZ0JBWUEsUUFBQSxHQUFVLElBWlYsQ0FBQTs7QUFtQmEsRUFBQSxhQUFDLE9BQUQsR0FBQTtBQUNWLHFEQUFBLENBQUE7QUFBQSxJQUFBLHFDQUFNLE9BQU4sQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FDZjtBQUFBLE1BQUEsUUFBQSxFQUFVLElBQUMsQ0FBQSxRQUFYO0tBRGUsQ0FGbEIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLE9BQUEsQ0FDWjtBQUFBLE1BQUEsT0FBQSxFQUFTLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBckI7QUFBQSxNQUNBLGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFEaEM7S0FEWSxDQUxmLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLENBVEEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLE9B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cUJBQUEsR0FBdUIsU0FBQSxHQUFBLENBM0h2QixDQUFBOztvQkFBQTs7R0FOc0IsS0FiekIsQ0FBQTs7QUFBQSxNQW1LTSxDQUFDLE9BQVAsR0FBaUIsVUFuS2pCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAqIE1hcCBDYW52YXMgYXBwbGljYXRpb24gYm9vdHN0cmFwcGVyclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuTWFwRXZlbnQgICA9IHJlcXVpcmUgJy4vZXZlbnRzL01hcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuL3N1cGVycy9WaWV3LmNvZmZlZSdcbk1hcFZpZXcgICAgPSByZXF1aXJlICcuL3ZpZXdzL01hcFZpZXcuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvQ2FudmFzVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgTWFwQm94IG1hcCB2aWV3IGNvbnRhaW5pbmcgYWxsIG1hcCByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0wuTWFwQm94fVxuXG4gICBtYXBWaWV3OiBudWxsXG5cblxuICAgIyBDYW52YXMgdmlldyBjb250YWluaW5nIGFsbCBjYW52YXMgcmVsYXRlZCBmdW5jdGlvbmFsaXR5XG4gICAjIEB0eXBlIHtDYW52YXNWaWV3fVxuXG4gICBjYW52YXNWaWV3OiBudWxsXG5cblxuICAgIyBKU09OIERhdGEgb2Ygd2FnZXMgYW5kIGxhdCwgbG5nIGJ5IHN0YXRlXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgd2FnZURhdGE6IG51bGxcblxuXG5cblxuICAgIyBJbml0aWFsaXplIGFwcCBieSBjcmVhdGluZyBhIGNhbnZhcyB2aWV3IGFuZCBhIG1hcHZpZXdcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAY2FudmFzVmlldyA9IG5ldyBDYW52YXNWaWV3XG4gICAgICAgICB3YWdlRGF0YTogQHdhZ2VEYXRhXG5cbiAgICAgIEBtYXBWaWV3ID0gbmV3IE1hcFZpZXdcbiAgICAgICAgICRjYW52YXM6IEBjYW52YXNWaWV3LiRlbFxuICAgICAgICAgY2FudmFzVXBkYXRlTWV0aG9kOiBAY2FudmFzVmlldy51cGRhdGVcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcbiAgICAgIEBtYXBWaWV3LnJlbmRlcigpXG5cblxuXG5cblxuXG4gICAjIEFkZCBhcHAtd2lkZSBldmVudCBsaXN0ZW5lcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsICAgIE1hcEV2ZW50LklOSVRJQUxJWkVELCAgQG9uTWFwSW5pdGlhbGl6ZWRcbiAgICAgIEBsaXN0ZW5UbyBAbWFwVmlldywgICAgTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAb25NYXBab29tQ2hhbmdlZFxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCAgICBNYXBFdmVudC5EUkFHLCAgICAgICAgIEBvbk1hcERyYWdcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG1hcCBpbml0aWFsaXphdGlvbiBldmVudHMuICBSZWNlaXZlZCBmcm9tIHRoZSBNYXBWaWV3IHdoaWNoXG4gICAjIGtpY2tzIG9mZiBjYW52YXMgcmVuZGVyaW5nIGFuZCAzLmpzIGluc3RhbnRpYXRpb25cblxuICAgb25NYXBJbml0aWFsaXplZDogLT5cbiAgICAgIEBjYW52YXNWaWV3LnJlbmRlcigpXG5cblxuXG5cblxuICAgIyBIYW5kbGVyIGZvciB6b29tIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtOdW1iZXJ9IHpvb20gVGhlIGN1cnJlbnQgbWFwIHpvb21cblxuICAgb25NYXBab29tQ2hhbmdlZDogKHpvb20pIC0+XG5cblxuXG5cblxuICAgb25NYXBEcmFnOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcub25NYXBEcmFnKClcblxuXG5cblxuXG4gICBvbk1vdXNlTW92ZTogKGV2ZW50KSA9PlxuICAgICAgQGNhbnZhc1ZpZXcub25Nb3VzZU1vdmVcbiAgICAgICAgIHg6IGV2ZW50LmNsaWVudFhcbiAgICAgICAgIHk6IGV2ZW50LmNsaWVuWVxuXG5cblxuXG4jIEtpY2sgb2ZmIEFwcCBhbmQgbG9hZCBleHRlcm5hbCB3YWdlIGRhdGFcblxuJCAtPlxuICAgJC5nZXRKU09OICdhc3NldHMvZGF0YS93YWdlcy5qc29uJywgKHdhZ2VEYXRhKSAtPlxuICAgICAgbmV3IEFwcFxuICAgICAgICAgd2FnZURhdGE6IHdhZ2VEYXRhXG4iLCIjIyMqXG4gKiBNYXAgYXBwIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBDb25maWcgPVxuXG5cbiAgICMgVW5pcXVlIGlkZW50aWZpZXIgZm9yIE1hcEJveCBhcHBcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgSUQ6ICdkYW1hc3NpLmk2bXBnZmEwJ1xuXG5cbiAgICMgTWFwIGxhbmRzIG9uIFNlYXR0bGUgZHVyaW5nIGluaXRpYWxpemF0aW9uXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgSU5JVDpcbiAgICAgIGxvY2F0aW9uOiBbNDAuMDkwMjQsIC05NS43MTI4OTFdXG4gICAgICB6b29tOiA1XG5cblxuICAgIyBXaWR0aCBvZiBlYWNoIGluZGl2aWR1YWwgY2FudmFzIHNxdWFyZVxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBDQU5WQVNfU0laRTogMzAwXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENvbmZpZyIsIiMjIypcbiAqIEdlbmVyaWMgQXBwLXdpZGUgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbkV2ZW50ID1cblxuICAgVEVTVDogJ29uVGVzdHR0J1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnQiLCIjIyMqXG4gKiBMZWFmbGV0LXJlbGF0ZWQgTWFwIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBFdmVudCA9XG5cbiAgIERSQUdfU1RBUlQ6ICAgICAgICdkcmFnc3RhcnQnXG4gICBEUkFHOiAgICAgICAgICAgICAnZHJhZydcbiAgIERSQUdfRU5EOiAgICAgICAgICdkcmFnZW5kJ1xuXG4gICAjIFRyaWdnZXJlZCBvbmNlIHRoZSBNYXBCb3ggbWFwIGlzIGluaXRpYWxpemVkIGFuZCByZW5kZXJlZCB0byB0aGUgRE9NXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIElOSVRJQUxJWkVEOiAgICAgICdpbml0aWFsaXplZCdcbiAgIFVQREFURTogICAgICAgICAgICd1cGRhdGUnXG4gICBaT09NX1NUQVJUOiAgICAgICAnem9vbXN0YXJ0J1xuICAgWk9PTV9DSEFOR0VEOiAgICAgJ3pvb21lbmQnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBFdmVudCIsIiMjIypcbiAqIFZpZXcgc3VwZXJjbGFzcyBmb3Igc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbmNsYXNzIFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cblxuICAgIyBWaWV3IGNvbnN0cnVjdG9yIHdoaWNoIGFjY2VwdHMgcGFyYW1ldGVycyBhbmQgbWVyZ2VzIHRoZW1cbiAgICMgaW50byB0aGUgdmlldyBwcm90b3R5cGUgZm9yIGVhc3kgYWNjZXNzLlxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgICAgIyBNZXJnZSBwYXNzZWQgcHJvcHMgb3IgaW5zdGFuY2UgZGVmYXVsdHNcbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXciLCIjIyMqXG4gKiBHZW5lcmF0ZSBhIFdJTlRSIGdyYWRpZW50IGJhc2VkIHVwb24gb3VyIHN0eWxlZ3VpZGVcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuOS4xNFxuIyMjXG5cblxuV2ludHJHcmFkaWVudCA9XG5cbiAgICMgRGVmYXVsdCBzaXplIG9mIHRoZSBjYW52YXMgdG8gYmUgZHJhd24gdXBvblxuICAgIyBAdHlwZSB7TnVtYmVyfVxuXG4gICBERUZBVUxUX1NJWkU6IDUxMlxuXG5cbiAgICMgQmFzZSBjb2xvcnMgZm9yIGNvbXBvc2luZyBncmFkaWVudHNcbiAgICMgQHR5cGUge09iamVjdH1cblxuICAgQ09MT1JTOlxuICAgICAgcGx1bTpcbiAgICAgICAgIGxpZ2h0OiAnI0ExNEY0OSdcbiAgICAgICAgIGRhcms6ICAnIzViMTkxNSdcblxuICAgICAgZ3JlZW46XG4gICAgICAgICBsaWdodDogJyNBREQ0QkYnXG4gICAgICAgICBkYXJrOiAgJyM0RTgyNzMnXG5cbiAgICAgIGdyZXk6XG4gICAgICAgICBsaWdodDogJyM5RjlGOUYnXG4gICAgICAgICBkYXJrOiAgJyM3Nzc3NzcnXG5cbiAgICAgIHBpbms6ICAgICAnI0ZENjY4NSdcbiAgICAgIHllbGxvdzogICAnI0Y4RTk5RSdcbiAgICAgIGFxdWE6ICAgICAnI0E2RkNFQidcbiAgICAgIG9yYW5nZTogICAnI0ZDOTE3MCdcblxuXG5cbiAgIHllbGxvd1Bpbms6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy55ZWxsb3csIHN0b3A6IEBDT0xPUlMucGluayB9XG5cbiAgIHllbGxvd0FxdWE6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy55ZWxsb3csIHN0b3A6IEBDT0xPUlMuYXF1YSB9XG5cbiAgIHBpbmtBcXVhOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMucGluaywgc3RvcDogQENPTE9SUy5hcXVhIH1cblxuICAgeWVsbG93T3JhbmdlOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMueWVsbG93LCBzdG9wOiBAQ09MT1JTLm9yYW5nZSB9XG5cbiAgIG9yYW5nZVBpbms6IC0+XG4gICAgICByZXR1cm4geyBzdGFydDogQENPTE9SUy5vcmFuZ2UsIHN0b3A6IEBDT0xPUlMucGluayB9XG5cbiAgIHllbGxvd0dyZWVuOiAtPlxuICAgICAgcmV0dXJuIHsgc3RhcnQ6IEBDT0xPUlMueWVsbG93LCBzdG9wOiBAQ09MT1JTLmdyZWVuLmxpZ2h0IH1cblxuICAgb3JhbmdlQXF1YTogLT5cbiAgICAgIHJldHVybiB7IHN0YXJ0OiBAQ09MT1JTLm9yYW5nZSwgc3RvcDogQENPTE9SUy5hcXVhIH1cblxuXG5cbiAgICMgR2VuZXJhdGVzIGEgY29sb3IgZ3JhZGllbnQgYnkgdGFraW5nIGFuIG9iamVjdCBjb25zaXN0aW5nIG9mXG4gICAjIGBzdGFydGAgYW5kIGBzdG9wYCBhbmQgYmVsZW5kaW5nIHRoZW0gdG9nZXRoZXIgd2l0aGluIGEgY3R4XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBjb2xvclJhbmdlXG4gICAjIEByZXR1cm4ge0NvbnRleHR9XG5cbiAgIGdlbmVyYXRlOiAoY29sb3JSYW5nZSkgLT5cbiAgICAgIHtzdGFydCwgc3RvcH0gPSBjb2xvclJhbmdlXG5cbiAgICAgIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICAgIGNhbnZhcy53aWR0aCAgPSBAREVGQVVMVF9TSVpFXG4gICAgICBjYW52YXMuaGVpZ2h0ID0gQERFRkFVTFRfU0laRVxuXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQgJzJkJ1xuXG4gICAgICBjb250ZXh0LnJlY3QgMCwgMCwgQERFRkFVTFRfU0laRSwgQERFRkFVTFRfU0laRVxuICAgICAgZ3JhZGllbnQgPSBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50IDAsIDAsIEBERUZBVUxUX1NJWkUsIEBERUZBVUxUX1NJWkVcbiAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCAwLCBzdGFydFxuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wIDEsIHN0b3BcblxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBncmFkaWVudFxuICAgICAgY29udGV4dC5maWxsKClcblxuICAgICAgcmV0dXJuIGNhbnZhc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gV2ludHJHcmFkaWVudCIsIiMjIypcbiAqIENhbnZhcyBMYXllciB3aGljaCByZXByZXNlbnRzIGRhdGEgdG8gYmUgZGlzcGxheWVkIG9uIHRoZSBNYXBWaWV3XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBDb25maWcgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5FdmVudCAgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5UaHJlZVNjZW5lID0gcmVxdWlyZSAnLi9UaHJlZVNjZW5lLmNvZmZlZSdcblxuXG5jbGFzcyBDYW52YXNWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgSUQgb2YgRE9NIGNvbnRhaW5lciBmb3IgY2FudmFzIGxheWVyXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGlkOiAnY2FudmFzLWxheWVyJ1xuXG5cblxuICAgIyBJbnN0YW50aWF0ZSBUaHJlZS5qcyBzY2VuZXMgYmFzZWQgdXBvbiBudW1iZXIgb2YgZGF0YXBvaW50cyBpbiB0aGUgSlNPTlxuXG4gICByZW5kZXI6IC0+XG5cbiAgICAgIEBzY2VuZXMgPSAoXy5yYW5nZSBAd2FnZURhdGEubGVuZ3RoKS5tYXAgKHNjZW5lLCBpbmRleCkgPT5cbiAgICAgICAgIHNjZW5lID0gbmV3IFRocmVlU2NlbmVcbiAgICAgICAgICAgIHdhZ2U6IEB3YWdlRGF0YVtpbmRleF1cblxuICAgICAgIyBBcHBlbmQgdG8gZG9tIGFuZCBzdGFydCB0aWNrZXJcbiAgICAgIEBzY2VuZXMuZm9yRWFjaCAoc2NlbmUpID0+IEAkZWwuYXBwZW5kIHNjZW5lLnJlbmRlcigpLiRlbFxuICAgICAgQG9uVGljaygpXG5cblxuXG5cbiAgICMgVXBkYXRlIHRoZSBjYW52YXMgbGF5ZXIgd2hlbmV2ZXIgdGhlcmUgaXMgYSB6b29tIGFjdGlvblxuICAgIyBAcGFyYW0ge0hUTUxEb21FbGVtZW50fSBjYW52YXNPdmVybGF5XG4gICAjIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcblxuICAgdXBkYXRlOiAoY2FudmFzT3ZlcmxheSwgcGFyYW1zKSA9PlxuICAgICAge2xlZnQsIHRvcH0gPSBAJGVsLm9mZnNldCgpXG5cbiAgICAgIEB3YWdlRGF0YS5mb3JFYWNoIChzdGF0ZSwgaW5kZXgpID0+XG4gICAgICAgICB7eCwgeX0gPSBjYW52YXNPdmVybGF5Ll9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludCBbc3RhdGUubGF0aXR1ZGUsIHN0YXRlLmxvbmdpdHVkZV1cblxuICAgICAgICAgaWYgQHNjZW5lcyBhbmQgaW5kZXggPCBAd2FnZURhdGEubGVuZ3RoXG4gICAgICAgICAgICB7JGVsfSA9IEBzY2VuZXNbaW5kZXhdXG5cbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvICRlbCwgLjYsXG4gICAgICAgICAgICAgICB4OiB4IC0gbGVmdCAtIChNYXBDb25maWcuQ0FOVkFTX1NJWkUgKiAuNSlcbiAgICAgICAgICAgICAgIHk6IHkgLSB0b3AgIC0gKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KVxuICAgICAgICAgICAgICAgZWFzZTogRXhwby5lYXNlT3V0XG5cblxuXG5cbiAgIHVwZGF0ZUNhbWVyYUFuZ2xlOiA9PlxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSwgaW5kZXgpID0+XG4gICAgICAgICBzY2VuZSAgPSBAc2NlbmVzW2luZGV4XVxuICAgICAgICAgb2Zmc2V0ID0gc2NlbmUuJGVsLm9mZnNldCgpXG5cbiAgICAgICAgICMgQ29tcHV0ZSB0aGUgZGlzdGFuY2UgdG8gdGhlIGNlbnRlciBvZiB0aGUgd2luZG93LiAgVXNlZCB0byBjcmVhdGVcbiAgICAgICAgICMgc3dheSBtdWx0aXBsZXMgZm9yIHBlcnNwZWN0aXZlIGNhbWVyYSBhbmdsZVxuXG4gICAgICAgICBkaXN0ID1cbiAgICAgICAgICAgIHg6ICgod2luZG93LmlubmVyV2lkdGggICogLjUpIC0gKG9mZnNldC5sZWZ0ICsgKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KSkpICogLjAxXG4gICAgICAgICAgICB5OiAoKHdpbmRvdy5pbm5lckhlaWdodCAqIC41KSAtIChvZmZzZXQudG9wICArIChNYXBDb25maWcuQ0FOVkFTX1NJWkUgKiAuNSkpKSAqIC4wMVxuXG4gICAgICAgICBzY2VuZS51cGRhdGVDYW1lcmFBbmdsZSggZGlzdC54LCAtZGlzdC55IClcblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIFRIUkVFLmpzIHJlcXVlc3RBbmltYXRpb25GcmFtZSBldmVudCBsb29wLiAgVXBkYXRlcyBlYWNoXG4gICAjIGludmlkaXZpZHVhbCBjYW52YXMgbGF5ZXIgaW4gc2NlbmVzIGFycmF5XG5cbiAgIG9uVGljazogKGV2ZW50KSA9PlxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSkgLT4gc2NlbmUudGljaygpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQG9uVGlja1xuXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBsYXllciBhbmQgYmVnaW4gVEhSRUUuanMgdGlja2VyXG4gICAjIEBwdWJsaWNcblxuICAgb25VcGRhdGVab29tOiAoem9vbSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIHpvb21cblxuXG5cblxuXG4gICBvbk1hcERyYWc6IC0+XG4gICAgICBAdXBkYXRlQ2FtZXJhQW5nbGUoKVxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1ZpZXciLCIjIyMqXG4gKiBNYXBCb3ggbWFwIGxheWVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBDb25maWcgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5FdmVudCAgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcbk1hcEV2ZW50ICAgPSByZXF1aXJlICcuLi9ldmVudHMvTWFwRXZlbnQuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vQ2FudmFzVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIE1hcFZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBJRCBvZiB0aGUgdmlld1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBpZDogJ21hcCdcblxuXG4gICAjIFByb3h5IEwubWFwYm94IG5hbWVzcGFjZSBmb3IgZWFzeSBhY2Nlc3NcbiAgICMgQHR5cGUge0wubWFwYm94fVxuXG4gICBtYXBib3g6IG51bGxcblxuXG4gICAjIE1hcEJveCBtYXAgbGF5ZXJcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICBtYXBMYXllcjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBMZWFmbGV0IGxheWVyIHRvIGluc2VydCBtYXAgYmVmb3JlXG4gICAjIEB0eXBlIHskfVxuXG4gICAkbGVhZmxldFBhbmU6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgY2FudmFzIERPTSBlbGVtZW50XG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgJGNhbnZhczogbnVsbFxuXG5cblxuICAgIyBJbml0aWFsaXplIHRoZSBNYXBMYXllciBhbmQga2ljayBvZmYgQ2FudmFzIGxheWVyIHJlcG9zaXRpb25pbmdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgRGVmYXVsdCBvcHRpb25zIHRvIHBhc3MgaW50byB0aGUgYXBwXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG1hcGJveCA9IEwubWFwYm94XG4gICAgICBAbWFwICAgID0gQG1hcGJveC5tYXBcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBieSBjcmVhdGluZyB0aGUgTWFwIGxheWVyIGFuZCBpbnNlcnRpbmcgdGhlXG4gICAjIGNhbnZhcyBET00gbGF5ZXIgaW50byBMZWFmbGV0J3MgaGlhcmNoeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAbWFwTGF5ZXIgPSBAbWFwYm94Lm1hcCBAaWQsIE1hcENvbmZpZy5JRFxuICAgICAgICAgLnNldFZpZXcgICAgTWFwQ29uZmlnLklOSVQubG9jYXRpb24sIE1hcENvbmZpZy5JTklULnpvb21cbiAgICAgICAgIC5hZGRDb250cm9sIEBtYXBib3guZ2VvY29kZXJDb250cm9sIE1hcENvbmZpZy5JRFxuXG4gICAgICAkKCcubGVhZmxldC1jb250cm9sLWdyaWQnKS5yZW1vdmUoKVxuXG4gICAgICAjIEFkZCBhIGNhbnZhcyBvdmVybGF5IGFuZCBwYXNzIGluIGFuIHVwZGF0ZSBtZXRob2RcbiAgICAgIEwuY2FudmFzT3ZlcmxheSgpXG4gICAgICAgICAuZHJhd2luZyBAY2FudmFzVXBkYXRlTWV0aG9kXG4gICAgICAgICAuYWRkVG8gQG1hcExheWVyXG4gICAgICAgICAucmVkcmF3KClcblxuICAgICAgQGluc2VydENhbnZhc0xheWVyKClcbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG5cblxuXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQG1hcExheWVyLm9uIE1hcEV2ZW50LlpPT01fQ0hBTkdFRCwgQG9uWm9vbUNoYW5nZWRcbiAgICAgIEBtYXBMYXllci5vbiBNYXBFdmVudC5EUkFHLCAgICAgICAgIEBvbk1hcERyYWdcblxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIEhhbmRsZXIgZm9yIHpvb20gY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge09iamVjdH0gZXZlbnRcblxuICAgb25ab29tQ2hhbmdlZDogKGV2ZW50KSA9PlxuICAgICAgQHRyaWdnZXIgTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAbWFwTGF5ZXIuZ2V0Wm9vbSgpXG5cblxuXG5cblxuICAgb25NYXBEcmFnOiAoZXZlbnQpID0+XG4gICAgICBAdHJpZ2dlciBNYXBFdmVudC5EUkFHXG5cblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgTW92ZXMgdGhlIGNhbnZhcyBsYXllciBpbnRvIHRoZSBMZWFmbGV0IERPTVxuXG4gICBpbnNlcnRDYW52YXNMYXllcjogLT5cbiAgICAgIEAkbGVhZmxldFBhbmUgPSAkIFwiLmxlYWZsZXQtb2JqZWN0cy1wYW5lXCJcbiAgICAgIEAkY2FudmFzLnByZXBlbmRUbyBAJGxlYWZsZXRQYW5lXG4gICAgICBAJGNhbnZhcy5jc3MgJ3otaW5kZXgnLCA1XG5cbiAgICAgIEB0cmlnZ2VyIE1hcEV2ZW50LklOSVRJQUxJWkVEXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwVmlldyIsIiMjIypcbiAqIEluZGl2aWR1YWwgVGhyZWUuanMgU2NlbmVzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjguMTRcbiMjI1xuXG5XaW50ckdyYWRpZW50ID0gcmVxdWlyZSAnLi4vdXRpbHMvV2ludHJHcmFkaWVudC5jb2ZmZWUnXG5NYXBDb25maWcgICAgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5FdmVudCAgICAgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgVGhyZWVTY2VuZSBleHRlbmRzIFZpZXdcblxuXG4gICAjIENsYXNzIG5hbWUgb2YgRE9NIGNvbnRhaW5lciBmb3IgaW5kaXZpZHVhbCBUaHJlZS5qcyBzY2VuZXNcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgY2xhc3NOYW1lOiAnc2NlbmUnXG5cblxuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBzZXR1cFRocmVlSlNSZW5kZXJlcigpXG5cblxuXG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIHNpemUgPSBNYXBDb25maWcuQ0FOVkFTX1NJWkVcblxuICAgICAgIyBBZGQgU2NlbmUgY2FudmFzIHRvIHRoZSBkb21cbiAgICAgIF8uZGVmZXIgPT5cblxuICAgICAgICAgQHJlbmRlcmVyLnNldFNpemUgc2l6ZSwgc2l6ZVxuICAgICAgICAgQCRlbC5hcHBlbmQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcblxuICAgICAgICAgIyBBbmltYXRlIGluIHRoZSBjdWJlXG4gICAgICAgICBfLmRlbGF5ID0+XG5cbiAgICAgICAgICAgIHRpbWUgID0gMVxuICAgICAgICAgICAgZWFzZSAgPSBFeHBvLmVhc2VJbk91dFxuICAgICAgICAgICAgZGVsYXkgPSBNYXRoLnJhbmRvbSgpICogNVxuXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgICAgVHdlZW5NYXguZnJvbVRvIEBjdWJlLnNjYWxlLCB0aW1lLCB5OiAuMSxcbiAgICAgICAgICAgICAgIHk6IDFcbiAgICAgICAgICAgICAgIGRlbGF5OiBkZWxheVxuICAgICAgICAgICAgICAgZWFzZTogZWFzZVxuXG4gICAgICAgICAgICBUd2Vlbk1heC5mcm9tVG8gQGN1YmUucm90YXRpb24sIHRpbWUsIHg6IDE5LjQsXG4gICAgICAgICAgICAgICB4OiAyMFxuICAgICAgICAgICAgICAgZGVsYXk6IGRlbGF5XG4gICAgICAgICAgICAgICBlYXNlOiBlYXNlXG5cbiAgICAgIEBcblxuXG5cblxuICAgdGljazogLT5cbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgKz0gLjEgaWYgQGN1YmVcbiAgICAgIEByZW5kZXJlci5yZW5kZXIgQHNjZW5lLCBAY2FtZXJhXG5cblxuXG5cbiAgIHVwZGF0ZUNhbWVyYUFuZ2xlOiAoeCwgeSkgLT5cbiAgICAgIEBjYW1lcmEucG9zaXRpb24ueCA9IHhcbiAgICAgIEBjYW1lcmEucG9zaXRpb24ueSA9IHlcblxuXG5cblxuICAgc2V0dXBUaHJlZUpTUmVuZGVyZXI6IC0+XG4gICAgICBoZWlnaHQgPSBpZiBAd2FnZS53YWdlIGlzbnQgMCB0aGVuIEB3YWdlLndhZ2UgKiAzIGVsc2UgMlxuXG4gICAgICBjYW1lcmFBdHRyaWJ1dGVzID1cbiAgICAgICAgIGFuZ2xlOiA0NVxuICAgICAgICAgYXNwZWN0OiBNYXBDb25maWcuQ0FOVkFTX1NJWkUgLyBNYXBDb25maWcuQ0FOVkFTX1NJWkVcbiAgICAgICAgIG5lYXI6IC4xXG4gICAgICAgICBmYXI6IDEwMFxuXG4gICAgICAjIFNjZW5lIHBhcmFtZXRlcnNcbiAgICAgIEBzY2VuZSAgICA9IG5ldyBUSFJFRS5TY2VuZVxuICAgICAgQGNhbWVyYSAgID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhIGNhbWVyYUF0dHJpYnV0ZXMuYW5nbGUsIGNhbWVyYUF0dHJpYnV0ZXMuYXNwZWN0LCBjYW1lcmFBdHRyaWJ1dGVzLm5lYXIsIGNhbWVyYUF0dHJpYnV0ZXMuZmFyXG4gICAgICBAcmVuZGVyZXIgPSBuZXcgVEhSRUUuQ2FudmFzUmVuZGVyZXIgYWxwaGE6IHRydWVcblxuXG4gICAgICBAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkgMiwgaGVpZ2h0LCAyLCAyLCAyLCAyXG5cbiAgICAgICMgbWF0ZXJpYWxcbiAgICAgIHRleHR1cmUgID0gbmV3IFRIUkVFLlRleHR1cmUgV2ludHJHcmFkaWVudC5nZW5lcmF0ZSBXaW50ckdyYWRpZW50LnllbGxvd0dyZWVuKClcbiAgICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlXG5cbiAgICAgIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IG1hcDogdGV4dHVyZSwgb3ZlcmRyYXc6IDAuNSB9IClcbiAgICAgIEBjdWJlID0gbmV3IFRIUkVFLk1lc2goIEBnZW9tZXRyeSwgbWF0ZXJpYWwgKVxuICAgICAgQGN1YmUucm90YXRpb24ueCA9IDIwXG4gICAgICBAY3ViZS5yb3RhdGlvbi55ID0gMjBcblxuICAgICAgQHNjZW5lLmFkZCBAY3ViZVxuXG4gICAgICAjIFVwZGF0ZSB2aWV3XG4gICAgICBAcmVuZGVyZXIuc2V0Q2xlYXJDb2xvciAweDAwMDAwMCwgMFxuICAgICAgQGNhbWVyYS5wb3NpdGlvbi56ID0gNTBcblxuXG5cbiAgIGdlbmVyYXRlVGV4dHVyZTogKHN0YXJ0SGV4LCBzdG9wSGV4KSAtPlxuICAgICAgc2l6ZSA9IDUxMlxuICAgICAgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnY2FudmFzJ1xuICAgICAgY2FudmFzLndpZHRoID0gc2l6ZVxuICAgICAgY2FudmFzLmhlaWdodCA9IHNpemVcblxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcblxuICAgICAgY29udGV4dC5yZWN0IDAsIDAsIHNpemUsIHNpemVcbiAgICAgIGdyYWRpZW50ID0gY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudCAwLCAwLCBzaXplLCBzaXplXG4gICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgc3RhcnRIZXgpICMgbGlnaHQgYmx1ZVxuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsIHN0b3BIZXgpICMgZGFyayBibHVlXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyYWRpZW50XG4gICAgICBjb250ZXh0LmZpbGwoKVxuXG4gICAgICBjYW52YXNcblxuXG5cbiAgIHJhbmRvbUNvbG9yOiAtPlxuICAgICAgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJy5zcGxpdCgnJyk7XG4gICAgICBjb2xvciA9ICcjJztcbiAgICAgIGZvciBpIGluIFswLi41XVxuICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNildXG5cbiAgICAgIGNvbG9yXG5cblxuXG5cbiAgIHJldHVyblJhbmRvbUNvbG9yQ3ViZTogLT5cbiAgICAgICMgIyBPYmplY3QgcGFyYW1ldGVyc1xuICAgICAgIyBAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkgMiwgaGVpZ2h0LCAyXG5cbiAgICAgICMgZm9yIGkgaW4gWzAuLkBnZW9tZXRyeS5mYWNlcy5sZW5ndGggLSAxXSBieSArMlxuICAgICAgIyAgICBoZXggPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmZcbiAgICAgICMgICAgQGdlb21ldHJ5LmZhY2VzW2ldLmNvbG9yLnNldEhleCBoZXhcbiAgICAgICMgICAgQGdlb21ldHJ5LmZhY2VzW2kgKyAxXS5jb2xvci5zZXRIZXggaGV4XG5cblxuICAgICAgIyBAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwgdmVydGV4Q29sb3JzOiBUSFJFRS5GYWNlQ29sb3JzLCBvdmVyZHJhdzogMC41XG4gICAgICAjIEBjdWJlICAgICA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgQG1hdGVyaWFsXG4gICAgICAjIEBjdWJlLnJvdGF0aW9uLnggPSAyMFxuICAgICAgIyBAY3ViZS5yb3RhdGlvbi55ID0gMjBcbiAgICAgICMgQHNjZW5lLmFkZCBAY3ViZVxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUaHJlZVNjZW5lIl19
