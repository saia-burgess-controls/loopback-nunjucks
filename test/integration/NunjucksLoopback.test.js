const { expect } = require('chai');
const cheerio = require('cheerio');
const { before, describe, it } = require('mocha');

const { LoopbackNunjucks } = require('../../index.js');

describe('NunjucksLoopback integration', () => {

    before('get the component', function() {
        const key = 'loopback-nunjucks-test';
        this.component = this.service.app.get(key);
    });

    it('the nunjucks loopback component is available at the configured "exposeAt" key', function() {
        expect(this.component).to.be.an.instanceof(LoopbackNunjucks);
    });

    it('renders the base index', async function(){
        const response = await this.service.api.get('/index/base');
        const content = cheerio.load(response.text);
        const title = content('h1');

        expect(title.text()).to.equal('Index');
    });

    it('renders the composed index', async function(){
        const response = await this.service.api.get('/index/composed');
        const content = cheerio.load(response.text);

        const title = content('h1');
        expect(title.text()).to.equal('Yay composition');

        const component = content('.nifty-component');
        expect(component).to.have.length(1);

        const innerTitle = component.find('h2');
        expect(innerTitle.text()).to.equal('A Nifty Component');
    });

    it('registers a loader for every (non ignored) package', function() {
        const env = this.service.app.get('nunjucksEnv');
        expect(env.loaders).to.have.length(2);
    });
});