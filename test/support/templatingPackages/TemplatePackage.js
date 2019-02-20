/**
 * Initial version of a templating package.
 *
 * @type {module.TemplatePackage}
 */
module.exports = class TemplatePackage {

    constructor({
        name,
        prefix,
        templatePath,
        assets,
        filters,
        extensions,
        dependencies,
    }) {
        this.name = name;
        this.prefix = prefix;
        this.templatePath = templatePath;
        this.assets = assets;
        this.filters = filters;
        this.extensions = extensions;
        this.dependencies = dependencies;
    }

};
