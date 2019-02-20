const LoopbackNunjucks = require('./src/LoopbackNunjucks.js');

module.exports = async(app, options = {}) => {
    const exposeAt = options.exposeAt || 'loopback-nunjucks';
    const component = new LoopbackNunjucks(options);
    app.set(exposeAt, component);
};

module.exports.LoopbackNunjucks = LoopbackNunjucks;
