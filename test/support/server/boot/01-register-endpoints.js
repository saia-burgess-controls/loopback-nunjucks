module.exports = async (app) => {
    app.get('/index/base', async (req, res) => {
        res.render('testingBase/index.njk', {});
    });
    app.get('/index/composed', async (req, res) => {
        res.render('testing-composition-package/index.njk', {});
    });
};