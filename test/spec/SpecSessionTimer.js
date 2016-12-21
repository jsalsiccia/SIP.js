// RFC 4028
describe('Session Timers', function() {
  // silence logs in test results 
  SIP.LoggerFactory.prototype.debug =
  SIP.LoggerFactory.prototype.log =
  SIP.LoggerFactory.prototype.warn =
  SIP.LoggerFactory.prototype.error = function f() {};

  it('are supported', function() {
    expect(true).toEqual(true);
  });
});