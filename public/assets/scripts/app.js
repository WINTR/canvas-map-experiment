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

  CanvasView.prototype.id = 'canvas-layer';

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
    console.log(this.$canvas);
    this.$canvas.prependTo(this.$leafletPane);
    this.$canvas.css('z-index', 5);
    return this.trigger(Event.MAP_INITIALIZED);
  };

  return MapView;

})(View);

module.exports = MapView;


},{"../config/MapConfig.coffee":2,"../events/Event.coffee":3,"../supers/View.coffee":4,"./CanvasView.coffee":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2FwcC5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9ldmVudHMvRXZlbnQuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9zdXBlcnMvVmlldy5jb2ZmZWUiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9NYXBWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQUE7Ozs7O0dBQUE7QUFBQSxJQUFBLHFDQUFBO0VBQUE7aVNBQUE7O0FBQUEsS0FPQSxHQUFhLE9BQUEsQ0FBUSx1QkFBUixDQVBiLENBQUE7O0FBQUEsSUFRQSxHQUFhLE9BQUEsQ0FBUSxz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TixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLE1BRlosQ0FEVTtFQUFBLENBL0JiOztBQUFBLG9CQXlDQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ0wsSUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLElBQUMsQ0FBQSxFQUFiLEVBQWlCLFNBQVMsQ0FBQyxFQUEzQixDQUNULENBQUMsT0FEUSxDQUNHLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFEbEIsRUFDNEIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUQzQyxDQUVULENBQUMsVUFGUSxDQUVHLElBQUMsQ0FBQSxNQUFNLENBQUMsZUFBUixDQUF3QixTQUFTLENBQUMsRUFBbEMsQ0FGSCxDQUFaLENBQUE7V0FJQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUxLO0VBQUEsQ0F6Q1IsQ0FBQTs7QUFBQSxvQkFvREEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2hCLElBQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FBQSxDQUFFLGtEQUFGLENBQWhCLENBQUE7QUFBQSxJQUVBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLE9BQWIsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsSUFBQyxDQUFBLFlBQXBCLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsU0FBYixFQUF3QixDQUF4QixDQUpBLENBQUE7V0FNQSxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQUssQ0FBQyxlQUFmLEVBUGdCO0VBQUEsQ0FwRG5CLENBQUE7O2lCQUFBOztHQU5tQixLQWJ0QixDQUFBOztBQUFBLE1BbUZNLENBQUMsT0FBUCxHQUFpQixPQW5GakIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjKlxuICogTWFwIENhbnZhcyBhcHBsaWNhdGlvbiBib290c3RyYXBwZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzdG9waGVyIFBhcHBhcyA8Y2hyaXNAd2ludHIudXM+XG4gKiBAZGF0ZSAgIDUuNy4xNFxuIyMjXG5cbkV2ZW50ICAgICAgPSByZXF1aXJlICcuL2V2ZW50cy9FdmVudC5jb2ZmZWUnXG5WaWV3ICAgICAgID0gcmVxdWlyZSAnLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5NYXBWaWV3ICAgID0gcmVxdWlyZSAnLi92aWV3cy9NYXBWaWV3LmNvZmZlZSdcbkNhbnZhc1ZpZXcgPSByZXF1aXJlICcuL3ZpZXdzL0NhbnZhc1ZpZXcuY29mZmVlJ1xuXG5cbmNsYXNzIEFwcCBleHRlbmRzIFZpZXdcblxuXG4gICAjIE1hcEJveCBtYXAgdmlldyBjb250YWluaW5nIGFsbCBtYXAgcmVsYXRlZCBmdW5jdGlvbmFsaXR5XG4gICAjIEB0eXBlIHtMLk1hcEJveH1cblxuICAgbWFwVmlldzogbnVsbFxuXG5cbiAgICMgQ2FudmFzIHZpZXcgY29udGFpbmluZyBhbGwgY2FudmFzIHJlbGF0ZWQgZnVuY3Rpb25hbGl0eVxuICAgIyBAdHlwZSB7Q2FudmFzVmlld31cblxuICAgY2FudmFzVmlldzogbnVsbFxuXG5cbiAgICMgS2ljayBvZmYgdGhlIGFwcGxpY2F0aW9uIGJ5IGluc3RhbnRpYXRpbmdcbiAgICMgbmVjY2Vzc2FyeSB2aWV3c1xuXG4gICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgIEBjYW52YXNWaWV3ID0gbmV3IENhbnZhc1ZpZXdcblxuICAgICAgQG1hcFZpZXcgPSBuZXcgTWFwVmlld1xuICAgICAgICAgJGNhbnZhczogQGNhbnZhc1ZpZXcuJGVsXG5cbiAgICAgIEBhZGRFdmVudExpc3RlbmVycygpXG4gICAgICBAbWFwVmlldy5yZW5kZXIoKVxuXG5cblxuICAgIyBBcHAtd2lkZSBldmVudCBsaXN0ZW5lcnNcblxuICAgYWRkRXZlbnRMaXN0ZW5lcnM6IC0+XG4gICAgICBAbGlzdGVuVG8gQG1hcFZpZXcsIEV2ZW50Lk1BUF9JTklUSUFMSVpFRCwgQG9uTWFwSW5pdGlhbGl6ZWRcblxuXG5cbiAgICMgSGFuZGxlciBmb3IgbWFwIGluaXRpYWxpemF0aW9uIGV2ZW50c1xuXG4gICBvbk1hcEluaXRpYWxpemVkOiAtPlxuICAgICAgQGNhbnZhc1ZpZXcucmVuZGVyKClcblxuXG5cbiQgLT5cbiAgIG5ldyBBcHBcbiIsIiMjIypcbiAqIE1hcCBhcHAgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbk1hcENvbmZpZyA9XG5cblxuICAgIyBVbmlxdWUgaWRlbnRpZmllciBmb3IgTWFwQm94IGFwcFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBJRDogJ2RhbWFzc2kuaTY4b2wzOGEnXG5cblxuICAgIyBNYXAgbGFuZHMgb24gU2VhdHRsZSBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBJTklUOlxuICAgICAgbG9jYXRpb246IFs0Ny42NTE4MDE3NzQwMTI0MiwgLTEyMi4zNDI3MjAwMzE3MzgyOF1cbiAgICAgIHpvb206IDExXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENvbmZpZyIsIiMjIypcbiAqIEdlbmVyaWMgQXBwLXdpZGUgZXZlbnRzXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbkV2ZW50ID1cblxuICAgIyBUcmlnZ2VyZWQgb25jZSB0aGUgTWFwQm94IG1hcCBpcyBpbml0aWFsaXplZCBhbmQgcmVuZGVyZWQgdG8gdGhlIERPTVxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBNQVBfSU5JVElBTElaRUQ6ICdvbk1hcEluaXRpYWxpemVkJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnQiLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgZm9yIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5jbGFzcyBWaWV3XG5cblxuICAgIyBUaGUgdmlldyBlbGVtZW50XG4gICAjIEB0eXBlIHskfVxuXG4gICAkZWw6IG51bGxcblxuXG4gICAjIFZpZXcgY29uc3RydWN0b3Igd2hpY2ggYWNjZXB0cyBwYXJhbWV0ZXJzIGFuZCBtZXJnZXMgdGhlbVxuICAgIyBpbnRvIHRoZSB2aWV3IHByb3RvdHlwZSBmb3IgZWFzeSBhY2Nlc3MuIE1lcmdlcyBiYWNrYm9uZXNcbiAgICMgRXZlbnQgc3lzdGVtIGluIGFzIHdlbGwgZm9yIG9ic2VydmVyIGFuZCBldmVudCBkaXNwYXRjaFxuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG5cbiAgICAgICMgTWVyZ2UgcGFzc2VkIHByb3BzIG9yIGluc3RhbmNlIGRlZmF1bHRzXG4gICAgICBfLmV4dGVuZCBALCBfLmRlZmF1bHRzKCBvcHRpb25zID0gb3B0aW9ucyB8fCBAZGVmYXVsdHMsIEBkZWZhdWx0cyB8fCB7fSApXG5cbiAgICAgICMgRXh0ZW5kIEJhY2tib25lcyBldmVudHMgYnkgbWVyZ2luZyBpbnRvIHRoZSBWaWV3IHByb3RvdHlwZVxuICAgICAgXy5leHRlbmQgVmlldzo6LCBCYWNrYm9uZS5FdmVudHNcblxuICAgICAgIyBNaW1pY2sgQmFja2JvbmUncyAkZWwgYnkgY2hlY2tpbmcgaWYgY2xhc3NOYW1lIG9yIGlkIGlzIGRlZmluZWQgb24gaXZld1xuICAgICAgaWYgdHlwZW9mIEBpZCBpc250IHVuZGVmaW5lZCBhbmQgQGNsYXNzTmFtZSBpcyB1bmRlZmluZWRcbiAgICAgICAgIEAkZWwgPSAkIFwiIyN7QGlkfVwiXG5cbiAgICAgIGVsc2UgaWYgQGNsYXNzTmFtZSBpc250IHVuZGVmaW5lZFxuICAgICAgICAgQCRlbCA9ICQgXCIuI3tAY2xhc3NOYW1lfVwiXG5cblxuXG4gICAjIFJlbmRlcnMgdGhlIHZpZXcgdG8gdGhlIGRvbSBhbmQgcmV0dXJucyBpdHNlbGZcbiAgICMgQHBhcmFubSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIHJlbmRlcjogKG9wdGlvbnMpIC0+XG5cbiAgICAgIEBcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXciLCIjIyMqXG4gKiBDYW52YXMgTGF5ZXIgd2hpY2ggcmVwcmVzZW50cyBkYXRhIHRvIGJlIGRpc3BsYXllZCBvbiB0aGUgTWFwVmlld1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuRXZlbnQgPSByZXF1aXJlICcuLi9ldmVudHMvRXZlbnQuY29mZmVlJ1xuVmlldyAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgQ2FudmFzVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICBpZDogJ2NhbnZhcy1sYXllcidcblxuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cblxuICAgcmVuZGVyOiAtPlxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1ZpZXciLCIjIyMqXG4gKiBNYXBCb3ggbWFwIGxheWVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBDb25maWcgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5FdmVudCAgICAgID0gcmVxdWlyZSAnLi4vZXZlbnRzL0V2ZW50LmNvZmZlZSdcbkNhbnZhc1ZpZXcgPSByZXF1aXJlICcuL0NhbnZhc1ZpZXcuY29mZmVlJ1xuVmlldyAgICAgICA9IHJlcXVpcmUgJy4uL3N1cGVycy9WaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBNYXBWaWV3IGV4dGVuZHMgVmlld1xuXG5cbiAgICMgSUQgb2YgdGhlIHZpZXdcbiAgICMgQHR5cGUge1N0cmluZ31cblxuICAgaWQ6ICdtYXAnXG5cblxuICAgIyBQcm94eSBMLm1hcGJveCBuYW1lc3BhY2UgZm9yIGVhc3kgYWNjZXNzXG4gICAjIEB0eXBlIHtMLm1hcGJveH1cblxuICAgbWFwYm94OiBudWxsXG5cblxuICAgIyBNYXBCb3ggbWFwIGxheWVyXG4gICAjIEB0eXBlIHtMLk1hcH1cblxuICAgbWFwTGF5ZXI6IG51bGxcblxuXG4gICAjIFJlZiB0byB0aGUgTGVhZmxldCBsYXllciB0byBpbnNlcnQgbWFwIGJlZm9yZVxuICAgIyBAdHlwZSB7JH1cblxuICAgJGxlYWZsZXRQYW5lOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIGNhbnZhcyBET00gZWxlbWVudFxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgICRjYW52YXM6IG51bGxcblxuXG5cbiAgICMgSW5pdGlhbGl6ZSB0aGUgTWFwTGF5ZXIgYW5kIGtpY2sgb2ZmIENhbnZhcyBsYXllciByZXBvc2l0aW9uaW5nXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIERlZmF1bHQgb3B0aW9ucyB0byBwYXNzIGludG8gdGhlIGFwcFxuXG4gICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAgICBzdXBlciBvcHRpb25zXG5cbiAgICAgIEBtYXBib3ggPSBMLm1hcGJveFxuXG5cblxuICAgIyBSZW5kZXJzIHRoZSB2aWV3IGJ5IGNyZWF0aW5nIHRoZSBNYXAgbGF5ZXIgYW5kIGluc2VydGluZyB0aGVcbiAgICMgY2FudmFzIERPTSBsYXllciBpbnRvIExlYWZsZXQncyBoaWFyY2h5XG5cbiAgIHJlbmRlcjogLT5cbiAgICAgIEBtYXBMYXllciA9IEBtYXBib3gubWFwIEBpZCwgTWFwQ29uZmlnLklEXG4gICAgICAgICAuc2V0VmlldyAgICBNYXBDb25maWcuSU5JVC5sb2NhdGlvbiwgTWFwQ29uZmlnLklOSVQuem9vbVxuICAgICAgICAgLmFkZENvbnRyb2wgQG1hcGJveC5nZW9jb2RlckNvbnRyb2wgTWFwQ29uZmlnLklEXG5cbiAgICAgIEBpbnNlcnRDYW52YXNMYXllcigpXG5cblxuXG4gICAjIE1vdmVzIHRoZSBjYW52YXMgbGF5ZXIgaW50byB0aGUgTGVhZmxldCBET01cblxuICAgaW5zZXJ0Q2FudmFzTGF5ZXI6IC0+XG4gICAgICBAJGxlYWZsZXRQYW5lID0gJCBcIiNtYXAgPiAubGVhZmxldC1tYXAtcGFuZSA+IC5sZWFmbGV0LW9iamVjdHMtcGFuZVwiXG5cbiAgICAgIGNvbnNvbGUubG9nIEAkY2FudmFzXG4gICAgICBAJGNhbnZhcy5wcmVwZW5kVG8gQCRsZWFmbGV0UGFuZVxuICAgICAgQCRjYW52YXMuY3NzICd6LWluZGV4JywgNVxuXG4gICAgICBAdHJpZ2dlciBFdmVudC5NQVBfSU5JVElBTElaRURcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBWaWV3Il19
