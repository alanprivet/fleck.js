import express from 'express';
import morgan from 'morgan'
import path from 'path';
import ip from 'ip';
import config from './config';
import pages from './pages';

const app = new express();
app.use(morgan())

app.use('/', pages)

/**
 * Serve files from public directory
 */
app.use(express.static(config.publicDir))
app.use(express.static(path.join(config.cwd, 'assets')))

app.listen(8080, 0, function () {
  console.log(`http://${ip.address()}:${this.address().port}`)
});
