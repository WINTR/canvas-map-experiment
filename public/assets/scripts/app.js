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
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Event = require('../events/Event.coffee');

View = require('../supers/View.coffee');

CanvasView = (function(_super) {
  __extends(CanvasView, _super);

  CanvasView.prototype.id = 'canvas';

  function CanvasView(options) {
    CanvasView.__super__.constructor.call(this, options);
  }

  CanvasView.prototype.render = function() {};

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
    this.$canvas.prependTo(this.$leafletPane);
    this.$canvas.css('z-index', 5);
    return this.trigger(Event.MAP_INITIALIZED);
  };

  return MapView;

})(View);

module.exports = MapView;


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":4,"./CanvasView.coffee":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9NYXBWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHFDQUFBO0VBQUE7aVNBQUE7O0FBQUEsS0FPQSxHQUFhLE9BQUEsQ0FBUSx1QkFBUixDQVBiLENBQUE7O0FBQUEsSUFRQSxHQUFhLE9BQUEsQ0FBUSxz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TixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLE1BRlosQ0FEVTtFQUFBLENBL0JiOztBQUFBLG9CQXlDQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0wsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLElBQUMsQ0FBQSxFQUFiLEVBQWlCLFNBQVMsQ0FBQyxFQUEzQixDQUNULENBQUMsT0FEUSxDQUNHLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFEbEIsRUFDNEIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUQzQyxDQUVULENBQUMsVUFGUSxDQUVHLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUF3QixTQUFTLENBQUMsRUFBbEMsQ0FGSCxDQUFaLENBQUE7V0FJQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUxLO0VBQUEsQ0F6Q1IsQ0FBQTs7QUFBQSxvQkFvREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2hCLElBQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FBQSxDQUFFLGtEQUFGLENBQWhCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixJQUFDLENBQUEsWUFBcEIsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxTQUFiLEVBQXdCLENBQXhCLENBSEEsQ0FBQTtXQUtBLElBQUMsQ0FBQSxPQUFELENBQVMsS0FBSyxDQUFDLGVBQWYsRUFOZ0I7RUFBQSxDQXBEbkIsQ0FBQTs7aUJBQUE7O0dBTm1CLEtBYnRCLENBQUE7O0FBQUEsTUFrRk0sQ0FBQyxPQUFQLEdBQWlCLE9BbEZqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyMqXG4gKiBNYXAgQ2FudmFzIGFwcGxpY2F0aW9uIGJvb3RzdHJhcHBlclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuRXZlbnQgICAgICA9IHJlcXVpcmUgJy4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuL3N1cGVycy9WaWV3LmNvZmZlZSdcbk1hcFZpZXcgICAgPSByZXF1aXJlICcuL3ZpZXdzL01hcFZpZXcuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vdmlld3MvQ2FudmFzVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQXBwIGV4dGVuZHMgVmlld1xuXG5cbiAgICMgTWFwQm94IG1hcCB2aWV3IGNvbnRhaW5pbmcgYWxsIG1hcCByZWxhdGVkIGZ1bmN0aW9uYWxpdHlcbiAgICMgQHR5cGUge0wuTWFwQm94fVxuXG4gICBtYXBWaWV3OiBudWxsXG5cblxuICAgIyBDYW52YXMgdmlldyBjb250YWluaW5nIGFsbCBjYW52YXMgcmVsYXRlZCBmdW5jdGlvbmFsaXR5XG4gICAjIEB0eXBlIHtDYW52YXNWaWV3fVxuXG4gICBjYW52YXNWaWV3OiBudWxsXG5cblxuICAgIyBLaWNrIG9mZiB0aGUgYXBwbGljYXRpb24gYnkgaW5zdGFudGlhdGluZ1xuICAgIyBuZWNjZXNzYXJ5IHZpZXdzXG5cbiAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcgPSBuZXcgQ2FudmFzVmlld1xuXG4gICAgICBAbWFwVmlldyA9IG5ldyBNYXBWaWV3XG4gICAgICAgICAkY2FudmFzOiBAY2FudmFzVmlldy4kZWxcblxuICAgICAgQGFkZEV2ZW50TGlzdGVuZXJzKClcbiAgICAgIEBtYXBWaWV3LnJlbmRlcigpXG5cblxuXG4gICAjIEFwcC13aWRlIGV2ZW50IGxpc3RlbmVyc1xuXG4gICBhZGRFdmVudExpc3RlbmVyczogLT5cbiAgICAgIEBsaXN0ZW5UbyBAbWFwVmlldywgRXZlbnQuTUFQX0lOSVRJQUxJWkVELCBAb25NYXBJbml0aWFsaXplZFxuXG5cblxuICAgIyBIYW5kbGVyIGZvciBtYXAgaW5pdGlhbGl6YXRpb24gZXZlbnRzXG5cbiAgIG9uTWFwSW5pdGlhbGl6ZWQ6IC0+XG4gICAgICBAY2FudmFzVmlldy5yZW5kZXIoKVxuXG5cblxuJCAtPlxuICAgbmV3IEFwcFxuIiwiIyMjKlxuICogTWFwIGFwcCBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuTWFwQ29uZmlnID1cblxuXG4gICAjIFVuaXF1ZSBpZGVudGlmaWVyIGZvciBNYXBCb3ggYXBwXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIElEOiAnZGFtYXNzaS5pNjhvbDM4YSdcblxuXG4gICAjIE1hcCBsYW5kcyBvbiBTZWF0dGxlIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIElOSVQ6XG4gICAgICBsb2NhdGlvbjogWzQ3LjY1MTgwMTc3NDAxMjQyLCAtMTIyLjM0MjcyMDAzMTczODI4XVxuICAgICAgem9vbTogMTFcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ29uZmlnIiwiIyMjKlxuICogR2VuZXJpYyBBcHAtd2lkZSBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuRXZlbnQgPVxuXG4gICAjIFRyaWdnZXJlZCBvbmNlIHRoZSBNYXBCb3ggbWFwIGlzIGluaXRpYWxpemVkIGFuZCByZW5kZXJlZCB0byB0aGUgRE9NXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIE1BUF9JTklUSUFMSVpFRDogJ29uTWFwSW5pdGlhbGl6ZWQnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudCIsIiMjIypcbiAqIFZpZXcgc3VwZXJjbGFzcyBmb3Igc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbmNsYXNzIFZpZXdcblxuXG4gICAjIFRoZSB2aWV3IGVsZW1lbnRcbiAgICMgQHR5cGUgeyR9XG5cbiAgICRlbDogbnVsbFxuXG5cbiAgICMgVmlldyBjb25zdHJ1Y3RvciB3aGljaCBhY2NlcHRzIHBhcmFtZXRlcnMgYW5kIG1lcmdlcyB0aGVtXG4gICAjIGludG8gdGhlIHZpZXcgcHJvdG90eXBlIGZvciBlYXN5IGFjY2Vzcy4gTWVyZ2VzIGJhY2tib25lc1xuICAgIyBFdmVudCBzeXN0ZW0gaW4gYXMgd2VsbCBmb3Igb2JzZXJ2ZXIgYW5kIGV2ZW50IGRpc3BhdGNoXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cblxuICAgICAgIyBNZXJnZSBwYXNzZWQgcHJvcHMgb3IgaW5zdGFuY2UgZGVmYXVsdHNcbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9IClcblxuICAgICAgIyBFeHRlbmQgQmFja2JvbmVzIGV2ZW50cyBieSBtZXJnaW5nIGludG8gdGhlIFZpZXcgcHJvdG90eXBlXG4gICAgICBfLmV4dGVuZCBWaWV3OjosIEJhY2tib25lLkV2ZW50c1xuXG4gICAgICAjIE1pbWljayBCYWNrYm9uZSdzICRlbCBieSBjaGVja2luZyBpZiBjbGFzc05hbWUgb3IgaWQgaXMgZGVmaW5lZCBvbiBpdmV3XG4gICAgICBpZiB0eXBlb2YgQGlkIGlzbnQgdW5kZWZpbmVkIGFuZCBAY2xhc3NOYW1lIGlzIHVuZGVmaW5lZFxuICAgICAgICAgQCRlbCA9ICQgXCIjI3tAaWR9XCJcblxuICAgICAgZWxzZSBpZiBAY2xhc3NOYW1lIGlzbnQgdW5kZWZpbmVkXG4gICAgICAgICBAJGVsID0gJCBcIi4je0BjbGFzc05hbWV9XCJcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyB0byB0aGUgZG9tIGFuZCByZXR1cm5zIGl0c2VsZlxuICAgIyBAcGFyYW5tIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cblxuICAgICAgQFxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlldyIsIiMjIypcbiAqIENhbnZhcyBMYXllciB3aGljaCByZXByZXNlbnRzIGRhdGEgdG8gYmUgZGlzcGxheWVkIG9uIHRoZSBNYXBWaWV3XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5FdmVudCA9IHJlcXVpcmUgJy4uL2V2ZW50cy9FdmVudC5jb2ZmZWUnXG5WaWV3ICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBDYW52YXNWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgIGlkOiAnY2FudmFzJ1xuXG5cblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG5cblxuICAgcmVuZGVyOiAtPlxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1ZpZXciLCIjIyMqXG4gKiBNYXBCb3ggbWFwIGxheWVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBDb25maWcgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5FdmVudCAgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcbkNhbnZhc1ZpZXcgPSByZXF1aXJlICcuL0NhbnZhc1ZpZXcuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBNYXBWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgSUQgb2YgdGhlIHZpZXdcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgaWQ6ICdtYXAnXG5cblxuICAgIyBQcm94eSBMLm1hcGJveCBuYW1lc3BhY2UgZm9yIGVhc3kgYWNjZXNzXG4gICAjIEB0eXBlIHtMLm1hcGJveH1cblxuICAgbWFwYm94OiBudWxsXG5cblxuICAgIyBNYXBCb3ggbWFwIGxheWVyXG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgbWFwTGF5ZXI6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgTGVhZmxldCBsYXllciB0byBpbnNlcnQgbWFwIGJlZm9yZVxuICAgIyBAdHlwZSB7JH1cblxuICAgJGxlYWZsZXRQYW5lOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIGNhbnZhcyBET00gZWxlbWVudFxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgICRjYW52YXM6IG51bGxcblxuXG5cbiAgICMgSW5pdGlhbGl6ZSB0aGUgTWFwTGF5ZXIgYW5kIGtpY2sgb2ZmIENhbnZhcyBsYXllciByZXBvc2l0aW9uaW5nXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIERlZmF1bHQgb3B0aW9ucyB0byBwYXNzIGludG8gdGhlIGFwcFxuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBtYXBib3ggPSBMLm1hcGJveFxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGJ5IGNyZWF0aW5nIHRoZSBNYXAgbGF5ZXIgYW5kIGluc2VydGluZyB0aGVcbiAgICMgY2FudmFzIERPTSBsYXllciBpbnRvIExlYWZsZXQncyBoaWFyY2h5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEBtYXBMYXllciA9IEBtYXBib3gubWFwIEBpZCwgTWFwQ29uZmlnLklEXG4gICAgICAgICAuc2V0VmlldyAgICBNYXBDb25maWcuSU5JVC5sb2NhdGlvbiwgTWFwQ29uZmlnLklOSVQuem9vbVxuICAgICAgICAgLmFkZENvbnRyb2wgQG1hcGJveC5nZW9jb2RlckNvbnRyb2wgTWFwQ29uZmlnLklEXG5cbiAgICAgIEBpbnNlcnRDYW52YXNMYXllcigpXG5cblxuXG4gICAjIE1vdmVzIHRoZSBjYW52YXMgbGF5ZXIgaW50byB0aGUgTGVhZmxldCBET01cblxuICAgaW5zZXJ0Q2FudmFzTGF5ZXI6IC0+XG4gICAgICBAJGxlYWZsZXRQYW5lID0gJCBcIiNtYXAgPiAubGVhZmxldC1tYXAtcGFuZSA+IC5sZWFmbGV0LW9iamVjdHMtcGFuZVwiXG5cbiAgICAgIEAkY2FudmFzLnByZXBlbmRUbyBAJGxlYWZsZXRQYW5lXG4gICAgICBAJGNhbnZhcy5jc3MgJ3otaW5kZXgnLCA1XG5cbiAgICAgIEB0cmlnZ2VyIEV2ZW50Lk1BUF9JTklUSUFMSVpFRFxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFZpZXciXX0=
