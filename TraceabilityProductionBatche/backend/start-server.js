const { spawn } = require('child_process');
const path = require('path');

let server;

function startServer() {
  console.log('正在启动后端服务器...');
  
  server = spawn('node', [path.join(__dirname, 'src/app.js')], {
    stdio: 'inherit',
    cwd: __dirname
  });

  server.on('close', (code) => {
    console.log(`服务器退出，代码: ${code}。5秒后重启...`);
    setTimeout(startServer, 5000);
  });

  server.on('error', (err) => {
    console.error('启动错误:', err);
  });
}

process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  if (server) server.kill();
  process.exit(0);
});

startServer();
