(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Map app configuration options
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapConfig;

MapConfig = {
  INIT: {
    location: [47.61356975397398, -122.34374999999999],
    zoom: 9
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
var MapView;

MapView = require('./views/MapView.coffee');

$(function() {
  return new MapView;
});


},{"./views/MapView.coffee":3}],3:[function(require,module,exports){

/**
 * MapBox map layer
 *
 * @author Christopher Pappas <chris@wintr.us>
 * @date   5.7.14
 */
var MapConfig, MapView;

MapConfig = require('../config/MapConfig.coffee');

MapView = (function() {
  MapView.prototype.mapLayer = null;

  function MapView(options) {
    this.mapLayer = L.mapbox.map('map', 'examples.map-9ijuk24y');
    this.mapLayer.setView(MapConfig.INIT.location, MapConfig.INIT.zoom);
  }

  return MapView;

})();

module.exports = MapView;


},{"../config/MapConfig.coffee":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hyaXMvU2l0ZXMvV0lOVFIvRXhwZXJpbWVudHMvY2FudmFzLW1hcC1leHBlcmltZW50L3NyYy9zY3JpcHRzL2NvbmZpZy9NYXBDb25maWcuY29mZmVlIiwiL1VzZXJzL2NocmlzL1NpdGVzL1dJTlRSL0V4cGVyaW1lbnRzL2NhbnZhcy1tYXAtZXhwZXJpbWVudC9zcmMvc2NyaXB0cy9pbml0aWFsaXplLmNvZmZlZSIsIi9Vc2Vycy9jaHJpcy9TaXRlcy9XSU5UUi9FeHBlcmltZW50cy9jYW52YXMtbWFwLWV4cGVyaW1lbnQvc3JjL3NjcmlwdHMvdmlld3MvTWFwVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxTQUFBOztBQUFBLFNBUUEsR0FNRztBQUFBLEVBQUEsSUFBQSxFQUNHO0FBQUEsSUFBQSxRQUFBLEVBQVUsQ0FBQyxpQkFBRCxFQUFvQixDQUFBLGtCQUFwQixDQUFWO0FBQUEsSUFDQSxJQUFBLEVBQU0sQ0FETjtHQURIO0NBZEgsQ0FBQTs7QUFBQSxNQW9CTSxDQUFDLE9BQVAsR0FBaUIsU0FwQmpCLENBQUE7Ozs7QUNBQTtBQUFBOzs7OztHQUFBO0FBQUEsSUFBQSxPQUFBOztBQUFBLE9BT0EsR0FBVSxPQUFBLENBQVEsd0JBQVIsQ0FQVixDQUFBOztBQUFBLENBU0EsQ0FBRSxTQUFBLEdBQUE7U0FFQyxHQUFBLENBQUEsUUFGRDtBQUFBLENBQUYsQ0FUQSxDQUFBOzs7O0FDQUE7QUFBQTs7Ozs7R0FBQTtBQUFBLElBQUEsa0JBQUE7O0FBQUEsU0FPQSxHQUFZLE9BQUEsQ0FBUSw0QkFBUixDQVBaLENBQUE7O0FBQUE7QUFnQkcsb0JBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFHYSxFQUFBLGlCQUFDLE9BQUQsR0FBQTtBQUNWLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQVQsQ0FBYSxLQUFiLEVBQW9CLHVCQUFwQixDQUFaLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixTQUFTLENBQUMsSUFBSSxDQUFDLFFBQWpDLEVBQTJDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBMUQsQ0FEQSxDQURVO0VBQUEsQ0FIYjs7aUJBQUE7O0lBaEJILENBQUE7O0FBQUEsTUF3Qk0sQ0FBQyxPQUFQLEdBQWlCLE9BeEJqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyMqXG4gKiBNYXAgYXBwIGNvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuXG5NYXBDb25maWcgPVxuXG5cbiAgICMgTWFwIGxhbmRzIG9uIFNlYXR0bGUgZHVyaW5nIGluaXRpYWxpemF0aW9uXG4gICAjIEB0eXBlIHtBcnJheX1cblxuICAgSU5JVDpcbiAgICAgIGxvY2F0aW9uOiBbNDcuNjEzNTY5NzUzOTczOTgsIC0xMjIuMzQzNzQ5OTk5OTk5OTldXG4gICAgICB6b29tOiA5XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENvbmZpZyIsIiMjIypcbiAqIE1hcCBDYW52YXMgYXBwbGljYXRpb24gYm9vdHN0cmFwcGVyXG4gKlxuICogQGF1dGhvciBDaHJpc3RvcGhlciBQYXBwYXMgPGNocmlzQHdpbnRyLnVzPlxuICogQGRhdGUgICA1LjcuMTRcbiMjI1xuXG5NYXBWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9NYXBWaWV3LmNvZmZlZSdcblxuJCAtPlxuXG4gICBuZXcgTWFwVmlld1xuIiwiIyMjKlxuICogTWFwQm94IG1hcCBsYXllclxuICpcbiAqIEBhdXRob3IgQ2hyaXN0b3BoZXIgUGFwcGFzIDxjaHJpc0B3aW50ci51cz5cbiAqIEBkYXRlICAgNS43LjE0XG4jIyNcblxuTWFwQ29uZmlnID0gcmVxdWlyZSAnLi4vY29uZmlnL01hcENvbmZpZy5jb2ZmZWUnXG5cblxuY2xhc3MgTWFwVmlld1xuXG5cbiAgICMgTWFwQm94IG1hcCBsYXllclxuICAgIyBAdHlwZSB7TC5NYXB9XG5cbiAgIG1hcExheWVyOiBudWxsXG5cblxuICAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgICAgQG1hcExheWVyID0gTC5tYXBib3gubWFwICdtYXAnLCAnZXhhbXBsZXMubWFwLTlpanVrMjR5J1xuICAgICAgQG1hcExheWVyLnNldFZpZXcgTWFwQ29uZmlnLklOSVQubG9jYXRpb24sIE1hcENvbmZpZy5JTklULnpvb21cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFZpZXciXX0=
