// RFC 4028
describe('Session Timers', function() {
  var UA_CONFIGURATION_KEY, TIMER;

  // i could not find a way to use the parser to check the supported and required
  // headers of an outgoing request
  function requestHeaderValueContains(request, header, token) {
    var message, regex, matches, value;

    message = request.toString();
    regex = new RegExp('\r\n' + header + ': (.+)\r\n');
    matches = message.match(regex);
    if (matches && matches[1]) {
      return matches[1].split(',').indexOf(token) >= 0 ? true : false;
    } else {
      return false;
    }
  }

  // silence logs in test results 
  SIP.LoggerFactory.prototype.debug =
  SIP.LoggerFactory.prototype.log =
  SIP.LoggerFactory.prototype.warn =
  SIP.LoggerFactory.prototype.error = function f() {};

  UA_CONFIGURATION_KEY = 'sessionTimers';
  TIMER = 'timer';

  // UAC Behavior: https://tools.ietf.org/html/rfc4028#section-7.1
  it('are unsupported by default', function() {
    var ua, session;
    ua = new SIP.UA();
    session = ua.invite('alice@example.com');
    expect(ua.configuration[UA_CONFIGURATION_KEY]).toBe(SIP.C.supported.UNSUPPORTED);
    expect(requestHeaderValueContains(session.request, 'Supported', TIMER)).toBe(false);
    expect(requestHeaderValueContains(session.request, 'Require', TIMER)).toBe(false);
  });

  // UAC Behavior: https://tools.ietf.org/html/rfc4028#section-7.1
  it('are supported when configured to be', function() {
    var ua, uaConfig;
    uaConfig = {};
    uaConfig[UA_CONFIGURATION_KEY] = SIP.C.supported.SUPPORTED;
    ua = new SIP.UA(uaConfig);
    session = ua.invite('alice@example.com');
    expect(ua.configuration[UA_CONFIGURATION_KEY]).toBe(SIP.C.supported.SUPPORTED);
    expect(requestHeaderValueContains(session.request, 'Supported', TIMER)).toBe(true);
    expect(requestHeaderValueContains(session.request, 'Require', TIMER)).toBe(false);
  });

  // UAC Behavior: https://tools.ietf.org/html/rfc4028#section-7.1
  it('are required when configured to be', function() {
    var ua, uaConfig;
    uaConfig = {};
    uaConfig[UA_CONFIGURATION_KEY] = SIP.C.supported.REQUIRED;
    ua = new SIP.UA(uaConfig);
    session = ua.invite('alice@example.com');
    expect(ua.configuration[UA_CONFIGURATION_KEY]).toBe(SIP.C.supported.REQUIRED);
    expect(requestHeaderValueContains(session.request, 'Supported', TIMER)).toBe(true);
    expect(requestHeaderValueContains(session.request, 'Require', TIMER)).toBe(true);
  });
});