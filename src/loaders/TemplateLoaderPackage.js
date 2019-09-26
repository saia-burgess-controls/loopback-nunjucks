const nunjucks = require('nunjucks');
const path = require('path');

const { FileSystemLoader } = nunjucks;

/**
 * @todo: Switch from inheritance to composition to avoid naming collisions.
 * @type {module.TemplateLoaderPackage}
 */
module.exports = class TemplateLoaderPackage extends FileSystemLoader {

    constructor(templatePackage, options = {}) {
        const {
            name,
            prefix,
            templatePath,
            assets,
        } = templatePackage;

        const searchPaths = [templatePath];
        const fsLoaderOptions = {
            watch: options.watch === true,
            noCache: options.noCache === true,
        };

        super(searchPaths, fsLoaderOptions);

        this.name = name;
        this.packagePrefix = prefix || name;
        this.assets = assets;
        // We removed the asynchronity since it lead to massive problems in our templates
        // this.async = true;
    }

    /**
     * Loads the template source according to the documentation by delegating to the file system
     * loader.
     *
     * @see: https://mozilla.github.io/nunjucks/api.html#writing-a-loader
     *
     * @override
     *
     * @param {String} name - the name/path of the template including the package prefix
     * @param {Function} callback
     * @return {*}
     */
    getSource(name) {
        if (!this.templateBelongsToPackage(name)) {
            return null;
        }
        const relativeTemplatePath = this.getRelativeTemplatePath(name);
        return super.getSource(relativeTemplatePath);
    }

    /**
     * Transform the template path to a path relative to the package templatePath by stripping off
     * the prefix (and the directory separator to avoid absolute paths).
     *
     * @param name
     * @return {string}
     */
    getRelativeTemplatePath(name = '') {
        const pathWithoutPrefix = name.slice(this.packagePrefix.length);
        if (!pathWithoutPrefix.startsWith(path.sep)) {
            return pathWithoutPrefix;
        }
        return pathWithoutPrefix.slice(path.sep.length);
    }

    templateBelongsToPackage(name = '') {
        return name.startsWith(this.packagePrefix);
    }

};
