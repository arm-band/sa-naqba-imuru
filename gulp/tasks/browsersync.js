const _         = require('../plugin');
const dir       = require('../dir');
const sitemap = require('./sitemap');

//自動リロード
const browsersync = () => {
    _.browserSync({
        server: {
            baseDir: './'
        },
        startPath: dir.dist.html,
        open: 'external',
        https: true
    });

    _.watch(`${dir.src.html}/**/*.html`, _.gulp.series(sitemap, _.browserSync.reload));
};

module.exports = _.gulp.series(browsersync);
