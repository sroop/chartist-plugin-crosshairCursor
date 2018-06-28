/**
 * Chartist.js plugin that generates a crosshair cursor for a line chart which highlights and notifies you of any data points that fall along the crosshair axis
 *
 */
/* global Chartist */
(function(window, document, Chartist) {
  'use strict';

  Chartist.plugins = Chartist.plugins || {};

  Chartist.plugins.crosshairCursor = function(options) {
    var dataPoints = []
    var noop = function() {};

    var defaultOptions = {
      wrapperName: '.crosshairCursorWrapper',
      x: false,
      y: false,
      click: noop,
      pointHover: noop,
      frozenStatus: noop,
      styles: {
        x: {
          backgroundColor: '#dedede',
          width: '1px',
          height: '95%'
        },
        y: {
          backgroundColor: '#dedede',
          width: '100%',
          height: '1px'
        }
      }
    };

    options = Chartist.extend({}, defaultOptions, options);

    function CrosshairCursor() {
      this.frozen = false;
      this._pointArea = calculatePointArea();
    }

    CrosshairCursor.prototype.create = function() {
      var self = this;
      this._chartWrapper = wrapChart();

      self._crosshairCursor = {};
      self._crosshairCursor.x = createCrosshairCursor(self._chartWrapper, 'x');
      self._crosshairCursor.y = createCrosshairCursor(self._chartWrapper, 'y');
      self.hide(self._crosshairCursor);

      self._chartWrapper.addEventListener('click', clickFn);
      self._chartWrapper.addEventListener('mousemove', self.move.bind(self));
      self._chartWrapper.addEventListener('mouseenter', self.show.bind(self));
      self._chartWrapper.addEventListener('mouseleave', self.hide.bind(self));
    };

    CrosshairCursor.prototype.destroy = function() {
      var self = this;

      destroyCrosshairCursor(self._crosshairCursor);

      unwrapChart(self._chartWrapper);
    };

    CrosshairCursor.prototype.show = function() {
      showCrosshairCursor(this._crosshairCursor);
    };


    CrosshairCursor.prototype.hide = function() {
      if(!this.frozen) {
        hideCrosshairCursor(this._crosshairCursor);
      }
    };

    CrosshairCursor.prototype.reset = function() {
      this.frozen = false;
      this.hide();
    };

    CrosshairCursor.prototype.move = function(e) {
      if(!this.frozen){
        var position = moveCrosshairCursor.call(this._chartWrapper, e, this._crosshairCursor);
        var highlightedPoints = highlightCurrentPoints(position, this._pointArea);
        sendMetaData(highlightedPoints);
      }
    };

    CrosshairCursor.prototype.freeze = function() {
      this.frozen = true;
      sendFrozenStatus(this.frozen);
    };

    CrosshairCursor.prototype.unfreeze = function() {
      this.frozen = false;
      sendFrozenStatus(this.frozen);
    };

    CrosshairCursor.prototype.isFrozen = function() {
      return this.frozen;
    };

    CrosshairCursor.prototype.currentPoints = function() {
      return currentPoints();
    };

    CrosshairCursor.prototype.element = function() {
      return this._chartWrapper;
    };

    CrosshairCursor.prototype.chartData = function() {

    };

    var sendMetaData = function(points) {
      var meta = points.map(function(point) {
        return point.meta;
      });
      options.pointHover(chart.crosshairCursor, meta);
      chart.eventEmitter.emit('crosshairCursor:hovered', meta);
    };

    var sendFrozenStatus = function(frozenStatus) {
      options.frozenStatus(frozenStatus);
      chart.eventEmitter.emit('crosshairCursor:frozen', frozenStatus);
    };

    var currentPoints = function() {
      return dataPoints.filter(function(point) {
        return point.current;
      });
    };

    var createCrosshairCursor = function(chartWrapper, type) {
      var div = document.createElement('div');
      div.setAttribute('id', 'crosshairCursor-' + type);
      chartWrapper.insertBefore(div, chartWrapper.firstChild);
      var crosshairCursor = document.querySelector('#crosshairCursor-' + type);
      crosshairCursor.style.position = 'absolute';

      styleCrosshairCursor(crosshairCursor, type);

      return crosshairCursor;
    };

    var destroyCrosshairCursor = function(crosshairCursor) {
      crosshairCursor.x.remove();
      crosshairCursor.y.remove();
    };

    var styleCrosshairCursor = function(crosshairCursor, type) {
      crosshairCursor.style.height = options.styles[type].height;
      crosshairCursor.style.width = options.styles[type].width;
      crosshairCursor.style.backgroundColor = options.styles[type].backgroundColor;
    };

    var inPointArea = function(cursorPosition, pointPosition, padding) {
      return (cursorPosition >= (pointPosition - padding) && cursorPosition <= (pointPosition + padding));
    };

    var formatPointData = function(point) {
      var meta = Chartist.deserialize(point.meta);
      meta.value = point.value;
      meta.value.x = point.axisX.ticks[point.index];
      return {
        meta: meta,
        position: {x: Math.round(point.x), y: Math.round(point.y)},
        element: point.element
      };
    };

    var toggleHighlight = function(point, highlight) {
      if(highlight) {
        point.element.addClass('crosshairCursor-highlight');
      } else {
        point.element.removeClass('crosshairCursor-highlight');
      }
    };

    var cursorIsOnPoint = function(cursorPosition, pointPosition, padding) {
      if(options.x && options.y) {
        return inPointArea(cursorPosition.x, pointPosition.x, padding) || inPointArea(cursorPosition.y, pointPosition.y , padding);
      } else if(options.x) {
        return inPointArea(cursorPosition.x, pointPosition.x, padding);
      } else if(options.y) {
        return inPointArea(cursorPosition.y, pointPosition.y , padding);
      }
    };

    var wrapChart = function() {
      var element = document.createElement('div');
      if(options.wrapperName.startsWith('#')) {
        element.id = options.wrapperName.substr(1);
      } else if(options.wrapperName.startsWith('.')) {
        element.className = options.wrapperName.substr(1);
      } else {
        throw('Must be a class or id!');
      }
      chart.container.parentNode.insertBefore(element, chart.container);
      element.appendChild(chart.container);
      element.className = element.className + ' crosshairCursor-wrapper';
      element.style.cursor = 'pointer';
      element.style.position = 'relative';

      return element;
    };

    var unwrapChart = function(chartWrapper) {
      chartWrapper.outerHTML = chartWrapper.innerHTML;
    };

    var calculatePointArea = function() {
      var ctPoints = document.querySelectorAll('.ct-point');
      var pointWidth = window.getComputedStyle(ctPoints[0])['stroke-width'].replace('px', '');
      return +pointWidth/2;
    };

    var showCrosshairCursor = function(crosshairCursor){
      if(options.x && options.y) {
        crosshairCursor.x.style.display = '';
        crosshairCursor.y.style.display = '';
      } else if(options.x) {
        crosshairCursor.x.style.display = '';
      } else if(options.y) {
        crosshairCursor.y.style.display = '';
      }
    };

    var moveCrosshairCursor = function(e, crosshairCursor){
      var crosshairCursorPosition = {};

      crosshairCursorPosition.x = e.pageX - this.offsetLeft;
      crosshairCursorPosition.y = e.pageY - this.offsetTop;

      crosshairCursor.x.style.left = crosshairCursorPosition.x + 'px';
      crosshairCursor.y.style.top = crosshairCursorPosition.y + 'px';

      return crosshairCursorPosition;
    };

    var highlightCurrentPoints = function(crosshairCursorPosition, pointArea) {
      return dataPoints.filter(function(point) {
        var highlighted = cursorIsOnPoint(crosshairCursorPosition, point.position, pointArea);
        toggleHighlight(point, highlighted);
        point.current = highlighted;
        return highlighted;
      });
    };

    var clickFn = function(e) {
      e.stopPropagation();
      options.click(chart.crosshairCursor, currentPoints());
      chart.eventEmitter.emit('crosshairCursor:click');
    };

    var hideCrosshairCursor = function(crosshairCursor){
      crosshairCursor.x.style.display = 'none';
      crosshairCursor.y.style.display = 'none';
    };

    return function crosshairCursor(chart) {
      var created = false;

      if(chart instanceof Chartist.Line) {

        chart.on('draw', function(data) {
          if(data.type === 'point') {
            if(data.index === 0) { dataPoints = []; }
            dataPoints.push(formatPointData(data));
          }
        });

        chart.on('created', function() {
          if(!created) {
            created = true;
            chart.crosshairCursor = new CrosshairCursor();
            chart.crosshairCursor.create();
          } else {
            chart.crosshairCursor.reset();
          }
        });

      }

    };
  };


}(window, document, Chartist));