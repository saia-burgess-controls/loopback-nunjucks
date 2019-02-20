const path = require('path');
const TemplatePackage = require('../TemplatePackage.js');

const joinFilter = require('./filters/customArrayjoin.js');
const customTag = require('./extensions/customTag.js');
/**
 * @todo: define a proper interface for the packages
 */
module.exports = class BaseTemplatePackage extends TemplatePackage {
    constructor() {
        super({
            name: 'testing-base-package',
            prefix: 'testingBase',
            templatePath: path.resolve(__dirname, 'views'),
            filters: {
                testingBaseCustomArrayJoin: {
                    filter: joinFilter,
                    isAsync: false,
                },
            },
            extensions: {
                testingBaseCustomTag: {
                    extension: customTag,
                },
            },
        });
    }
};
