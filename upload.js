var express = require('express');
var app = express();
const fsPromise = require('fs/promises');
const fs = require('fs');
const readline = require('readline');
const UPLOAD_DIR = 'upload_files';

// init upload file directory
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
    console.log(`[init] Upload Directory '${UPLOAD_DIR}' created.`);
}

//form表单需要的中间件。
var mutipart = require('connect-multiparty');
var mutipartMiddeware = mutipart();
//临时文件的储存位置
app.use(mutipart({ uploadDir: UPLOAD_DIR }));
app.use(express.json());

app.set('port', process.env.PORT || 3001);
app.listen(app.get('port'), function () {
    console.log("Express started on http://localhost:" + app.get('port') + ',press Ctrl-C to terminate.');
});

// INDEX
app.get('/', function (req, res) {
    res.type('text/html');
    res.sendFile(__dirname + '/index.html')
});

// UPLOAD
//浏览器访问localhost会输出一个html文件
app.get('/up', function (req, res) {
    res.type('text/html');
    res.sendFile(__dirname + '/upload.html')
});
//这里就是接受form表单请求的接口路径，请求方式为post。
app.post('/upload', mutipartMiddeware, function (req, res) {
    //这里打印可以看到接收到文件的信息。
    console.log(req.files);
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR);
        console.log(`Directory '${UPLOAD_DIR}' created.`);
    }

    //成功接受到浏览器传来的文件。我们可以在这里写对文件的一系列操作。例如重命名，修改文件储存路径 。等等。
    fsPromise.rename(req.files.myfile.path, UPLOAD_DIR + "/" + req.files.myfile.originalFilename);

    //给浏览器返回一个成功提示。
    res.send('upload success!');
});

// DOWNLOAD html
app.get('/down', function (req, res) {
    res.type('text/html');
    res.sendFile(__dirname + '/download.html')
});

// DOWNLOAD folder file list
app.get('/downloadlist', function (req, res) {
    if (!fs.existsSync(UPLOAD_DIR)) {
        let msg = `Directory '${UPLOAD_DIR}' not exist.`
        console.log(msg);
        res.status(500).send(msg);
        return;
    }
    fsPromise.readdir(UPLOAD_DIR).then(files => {
        let filearr = [];
        for (const file of files) {
            filearr.push(file);
        }
        res.send(JSON.stringify(filearr))
    });
});

// DOWNLOAD file 
app.post('/download', function (req, res) {
    var fileName = req.body.file;

    const filePath = UPLOAD_DIR + "/" + fileName;
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const fileStream = fs.createReadStream(filePath);

    res.writeHead(200, {
        'Content-Type': 'application/octet-stream', //告诉浏览器这是一个二进制文件  
        'Content-Length': fileSize,
        'Content-Disposition': 'attachment; filename=' + encodeURI(fileName),  //告诉浏览器这是一个需要下载的文件  
    });

    fileStream.on('error', (err) => {
        console.error('Error reading file:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
    });
    fileStream.pipe(res);
});

// TEXT MESSAGE
app.get('/text', function (req, res) {
    res.type('text/html');
    res.sendFile(__dirname + '/text.html')
});

app.post('/text', function (req, res) {
    fsPromise.appendFile(UPLOAD_DIR + "/P_text.txt", '\n' + req.body.text, (err) => {
        if (err) console.log("append text failed: " + req.body.text);
        else console.log("append text success");
    });
    res.send('upload finish!');
});

app.get('/textread', function (req, res) {
    res.type('text/html');
    res.sendFile(__dirname + '/textread.html')
});

app.get('/messages', function (req, res) {
    const filePath = UPLOAD_DIR + "/P_text.txt";
    const readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: res,
        console: false
    });
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8'
    });

    readInterface.on('line', function (line) {
        res.write('<p>' + line + '</p>');
    });
    readInterface.on('close', function () {
        // End the response when all lines have been processed
        res.end();
    });
});
