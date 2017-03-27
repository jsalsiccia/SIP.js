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

  // supported header is added in OutgoingRequest.toString (dunno why)
  function isSupported(request) {
    var message, regex, matches, value;

    message = request.toString();
    regex = new RegExp('\r\nSupported: (.+)\r\n');
    matches = message.match(regex);
    if (matches && matches[1]) {
      return matches[1].split(',').indexOf('timer') >= 0 ? true : false;
    } else {
      return false;
    }
  }

  UA_CONFIG_KEY_SUPPORTED = 'sessionTimers';
  UA_CONFIG_KEY_REFRESHER_UAC = 'sessionTimerUACRefresher';
  UA_CONFIG_KEY_REFRESHER_UAS = 'sessionTimerUASRefresher';
  silenceLogs();

  // https://tools.ietf.org/html/rfc4028#section-7
  describe("UAC", function() {
    describe("when session timers are unsupported (default)", function() {
      it("sends INVITE requests that do not include session timer support", function() {
        var ua, session;
        ua = new SIP.UA();
        session = ua.invite('alice@example.com');
        expect(isSupported(session.request)).toBe(false);
        expect(SIP.Grammar.parse(session.request.getHeader('Allow'), 'Allow')).toContain(SIP.C.UPDATE);
        expect(session.request.hasHeader('Session-Expires')).toBe(false);
        expect(session.request.hasHeader('Min-SE')).toBe(false);
      });
    });
    describe("when session timers are supported", function() {
      var uaConfig;
      uaConfig = {};
      uaConfig[UA_CONFIG_KEY_SUPPORTED] = SIP.C.supported.SUPPORTED;
      it("sends INVITE requests that includes session timer support", function() {
        ua = new SIP.UA(uaConfig);
        session = ua.invite('alice@example.com');
        expect(isSupported(session.request)).toBe(true);
      });
      it("receives a refresh (UPDATE) response", function() {
      });
      describe("when configured to NOT choose a refresher", function() {
        it("sends INVITE requests without a Session-Expires header", function() {
          var ua, session;
          uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_OMIT;
          ua = new SIP.UA(uaConfig);
          session = ua.invite('alice@example.com');
          expect(session.request.hasHeader('Session-Expires')).toBe(false);
        });
        it("receives a 2XX INVITE response without a Session-Expires header", function() {
        });
        it("receives a 2XX INVITE response specifying UAC as the refresher", function() {
        });
        it("receives a 2XX INVITE response specifying UAS as the refresher", function() {
        });
      });
      describe("when configured to choose UAC as the refresher", function() {
        it("sends INVITE requests with a Session-Expires header specifying UAC as the refresher", function() {
          var ua, session;
          uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAC;
          ua = new SIP.UA(uaConfig);
          session = ua.invite('alice@example.com');
          expect(SIP.Grammar.parse(session.request.getHeader('Session-Expires'), 'Session_Expires').refresher).toBe(SIP.UA.C.REFRESHER_UAC);
        });
        it("receives a 2XX INVITE response without a Session-Expires header", function() {
        });
        it("receives a 2XX INVITE with a Session-Expires header", function() {
        });
        it("receives a 422 INVITE response", function() {
        });
      });
      describe("when configured to choose UAS as the refrehser", function() {
        it("sends INVITE requsts with a 'Session-Expires' header specifying UAS as the refresher", function() {
          var ua, session;
          uaConfig[UA_CONFIG_KEY_REFRESHER_UAC] = SIP.UA.C.REFRESHER_UAS;
          ua = new SIP.UA(uaConfig);
          session = ua.invite('alice@example.com');
          expect(SIP.Grammar.parse(session.request.getHeader('Session-Expires'), 'Session_Expires').refresher).toBe(SIP.UA.C.REFRESHER_UAS);
        });
        it("receives a 2XX INVITE response without a Session-Expires header", function() {
        });
        it("receives a 2XX INVITE with a Session-Expires header", function() {
        });
        it("receives a 422 INVITE response", function() {
        });
    });
  });
  describe("UAS", function() {
    describe("when session timers are unsupported", function() {
        describe("sends INVITE responses", function() {
          it("with a Supported header that does not include option tag 'timer'", function() {
          });
          it("without a Session-Expires header", function() {
          });
          it("with status code 420 if request requires session timers", function() {
          });
        });
    });
    describe("When csession timers are supported", function() {
      describe("sends INVITE responses ", function() {
        it("without a Session-Expires header when request does NOT support session timers", function() {
        });
        it("without a Session-Expires header when request Does support session timers", function() {
        });
      });
      describe("receives UPDATE requests", function() {
      });
      describe("sends UPDATE requests", function() {
        it("if uas refresher is NOT set to omit and initial INVITE request did not support session timers", function() {
        });
      });
    });
  });
});