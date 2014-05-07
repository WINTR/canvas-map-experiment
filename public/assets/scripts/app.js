(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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


},{}],2:[function(require,module,exports){

/**
 * Map Canvas application bootstrapper
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapCanvasApp, MapView;

MapView = require('./views/MapView.coffee');

MapCanvasApp = (function() {
  function MapCanvasApp() {
    new MapView;
  }

  return MapCanvasApp;

})();

$(function() {
  return new MapCanvasApp;
});


},{"./views/MapView.coffee":5}],3:[function(require,module,exports){

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
    _.extend(this, _.defaults(options = options || this.defaults, this.defaults || {}), Backbone.Events);
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


},{}],4:[function(require,module,exports){

/**
 * Canvas Layer which represents data to be displayed on the MapView
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var CanvasView;

CanvasView = (function() {
  function CanvasView(options) {
    console.log('hey now');
  }

  return CanvasView;

})();

module.exports = CanvasView;


},{}],5:[function(require,module,exports){

/**
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var CanvasView, MapConfig, MapView, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MapConfig = require('../config/MapConfig.coffee');

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
    console.log(this);
    return this;
  };

  return MapView;

})(View);

module.exports = MapView;


},{"../config/MapConfig.coffee":1,"../supers/View.coffee":3,"./CanvasView.coffee":4}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9pbml0aWFsaXplLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9XSU5UUi9FeHBlcmltZW50cy9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvc3VwZXJzL1ZpZXcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy92aWV3cy9DYW52YXNWaWV3LmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9XSU5UUi9FeHBlcmltZW50cy9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBUUEsR0FNRztBQUFBLEVBQUEsRUFBQSxFQUFJLGtCQUFKO0FBQUEsRUFNQSxJQUFBLEVBQ0c7QUFBQSxJQUFBLFFBQUEsRUFBVSxDQUFDLGlCQUFELEVBQW9CLENBQUEsa0JBQXBCLENBQVY7QUFBQSxJQUNBLElBQUEsRUFBTSxFQUROO0dBUEg7Q0FkSCxDQUFBOztBQUFBLE1BMEJN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TSxDQUFDLGVBQVIsQ0FBd0IsU0FBUyxDQUFDLEVBQWxDLENBRkgsQ0FKWixDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQVJBLENBRFU7RUFBQSxDQS9CYjs7QUFBQSxvQkE0Q0EsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2hCLFFBQUEscUJBQUE7QUFBQSxJQUFBLFlBQUEsR0FBZSxDQUFBLENBQUUsa0RBQUYsQ0FBZixDQUFBO0FBQUEsSUFDQSxPQUFBLEdBQWUsQ0FBQSxDQUFFLGVBQUYsQ0FEZixDQUFBO0FBQUEsSUFHQSxPQUFPLENBQUMsU0FBUixDQUFrQixZQUFsQixDQUhBLENBQUE7QUFBQSxJQUlBLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWixFQUF1QixDQUF2QixDQUpBLENBQUE7QUFBQSxJQU1BLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWixDQU5BLENBQUE7V0FRQSxLQVRnQjtFQUFBLENBNUNuQixDQUFBOztpQkFBQTs7R0FObUIsS0FadEIsQ0FBQTs7QUFBQSxNQTRFTSxDQUFDLE9BQVAsR0FBaUIsT0E1RWpCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjIypcbiAqIE1hcCBhcHAgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbk1hcENvbmZpZyA9XG5cblxuICAgIyBVbmlxdWUgaWRlbnRpZmllciBmb3IgTWFwQm94IGFwcFxuICAgIyBAdHlwZSB7U3RyaW5nfVxuXG4gICBJRDogJ2RhbWFzc2kuaTY4b2wzOGEnXG5cblxuICAgIyBNYXAgbGFuZHMgb24gU2VhdHRsZSBkdXJpbmcgaW5pdGlhbGl6YXRpb25cbiAgICMgQHR5cGUge0FycmF5fVxuXG4gICBJTklUOlxuICAgICAgbG9jYXRpb246IFs0Ny42NTE4MDE3NzQwMTI0MiwgLTEyMi4zNDI3MjAwMzE3MzgyOF1cbiAgICAgIHpvb206IDExXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENvbmZpZyIsIiMjIypcbiAqIE1hcCBDYW52YXMgYXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9NYXBWaWV3LmNvZmZlZSdcblxuXG5jbGFzcyBNYXBDYW52YXNBcHBcblxuICAgIyBLaWNrIG9mZiB0aGUgYXBwbGljYXRpb24gYnkgaW5zdGFudGlhdGluZ1xuICAgIyBuZWNjZXNzYXJ5IHZpZXdzXG5cbiAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgbmV3IE1hcFZpZXdcblxuXG4kIC0+XG4gICBuZXcgTWFwQ2FudmFzQXBwXG4iLCIjIyMqXG4gKiBWaWV3IHN1cGVyY2xhc3MgZm9yIHNoYXJlZCBmdW5jdGlvbmFsaXR5XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5jbGFzcyBWaWV3XG5cblxuICAgIyBUaGUgdmlldyBlbGVtZW50XG4gICAjIEB0eXBlIHskfVxuXG4gICAkZWw6IG51bGxcblxuXG5cbiAgICMgVmlldyBjb25zdHJ1Y3RvciB3aGljaCBhY2NlcHRzIHBhcmFtZXRlcnMgYW5kIG1lcmdlcyB0aGVtXG4gICAjIGludG8gdGhlIHZpZXcgcHJvdG90eXBlIGZvciBlYXN5IGFjY2Vzcy4gTWVyZ2VzIGJhY2tib25lc1xuICAgIyBFdmVudCBzeXN0ZW0gaW4gYXMgd2VsbCBmb3Igb2JzZXJ2ZXIgYW5kIGV2ZW50IGRpc3BhdGNoXG4gICAjIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cbiAgIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICAgIF8uZXh0ZW5kIEAsIF8uZGVmYXVsdHMoIG9wdGlvbnMgPSBvcHRpb25zIHx8IEBkZWZhdWx0cywgQGRlZmF1bHRzIHx8IHt9ICksIEJhY2tib25lLkV2ZW50c1xuXG4gICAgICBpZiB0eXBlb2YgQGlkIGlzbnQgdW5kZWZpbmVkIGFuZCBAY2xhc3NOYW1lIGlzIHVuZGVmaW5lZFxuICAgICAgICAgQCRlbCA9ICQgXCIjI3tAaWR9XCJcblxuICAgICAgZWxzZSBpZiBAY2xhc3NOYW1lIGlzbnQgdW5kZWZpbmVkXG4gICAgICAgICBAJGVsID0gJCBcIi4je0BjbGFzc05hbWV9XCJcblxuXG5cbiAgICMgUmVuZGVycyB0aGUgdmlldyB0byB0aGUgZG9tIGFuZCByZXR1cm5zIGl0c2VsZlxuICAgIyBAcGFyYW5tIHtPYmplY3R9IG9wdGlvbnNcblxuICAgcmVuZGVyOiAob3B0aW9ucykgLT5cblxuICAgICAgQFxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlldyIsIiMjIypcbiAqIENhbnZhcyBMYXllciB3aGljaCByZXByZXNlbnRzIGRhdGEgdG8gYmUgZGlzcGxheWVkIG9uIHRoZSBNYXBWaWV3XG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5cbmNsYXNzIENhbnZhc1ZpZXdcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2hleSBub3cnXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1ZpZXciLCIjIyMqXG4gKiBNYXBCb3ggbWFwIGxheWVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBDb25maWcgID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5DYW52YXNWaWV3ID0gcmVxdWlyZSAnLi9DYW52YXNWaWV3LmNvZmZlZSdcblZpZXcgICAgICAgPSByZXF1aXJlICcuLi9zdXBlcnMvVmlldy5jb2ZmZWUnXG5cblxuY2xhc3MgTWFwVmlldyBleHRlbmRzIFZpZXdcblxuXG4gICAjIElEIG9mIHRoZSB2aWV3XG4gICAjIEB0eXBlIHtTdHJpbmd9XG5cbiAgIGlkOiAnbWFwJ1xuXG5cbiAgICMgUHJveHkgTC5tYXBib3ggbmFtZXNwYWNlIGZvciBlYXN5IGFjY2Vzc1xuICAgIyBAdHlwZSB7TC5tYXBib3h9XG5cbiAgIG1hcGJveDogbnVsbFxuXG5cbiAgICMgTWFwQm94IG1hcCBsYXllclxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgIG1hcExheWVyOiBudWxsXG5cblxuICAgIyBSZWYgdG8gdGhlIExlYWZsZXQgbGF5ZXIgdG8gaW5zZXJ0IG1hcCBiZWZvcmVcbiAgICMgQHR5cGUgeyR9XG5cbiAgICRsZWFmbGV0UGFuZTogbnVsbFxuXG5cbiAgICMgUmVmIHRvIHRoZSBjYW52YXMgRE9NIGVsZW1lbnRcbiAgICMgQHR5cGUge0wuTWFwfVxuXG4gICAkY2FudmFzOiBudWxsXG5cblxuXG4gICAjIEluaXRpYWxpemUgdGhlIE1hcExheWVyIGFuZCBraWNrIG9mZiBDYW52YXMgbGF5ZXIgcmVwb3NpdGlvbmluZ1xuICAgIyBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBEZWZhdWx0IG9wdGlvbnMgdG8gcGFzcyBpbnRvIHRoZSBhcHBcblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgc3VwZXIgb3B0aW9uc1xuXG4gICAgICBAbWFwYm94ID0gTC5tYXBib3hcblxuICAgICAgQG1hcExheWVyID0gQG1hcGJveC5tYXAgQGlkLCBNYXBDb25maWcuSURcbiAgICAgICAgIC5zZXRWaWV3ICAgIE1hcENvbmZpZy5JTklULmxvY2F0aW9uLCBNYXBDb25maWcuSU5JVC56b29tXG4gICAgICAgICAuYWRkQ29udHJvbCBAbWFwYm94Lmdlb2NvZGVyQ29udHJvbCBNYXBDb25maWcuSURcblxuICAgICAgQGluc2VydENhbnZhc0xheWVyKClcblxuXG5cbiAgIGluc2VydENhbnZhc0xheWVyOiAtPlxuICAgICAgJGxlYWZsZXRQYW5lID0gJCBcIiNtYXAgPiAubGVhZmxldC1tYXAtcGFuZSA+IC5sZWFmbGV0LW9iamVjdHMtcGFuZVwiXG4gICAgICAkY2FudmFzICAgICAgPSAkICcjY2FudmFzLWxheWVyJ1xuXG4gICAgICAkY2FudmFzLnByZXBlbmRUbyAkbGVhZmxldFBhbmVcbiAgICAgICRjYW52YXMuY3NzICd6LWluZGV4JywgNVxuXG4gICAgICBjb25zb2xlLmxvZyBAXG5cbiAgICAgIEBcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBWaWV3Il19
