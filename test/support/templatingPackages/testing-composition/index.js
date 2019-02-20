const path = require('path');
const TemplatePackage = require('../TemplatePackage.js');

module.exports = class CompositionPackage extends TemplatePackage {
    constructor() {
        super({
            name: 'testing-composition-package',
            templatePath: path.resolve(__dirname, 'views'),
            dependencies: {
                filters: [
                    'testingBaseCustomArrayJoin',
                ],
                extensions: [
                    'testingBaseCustomTag',
                ],
            },
        });
    }
};
