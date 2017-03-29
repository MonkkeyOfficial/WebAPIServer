var image = require('../system/image.js'),
    multer = require('multer'),
    upload = multer({ dest: '/tmp/' });

module.exports = {
    init: app => {
        app.post('/exo/:id/compile', upload.single('file'), (req, res) => {
            if(req.accepts(['json', 'html']) === 'html')
            {
                app.toRootPage(res);
                return;
            }

            image.update(req.params.id, req.file.path, data => {
                res.json(data);
            });
        });
    }
}