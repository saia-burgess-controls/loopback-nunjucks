const TemplatePackage = require('../TemplatePackage.js');

module.exports = class BaseTemplatePackage extends TemplatePackage {
    constructor() {
        super({
            name: 'testing-excludes',
            templatePath: '',
        });
    }
};
