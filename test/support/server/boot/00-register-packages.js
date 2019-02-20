const BasePackage = require('../../templatingPackages/testing-base/index.js');
const ComposedPackage = require('../../templatingPackages/testing-composition/index.js');
const ExcludedPackage = require('../../templatingPackages/testing-exclusion/index.js');

module.exports = async(app) => {
    const component = app.get('loopback-nunjucks-test');
    component.addPackage(new BasePackage());
    component.addPackage(new ExcludedPackage());
    component.addPackage(new ComposedPackage());
    return component.install(app);
};
