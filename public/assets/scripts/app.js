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


},{"./events/MapEvent.coffee":4,"./supers/View.coffee":5,"./views/CanvasView.coffee":6,"./views/MapView.coffee":7}],2:[function(require,module,exports){

/**
 * Map app configuration options
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapConfig;

MapConfig = {
  ID: 'damassi.i68ol38a',
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


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":5,"./ThreeScene.coffee":8}],7:[function(require,module,exports){

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
    this.$leafletPane = $("#map > .leaflet-map-pane > .leaflet-objects-pane");
    this.$canvas.prependTo(this.$leafletPane);
    this.$canvas.css('z-index', 5);
    return this.trigger(MapEvent.INITIALIZED);
  };

  return MapView;

})(View);

module.exports = MapView;


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../events/MapEvent.coffee":4,"../supers/View.coffee":5,"./CanvasView.coffee":6}],8:[function(require,module,exports){

/**
 * Individual Three.js Scenes
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.8.14
 */
var Event, MapConfig, ThreeScene, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapConfig = require('../config/MapConfig.coffee');

Event = require('../events/Event.coffee');

View = require('../supers/View.coffee');

ThreeScene = (function(_super) {
  __extends(ThreeScene, _super);

  ThreeScene.prototype.className = 'scene';

  function ThreeScene(options) {
    ThreeScene.__super__.constructor.call(this, options);
    console.log(this.wage);
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
    this.cube.rotation.y += .1;
    return this.renderer.render(this.scene, this.camera);
  };

  ThreeScene.prototype.updateCameraAngle = function(x, y) {
    this.camera.position.x = x;
    return this.camera.position.y = y;
  };

  ThreeScene.prototype.setupThreeJSRenderer = function() {
    var cameraAttributes, height, hex, i, _i, _ref;
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
    height = this.wage.wage !== 0 ? this.wage.wage * 3 : 2;
    this.geometry = new THREE.BoxGeometry(2, height, 2);
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
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.z = 50;
    this.scene.add(this.cube);
    this.cube.rotation.x = 20;
    return this.cube.rotation.y = 20;
  };

  return ThreeScene;

})(View);

module.exports = ThreeScene;


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9hcHAuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2RhbWFzc2kvU2l0ZXMvV0lOVFIvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2V2ZW50cy9FdmVudC5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvZXZlbnRzL01hcEV2ZW50LmNvZmZlZSIsIi9Vc2Vycy9kYW1hc3NpL1NpdGVzL1dJTlRSL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvQ2FudmFzVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiLCIvVXNlcnMvZGFtYXNzaS9TaXRlcy9XSU5UUi9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvVGhyZWVTY2VuZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUFBOzs7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QUFBLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBZixHQUFtQixFQTlCbkIsQ0FBQTtXQStCQSxJQUFDLENBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFmLEdBQW1CLEdBaENBO0VBQUEsQ0E3RHRCLENBQUE7O29CQUFBOztHQU5zQixLQVp6QixDQUFBOztBQUFBLE1BbUhNLENBQUMsT0FBUCxHQUFpQixVQW5IakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICogTWFwIENhbnZhcyBhcHBsaWNhdGlvbiBib290c3RyYXBwZXJyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBFdmVudCAgID0gcmVxdWlyZSAnLi9ldmVudHMvTWFwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuTWFwVmlldyAgICA9IHJlcXVpcmUgJy4vdmlld3MvTWFwVmlldy5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBBcHAgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBNYXBCb3ggbWFwIHZpZXcgY29udGFpbmluZyBhbGwgbWFwIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eVxuICAgIyBAdHlwZSB7TC5NYXBCb3h9XG5cbiAgIG1hcFZpZXc6IG51bGxcblxuXG4gICAjIENhbnZhcyB2aWV3IGNvbnRhaW5pbmcgYWxsIGNhbnZhcyByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0NhbnZhc1ZpZXd9XG5cbiAgIGNhbnZhc1ZpZXc6IG51bGxcblxuXG4gICAjIEpTT04gRGF0YSBvZiB3YWdlcyBhbmQgbGF0LCBsbmcgYnkgc3RhdGVcbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICB3YWdlRGF0YTogbnVsbFxuXG5cblxuXG4gICAjIEluaXRpYWxpemUgYXBwIGJ5IGNyZWF0aW5nIGEgY2FudmFzIHZpZXcgYW5kIGEgbWFwdmlld1xuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXdcbiAgICAgICAgIHdhZ2VEYXRhOiBAd2FnZURhdGFcblxuICAgICAgQG1hcFZpZXcgPSBuZXcgTWFwVmlld1xuICAgICAgICAgJGNhbnZhczogQGNhbnZhc1ZpZXcuJGVsXG4gICAgICAgICBjYW52YXNVcGRhdGVNZXRob2Q6IEBjYW52YXNWaWV3LnVwZGF0ZVxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQG1hcFZpZXcucmVuZGVyKClcblxuXG5cblxuXG4gICAjIEFkZCBhcHAtd2lkZSBldmVudCBsaXN0ZW5lcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsICAgIE1hcEV2ZW50LklOSVRJQUxJWkVELCAgQG9uTWFwSW5pdGlhbGl6ZWRcbiAgICAgIEBsaXN0ZW5UbyBAbWFwVmlldywgICAgTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAb25NYXBab29tQ2hhbmdlZFxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCAgICBNYXBFdmVudC5EUkFHLCAgICAgICAgIEBvbk1hcERyYWdcbiAgICAgICMkKHdpbmRvdykub24gICAgICAgICAgJ21vdXNlbW92ZScsICAgICAgICAgICAgQG9uTW91c2VNb3ZlXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtYXAgaW5pdGlhbGl6YXRpb24gZXZlbnRzLiAgUmVjZWl2ZWQgZnJvbSB0aGUgTWFwVmlldyB3aGljaFxuICAgIyBraWNrcyBvZmYgY2FudmFzIHJlbmRlcmluZyBhbmQgMy5qcyBpbnN0YW50aWF0aW9uXG5cbiAgIG9uTWFwSW5pdGlhbGl6ZWQ6IC0+XG4gICAgICBAY2FudmFzVmlldy5yZW5kZXIoKVxuXG5cblxuXG5cbiAgICMgSGFuZGxlciBmb3Igem9vbSBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7TnVtYmVyfSB6b29tIFRoZSBjdXJyZW50IG1hcCB6b29tXG5cbiAgIG9uTWFwWm9vbUNoYW5nZWQ6ICh6b29tKSAtPlxuXG5cblxuXG5cbiAgIG9uTWFwRHJhZzogLT5cbiAgICAgIEBjYW52YXNWaWV3Lm9uTWFwRHJhZygpXG5cblxuXG5cblxuICAgb25Nb3VzZU1vdmU6IChldmVudCkgPT5cbiAgICAgIEBjYW52YXNWaWV3Lm9uTW91c2VNb3ZlXG4gICAgICAgICB4OiBldmVudC5jbGllbnRYXG4gICAgICAgICB5OiBldmVudC5jbGllbllcblxuXG5cblxuIyBLaWNrIG9mZiBBcHAgYW5kIGxvYWQgZXh0ZXJuYWwgd2FnZSBkYXRhXG5cbiQgLT5cbiAgICQuZ2V0SlNPTiAnYXNzZXRzL2RhdGEvd2FnZXMuanNvbicsICh3YWdlRGF0YSkgLT5cbiAgICAgIG5ldyBBcHBcbiAgICAgICAgIHdhZ2VEYXRhOiB3YWdlRGF0YVxuIiwiIyMjKlxuICogTWFwIGFwcCBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuTWFwQ29uZmlnID1cblxuXG4gICAjIFVuaXF1ZSBpZGVudGlmaWVyIGZvciBNYXBCb3ggYXBwXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIElEOiAnZGFtYXNzaS5pNjhvbDM4YSdcblxuXG4gICAjIE1hcCBsYW5kcyBvbiBTZWF0dGxlIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIElOSVQ6XG4gICAgICBsb2NhdGlvbjogWzQwLjA5MDI0LCAtOTUuNzEyODkxXVxuICAgICAgem9vbTogNVxuXG5cbiAgICMgV2lkdGggb2YgZWFjaCBpbmRpdmlkdWFsIGNhbnZhcyBzcXVhcmVcbiAgICMgQHR5cGUge051bWJlcn1cblxuICAgQ0FOVkFTX1NJWkU6IDMwMFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDb25maWciLCIjIyMqXG4gKiBHZW5lcmljIEFwcC13aWRlIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5FdmVudCA9XG5cbiAgIFRFU1Q6ICdvblRlc3R0dCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50IiwiIyMjKlxuICogTGVhZmxldC1yZWxhdGVkIE1hcCBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuTWFwRXZlbnQgPVxuXG4gICBEUkFHX1NUQVJUOiAgICAgICAnZHJhZ3N0YXJ0J1xuICAgRFJBRzogICAgICAgICAgICAgJ2RyYWcnXG4gICBEUkFHX0VORDogICAgICAgICAnZHJhZ2VuZCdcblxuICAgIyBUcmlnZ2VyZWQgb25jZSB0aGUgTWFwQm94IG1hcCBpcyBpbml0aWFsaXplZCBhbmQgcmVuZGVyZWQgdG8gdGhlIERPTVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBJTklUSUFMSVpFRDogICAgICAnaW5pdGlhbGl6ZWQnXG4gICBVUERBVEU6ICAgICAgICAgICAndXBkYXRlJ1xuICAgWk9PTV9TVEFSVDogICAgICAgJ3pvb21zdGFydCdcbiAgIFpPT01fQ0hBTkdFRDogICAgICd6b29tZW5kJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwRXZlbnQiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgZm9yIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5jbGFzcyBWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG5cbiAgICMgVmlldyBjb25zdHJ1Y3RvciB3aGljaCBhY2NlcHRzIHBhcmFtZXRlcnMgYW5kIG1lcmdlcyB0aGVtXG4gICAjIGludG8gdGhlIHZpZXcgcHJvdG90eXBlIGZvciBlYXN5IGFjY2Vzcy5cbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICAgICMgTWVyZ2UgcGFzc2VkIHByb3BzIG9yIGluc3RhbmNlIGRlZmF1bHRzXG4gICAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiIyMjKlxuICogQ2FudmFzIExheWVyIHdoaWNoIHJlcHJlc2VudHMgZGF0YSB0byBiZSBkaXNwbGF5ZWQgb24gdGhlIE1hcFZpZXdcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcENvbmZpZyAgPSByZXF1aXJlICcuLi9jb25maWcvTWFwQ29uZmlnLmNvZmZlZSdcbkV2ZW50ICAgICAgPSByZXF1aXJlICcuLi9ldmVudHMvRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblRocmVlU2NlbmUgPSByZXF1aXJlICcuL1RocmVlU2NlbmUuY29mZmVlJ1xuXG5cbmNsYXNzIENhbnZhc1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBJRCBvZiBET00gY29udGFpbmVyIGZvciBjYW52YXMgbGF5ZXJcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgaWQ6ICdjYW52YXMtbGF5ZXInXG5cblxuXG4gICAjIEluc3RhbnRpYXRlIFRocmVlLmpzIHNjZW5lcyBiYXNlZCB1cG9uIG51bWJlciBvZiBkYXRhcG9pbnRzIGluIHRoZSBKU09OXG5cbiAgIHJlbmRlcjogLT5cblxuICAgICAgQHNjZW5lcyA9IChfLnJhbmdlIEB3YWdlRGF0YS5sZW5ndGgpLm1hcCAoc2NlbmUsIGluZGV4KSA9PlxuICAgICAgICAgc2NlbmUgPSBuZXcgVGhyZWVTY2VuZVxuICAgICAgICAgICAgd2FnZTogQHdhZ2VEYXRhW2luZGV4XVxuXG4gICAgICAjIEFwcGVuZCB0byBkb20gYW5kIHN0YXJ0IHRpY2tlclxuICAgICAgQHNjZW5lcy5mb3JFYWNoIChzY2VuZSkgPT4gQCRlbC5hcHBlbmQgc2NlbmUucmVuZGVyKCkuJGVsXG4gICAgICBAb25UaWNrKClcblxuXG5cblxuICAgIyBVcGRhdGUgdGhlIGNhbnZhcyBsYXllciB3aGVuZXZlciB0aGVyZSBpcyBhIHpvb20gYWN0aW9uXG4gICAjIEBwYXJhbSB7SFRNTERvbUVsZW1lbnR9IGNhbnZhc092ZXJsYXlcbiAgICMgQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuXG4gICB1cGRhdGU6IChjYW52YXNPdmVybGF5LCBwYXJhbXMpID0+XG4gICAgICB7bGVmdCwgdG9wfSA9IEAkZWwub2Zmc2V0KClcblxuICAgICAgQHdhZ2VEYXRhLmZvckVhY2ggKHN0YXRlLCBpbmRleCkgPT5cbiAgICAgICAgIHt4LCB5fSA9IGNhbnZhc092ZXJsYXkuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50IFtzdGF0ZS5sYXRpdHVkZSwgc3RhdGUubG9uZ2l0dWRlXVxuXG4gICAgICAgICBpZiBAc2NlbmVzIGFuZCBpbmRleCA8IEB3YWdlRGF0YS5sZW5ndGhcbiAgICAgICAgICAgIHskZWx9ID0gQHNjZW5lc1tpbmRleF1cblxuICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsLCAuNixcbiAgICAgICAgICAgICAgIHg6IHggLSBsZWZ0IC0gKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KVxuICAgICAgICAgICAgICAgeTogeSAtIHRvcCAgLSAoTWFwQ29uZmlnLkNBTlZBU19TSVpFICogLjUpXG4gICAgICAgICAgICAgICBlYXNlOiBFeHBvLmVhc2VPdXRcblxuXG5cblxuICAgdXBkYXRlQ2FtZXJhQW5nbGU6ID0+XG4gICAgICBAc2NlbmVzLmZvckVhY2ggKHNjZW5lLCBpbmRleCkgPT5cbiAgICAgICAgIHNjZW5lICA9IEBzY2VuZXNbaW5kZXhdXG4gICAgICAgICBvZmZzZXQgPSBzY2VuZS4kZWwub2Zmc2V0KClcblxuICAgICAgICAgIyBDb21wdXRlIHRoZSBkaXN0YW5jZSB0byB0aGUgY2VudGVyIG9mIHRoZSB3aW5kb3cuICBVc2VkIHRvIGNyZWF0ZVxuICAgICAgICAgIyBzd2F5IG11bHRpcGxlcyBmb3IgcGVyc3BlY3RpdmUgY2FtZXJhIGFuZ2xlXG5cbiAgICAgICAgIGRpc3QgPVxuICAgICAgICAgICAgeDogKCh3aW5kb3cuaW5uZXJXaWR0aCAgKiAuNSkgLSAob2Zmc2V0LmxlZnQgKyAoTWFwQ29uZmlnLkNBTlZBU19TSVpFICogLjUpKSkgKiAuMDFcbiAgICAgICAgICAgIHk6ICgod2luZG93LmlubmVySGVpZ2h0ICogLjUpIC0gKG9mZnNldC50b3AgICsgKE1hcENvbmZpZy5DQU5WQVNfU0laRSAqIC41KSkpICogLjAxXG5cbiAgICAgICAgIHNjZW5lLnVwZGF0ZUNhbWVyYUFuZ2xlKCBkaXN0LngsIC1kaXN0LnkgKVxuXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICMgSGFuZGxlciBmb3IgVEhSRUUuanMgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGV2ZW50IGxvb3AuICBVcGRhdGVzIGVhY2hcbiAgICMgaW52aWRpdmlkdWFsIGNhbnZhcyBsYXllciBpbiBzY2VuZXMgYXJyYXlcblxuICAgb25UaWNrOiAoZXZlbnQpID0+XG4gICAgICBAc2NlbmVzLmZvckVhY2ggKHNjZW5lKSAtPiBzY2VuZS50aWNrKClcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAb25UaWNrXG5cblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGxheWVyIGFuZCBiZWdpbiBUSFJFRS5qcyB0aWNrZXJcbiAgICMgQHB1YmxpY1xuXG4gICBvblVwZGF0ZVpvb206ICh6b29tKSAtPlxuICAgICAgY29uc29sZS5sb2cgem9vbVxuXG5cblxuXG5cbiAgIG9uTWFwRHJhZzogLT5cbiAgICAgIEB1cGRhdGVDYW1lcmFBbmdsZSgpXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzVmlldyIsIiMjIypcbiAqIE1hcEJveCBtYXAgbGF5ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcENvbmZpZyAgPSByZXF1aXJlICcuLi9jb25maWcvTWFwQ29uZmlnLmNvZmZlZSdcbkV2ZW50ICAgICAgPSByZXF1aXJlICcuLi9ldmVudHMvRXZlbnQuY29mZmVlJ1xuTWFwRXZlbnQgICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9NYXBFdmVudC5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi9DYW52YXNWaWV3LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgTWFwVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICAjIElEIG9mIHRoZSB2aWV3XG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGlkOiAnbWFwJ1xuXG5cbiAgICMgUHJveHkgTC5tYXBib3ggbmFtZXNwYWNlIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAdHlwZSB7TC5tYXBib3h9XG5cbiAgIG1hcGJveDogbnVsbFxuXG5cbiAgICMgTWFwQm94IG1hcCBsYXllclxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgIG1hcExheWVyOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIExlYWZsZXQgbGF5ZXIgdG8gaW5zZXJ0IG1hcCBiZWZvcmVcbiAgICMgQHR5cGUgeyR9XG5cbiAgICRsZWFmbGV0UGFuZTogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjYW52YXMgRE9NIGVsZW1lbnRcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICAkY2FudmFzOiBudWxsXG5cblxuXG4gICAjIEluaXRpYWxpemUgdGhlIE1hcExheWVyIGFuZCBraWNrIG9mZiBDYW52YXMgbGF5ZXIgcmVwb3NpdGlvbmluZ1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBEZWZhdWx0IG9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBhcHBcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAbWFwYm94ID0gTC5tYXBib3hcbiAgICAgIEBtYXAgICAgPSBAbWFwYm94Lm1hcFxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGJ5IGNyZWF0aW5nIHRoZSBNYXAgbGF5ZXIgYW5kIGluc2VydGluZyB0aGVcbiAgICMgY2FudmFzIERPTSBsYXllciBpbnRvIExlYWZsZXQncyBoaWFyY2h5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEBtYXBMYXllciA9IEBtYXBib3gubWFwIEBpZCwgTWFwQ29uZmlnLklEXG4gICAgICAgICAuc2V0VmlldyAgICBNYXBDb25maWcuSU5JVC5sb2NhdGlvbiwgTWFwQ29uZmlnLklOSVQuem9vbVxuICAgICAgICAgLmFkZENvbnRyb2wgQG1hcGJveC5nZW9jb2RlckNvbnRyb2wgTWFwQ29uZmlnLklEXG5cbiAgICAgICMgQWRkIGEgY2FudmFzIG92ZXJsYXkgYW5kIHBhc3MgaW4gYW4gdXBkYXRlIG1ldGhvZFxuICAgICAgTC5jYW52YXNPdmVybGF5KClcbiAgICAgICAgIC5kcmF3aW5nIEBjYW52YXNVcGRhdGVNZXRob2RcbiAgICAgICAgIC5hZGRUbyBAbWFwTGF5ZXJcbiAgICAgICAgIC5yZWRyYXcoKVxuXG4gICAgICBAaW5zZXJ0Q2FudmFzTGF5ZXIoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbWFwTGF5ZXIub24gTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAb25ab29tQ2hhbmdlZFxuICAgICAgQG1hcExheWVyLm9uIE1hcEV2ZW50LkRSQUcsICAgICAgICAgQG9uTWFwRHJhZ1xuXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgSGFuZGxlciBmb3Igem9vbSBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXG4gICBvblpvb21DaGFuZ2VkOiAoZXZlbnQpID0+XG4gICAgICBAdHJpZ2dlciBNYXBFdmVudC5aT09NX0NIQU5HRUQsIEBtYXBMYXllci5nZXRab29tKClcblxuXG5cblxuXG4gICBvbk1hcERyYWc6IChldmVudCkgPT5cbiAgICAgIEB0cmlnZ2VyIE1hcEV2ZW50LkRSQUdcblxuXG5cblxuXG5cbiAgICMgUFJJVkFURSBNRVRIT0RTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIyBNb3ZlcyB0aGUgY2FudmFzIGxheWVyIGludG8gdGhlIExlYWZsZXQgRE9NXG5cbiAgIGluc2VydENhbnZhc0xheWVyOiAtPlxuICAgICAgQCRsZWFmbGV0UGFuZSA9ICQgXCIjbWFwID4gLmxlYWZsZXQtbWFwLXBhbmUgPiAubGVhZmxldC1vYmplY3RzLXBhbmVcIlxuICAgICAgQCRjYW52YXMucHJlcGVuZFRvIEAkbGVhZmxldFBhbmVcbiAgICAgIEAkY2FudmFzLmNzcyAnei1pbmRleCcsIDVcblxuICAgICAgQHRyaWdnZXIgTWFwRXZlbnQuSU5JVElBTElaRURcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBWaWV3IiwiIyMjKlxuICogSW5kaXZpZHVhbCBUaHJlZS5qcyBTY2VuZXNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuOC4xNFxuIyMjXG5cbk1hcENvbmZpZyA9IHJlcXVpcmUgJy4uL2NvbmZpZy9NYXBDb25maWcuY29mZmVlJ1xuRXZlbnQgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcblZpZXcgICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBUaHJlZVNjZW5lIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgQ2xhc3MgbmFtZSBvZiBET00gY29udGFpbmVyIGZvciBpbmRpdmlkdWFsIFRocmVlLmpzIHNjZW5lc1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBjbGFzc05hbWU6ICdzY2VuZSdcblxuXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgY29uc29sZS5sb2cgQHdhZ2VcblxuICAgICAgQHNldHVwVGhyZWVKU1JlbmRlcmVyKClcblxuXG5cblxuICAgcmVuZGVyOiAtPlxuICAgICAgc2l6ZSA9IE1hcENvbmZpZy5DQU5WQVNfU0laRVxuXG4gICAgICAjIEFkZCBTY2VuZSBjYW52YXMgdG8gdGhlIGRvbVxuICAgICAgXy5kZWZlciA9PlxuXG4gICAgICAgICBAcmVuZGVyZXIuc2V0U2l6ZSBzaXplLCBzaXplXG4gICAgICAgICBAJGVsLmFwcGVuZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG4gICAgICAgICAjIEFuaW1hdGUgaW4gdGhlIGN1YmVcbiAgICAgICAgIF8uZGVsYXkgPT5cblxuICAgICAgICAgICAgdGltZSAgPSAxXG4gICAgICAgICAgICBlYXNlICA9IEV4cG8uZWFzZUluT3V0XG4gICAgICAgICAgICBkZWxheSA9IE1hdGgucmFuZG9tKCkgKiA1XG5cbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICBUd2Vlbk1heC5mcm9tVG8gQGN1YmUuc2NhbGUsIHRpbWUsIHk6IC4xLFxuICAgICAgICAgICAgICAgeTogMVxuICAgICAgICAgICAgICAgZGVsYXk6IGRlbGF5XG4gICAgICAgICAgICAgICBlYXNlOiBlYXNlXG5cbiAgICAgICAgICAgIFR3ZWVuTWF4LmZyb21UbyBAY3ViZS5yb3RhdGlvbiwgdGltZSwgeDogMTkuNCxcbiAgICAgICAgICAgICAgIHg6IDIwXG4gICAgICAgICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgICAgICAgICAgIGVhc2U6IGVhc2VcblxuICAgICAgQFxuXG5cblxuXG4gICB0aWNrOiAtPlxuICAgICAgQGN1YmUucm90YXRpb24ueSArPSAuMVxuICAgICAgQHJlbmRlcmVyLnJlbmRlciBAc2NlbmUsIEBjYW1lcmFcblxuXG5cblxuICAgdXBkYXRlQ2FtZXJhQW5nbGU6ICh4LCB5KSAtPlxuICAgICAgQGNhbWVyYS5wb3NpdGlvbi54ID0geFxuICAgICAgQGNhbWVyYS5wb3NpdGlvbi55ID0geVxuXG5cblxuXG4gICBzZXR1cFRocmVlSlNSZW5kZXJlcjogLT5cbiAgICAgIGNhbWVyYUF0dHJpYnV0ZXMgPVxuICAgICAgICAgYW5nbGU6IDQ1XG4gICAgICAgICBhc3BlY3Q6IE1hcENvbmZpZy5DQU5WQVNfU0laRSAvIE1hcENvbmZpZy5DQU5WQVNfU0laRVxuICAgICAgICAgbmVhcjogLjFcbiAgICAgICAgIGZhcjogMTAwXG5cbiAgICAgICMgU2NlbmUgcGFyYW1ldGVyc1xuICAgICAgQHNjZW5lICAgID0gbmV3IFRIUkVFLlNjZW5lXG4gICAgICBAY2FtZXJhICAgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEgY2FtZXJhQXR0cmlidXRlcy5hbmdsZSwgY2FtZXJhQXR0cmlidXRlcy5hc3BlY3QsIGNhbWVyYUF0dHJpYnV0ZXMubmVhciwgY2FtZXJhQXR0cmlidXRlcy5mYXJcbiAgICAgIEByZW5kZXJlciA9IG5ldyBUSFJFRS5DYW52YXNSZW5kZXJlciBhbHBoYTogdHJ1ZVxuXG4gICAgICAjIE9iamVjdCBwYXJhbWV0ZXJzXG4gICAgICBoZWlnaHQgPSBpZiBAd2FnZS53YWdlIGlzbnQgMCB0aGVuIEB3YWdlLndhZ2UgKiAzIGVsc2UgMlxuICAgICAgQGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5IDIsIGhlaWdodCwgMlxuXG4gICAgICBmb3IgaSBpbiBbMC4uQGdlb21ldHJ5LmZhY2VzLmxlbmd0aCAtIDFdIGJ5ICsyXG4gICAgICAgICBoZXggPSBNYXRoLnJhbmRvbSgpICogMHhmZmZmZmZcbiAgICAgICAgIEBnZW9tZXRyeS5mYWNlc1tpXS5jb2xvci5zZXRIZXggaGV4XG4gICAgICAgICBAZ2VvbWV0cnkuZmFjZXNbaSArIDFdLmNvbG9yLnNldEhleCBoZXhcblxuXG4gICAgICBAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwgdmVydGV4Q29sb3JzOiBUSFJFRS5GYWNlQ29sb3JzLCBvdmVyZHJhdzogMC41XG4gICAgICBAY3ViZSAgICAgPSBuZXcgVEhSRUUuTWVzaCBAZ2VvbWV0cnksIEBtYXRlcmlhbFxuXG4gICAgICAjIFVwZGF0ZSB2aWV3XG4gICAgICBAcmVuZGVyZXIuc2V0Q2xlYXJDb2xvciAweDAwMDAwMCwgMFxuICAgICAgQGNhbWVyYS5wb3NpdGlvbi56ID0gNTBcblxuICAgICAgQHNjZW5lLmFkZCBAY3ViZVxuXG4gICAgICBAY3ViZS5yb3RhdGlvbi54ID0gMjBcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgPSAyMFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUaHJlZVNjZW5lIl19
