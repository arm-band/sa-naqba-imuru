/**
 * gulp task
 *
 * @author    アルム＝バンド
 * @copyright Copyright (c) アルム＝バンド
 */
/* require
*************************************** */
const _         = require('./gulp/plugin');

//counting html file
const sitemap = require('./gulp/tasks/sitemap');
exports.sitemap = sitemap;

//browsersync
const browsersync = require('./gulp/tasks/browsersync');
const taskServer = browsersync;
exports.server = taskServer;

//gulp default
exports.default = _.gulp.series(sitemap, taskServer);
