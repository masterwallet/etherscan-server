module.exports = module => {

  const debug = require('debug')(`http-${module}`);

  const ok = (res, result) => {
    if (require.main === module) {
      debug("Response: " + JSON.stringify(result));
    }
    res.json({
      status: "1",
      message: "OK",
      result
    });
  };

  const body = (req) => {
    if (typeof req.body === 'object') return req.body;
    try {
      return JSON.parse(req.body);
    } catch (e) {
    }
  };

  const error = (res, result, code = 'NOTOK') => {
    debug( code, result );
    res.status(200).json({
      status: "0",
      result,
      message: code
    });
    return false;
  };

  return { ok, error, body };
};
