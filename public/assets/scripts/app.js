(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Map Canvas application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var App, CanvasView, MapEvent, MapView, View,
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

  function App() {
    this.canvasView = new CanvasView;
    this.mapView = new MapView({
      $canvas: this.canvasView.$el
    });
    this.addEventListeners();
    this.mapView.render();
  }

  App.prototype.addEventListeners = function() {
    this.listenTo(this.mapView, MapEvent.INITIALIZED, this.onMapInitialized);
    return this.listenTo(this.mapView, MapEvent.ZOOM_CHANGED, this.onMapZoomChanged);
  };

  App.prototype.onMapInitialized = function() {
    return this.canvasView.render();
  };

  App.prototype.onMapZoomChanged = function(zoom) {
    return this.canvasView.updateZoom(zoom);
  };

  return App;

})(View);

$(function() {
  return new App;
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
    location: [47.65180177401242, -122.34272003173828],
    zoom: 11
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

Event = module.exports = Event;


},{}],4:[function(require,module,exports){

/**
 * Leaflet-related Map events
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapEvent;

MapEvent = {
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
var View;

View = (function() {
  View.prototype.$el = null;

  function View(options) {
    _.extend(this, _.defaults(options = options || this.defaults, this.defaults || {}));
    _.extend(View.prototype, Backbone.Events);
    if (typeof this.id !== void 0 && this.className === void 0) {
      this.$el = $("#" + this.id);
    } else if (this.className !== void 0) {
      this.$el = $("." + this.className);
    }
  }

  View.prototype.render = function(options) {
    return this;
  };

  return View;

})();

module.exports = View;


},{}],6:[function(require,module,exports){

/**
 * Canvas Layer which represents data to be displayed on the MapView
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var CanvasView, Event, View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Event = require('../events/Event.coffee');

View = require('../supers/View.coffee');

CanvasView = (function(_super) {
  __extends(CanvasView, _super);

  CanvasView.prototype.id = 'canvas-layer';

  function CanvasView(options) {
    this.onTick = __bind(this.onTick, this);
    CanvasView.__super__.constructor.call(this, options);
    this.setupThreeJSRenderer();
  }

  CanvasView.prototype.render = function() {
    this.$el.width(window.innerWidth);
    this.$el.height(this.$el.width());
    this.renderer.setSize(this.$el.width(), this.$el.height());
    this.$el.append(this.renderer.domElement);
    return this.onTick();
  };

  CanvasView.prototype.updateZoom = function(zoom) {
    return console.log(zoom);
  };

  CanvasView.prototype.onTick = function() {
    this.cube.rotation.x += .01;
    this.cube.rotation.y += .01;
    this.renderer.render(this.scene, this.camera);
    return requestAnimationFrame(this.onTick);
  };

  CanvasView.prototype.setupThreeJSRenderer = function() {
    var cameraAttributes;
    cameraAttributes = {
      angle: 45,
      aspect: this.$el.width() / this.$el.height(),
      near: .1,
      far: 1000
    };
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(cameraAttributes.angle, cameraAttributes.aspect, cameraAttributes.near, cameraAttributes.far);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    this.renderer.setClearColor(0x000000, 0);
    this.geometry = new THREE.BoxGeometry(10, 10, 10);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      wireframe: true
    });
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.camera.position.z = 50;
    return this.scene.add(this.cube);
  };

  return CanvasView;

})(View);

module.exports = CanvasView;


},{"../events/Event.coffee":3,"../supers/View.coffee":5}],7:[function(require,module,exports){

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
    this.onZoomChanged = __bind(this.onZoomChanged, this);
    MapView.__super__.constructor.call(this, options);
    this.mapbox = L.mapbox;
    this.map = this.mapbox.map;
  }

  MapView.prototype.render = function() {
    this.mapLayer = this.mapbox.map(this.id, MapConfig.ID).setView(MapConfig.INIT.location, MapConfig.INIT.zoom).addControl(this.mapbox.geocoderControl(MapConfig.ID));
    this.insertCanvasLayer();
    return this.addEventListeners();
  };

  MapView.prototype.addEventListeners = function() {
    return this.mapLayer.on(MapEvent.ZOOM_CHANGED, this.onZoomChanged);
  };

  MapView.prototype.onZoomChanged = function(event) {
    return this.trigger(MapEvent.ZOOM_CHANGED, this.mapLayer.getZoom());
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


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../events/MapEvent.coffee":4,"../supers/View.coffee":5,"./CanvasView.coffee":6}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvTWFwRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9NYXBWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7O0dBQUE7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QWlCLE9BOUdqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyMqXG4gKiBNYXAgQ2FudmFzIGFwcGxpY2F0aW9uIGJvb3RzdHJhcHBlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuTWFwRXZlbnQgICA9IHJlcXVpcmUgJy4vZXZlbnRzL01hcEV2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuL3N1cGVycy9WaWV3LmNvZmZlZSdcbk1hcFZpZXcgICAgPSByZXF1aXJlICcuL3ZpZXdzL01hcFZpZXcuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvQ2FudmFzVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgTWFwQm94IG1hcCB2aWV3IGNvbnRhaW5pbmcgYWxsIG1hcCByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0wuTWFwQm94fVxuXG4gICBtYXBWaWV3OiBudWxsXG5cblxuICAgIyBDYW52YXMgdmlldyBjb250YWluaW5nIGFsbCBjYW52YXMgcmVsYXRlZCBmdW5jdGlvbmFsaXR5XG4gICAjIEB0eXBlIHtDYW52YXNWaWV3fVxuXG4gICBjYW52YXNWaWV3OiBudWxsXG5cblxuICAgIyBLaWNrIG9mZiB0aGUgYXBwbGljYXRpb24gYnkgaW5zdGFudGlhdGluZ1xuICAgIyBuZWNjZXNzYXJ5IHZpZXdzXG5cbiAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcgPSBuZXcgQ2FudmFzVmlld1xuXG4gICAgICBAbWFwVmlldyA9IG5ldyBNYXBWaWV3XG4gICAgICAgICAkY2FudmFzOiBAY2FudmFzVmlldy4kZWxcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcbiAgICAgIEBtYXBWaWV3LnJlbmRlcigpXG5cblxuXG4gICAjIEFwcC13aWRlIGV2ZW50IGxpc3RlbmVyc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAbWFwVmlldywgTWFwRXZlbnQuSU5JVElBTElaRUQsICBAb25NYXBJbml0aWFsaXplZFxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCBNYXBFdmVudC5aT09NX0NIQU5HRUQsIEBvbk1hcFpvb21DaGFuZ2VkXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIEhhbmRsZXIgZm9yIG1hcCBpbml0aWFsaXphdGlvbiBldmVudHNcblxuICAgb25NYXBJbml0aWFsaXplZDogLT5cbiAgICAgIEBjYW52YXNWaWV3LnJlbmRlcigpXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIHpvb20gY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge051bWJlcn0gem9vbSBUaGUgY3VycmVudCBtYXAgem9vbVxuXG4gICBvbk1hcFpvb21DaGFuZ2VkOiAoem9vbSkgLT5cbiAgICAgIEBjYW52YXNWaWV3LnVwZGF0ZVpvb20gem9vbVxuXG5cblxuJCAtPlxuICAgbmV3IEFwcFxuIiwiIyMjKlxuICogTWFwIGFwcCBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuTWFwQ29uZmlnID1cblxuXG4gICAjIFVuaXF1ZSBpZGVudGlmaWVyIGZvciBNYXBCb3ggYXBwXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIElEOiAnZGFtYXNzaS5pNjhvbDM4YSdcblxuXG4gICAjIE1hcCBsYW5kcyBvbiBTZWF0dGxlIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIElOSVQ6XG4gICAgICBsb2NhdGlvbjogWzQ3LjY1MTgwMTc3NDAxMjQyLCAtMTIyLjM0MjcyMDAzMTczODI4XVxuICAgICAgem9vbTogMTFcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ29uZmlnIiwiIyMjKlxuICogR2VuZXJpYyBBcHAtd2lkZSBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuRXZlbnQgPVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnQiLCIjIyMqXG4gKiBMZWFmbGV0LXJlbGF0ZWQgTWFwIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBFdmVudCA9XG5cbiAgICMgVHJpZ2dlcmVkIG9uY2UgdGhlIE1hcEJveCBtYXAgaXMgaW5pdGlhbGl6ZWQgYW5kIHJlbmRlcmVkIHRvIHRoZSBET01cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgSU5JVElBTElaRUQ6ICAgICAgJ2luaXRpYWxpemVkJ1xuICAgVVBEQVRFOiAgICAgICAgICAgJ3VwZGF0ZSdcbiAgIFpPT01fU1RBUlQ6ICAgICAgICd6b29tc3RhcnQnXG4gICBaT09NX0NIQU5HRUQ6ICAgICAnem9vbWVuZCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEV2ZW50IiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGZvciBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuY2xhc3MgVmlld1xuXG5cbiAgICMgVGhlIHZpZXcgZWxlbWVudFxuICAgIyBAdHlwZSB7JH1cblxuICAgJGVsOiBudWxsXG5cblxuICAgIyBWaWV3IGNvbnN0cnVjdG9yIHdoaWNoIGFjY2VwdHMgcGFyYW1ldGVycyBhbmQgbWVyZ2VzIHRoZW1cbiAgICMgaW50byB0aGUgdmlldyBwcm90b3R5cGUgZm9yIGVhc3kgYWNjZXNzLiBNZXJnZXMgYmFja2JvbmVzXG4gICAjIEV2ZW50IHN5c3RlbSBpbiBhcyB3ZWxsIGZvciBvYnNlcnZlciBhbmQgZXZlbnQgZGlzcGF0Y2hcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuXG4gICAgICAjIE1lcmdlIHBhc3NlZCBwcm9wcyBvciBpbnN0YW5jZSBkZWZhdWx0c1xuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG4gICAgICAjIEV4dGVuZCBCYWNrYm9uZXMgZXZlbnRzIGJ5IG1lcmdpbmcgaW50byB0aGUgVmlldyBwcm90b3R5cGVcbiAgICAgIF8uZXh0ZW5kIFZpZXc6OiwgQmFja2JvbmUuRXZlbnRzXG5cbiAgICAgICMgTWltaWNrIEJhY2tib25lJ3MgJGVsIGJ5IGNoZWNraW5nIGlmIGNsYXNzTmFtZSBvciBpZCBpcyBkZWZpbmVkIG9uIGl2ZXdcbiAgICAgIGlmIHR5cGVvZiBAaWQgaXNudCB1bmRlZmluZWQgYW5kIEBjbGFzc05hbWUgaXMgdW5kZWZpbmVkXG4gICAgICAgICBAJGVsID0gJCBcIiMje0BpZH1cIlxuXG4gICAgICBlbHNlIGlmIEBjbGFzc05hbWUgaXNudCB1bmRlZmluZWRcbiAgICAgICAgIEAkZWwgPSAkIFwiLiN7QGNsYXNzTmFtZX1cIlxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IHRvIHRoZSBkb20gYW5kIHJldHVybnMgaXRzZWxmXG4gICAjIEBwYXJhbm0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuXG4gICAgICBAXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiIyMjKlxuICogQ2FudmFzIExheWVyIHdoaWNoIHJlcHJlc2VudHMgZGF0YSB0byBiZSBkaXNwbGF5ZWQgb24gdGhlIE1hcFZpZXdcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbkV2ZW50ID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcblZpZXcgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIENhbnZhc1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBJRCBvZiBET00gY29udGFpbmVyIGZvciBjYW52YXMgbGF5ZXJcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgaWQ6ICdjYW52YXMtbGF5ZXInXG5cblxuXG4gICAjIEluaXRpYWxpemUgdGhlIG1hcCBsYXllclxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBzZXR1cFRocmVlSlNSZW5kZXJlcigpXG5cblxuXG4gICAjIFJlbmRlciB0aGUgdmlldyBsYXllciBhbmQgYmVnaW4gVEhSRUUuanMgdGlja2VyXG4gICAjIEBwdWJsaWNcblxuICAgcmVuZGVyOiAtPlxuICAgICAgQCRlbC53aWR0aCB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgQCRlbC5oZWlnaHQgQCRlbC53aWR0aCgpXG5cbiAgICAgIEByZW5kZXJlci5zZXRTaXplIEAkZWwud2lkdGgoKSwgQCRlbC5oZWlnaHQoKVxuICAgICAgQCRlbC5hcHBlbmQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcbiAgICAgIEBvblRpY2soKVxuXG5cblxuICAgIyBSZW5kZXIgdGhlIHZpZXcgbGF5ZXIgYW5kIGJlZ2luIFRIUkVFLmpzIHRpY2tlclxuICAgIyBAcHVibGljXG5cbiAgIHVwZGF0ZVpvb206ICh6b29tKSAtPlxuICAgICAgY29uc29sZS5sb2cgem9vbVxuICAgICAgI0BjdWJlLnNjYWxlLnNldCB6b29tLCB6b29tLCB6b29tXG5cblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgSGFuZGxlciBmb3IgVEhSRUUuanMgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGV2ZW50IGxvb3BcblxuICAgb25UaWNrOiA9PlxuICAgICAgQGN1YmUucm90YXRpb24ueCArPSAuMDFcbiAgICAgIEBjdWJlLnJvdGF0aW9uLnkgKz0gLjAxXG5cbiAgICAgIEByZW5kZXJlci5yZW5kZXIgQHNjZW5lLCBAY2FtZXJhXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQG9uVGlja1xuXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIFNldHVwIHRoZSBUSFJFRS5qcyBzY2VuZVxuXG4gICBzZXR1cFRocmVlSlNSZW5kZXJlcjogLT5cblxuICAgICAgY2FtZXJhQXR0cmlidXRlcyA9XG4gICAgICAgICBhbmdsZTogNDVcbiAgICAgICAgIGFzcGVjdDogQCRlbC53aWR0aCgpIC8gQCRlbC5oZWlnaHQoKVxuICAgICAgICAgbmVhcjogLjFcbiAgICAgICAgIGZhcjogMTAwMFxuXG4gICAgICBAc2NlbmUgICAgPSBuZXcgVEhSRUUuU2NlbmVcbiAgICAgIEBjYW1lcmEgICA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSBjYW1lcmFBdHRyaWJ1dGVzLmFuZ2xlLCBjYW1lcmFBdHRyaWJ1dGVzLmFzcGVjdCwgY2FtZXJhQXR0cmlidXRlcy5uZWFyLCBjYW1lcmFBdHRyaWJ1dGVzLmZhclxuICAgICAgQHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIgYWxwaGE6IHRydWVcbiAgICAgIEByZW5kZXJlci5zZXRDbGVhckNvbG9yIDB4MDAwMDAwLCAwXG4gICAgICBAZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkgMTAsIDEwLCAxMFxuICAgICAgQG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsIGNvbG9yOiAweEZGMDAwMCwgd2lyZWZyYW1lOiB0cnVlXG4gICAgICBAY3ViZSAgICAgPSBuZXcgVEhSRUUuTWVzaCBAZ2VvbWV0cnksIEBtYXRlcmlhbFxuXG4gICAgICBAY2FtZXJhLnBvc2l0aW9uLnogPSA1MFxuICAgICAgQHNjZW5lLmFkZCBAY3ViZVxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1ZpZXciLCIjIyMqXG4gKiBNYXBCb3ggbWFwIGxheWVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBDb25maWcgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5FdmVudCAgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcbk1hcEV2ZW50ICAgPSByZXF1aXJlICcuLi9ldmVudHMvTWFwRXZlbnQuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vQ2FudmFzVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIE1hcFZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBJRCBvZiB0aGUgdmlld1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBpZDogJ21hcCdcblxuXG4gICAjIFByb3h5IEwubWFwYm94IG5hbWVzcGFjZSBmb3IgZWFzeSBhY2Nlc3NcbiAgICMgQHR5cGUge0wubWFwYm94fVxuXG4gICBtYXBib3g6IG51bGxcblxuXG4gICAjIE1hcEJveCBtYXAgbGF5ZXJcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICBtYXBMYXllcjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBMZWFmbGV0IGxheWVyIHRvIGluc2VydCBtYXAgYmVmb3JlXG4gICAjIEB0eXBlIHskfVxuXG4gICAkbGVhZmxldFBhbmU6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgY2FudmFzIERPTSBlbGVtZW50XG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgJGNhbnZhczogbnVsbFxuXG5cblxuICAgIyBJbml0aWFsaXplIHRoZSBNYXBMYXllciBhbmQga2ljayBvZmYgQ2FudmFzIGxheWVyIHJlcG9zaXRpb25pbmdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgRGVmYXVsdCBvcHRpb25zIHRvIHBhc3MgaW50byB0aGUgYXBwXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG1hcGJveCA9IEwubWFwYm94XG4gICAgICBAbWFwICAgID0gQG1hcGJveC5tYXBcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyBieSBjcmVhdGluZyB0aGUgTWFwIGxheWVyIGFuZCBpbnNlcnRpbmcgdGhlXG4gICAjIGNhbnZhcyBET00gbGF5ZXIgaW50byBMZWFmbGV0J3MgaGlhcmNoeVxuXG4gICByZW5kZXI6IC0+XG4gICAgICBAbWFwTGF5ZXIgPSBAbWFwYm94Lm1hcCBAaWQsIE1hcENvbmZpZy5JRFxuICAgICAgICAgLnNldFZpZXcgICAgTWFwQ29uZmlnLklOSVQubG9jYXRpb24sIE1hcENvbmZpZy5JTklULnpvb21cbiAgICAgICAgIC5hZGRDb250cm9sIEBtYXBib3guZ2VvY29kZXJDb250cm9sIE1hcENvbmZpZy5JRFxuXG4gICAgICBAaW5zZXJ0Q2FudmFzTGF5ZXIoKVxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcblxuXG5cblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbWFwTGF5ZXIub24gTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAb25ab29tQ2hhbmdlZFxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIyBIYW5kbGVyIGZvciB6b29tIGNoYW5nZSBldmVudHNcbiAgICMgQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cbiAgIG9uWm9vbUNoYW5nZWQ6IChldmVudCkgPT5cbiAgICAgIEB0cmlnZ2VyIE1hcEV2ZW50LlpPT01fQ0hBTkdFRCwgQG1hcExheWVyLmdldFpvb20oKVxuXG5cblxuXG5cblxuICAgIyBQUklWQVRFIE1FVEhPRFNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIE1vdmVzIHRoZSBjYW52YXMgbGF5ZXIgaW50byB0aGUgTGVhZmxldCBET01cblxuICAgaW5zZXJ0Q2FudmFzTGF5ZXI6IC0+XG4gICAgICBAJGxlYWZsZXRQYW5lID0gJCBcIiNtYXAgPiAubGVhZmxldC1tYXAtcGFuZSA+IC5sZWFmbGV0LW9iamVjdHMtcGFuZVwiXG4gICAgICBAJGNhbnZhcy5wcmVwZW5kVG8gQCRsZWFmbGV0UGFuZVxuICAgICAgQCRjYW52YXMuY3NzICd6LWluZGV4JywgNVxuXG4gICAgICBAdHJpZ2dlciBNYXBFdmVudC5JTklUSUFMSVpFRFxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFZpZXciXX0=
