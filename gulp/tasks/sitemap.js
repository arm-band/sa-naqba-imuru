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
    <style>
    * {
        margin: 0;
        padding: 0;
    }
    div {
        margin: 1rem;
    }
    h3 {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    li {
        margin-left: 1.2rem;
    }
    table {
        margin-top: 4rem;
        border-collapse: separate;
        border-spacing: 0;
    }
    table th,
    table td {
        border-bottom: 1px solid #999;
        padding: 0.4rem;
    }
    table th {
        border-left: 1px solid #333;
    }
    table td {
        border-right: 1px solid #333;
    }
    table tr:first-of-type th,
    table tr:first-of-type td
     {
        border-top: 1px solid #333;
    }
    </style>
</head>
<body>
    <div>`;
    const midfix1 = `
    <h3>一覧</h3>
    <ul>`;
    const midfix2 = `    </ul>
    <h3>テーブル</h3>
    <table>
        <tbody>`;
    const suffix = `        </tbody>
    </table>
    </div>
</body>
</html>`;
    //探索
    functions.htmlWalk(functions, dir.src.html, fileList);
    //一覧生成
    const htmlHeading = `    <h2>htmlファイル数: ${fileList.length}</h2>
`;
    let htmlList = ``;
    const indexHtml = 'index.html';
    const pathIndexHtml = `${dir.src.html}${indexHtml}`;
    let currentParam = {
        'dirStr': dir.src.html,
        'depth': pathIndexHtml.split('/').length //., src, index.html
    }
    if(fs.statSync(pathIndexHtml)) {
        htmlList += `<li><a href="../src/${indexHtml}">ホーム</a></li>\n`;
    }
    for(let i = 0; i < fileList.length; i++) {
        const filepath = fileList[i]['path'].replace(/^\.\/src\//gi, './');
        if(filepath !== `./${indexHtml}`) {
            const filename = fileList[i]['title'].length > 0 ? fileList[i]['title'] : filepath;
            if(fileList[i]['depth'] > currentParam.depth) { //掘る
                htmlList = htmlList.replace(/<\/li>\n$/g, '');
                htmlList += `\n<ul><li><a href="../${fileList[i]['path']}">${filename}</a></li>\n`;
            }
            else if(currentParam.depth > fileList[i]['depth']) { //戻る
                defDepth = currentParam.depth - fileList[i]['depth'];
                let closeUl = '';
                for(let j = 0; j < defDepth; j++) {
                    closeUl += '</ul></li>\n';
                }
                htmlList += `${closeUl}<li><a href="../${fileList[i]['path']}">${filename}</a></li>\n`;
            }
            else { // 同じ階層
                htmlList += `<li><a href="../${fileList[i]['path']}">${filename}</a></li>\n`;
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

    let htmlTable = ``;
    if(fs.statSync(pathIndexHtml)) {
        htmlTable += `           <tr>
                <th><a href="../src/${indexHtml}">ホーム</a></th><td>${indexHtml}</td>
            </tr>\n`;
    }
    for(let i = 0; i < fileList.length; i++) {
        const filepath = fileList[i]['path'].replace(/^\.\/src\//gi, '');
        if(filepath !== `./${indexHtml}`) {
            const filename = fileList[i]['title'].length > 0 ? fileList[i]['title'] : filepath;
            htmlTable += `           <tr>
                <th><a href="../${fileList[i]['path']}">${filename}</a></th><td>${filepath}</td>
            </tr>\n`;
        }
    }

    fs.writeFileSync(dir.dist.html + '/index.html', `${prefix}${htmlHeading}${midfix1}${htmlList}${midfix2}${htmlTable}${suffix}`);
    done();
};

module.exports = sitemap;
