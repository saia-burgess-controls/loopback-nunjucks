const { expect } = require('chai');
const { before, describe, it } = require('mocha');
const path = require('path');

const TemplateLoaderPackage = require('../../../src/loaders/TemplateLoaderPackage.js');
const TestingPackage = require('../../support/templatingPackages/testing-base/index.js');

describe('The TemplateLoaderPackage', () => {

    before('setup loader', function() {
        this.pkg = new TestingPackage();
        this.loader = new TemplateLoaderPackage(this.pkg, {});
    })

    it('exports a class', () => {
        expect(TemplateLoaderPackage).to.be.a('function');
    });

    it('can be instantiated with a package', function() {
        expect(this.loader).to.have.property('name', this.pkg.name);
        expect(this.loader).to.have.property('packagePrefix', this.pkg.prefix);
    });

    it(
        'provides a getSource method which loads the template content asynchronously',
        function(done) {
            const fullPath = path.resolve(this.pkg.templatePath, './index.njk');
            this.loader.getSource('testingBase/index.njk', (err, result) => {
                if(err) return done(err);
                expect(result).to.have.property('noCache', false);
                expect(result).to.have.property('path', fullPath);
                expect(result).to.have.property('src').that.contains('<h1>Index</h1>');
                done();
            });
        },
    );

    it(
        'returns null if the template it does not exist (nunjucks default)',
        function(done) {
            this.loader.getSource('testingBase/unknown.njk', (err, result) => {
                if(err) return done(err);
                expect(result).to.equal(null);
                done();
            });
        }
    );

    it(
        'returns null if the template does not seem to belong to the package',
        function(done) {
            this.loader.getSource('fancyPackage/index.njk', (err, result) => {
                if(err) return done(err);
                expect(result).to.equal(null);
                done();
            });
        }
    );

    it(
        'strips away the prefix and leading path separators from the given template name',
        function() {
            const name = 'testingBase/layout/hero-layout.njk';
            const relativePath = this.loader.getRelativeTemplatePath(name);

            expect(relativePath).to.equal('layout/hero-layout.njk');
        },
    );

    it('indicates if a template belongs to its package', function() {
        const otherPackage = 'referencedPackage/index.njk';
        const ownPackage = 'testingBase/index.njk';
        expect(this.loader.templateBelongsToPackage(otherPackage)).to.equal(false);
        expect(this.loader.templateBelongsToPackage(ownPackage)).to.equal(true);
    });

});
