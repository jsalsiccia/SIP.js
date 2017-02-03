// RFC 4028
describe('Session Timers', function() {
  var UA_CONFIG_KEY_SUPPORTED, UA_CONFIG_KEY_REFRESHER_UAC, UA_CONFIG_KEY_REFRESHER_UAS;

  // silence logs in test results
  function silenceLogs() {
    SIP.LoggerFactory.prototype.debug =
    SIP.LoggerFactory.prototype.log =
    SIP.LoggerFactory.prototype.warn =
    SIP.LoggerFactory.prototype.error = function f() {};
  }

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

  function requestHeaderExists(request, header) {
    var message, regex, matches, value;

    message = request.toString();
    regex = new RegExp('\r\n' + header + ': .+\r\n');
    matches = message.match(regex);
    return matches ? true : false;
  }

  function requestRefresher(request) {
    var message, regex, matches, value;

    message = request.toString();
    regex = new RegExp('\r\nSession-Expires: \\d+;refresher=(uac|uas)\r\n');
    matches = message.match(regex);
    return matches && matches[1] || undefined;
  }

  UA_CONFIG_KEY_SUPPORTED = 'sessionTimers';
  UA_CONFIG_KEY_REFRESHER_UAC = 'sessionTimerUACRefresher';
  UA_CONFIG_KEY_REFRESHER_UAS = 'sessionTimerUASRefresher';
  silenceLogs();

  describe("UAC", function() {

    describe("By default", function() {
      var ua, uaConfig, session;

      beforeEach(function() {
        ua = new SIP.UA();
        session = ua.invite('alice@example.com');
      });

      it("inserts '" + SIP.C.UPDATE + "' into the Allow header", function() {
        expect(requestHeaderValueContains(session.request, 'Allow', SIP.C.UPDATE)).toBe(true);
      });
      it("does NOT insert option tag 'timer' into the Supported header", function() {
        expect(requestHeaderValueContains(session.request, 'Supported', 'timer')).toBe(false);
      });
      it("does NOT insert option tag 'timer' into the Require header", function() {
        expect(requestHeaderValueContains(session.request, 'Require', 'timer')).toBe(false);
      });
      it("does NOT insert 'Session-Expires' header into INVITE message with refresher param '" + SIP.UA.C.REFRESHER_UAC + "' when configured", function() {
        uaConfig = {};
        uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAC;
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
        console.log('req:', session.request.toString());
        expect(requestHeaderExists(session.request, 'Session-Expires')).toBe(false);
      });
      it("does NOT insert 'Session-Expires' header into INVITE message with refresher param '" + SIP.UA.C.REFRESHER_UAS + "' when configured", function() {
        uaConfig = {};
        uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAS;
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
        console.log('req:', session.request.toString());
        expect(requestHeaderExists(session.request, 'Session-Expires')).toBe(false);
      });
    });

    describe("When supporting session timers", function() {
      var uaConfig, ua, session;

      beforeEach(function() {
        uaConfig = {};
        uaConfig[UA_CONFIG_KEY_SUPPORTED] = SIP.C.supported.SUPPORTED;
        uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAS;
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
      });

      it("inserts option tag 'timer' into the Supported header", function() {
        expect(requestHeaderValueContains(session.request, 'Supported', 'timer')).toBe(true);
      });
      it("does NOT insert option tag 'timer' into the Require header", function() {
        expect(requestHeaderValueContains(session.request, 'Require', 'timer')).toBe(false);
      });
      it("inserts 'Session-Expires' header into INVITE message with refresher param '" + SIP.UA.C.REFRESHER_UAC + "' when configured", function() {
        uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAC;
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
        expect(requestRefresher(session.request)).toBe(SIP.UA.C.REFRESHER_UAC);
      });
      it("inserts 'Session-Expires' header into INVITE message with refresher param '" + SIP.UA.C.REFRESHER_UAS + "' when configured", function() {
        uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAS;
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
        expect(requestRefresher(session.request)).toBe(SIP.UA.C.REFRESHER_UAS);
      });
    });

    describe("When requiring session timers", function() {
      var uaConfig, ua, session;

      beforeEach(function() {
        uaConfig = {};
        uaConfig[UA_CONFIG_KEY_SUPPORTED] = SIP.C.supported.REQUIRED;
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
      });

      it("inserts option tag 'timer' into the Supported header", function() {
        expect(requestHeaderValueContains(session.request, 'Supported', 'timer')).toBe(true);
      });
      it("inserts option tag 'timer' into the Require header", function() {
        expect(requestHeaderValueContains(session.request, 'Require', 'timer')).toBe(true);
      });
      it("inserts 'Session-Expires' header into INVITE message with refresher param '" + SIP.UA.C.REFRESHER_UAC + "' when configured", function() {
        uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAC;
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
        expect(requestRefresher(session.request)).toBe(SIP.UA.C.REFRESHER_UAC);
      });
      it("inserts 'Session-Expires' header into INVITE message with refresher param '" + SIP.UA.C.REFRESHER_UAS + "' when configured", function() {
        uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAS;
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
        expect(requestRefresher(session.request)).toBe(SIP.UA.C.REFRESHER_UAS);
      });
    });

  });
});