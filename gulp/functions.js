const _         = require('./plugin');
const dir       = require('./dir');
const fs = require('fs');

module.exports = {
    htmlWalk(functions, p, fileList) {
        let files = fs.readdirSync(p);
        for(let i = 0; i < files.length; i++) {
            let path = p;
            if(!/.*\/$/.test(p)) {
                path += '/';
            }
            const fp = path + files[i];
            if(fs.statSync(fp).isDirectory()) {
                functions.htmlWalk(functions, fp, fileList); //ディレクトリなら再帰
            } else {
                if(/.*\.html$/.test(fp) && !/^error[\d]{3}\.html$/.test(fp.split('/').pop())) { //htmlファイルで、「errorXXX(数字3桁).html」というファイル名でなければ
                    //ページ名
                    const htmlStream = fs.readFileSync(fp, 'utf8');
                    let pageTitle = fp.replace(/^\.\/src\//gi, ''); //標準はファイル名
                    if(/<title>(.*?)<\/title>/gi.test(htmlStream)) { //titleタグを抽出
                        pageTitle = RegExp.$1.split('|')[0].trim(); //後方参照でtitleタグの中の文字列を参照し、config.ymlのセパレータ文字で分離、最後に両端のスペースをトリム。標準では「ページ名 | サイト名」の表記なので最初の要素のみ格納
                    }
                    //直近のディレクトリ名
                    const dirArray = fp.split('/'); //スラッシュで分割
                    const dirStr = fp.slice(0, fp.lastIndexOf('/') + 1);
                    //ディレクトリの深さ
                    let depth = dirArray.length; //スラッシュで分割された配列の要素数をカウント
                    fileList.push({
                        'path': fp,
                        'title': pageTitle,
                        'dirStr': dirStr,
                        'dirArray': dirArray,
                        'depth': depth
                    }); //htmlファイルならコールバック発動
                }
            }
        }
    },
    htmlMtimeWalk(functions, p, fileList) {
        let files = fs.readdirSync(p);
        for(let i = 0; i < files.length; i++) {
            let path = p;
            if(!/.*\/$/.test(p)) {
                path += '/';
            }
            const fp = path + files[i];
            if(fs.statSync(fp).isDirectory()) {
                functions.htmlMtimeWalk(functions, fp, fileList); //ディレクトリなら再帰
            } else {
                if(/.*\.html$/.test(fp) && !/^error[\d]{3}\.html$/.test(fp.split('/').pop())) { //htmlファイルで、「errorXXX(数字3桁).html」というファイル名でなければ
                    const mtime = fs.statSync(fp).mtime;
                    fileList.push([fp, mtime]); //HTMLファイルならコールバック発動
                }
            }
        }
    },
    htmlRemoveWalk(functions, p, fileList, config) {
        let files = fs.readdirSync(p);
        for(let i = 0; i < files.length; i++) {
            let path = p;
            if(!/.*\/$/.test(p)) {
                path += '/';
            }
            const fp = path + files[i];
            if(fs.statSync(fp).isDirectory()) {
                functions.htmlRemoveWalk(functions, fp, fileList, config); //ディレクトリなら再帰
            } else {
                if(/.*\.html$/.test(fp) && !/^error[\d]{3}\.html$/.test(fp.split('/').pop()) && !/sitesearch\.html$/.test(fp)) { //htmlファイルで、「errorXXX(数字3桁).html」や「sitesearch.html」というファイル名でなければ
                    const htmlStream = _.fs.readFileSync(fp, 'utf8');
                    let pageTitle = fp.replace(/^\.\/src\//gi, ''); //標準はファイル名
                    if(/<title>(.*?)<\/title>/gi.test(htmlStream)) { //titleタグを抽出
                        pageTitle = RegExp.$1.split(config.commons.titleseparator)[0].trim(); //後方参照でtitleタグの中の文字列を参照し、config.ymlのセパレータ文字で分離、最後に両端のスペースをトリム。標準では「ページ名 | サイト名」の表記なので最初の要素のみ格納
                    }
                    const noHTMLText = htmlStream.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
                    const noRCLFText = noHTMLText.replace(/[\s\t\r\n]+/g, '');
                    fileList.push([fp, pageTitle, noRCLFText]); //HTMLファイルならコールバック発動
                }
            }
        }
    },
    isExistFile(file) {
        try {
            fs.statSync(file);
            return true;
        } catch(err) {
            if(err.code === 'ENOENT') {
                return false;
            }
        }
    }
};
