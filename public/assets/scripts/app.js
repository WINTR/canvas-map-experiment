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
    this.geometry = new THREE.BoxGeometry(20, 20, 20);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvTWFwRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9NYXBWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7O0dBQUE7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QUFDLGVBQVIsQ0FBd0IsU0FBUyxDQUFDLEVBQWxDLENBRkgsQ0FBWixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUpBLENBQUE7V0FLQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQU5LO0VBQUEsQ0ExQ1IsQ0FBQTs7QUFBQSxvQkFxREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO1dBQ2hCLElBQUMsQ0FBQSxRQUFRLENBQUMsRUFBVixDQUFhLFFBQVEsQ0FBQyxZQUF0QixFQUFvQyxJQUFDLENBQUEsYUFBckMsRUFEZ0I7RUFBQSxDQXJEbkIsQ0FBQTs7QUFBQSxvQkFrRUEsYUFBQSxHQUFlLFNBQUMsS0FBRCxHQUFBO1dBQ1osSUFBQyxDQUFBLE9BQUQsQ0FBUyxRQUFRLENBQUMsWUFBbEIsRUFBZ0MsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQUEsQ0FBaEMsRUFEWTtFQUFBLENBbEVmLENBQUE7O0FBQUEsb0JBZ0ZBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNoQixJQUFBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUEsQ0FBRSxrREFBRixDQUFoQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsSUFBQyxDQUFBLFlBQXBCLENBREEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsU0FBYixFQUF3QixDQUF4QixDQUZBLENBQUE7V0FJQSxJQUFDLENBQUEsT0FBRCxDQUFTLFFBQVEsQ0FBQyxXQUFsQixFQUxnQjtFQUFBLENBaEZuQixDQUFBOztpQkFBQTs7R0FObUIsS0FkdEIsQ0FBQTs7QUFBQSxNQThHTSxDQUFDLE9BQVAsR0FBaUIsT0E5R2pCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAqIE1hcCBDYW52YXMgYXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBFdmVudCAgID0gcmVxdWlyZSAnLi9ldmVudHMvTWFwRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuTWFwVmlldyAgICA9IHJlcXVpcmUgJy4vdmlld3MvTWFwVmlldy5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBBcHAgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBNYXBCb3ggbWFwIHZpZXcgY29udGFpbmluZyBhbGwgbWFwIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eVxuICAgIyBAdHlwZSB7TC5NYXBCb3h9XG5cbiAgIG1hcFZpZXc6IG51bGxcblxuXG4gICAjIENhbnZhcyB2aWV3IGNvbnRhaW5pbmcgYWxsIGNhbnZhcyByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0NhbnZhc1ZpZXd9XG5cbiAgIGNhbnZhc1ZpZXc6IG51bGxcblxuXG4gICAjIEtpY2sgb2ZmIHRoZSBhcHBsaWNhdGlvbiBieSBpbnN0YW50aWF0aW5nXG4gICAjIG5lY2Nlc3Nhcnkgdmlld3NcblxuICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBAY2FudmFzVmlldyA9IG5ldyBDYW52YXNWaWV3XG5cbiAgICAgIEBtYXBWaWV3ID0gbmV3IE1hcFZpZXdcbiAgICAgICAgICRjYW52YXM6IEBjYW52YXNWaWV3LiRlbFxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQG1hcFZpZXcucmVuZGVyKClcblxuXG5cbiAgICMgQXBwLXdpZGUgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCBNYXBFdmVudC5JTklUSUFMSVpFRCwgIEBvbk1hcEluaXRpYWxpemVkXG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsIE1hcEV2ZW50LlpPT01fQ0hBTkdFRCwgQG9uTWFwWm9vbUNoYW5nZWRcblxuXG5cblxuICAgIyBFVkVOVCBIQU5ETEVSU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgSGFuZGxlciBmb3IgbWFwIGluaXRpYWxpemF0aW9uIGV2ZW50c1xuXG4gICBvbk1hcEluaXRpYWxpemVkOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcucmVuZGVyKClcblxuXG5cbiAgICMgSGFuZGxlciBmb3Igem9vbSBjaGFuZ2UgZXZlbnRzXG4gICAjIEBwYXJhbSB7TnVtYmVyfSB6b29tIFRoZSBjdXJyZW50IG1hcCB6b29tXG5cbiAgIG9uTWFwWm9vbUNoYW5nZWQ6ICh6b29tKSAtPlxuICAgICAgQGNhbnZhc1ZpZXcudXBkYXRlWm9vbSB6b29tXG5cblxuXG4kIC0+XG4gICBuZXcgQXBwXG4iLCIjIyMqXG4gKiBNYXAgYXBwIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBDb25maWcgPVxuXG5cbiAgICMgVW5pcXVlIGlkZW50aWZpZXIgZm9yIE1hcEJveCBhcHBcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgSUQ6ICdkYW1hc3NpLmk2OG9sMzhhJ1xuXG5cbiAgICMgTWFwIGxhbmRzIG9uIFNlYXR0bGUgZHVyaW5nIGluaXRpYWxpemF0aW9uXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgSU5JVDpcbiAgICAgIGxvY2F0aW9uOiBbNDcuNjUxODAxNzc0MDEyNDIsIC0xMjIuMzQyNzIwMDMxNzM4MjhdXG4gICAgICB6b29tOiAxMVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDb25maWciLCIjIyMqXG4gKiBHZW5lcmljIEFwcC13aWRlIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5FdmVudCA9XG5cblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudCIsIiMjIypcbiAqIExlYWZsZXQtcmVsYXRlZCBNYXAgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbk1hcEV2ZW50ID1cblxuICAgIyBUcmlnZ2VyZWQgb25jZSB0aGUgTWFwQm94IG1hcCBpcyBpbml0aWFsaXplZCBhbmQgcmVuZGVyZWQgdG8gdGhlIERPTVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBJTklUSUFMSVpFRDogICAgICAnaW5pdGlhbGl6ZWQnXG4gICBVUERBVEU6ICAgICAgICAgICAndXBkYXRlJ1xuICAgWk9PTV9TVEFSVDogICAgICAgJ3pvb21zdGFydCdcbiAgIFpPT01fQ0hBTkdFRDogICAgICd6b29tZW5kJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwRXZlbnQiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgZm9yIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5jbGFzcyBWaWV3XG5cblxuICAgIyBUaGUgdmlldyBlbGVtZW50XG4gICAjIEB0eXBlIHskfVxuXG4gICAkZWw6IG51bGxcblxuXG4gICAjIFZpZXcgY29uc3RydWN0b3Igd2hpY2ggYWNjZXB0cyBwYXJhbWV0ZXJzIGFuZCBtZXJnZXMgdGhlbVxuICAgIyBpbnRvIHRoZSB2aWV3IHByb3RvdHlwZSBmb3IgZWFzeSBhY2Nlc3MuIE1lcmdlcyBiYWNrYm9uZXNcbiAgICMgRXZlbnQgc3lzdGVtIGluIGFzIHdlbGwgZm9yIG9ic2VydmVyIGFuZCBldmVudCBkaXNwYXRjaFxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG5cbiAgICAgICMgTWVyZ2UgcGFzc2VkIHByb3BzIG9yIGluc3RhbmNlIGRlZmF1bHRzXG4gICAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cbiAgICAgICMgRXh0ZW5kIEJhY2tib25lcyBldmVudHMgYnkgbWVyZ2luZyBpbnRvIHRoZSBWaWV3IHByb3RvdHlwZVxuICAgICAgXy5leHRlbmQgVmlldzo6LCBCYWNrYm9uZS5FdmVudHNcblxuICAgICAgIyBNaW1pY2sgQmFja2JvbmUncyAkZWwgYnkgY2hlY2tpbmcgaWYgY2xhc3NOYW1lIG9yIGlkIGlzIGRlZmluZWQgb24gaXZld1xuICAgICAgaWYgdHlwZW9mIEBpZCBpc250IHVuZGVmaW5lZCBhbmQgQGNsYXNzTmFtZSBpcyB1bmRlZmluZWRcbiAgICAgICAgIEAkZWwgPSAkIFwiIyN7QGlkfVwiXG5cbiAgICAgIGVsc2UgaWYgQGNsYXNzTmFtZSBpc250IHVuZGVmaW5lZFxuICAgICAgICAgQCRlbCA9ICQgXCIuI3tAY2xhc3NOYW1lfVwiXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgdG8gdGhlIGRvbSBhbmQgcmV0dXJucyBpdHNlbGZcbiAgICMgQHBhcmFubSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG5cbiAgICAgIEBcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXciLCIjIyMqXG4gKiBDYW52YXMgTGF5ZXIgd2hpY2ggcmVwcmVzZW50cyBkYXRhIHRvIGJlIGRpc3BsYXllZCBvbiB0aGUgTWFwVmlld1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuRXZlbnQgPSByZXF1aXJlICcuLi9ldmVudHMvRXZlbnQuY29mZmVlJ1xuVmlldyAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICAjIElEIG9mIERPTSBjb250YWluZXIgZm9yIGNhbnZhcyBsYXllclxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBpZDogJ2NhbnZhcy1sYXllcidcblxuXG5cbiAgICMgSW5pdGlhbGl6ZSB0aGUgbWFwIGxheWVyXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQHNldHVwVGhyZWVKU1JlbmRlcmVyKClcblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGxheWVyIGFuZCBiZWdpbiBUSFJFRS5qcyB0aWNrZXJcbiAgICMgQHB1YmxpY1xuXG4gICByZW5kZXI6IC0+XG4gICAgICBAcmVuZGVyZXIuc2V0U2l6ZSBAJGVsLndpZHRoKCksIEAkZWwuaGVpZ2h0KClcbiAgICAgIEAkZWwuYXBwZW5kIEByZW5kZXJlci5kb21FbGVtZW50XG4gICAgICBAb25UaWNrKClcblxuXG5cbiAgICMgUmVuZGVyIHRoZSB2aWV3IGxheWVyIGFuZCBiZWdpbiBUSFJFRS5qcyB0aWNrZXJcbiAgICMgQHB1YmxpY1xuXG4gICB1cGRhdGVab29tOiAoem9vbSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIHpvb21cblxuXG5cblxuXG4gICAjIEVWRU5UIEhBTkRMRVJTXG4gICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIyBIYW5kbGVyIGZvciBUSFJFRS5qcyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgZXZlbnQgbG9vcFxuXG4gICBvblRpY2s6ID0+XG4gICAgICBAY3ViZS5yb3RhdGlvbi54ICs9IC4wMVxuICAgICAgQGN1YmUucm90YXRpb24ueSArPSAuMDFcblxuICAgICAgQHJlbmRlcmVyLnJlbmRlciBAc2NlbmUsIEBjYW1lcmFcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAb25UaWNrXG5cblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgU2V0dXAgdGhlIFRIUkVFLmpzIHNjZW5lXG5cbiAgIHNldHVwVGhyZWVKU1JlbmRlcmVyOiAtPlxuXG4gICAgICBjYW1lcmFBdHRyaWJ1dGVzID1cbiAgICAgICAgIGFuZ2xlOiA0NVxuICAgICAgICAgYXNwZWN0OiBAJGVsLndpZHRoKCkgLyBAJGVsLmhlaWdodCgpXG4gICAgICAgICBuZWFyOiAuMVxuICAgICAgICAgZmFyOiAxMDAwXG5cbiAgICAgIEBzY2VuZSAgICA9IG5ldyBUSFJFRS5TY2VuZVxuICAgICAgQGNhbWVyYSAgID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhIGNhbWVyYUF0dHJpYnV0ZXMuYW5nbGUsIGNhbWVyYUF0dHJpYnV0ZXMuYXNwZWN0LCBjYW1lcmFBdHRyaWJ1dGVzLm5lYXIsIGNhbWVyYUF0dHJpYnV0ZXMuZmFyXG4gICAgICBAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlciBhbHBoYTogdHJ1ZVxuICAgICAgQHJlbmRlcmVyLnNldENsZWFyQ29sb3IgMHgwMDAwMDAsIDBcbiAgICAgIEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSAyMCwgMjAsIDIwXG4gICAgICBAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwgY29sb3I6IDB4RkYwMDAwLCB3aXJlZnJhbWU6IHRydWVcbiAgICAgIEBjdWJlICAgICA9IG5ldyBUSFJFRS5NZXNoIEBnZW9tZXRyeSwgQG1hdGVyaWFsXG5cbiAgICAgIEBjYW1lcmEucG9zaXRpb24ueiA9IDUwXG4gICAgICBAc2NlbmUuYWRkIEBjdWJlXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzVmlldyIsIiMjIypcbiAqIE1hcEJveCBtYXAgbGF5ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcENvbmZpZyAgPSByZXF1aXJlICcuLi9jb25maWcvTWFwQ29uZmlnLmNvZmZlZSdcbkV2ZW50ICAgICAgPSByZXF1aXJlICcuLi9ldmVudHMvRXZlbnQuY29mZmVlJ1xuTWFwRXZlbnQgICA9IHJlcXVpcmUgJy4uL2V2ZW50cy9NYXBFdmVudC5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi9DYW52YXNWaWV3LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgTWFwVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICAjIElEIG9mIHRoZSB2aWV3XG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGlkOiAnbWFwJ1xuXG5cbiAgICMgUHJveHkgTC5tYXBib3ggbmFtZXNwYWNlIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAdHlwZSB7TC5tYXBib3h9XG5cbiAgIG1hcGJveDogbnVsbFxuXG5cbiAgICMgTWFwQm94IG1hcCBsYXllclxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgIG1hcExheWVyOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIExlYWZsZXQgbGF5ZXIgdG8gaW5zZXJ0IG1hcCBiZWZvcmVcbiAgICMgQHR5cGUgeyR9XG5cbiAgICRsZWFmbGV0UGFuZTogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjYW52YXMgRE9NIGVsZW1lbnRcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICAkY2FudmFzOiBudWxsXG5cblxuXG4gICAjIEluaXRpYWxpemUgdGhlIE1hcExheWVyIGFuZCBraWNrIG9mZiBDYW52YXMgbGF5ZXIgcmVwb3NpdGlvbmluZ1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBEZWZhdWx0IG9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBhcHBcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAbWFwYm94ID0gTC5tYXBib3hcbiAgICAgIEBtYXAgICAgPSBAbWFwYm94Lm1hcFxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGJ5IGNyZWF0aW5nIHRoZSBNYXAgbGF5ZXIgYW5kIGluc2VydGluZyB0aGVcbiAgICMgY2FudmFzIERPTSBsYXllciBpbnRvIExlYWZsZXQncyBoaWFyY2h5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEBtYXBMYXllciA9IEBtYXBib3gubWFwIEBpZCwgTWFwQ29uZmlnLklEXG4gICAgICAgICAuc2V0VmlldyAgICBNYXBDb25maWcuSU5JVC5sb2NhdGlvbiwgTWFwQ29uZmlnLklOSVQuem9vbVxuICAgICAgICAgLmFkZENvbnRyb2wgQG1hcGJveC5nZW9jb2RlckNvbnRyb2wgTWFwQ29uZmlnLklEXG5cbiAgICAgIEBpbnNlcnRDYW52YXNMYXllcigpXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBtYXBMYXllci5vbiBNYXBFdmVudC5aT09NX0NIQU5HRUQsIEBvblpvb21DaGFuZ2VkXG5cblxuXG5cbiAgICMgRVZFTlQgSEFORExFUlNcbiAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAjIEhhbmRsZXIgZm9yIHpvb20gY2hhbmdlIGV2ZW50c1xuICAgIyBAcGFyYW0ge09iamVjdH0gZXZlbnRcblxuICAgb25ab29tQ2hhbmdlZDogKGV2ZW50KSA9PlxuICAgICAgQHRyaWdnZXIgTWFwRXZlbnQuWk9PTV9DSEFOR0VELCBAbWFwTGF5ZXIuZ2V0Wm9vbSgpXG5cblxuXG5cblxuXG4gICAjIFBSSVZBVEUgTUVUSE9EU1xuICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICMgTW92ZXMgdGhlIGNhbnZhcyBsYXllciBpbnRvIHRoZSBMZWFmbGV0IERPTVxuXG4gICBpbnNlcnRDYW52YXNMYXllcjogLT5cbiAgICAgIEAkbGVhZmxldFBhbmUgPSAkIFwiI21hcCA+IC5sZWFmbGV0LW1hcC1wYW5lID4gLmxlYWZsZXQtb2JqZWN0cy1wYW5lXCJcbiAgICAgIEAkY2FudmFzLnByZXBlbmRUbyBAJGxlYWZsZXRQYW5lXG4gICAgICBAJGNhbnZhcy5jc3MgJ3otaW5kZXgnLCA1XG5cbiAgICAgIEB0cmlnZ2VyIE1hcEV2ZW50LklOSVRJQUxJWkVEXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwVmlldyJdfQ==
