import net from 'net';
import fs from 'fs';
import path from 'path';

const server = net.createServer();

server.on('connection', socket => {
  socket.on('data', data => {
    const incomeData = data.toString('utf-8');
    const consoleData = incomeData
      .split('\r\n')
      .map(item => {
        const newArr = item.split(": ");
        return JSON.stringify({
          [newArr[0]]: newArr[1],
        });
      })
      .join(',');
    console.log(consoleData);

    const pathName = incomeData.split(' ')[1];
    const fileExtension = pathName.split('.')[1];
    const filePath = path.resolve(__dirname, 'static', `.${pathName}`);
    fs.readFile(`${filePath}`, (err, file) => {
      if (err) {
        console.log(err);
        let errorMsg = '';
        switch (err.code) {
          case 'EACCES': errorMsg = '403 Forbidden'; break;
          case 'ENOENT': errorMsg = '404 Not Found'; break;
          default: errorMsg = '400 Bad Request';
        }
        socket.end(`HTTP/1.1 ${errorMsg}\r\n\r\n<h1>${errorMsg}</h1>\r\n\r\n`);
      }
      else {
        let contentType = '';
        if (fileExtension === 'png' || fileExtension === 'jpg') {
          contentType = `Content-Type: image/${fileExtension}`;
        } else if (fileExtension === 'css') {
          contentType = `Content-Type: text/${fileExtension}`;
        } else if (fileExtension === 'html') {
          contentType = `Content-Type: text/${fileExtension}; charset=utf-8`;
        }
        socket.write(`HTTP/1.1 OK 200\r\n${contentType}\r\n\r\n`);
        socket.write(file);
        socket.end();
      }
    });
  })
});

server.listen(3000);