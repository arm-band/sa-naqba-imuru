const _         = require('../plugin');
const dir       = require('../dir');
const functions = require('../functions');
const fs = require('fs');

const sitemap = (done) => {
    //リスト出力先の存在確認
    try {
        fs.statSync(dir.dist.html);
    } catch(err) {
        console.log(err);
        return false;
    }
    let fileList = [];
    //template
    const prefix = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sha naqba imuru</title>
</head>
<body>
    <ul>`;
    const suffix = `    </ul>
</body>
</html>`;
    //探索
    functions.htmlWalk(functions, dir.src.html, fileList);
    //一覧生成
    let htmlList = '';
    const indexHtml = 'index.html';
    const pathIndexHtml = `${dir.src.html}/${indexHtml}`;
    let currentParam = {
        'dirStr': dir.src.html,
        'depth': pathIndexHtml.split('/').length //., dist, index.html
    }
    if(fs.statSync(pathIndexHtml)) {
        htmlList += `<li><a href="${indexHtml}">ホーム</a></li>\n`;
    }
    for(let i = 0; i < fileList.length; i++) {
        const filepath = fileList[i]['path'].replace(/^\.\/dist\//gi, './');
        if(filepath !== `./${indexHtml}`) {
            const filename = fileList[i]['title'];
            if(fileList[i]['depth'] > currentParam.depth) { //掘る
                htmlList = htmlList.replace(/<\/li>\n$/g, '');
                htmlList += `\n<ul><li><a href="${filepath}">${filename}</a></li>\n`;
            }
            else if(currentParam.depth > fileList[i]['depth']) { //戻る
                defDepth = currentParam.depth - fileList[i]['depth'];
                let closeUl = '';
                for(let j = 0; j < defDepth; j++) {
                    closeUl += '</ul></li>\n';
                }
                htmlList += `${closeUl}<li><a href="${filepath}">${filename}</a></li>\n`;
            }
            else { // 同じ階層
                htmlList += `<li><a href="${filepath}">${filename}</a></li>\n`;
            }
            //上書き
            currentParam.dirStr = fileList[i]['dirStr'];
            currentParam.depth = fileList[i]['depth'];
        }
    }

    //最後
    if(fileList[fileList.length - 1]['depth'] > pathIndexHtml.split('/').length) {
        let closeUl = '';
        for(let j = 0; j < fileList[fileList.length - 1]['depth'] - pathIndexHtml.split('/').length; j++) {
            closeUl += '</ul></li>\n';
        }
        htmlList += `${closeUl}`;
    }

    htmlList += `<h3>htmlファイル数: ${fileList.length}</h3>`;
    fs.writeFileSync(dir.dist.html + '/index.html', `${prefix}${htmlList}${suffix}`);
    done();
};

module.exports = sitemap;
