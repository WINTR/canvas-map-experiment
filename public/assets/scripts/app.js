(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Map Canvas application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var App, CanvasView, Event, MapView, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Event = require('./events/Event.coffee');

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
    return this.listenTo(this.mapView, Event.MAP_INITIALIZED, this.onMapInitialized);
  };

  App.prototype.onMapInitialized = function() {
    return this.canvasView.render();
  };

  return App;

})(View);

$(function() {
  return new App;
});


},{"./events/Event.coffee":3,"./supers/View.coffee":4,"./views/CanvasView.coffee":5,"./views/MapView.coffee":6}],2:[function(require,module,exports){

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

Event = {
  MAP_INITIALIZED: 'onMapInitialized'
};

module.exports = Event;


},{}],4:[function(require,module,exports){

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


},{}],5:[function(require,module,exports){

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
    this.tick = __bind(this.tick, this);
    CanvasView.__super__.constructor.call(this, options);
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    this.renderer.setClearColor(0x000000, 0);
    this.geometry = new THREE.BoxGeometry(20, 20, 20);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xFF0000
    });
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.cube);
    this.camera.position.z = 50;
  }

  CanvasView.prototype.render = function() {
    this.$el.append(this.renderer.domElement);
    return this.tick();
  };

  CanvasView.prototype.tick = function() {
    this.cube.rotation.x += .01;
    this.cube.rotation.y += .01;
    this.renderer.render(this.scene, this.camera);
    return requestAnimationFrame(this.tick);
  };

  return CanvasView;

})(View);

module.exports = CanvasView;


},{"../events/Event.coffee":3,"../supers/View.coffee":4}],6:[function(require,module,exports){

/**
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var CanvasView, Event, MapConfig, MapView, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapConfig = require('../config/MapConfig.coffee');

Event = require('../events/Event.coffee');

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
    MapView.__super__.constructor.call(this, options);
    this.mapbox = L.mapbox;
  }

  MapView.prototype.render = function() {
    this.mapLayer = this.mapbox.map(this.id, MapConfig.ID).setView(MapConfig.INIT.location, MapConfig.INIT.zoom).addControl(this.mapbox.geocoderControl(MapConfig.ID));
    return this.insertCanvasLayer();
  };

  MapView.prototype.insertCanvasLayer = function() {
    this.$leafletPane = $("#map > .leaflet-map-pane > .leaflet-objects-pane");
    console.log(this.$canvas);
    this.$canvas.prependTo(this.$leafletPane);
    this.$canvas.css('z-index', 5);
    return this.trigger(Event.MAP_INITIALIZED);
  };

  return MapView;

})(View);

module.exports = MapView;


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":4,"./CanvasView.coffee":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9NYXBWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHFDQUFBO0VBQUE7aVNBQUE7O0FBQUEsS0FPQSxHQUFhLE9BQUEsQ0FBUSx1QkFBUixDQVBiLENBQUE7O0FBQUEsSUFRQSxHQUFhLE9BQUEsQ0FBUSxz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SUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQW1CLElBQUMsQ0FBQSxZQUFwQixDQUhBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFNBQWIsRUFBd0IsQ0FBeEIsQ0FKQSxDQUFBO1dBTUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsZUFBZixFQVBnQjtFQUFBLENBcERuQixDQUFBOztpQkFBQTs7R0FObUIsS0FidEIsQ0FBQTs7QUFBQSxNQW1GTSxDQUFDLE9BQVAsR0FBaUIsT0FuRmpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAqIE1hcCBDYW52YXMgYXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5FdmVudCAgICAgID0gcmVxdWlyZSAnLi9ldmVudHMvRXZlbnQuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuTWFwVmlldyAgICA9IHJlcXVpcmUgJy4vdmlld3MvTWFwVmlldy5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBBcHAgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBNYXBCb3ggbWFwIHZpZXcgY29udGFpbmluZyBhbGwgbWFwIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eVxuICAgIyBAdHlwZSB7TC5NYXBCb3h9XG5cbiAgIG1hcFZpZXc6IG51bGxcblxuXG4gICAjIENhbnZhcyB2aWV3IGNvbnRhaW5pbmcgYWxsIGNhbnZhcyByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0NhbnZhc1ZpZXd9XG5cbiAgIGNhbnZhc1ZpZXc6IG51bGxcblxuXG4gICAjIEtpY2sgb2ZmIHRoZSBhcHBsaWNhdGlvbiBieSBpbnN0YW50aWF0aW5nXG4gICAjIG5lY2Nlc3Nhcnkgdmlld3NcblxuICAgY29uc3RydWN0b3I6IC0+XG4gICAgICBAY2FudmFzVmlldyA9IG5ldyBDYW52YXNWaWV3XG5cbiAgICAgIEBtYXBWaWV3ID0gbmV3IE1hcFZpZXdcbiAgICAgICAgICRjYW52YXM6IEBjYW52YXNWaWV3LiRlbFxuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgQG1hcFZpZXcucmVuZGVyKClcblxuXG5cbiAgICMgQXBwLXdpZGUgZXZlbnQgbGlzdGVuZXJzXG5cbiAgIGFkZEV2ZW50TGlzdGVuZXJzOiAtPlxuICAgICAgQGxpc3RlblRvIEBtYXBWaWV3LCBFdmVudC5NQVBfSU5JVElBTElaRUQsIEBvbk1hcEluaXRpYWxpemVkXG5cblxuXG4gICAjIEhhbmRsZXIgZm9yIG1hcCBpbml0aWFsaXphdGlvbiBldmVudHNcblxuICAgb25NYXBJbml0aWFsaXplZDogLT5cbiAgICAgIEBjYW52YXNWaWV3LnJlbmRlcigpXG5cblxuXG4kIC0+XG4gICBuZXcgQXBwXG4iLCIjIyMqXG4gKiBNYXAgYXBwIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBDb25maWcgPVxuXG5cbiAgICMgVW5pcXVlIGlkZW50aWZpZXIgZm9yIE1hcEJveCBhcHBcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgSUQ6ICdkYW1hc3NpLmk2OG9sMzhhJ1xuXG5cbiAgICMgTWFwIGxhbmRzIG9uIFNlYXR0bGUgZHVyaW5nIGluaXRpYWxpemF0aW9uXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgSU5JVDpcbiAgICAgIGxvY2F0aW9uOiBbNDcuNjUxODAxNzc0MDEyNDIsIC0xMjIuMzQyNzIwMDMxNzM4MjhdXG4gICAgICB6b29tOiAxMVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDb25maWciLCIjIyMqXG4gKiBHZW5lcmljIEFwcC13aWRlIGV2ZW50c1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5FdmVudCA9XG5cbiAgICMgVHJpZ2dlcmVkIG9uY2UgdGhlIE1hcEJveCBtYXAgaXMgaW5pdGlhbGl6ZWQgYW5kIHJlbmRlcmVkIHRvIHRoZSBET01cbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgTUFQX0lOSVRJQUxJWkVEOiAnb25NYXBJbml0aWFsaXplZCdcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50IiwiIyMjKlxuICogVmlldyBzdXBlcmNsYXNzIGZvciBzaGFyZWQgZnVuY3Rpb25hbGl0eVxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuY2xhc3MgVmlld1xuXG5cbiAgICMgVGhlIHZpZXcgZWxlbWVudFxuICAgIyBAdHlwZSB7JH1cblxuICAgJGVsOiBudWxsXG5cblxuICAgIyBWaWV3IGNvbnN0cnVjdG9yIHdoaWNoIGFjY2VwdHMgcGFyYW1ldGVycyBhbmQgbWVyZ2VzIHRoZW1cbiAgICMgaW50byB0aGUgdmlldyBwcm90b3R5cGUgZm9yIGVhc3kgYWNjZXNzLiBNZXJnZXMgYmFja2JvbmVzXG4gICAjIEV2ZW50IHN5c3RlbSBpbiBhcyB3ZWxsIGZvciBvYnNlcnZlciBhbmQgZXZlbnQgZGlzcGF0Y2hcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuXG4gICAgICAjIE1lcmdlIHBhc3NlZCBwcm9wcyBvciBpbnN0YW5jZSBkZWZhdWx0c1xuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG4gICAgICAjIEV4dGVuZCBCYWNrYm9uZXMgZXZlbnRzIGJ5IG1lcmdpbmcgaW50byB0aGUgVmlldyBwcm90b3R5cGVcbiAgICAgIF8uZXh0ZW5kIFZpZXc6OiwgQmFja2JvbmUuRXZlbnRzXG5cbiAgICAgICMgTWltaWNrIEJhY2tib25lJ3MgJGVsIGJ5IGNoZWNraW5nIGlmIGNsYXNzTmFtZSBvciBpZCBpcyBkZWZpbmVkIG9uIGl2ZXdcbiAgICAgIGlmIHR5cGVvZiBAaWQgaXNudCB1bmRlZmluZWQgYW5kIEBjbGFzc05hbWUgaXMgdW5kZWZpbmVkXG4gICAgICAgICBAJGVsID0gJCBcIiMje0BpZH1cIlxuXG4gICAgICBlbHNlIGlmIEBjbGFzc05hbWUgaXNudCB1bmRlZmluZWRcbiAgICAgICAgIEAkZWwgPSAkIFwiLiN7QGNsYXNzTmFtZX1cIlxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IHRvIHRoZSBkb20gYW5kIHJldHVybnMgaXRzZWxmXG4gICAjIEBwYXJhbm0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuXG4gICAgICBAXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiIyMjKlxuICogQ2FudmFzIExheWVyIHdoaWNoIHJlcHJlc2VudHMgZGF0YSB0byBiZSBkaXNwbGF5ZWQgb24gdGhlIE1hcFZpZXdcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbkV2ZW50ID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcblZpZXcgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIENhbnZhc1ZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgaWQ6ICdjYW52YXMtbGF5ZXInXG5cblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAc2NlbmUgICAgPSBuZXcgVEhSRUUuU2NlbmVcbiAgICAgIEBjYW1lcmEgICA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSA3NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIC4xLCAxMDAwXG4gICAgICBAcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlciBhbHBoYTogdHJ1ZVxuICAgICAgQHJlbmRlcmVyLnNldENsZWFyQ29sb3IgMHgwMDAwMDAsIDBcbiAgICAgIEBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSAyMCwgMjAsIDIwXG4gICAgICBAbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwgY29sb3I6IDB4RkYwMDAwXG4gICAgICBAY3ViZSAgICAgPSBuZXcgVEhSRUUuTWVzaCBAZ2VvbWV0cnksIEBtYXRlcmlhbFxuXG4gICAgICBAc2NlbmUuYWRkIEBjdWJlXG5cbiAgICAgIEBjYW1lcmEucG9zaXRpb24ueiA9IDUwXG5cblxuICAgcmVuZGVyOiAtPlxuICAgICAgQCRlbC5hcHBlbmQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcbiAgICAgIEB0aWNrKClcblxuXG5cbiAgIHRpY2s6ID0+XG4gICAgICBAY3ViZS5yb3RhdGlvbi54ICs9IC4wMVxuICAgICAgQGN1YmUucm90YXRpb24ueSArPSAuMDFcblxuICAgICAgQHJlbmRlcmVyLnJlbmRlciBAc2NlbmUsIEBjYW1lcmFcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAdGlja1xuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1ZpZXciLCIjIyMqXG4gKiBNYXBCb3ggbWFwIGxheWVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBDb25maWcgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5FdmVudCAgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcbkNhbnZhc1ZpZXcgPSByZXF1aXJlICcuL0NhbnZhc1ZpZXcuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBNYXBWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgSUQgb2YgdGhlIHZpZXdcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgaWQ6ICdtYXAnXG5cblxuICAgIyBQcm94eSBMLm1hcGJveCBuYW1lc3BhY2UgZm9yIGVhc3kgYWNjZXNzXG4gICAjIEB0eXBlIHtMLm1hcGJveH1cblxuICAgbWFwYm94OiBudWxsXG5cblxuICAgIyBNYXBCb3ggbWFwIGxheWVyXG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgbWFwTGF5ZXI6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgTGVhZmxldCBsYXllciB0byBpbnNlcnQgbWFwIGJlZm9yZVxuICAgIyBAdHlwZSB7JH1cblxuICAgJGxlYWZsZXRQYW5lOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIGNhbnZhcyBET00gZWxlbWVudFxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgICRjYW52YXM6IG51bGxcblxuXG5cbiAgICMgSW5pdGlhbGl6ZSB0aGUgTWFwTGF5ZXIgYW5kIGtpY2sgb2ZmIENhbnZhcyBsYXllciByZXBvc2l0aW9uaW5nXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIERlZmF1bHQgb3B0aW9ucyB0byBwYXNzIGludG8gdGhlIGFwcFxuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBtYXBib3ggPSBMLm1hcGJveFxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGJ5IGNyZWF0aW5nIHRoZSBNYXAgbGF5ZXIgYW5kIGluc2VydGluZyB0aGVcbiAgICMgY2FudmFzIERPTSBsYXllciBpbnRvIExlYWZsZXQncyBoaWFyY2h5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEBtYXBMYXllciA9IEBtYXBib3gubWFwIEBpZCwgTWFwQ29uZmlnLklEXG4gICAgICAgICAuc2V0VmlldyAgICBNYXBDb25maWcuSU5JVC5sb2NhdGlvbiwgTWFwQ29uZmlnLklOSVQuem9vbVxuICAgICAgICAgLmFkZENvbnRyb2wgQG1hcGJveC5nZW9jb2RlckNvbnRyb2wgTWFwQ29uZmlnLklEXG5cbiAgICAgIEBpbnNlcnRDYW52YXNMYXllcigpXG5cblxuXG4gICAjIE1vdmVzIHRoZSBjYW52YXMgbGF5ZXIgaW50byB0aGUgTGVhZmxldCBET01cblxuICAgaW5zZXJ0Q2FudmFzTGF5ZXI6IC0+XG4gICAgICBAJGxlYWZsZXRQYW5lID0gJCBcIiNtYXAgPiAubGVhZmxldC1tYXAtcGFuZSA+IC5sZWFmbGV0LW9iamVjdHMtcGFuZVwiXG5cbiAgICAgIGNvbnNvbGUubG9nIEAkY2FudmFzXG4gICAgICBAJGNhbnZhcy5wcmVwZW5kVG8gQCRsZWFmbGV0UGFuZVxuICAgICAgQCRjYW52YXMuY3NzICd6LWluZGV4JywgNVxuXG4gICAgICBAdHJpZ2dlciBFdmVudC5NQVBfSU5JVElBTElaRURcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBWaWV3Il19
