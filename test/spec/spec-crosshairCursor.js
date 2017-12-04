describe('crosshairCursor', function () {
  'use strict';

  beforeEach(function () {

  });

  afterEach(function () {

  });

  it('should be defined in chartist', function () {
    expect(window.Chartist).toBeDefined();
    expect(window.Chartist.plugins).toBeDefined();
    expect(window.Chartist.plugins.crosshairCursor).toBeDefined();
  });
});
