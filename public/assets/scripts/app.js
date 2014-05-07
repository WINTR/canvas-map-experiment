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
    this.mapView = new MapView;
    this.canvasView = new CanvasView;
    this.addEventListeners();
  }

  App.prototype.addEventListeners = function() {
    return this.listenTo(this.mapView, Event.MAP_INITIALIZED, this.onMapInitialized);
  };

  App.prototype.onMapInitialized = function() {
    return console.log('init!');
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
var CanvasView;

CanvasView = (function() {
  function CanvasView(options) {}

  return CanvasView;

})();

module.exports = CanvasView;


},{}],6:[function(require,module,exports){

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
    this.mapLayer = this.mapbox.map(this.id, MapConfig.ID).setView(MapConfig.INIT.location, MapConfig.INIT.zoom).addControl(this.mapbox.geocoderControl(MapConfig.ID));
    this.insertCanvasLayer();
  }

  MapView.prototype.insertCanvasLayer = function() {
    var $canvas, $leafletPane;
    $leafletPane = $("#map > .leaflet-map-pane > .leaflet-objects-pane");
    $canvas = $('#canvas-layer');
    $canvas.prependTo($leafletPane);
    $canvas.css('z-index', 5);
    return this.trigger(Event.MAP_INITIALIZED);
  };

  return MapView;

})(View);

module.exports = MapView;


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":4,"./CanvasView.coffee":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9NYXBWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHFDQUFBO0VBQUE7aVNBQUE7O0FBQUEsS0FPQSxHQUFhLE9BQUEsQ0FBUSx1QkFBUixDQVBiLENBQUE7O0FBQUEsSUFRQSxHQUFhLE9BQUEsQ0FBUSxzQkFBUixDQVJiLENBQUE7O0FBQUEsT0FTQSxHQUFhLE9BQUEsQ0FBUSx3QkFBUixDQVRiLENBQUE7O0FBQUEsVUFVQSxHQUFhLE9BQUEsQ0FBUSwyQkFBUixDQVZiLENBQUE7O0FBQUE7QUFtQkcsd0JBQUEsQ0FBQTs7QUFBQSxnQkFBQSxPQUFBLEdBQVMsSUFBVCxDQUFBOztBQUFBLGdCQU1BLFVBQUEsR0FBWSxJQU5aLENBQUE7O0FBYWEsRUFBQSxhQUFBLEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxPQUFELEdBQWMsR0FBQSxDQUFBLE9BQWQsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxHQUFBLENBQUEsVUFEZCxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUhBLENBRFU7RUFBQSxDQWJiOztBQUFBLGdCQXVCQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7V0FDaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsT0FBWCxFQUFvQixLQUFLLENBQUMsZUFBMUIsRUFBMkMsSUFBQyxDQUFBLGdCQUE1QyxFQURnQjtFQUFBLENBdkJuQixDQUFBOztBQUFBLGdCQThCQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7V0FDZixPQUFPLENBQUMsR0FBUixDQUFZLE9BQVosRUFEZTtFQUFBLENBOUJsQixDQUFBOzthQUFBOztHQU5lLEtBYmxCLENBQUE7O0FBQUEsQ0FzREEsQ0FBRSxTQUFBLEdBQUE7U0FDQyxHQUFBLENBQUEsSUFERDtBQUFBLENBQUYsQ0F0REEsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLFNBQUE7O0FBQUEsU0FRQSxHQU1HO0FBQUEsRUFBQSxFQUFBLEVBQUksa0JBQUo7QUFBQSxFQU1BLElBQUEsRUFDRztBQUFBLElBQUEsUUFBQSxFQUFVLENBQUMsaUJBQUQsRUFBb0IsQ0FBQSxrQkFBcEIsQ0FBVjtBQUFBLElBQ0EsSUFBQSxFQUFNLEVBRE47R0FQSDtDQWRILENBQUE7O0FBQUEsTUEwQk0sQ0FBQyxPQUFQLEdBQWlCLFNBMUJqQixDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsS0FBQTs7QUFBQSxLQVFBLEdBS0c7QUFBQSxFQUFBLGVBQUEsRUFBaUIsa0JBQWpCO0NBYkgsQ0FBQTs7QUFBQSxNQWdCTSxDQUFDLE9BQVAsR0FBaUIsS0FoQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxJQUFBOztBQUFBO0FBYUcsaUJBQUEsR0FBQSxHQUFLLElBQUwsQ0FBQTs7QUFTYSxFQUFBLGNBQUMsT0FBRCxHQUFBO0FBQ1YsSUFBQSxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBWSxDQUFDLENBQUMsUUFBRixDQUFZLE9BQUEsR0FBVSxPQUFBLElBQVcsSUFBQyxDQUFBLFFBQWxDLEVBQTRDLElBQUMsQ0FBQSxRQUFELElBQWEsRUFBekQsQ0FBWixDQUFBLENBQUE7QUFBQSxJQUdBLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBSSxDQUFBLFNBQWIsRUFBaUIsUUFBUSxDQUFDLE1BQTFCLENBSEEsQ0FBQTtBQUtBLElBQUEsSUFBRyxNQUFBLENBQUEsSUFBUSxDQUFBLEVBQVIsS0FBZ0IsTUFBaEIsSUFBOEIsSUFBQyxDQUFBLFNBQUQsS0FBYyxNQUEvQztBQUNHLE1BQUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFBLENBQUcsR0FBQSxHQUFFLElBQUMsQ0FBQSxFQUFOLENBQVAsQ0FESDtLQUFBLE1BR0ssSUFBRyxJQUFDLENBQUEsU0FBRCxLQUFnQixNQUFuQjtBQUNGLE1BQUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFBLENBQUcsR0FBQSxHQUFFLElBQUMsQ0FBQSxTQUFOLENBQVAsQ0FERTtLQVRLO0VBQUEsQ0FUYjs7QUFBQSxpQkEwQkEsTUFBQSxHQUFRLFNBQUMsT0FBRCxHQUFBO1dBRUwsS0FGSztFQUFBLENBMUJSLENBQUE7O2NBQUE7O0lBYkgsQ0FBQTs7QUFBQSxNQTRDTSxDQUFDLE9BQVAsR0FBaUIsSUE1Q2pCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxVQUFBOztBQUFBO0FBVWdCLEVBQUEsb0JBQUMsT0FBRCxHQUFBLENBQWI7O29CQUFBOztJQVZILENBQUE7O0FBQUEsTUFlTSxDQUFDLE9BQVAsR0FBaUIsVUFmakIsQ0FBQTs7OztBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLDJDQUFBO0VBQUE7aVNBQUE7O0FBQUEsU0FPQSxHQUFhLE9BQUEsQ0FBUSw0QkFBUixDQVBiLENBQUE7O0FBQUEsS0FRQSxHQUFhLE9BQUEsQ0FBUSx3QkFBUixDQVJiLENBQUE7O0FBQUEsVUFTQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQVRiLENBQUE7O0FBQUEsSUFVQSxHQUFhLE9BQUEsQ0FBUSx1QkFBUixDQVZiLENBQUE7O0FBQUE7QUFtQkcsNEJBQUEsQ0FBQTs7QUFBQSxvQkFBQSxFQUFBLEdBQUksS0FBSixDQUFBOztBQUFBLG9CQU1BLE1BQUEsR0FBUSxJQU5SLENBQUE7O0FBQUEsb0JBWUEsUUFBQSxHQUFVLElBWlYsQ0FBQTs7QUFBQSxvQkFrQkEsWUFBQSxHQUFjLElBbEJkLENBQUE7O0FBQUEsb0JBd0JBLE9BQUEsR0FBUyxJQXhCVCxDQUFBOztBQStCYSxFQUFBLGlCQUFDLE9BQUQsR0FBQTtBQUNWLElBQUEseUNBQU0sT0FBTixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLE1BRlosQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsQ0FBWSxJQUFDLENBQUEsRUFBYixFQUFpQixTQUFTLENBQUMsRUFBM0IsQ0FDVCxDQUFDLE9BRFEsQ0FDRyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBRGxCLEVBQzRCLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFEM0MsQ0FFVCxDQUFDLFVBRlEsQ0FFRyxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsU0FBUyxDQUFDLEVBQWxDLENBRkgsQ0FKWixDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQVJBLENBRFU7RUFBQSxDQS9CYjs7QUFBQSxvQkE0Q0EsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2hCLFFBQUEscUJBQUE7QUFBQSxJQUFBLFlBQUEsR0FBZSxDQUFBLENBQUUsa0RBQUYsQ0FBZixDQUFBO0FBQUEsSUFDQSxPQUFBLEdBQWUsQ0FBQSxDQUFFLGVBQUYsQ0FEZixDQUFBO0FBQUEsSUFHQSxPQUFPLENBQUMsU0FBUixDQUFrQixZQUFsQixDQUhBLENBQUE7QUFBQSxJQUlBLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWixFQUF1QixDQUF2QixDQUpBLENBQUE7V0FNQSxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxlQUFmLEVBUGdCO0VBQUEsQ0E1Q25CLENBQUE7O2lCQUFBOztHQU5tQixLQWJ0QixDQUFBOztBQUFBLE1BMkVNLENBQUMsT0FBUCxHQUFpQixPQTNFakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICogTWFwIENhbnZhcyBhcHBsaWNhdGlvbiBib290c3RyYXBwZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbkV2ZW50ICAgICAgPSByZXF1aXJlICcuL2V2ZW50cy9FdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5NYXBWaWV3ICAgID0gcmVxdWlyZSAnLi92aWV3cy9NYXBWaWV3LmNvZmZlZSdcbkNhbnZhc1ZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcCBleHRlbmRzIFZpZXdcblxuXG4gICAjIE1hcEJveCBtYXAgdmlldyBjb250YWluaW5nIGFsbCBtYXAgcmVsYXRlZCBmdW5jdGlvbmFsaXR5XG4gICAjIEB0eXBlIHtMLk1hcEJveH1cblxuICAgbWFwVmlldzogbnVsbFxuXG5cbiAgICMgQ2FudmFzIHZpZXcgY29udGFpbmluZyBhbGwgY2FudmFzIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eVxuICAgIyBAdHlwZSB7Q2FudmFzVmlld31cblxuICAgY2FudmFzVmlldzogbnVsbFxuXG5cblxuICAgIyBLaWNrIG9mZiB0aGUgYXBwbGljYXRpb24gYnkgaW5zdGFudGlhdGluZ1xuICAgIyBuZWNjZXNzYXJ5IHZpZXdzXG5cbiAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgQG1hcFZpZXcgICAgPSBuZXcgTWFwVmlld1xuICAgICAgQGNhbnZhc1ZpZXcgPSBuZXcgQ2FudmFzVmlld1xuXG4gICAgICBAYWRkRXZlbnRMaXN0ZW5lcnMoKVxuXG5cblxuICAgIyBBcHAtd2lkZSBldmVudCBsaXN0ZW5lcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsIEV2ZW50Lk1BUF9JTklUSUFMSVpFRCwgQG9uTWFwSW5pdGlhbGl6ZWRcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbWFwIGluaXRpYWxpemF0aW9uIGV2ZW50c1xuXG4gICBvbk1hcEluaXRpYWxpemVkOiAtPlxuICAgICAgY29uc29sZS5sb2cgJ2luaXQhJ1xuXG5cblxuJCAtPlxuICAgbmV3IEFwcFxuIiwiIyMjKlxuICogTWFwIGFwcCBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuTWFwQ29uZmlnID1cblxuXG4gICAjIFVuaXF1ZSBpZGVudGlmaWVyIGZvciBNYXBCb3ggYXBwXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIElEOiAnZGFtYXNzaS5pNjhvbDM4YSdcblxuXG4gICAjIE1hcCBsYW5kcyBvbiBTZWF0dGxlIGR1cmluZyBpbml0aWFsaXphdGlvblxuICAgIyBAdHlwZSB7QXJyYXl9XG5cbiAgIElOSVQ6XG4gICAgICBsb2NhdGlvbjogWzQ3LjY1MTgwMTc3NDAxMjQyLCAtMTIyLjM0MjcyMDAzMTczODI4XVxuICAgICAgem9vbTogMTFcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ29uZmlnIiwiIyMjKlxuICogR2VuZXJpYyBBcHAtd2lkZSBldmVudHNcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuRXZlbnQgPVxuXG4gICAjIFRyaWdnZXJlZCBvbmNlIHRoZSBNYXBCb3ggbWFwIGlzIGluaXRpYWxpemVkIGFuZCByZW5kZXJlZCB0byB0aGUgRE9NXG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIE1BUF9JTklUSUFMSVpFRDogJ29uTWFwSW5pdGlhbGl6ZWQnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudCIsIiMjIypcbiAqIFZpZXcgc3VwZXJjbGFzcyBmb3Igc2hhcmVkIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbmNsYXNzIFZpZXdcblxuXG4gICAjIFRoZSB2aWV3IGVsZW1lbnRcbiAgICMgQHR5cGUgeyR9XG5cbiAgICRlbDogbnVsbFxuXG5cblxuICAgIyBWaWV3IGNvbnN0cnVjdG9yIHdoaWNoIGFjY2VwdHMgcGFyYW1ldGVycyBhbmQgbWVyZ2VzIHRoZW1cbiAgICMgaW50byB0aGUgdmlldyBwcm90b3R5cGUgZm9yIGVhc3kgYWNjZXNzLiBNZXJnZXMgYmFja2JvbmVzXG4gICAjIEV2ZW50IHN5c3RlbSBpbiBhcyB3ZWxsIGZvciBvYnNlcnZlciBhbmQgZXZlbnQgZGlzcGF0Y2hcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgXy5leHRlbmQgQCwgXy5kZWZhdWx0cyggb3B0aW9ucyA9IG9wdGlvbnMgfHwgQGRlZmF1bHRzLCBAZGVmYXVsdHMgfHwge30gKVxuXG4gICAgICAjIEV4dGVuZCBCYWNrYm9uZXMgZXZlbnRzIGJ5IG1lcmdpbmcgaW50byB0aGUgVmlldyBwcm90b3R5cGVcbiAgICAgIF8uZXh0ZW5kIFZpZXc6OiwgQmFja2JvbmUuRXZlbnRzXG5cbiAgICAgIGlmIHR5cGVvZiBAaWQgaXNudCB1bmRlZmluZWQgYW5kIEBjbGFzc05hbWUgaXMgdW5kZWZpbmVkXG4gICAgICAgICBAJGVsID0gJCBcIiMje0BpZH1cIlxuXG4gICAgICBlbHNlIGlmIEBjbGFzc05hbWUgaXNudCB1bmRlZmluZWRcbiAgICAgICAgIEAkZWwgPSAkIFwiLiN7QGNsYXNzTmFtZX1cIlxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IHRvIHRoZSBkb20gYW5kIHJldHVybnMgaXRzZWxmXG4gICAjIEBwYXJhbm0ge09iamVjdH0gb3B0aW9uc1xuXG4gICByZW5kZXI6IChvcHRpb25zKSAtPlxuXG4gICAgICBAXG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3IiwiIyMjKlxuICogQ2FudmFzIExheWVyIHdoaWNoIHJlcHJlc2VudHMgZGF0YSB0byBiZSBkaXNwbGF5ZWQgb24gdGhlIE1hcFZpZXdcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cblxuY2xhc3MgQ2FudmFzVmlld1xuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzVmlldyIsIiMjIypcbiAqIE1hcEJveCBtYXAgbGF5ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbk1hcENvbmZpZyAgPSByZXF1aXJlICcuLi9jb25maWcvTWFwQ29uZmlnLmNvZmZlZSdcbkV2ZW50ICAgICAgPSByZXF1aXJlICcuLi9ldmVudHMvRXZlbnQuY29mZmVlJ1xuQ2FudmFzVmlldyA9IHJlcXVpcmUgJy4vQ2FudmFzVmlldy5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi4vc3VwZXJzL1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIE1hcFZpZXcgZXh0ZW5kcyBWaWV3XG5cblxuICAgIyBJRCBvZiB0aGUgdmlld1xuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBpZDogJ21hcCdcblxuXG4gICAjIFByb3h5IEwubWFwYm94IG5hbWVzcGFjZSBmb3IgZWFzeSBhY2Nlc3NcbiAgICMgQHR5cGUge0wubWFwYm94fVxuXG4gICBtYXBib3g6IG51bGxcblxuXG4gICAjIE1hcEJveCBtYXAgbGF5ZXJcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICBtYXBMYXllcjogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBMZWFmbGV0IGxheWVyIHRvIGluc2VydCBtYXAgYmVmb3JlXG4gICAjIEB0eXBlIHskfVxuXG4gICAkbGVhZmxldFBhbmU6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgY2FudmFzIERPTSBlbGVtZW50XG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgJGNhbnZhczogbnVsbFxuXG5cblxuICAgIyBJbml0aWFsaXplIHRoZSBNYXBMYXllciBhbmQga2ljayBvZmYgQ2FudmFzIGxheWVyIHJlcG9zaXRpb25pbmdcbiAgICMgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgRGVmYXVsdCBvcHRpb25zIHRvIHBhc3MgaW50byB0aGUgYXBwXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIHN1cGVyIG9wdGlvbnNcblxuICAgICAgQG1hcGJveCA9IEwubWFwYm94XG5cbiAgICAgIEBtYXBMYXllciA9IEBtYXBib3gubWFwIEBpZCwgTWFwQ29uZmlnLklEXG4gICAgICAgICAuc2V0VmlldyAgICBNYXBDb25maWcuSU5JVC5sb2NhdGlvbiwgTWFwQ29uZmlnLklOSVQuem9vbVxuICAgICAgICAgLmFkZENvbnRyb2wgQG1hcGJveC5nZW9jb2RlckNvbnRyb2wgTWFwQ29uZmlnLklEXG5cbiAgICAgIEBpbnNlcnRDYW52YXNMYXllcigpXG5cblxuXG4gICBpbnNlcnRDYW52YXNMYXllcjogLT5cbiAgICAgICRsZWFmbGV0UGFuZSA9ICQgXCIjbWFwID4gLmxlYWZsZXQtbWFwLXBhbmUgPiAubGVhZmxldC1vYmplY3RzLXBhbmVcIlxuICAgICAgJGNhbnZhcyAgICAgID0gJCAnI2NhbnZhcy1sYXllcidcblxuICAgICAgJGNhbnZhcy5wcmVwZW5kVG8gJGxlYWZsZXRQYW5lXG4gICAgICAkY2FudmFzLmNzcyAnei1pbmRleCcsIDVcblxuICAgICAgQHRyaWdnZXIgRXZlbnQuTUFQX0lOSVRJQUxJWkVEXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwVmlldyJdfQ==
