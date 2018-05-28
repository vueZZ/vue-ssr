const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()
const LRU = require('lru-cache')
const { createBundleRenderer } = require('vue-server-renderer')
const resolve = file => path.resolve(__dirname, file)
// const favicon = require('serve-favicon')
// const compression = require('compression')
// const microcache = require('route-cache')

function createRenderer (bundle, options) {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return createBundleRenderer(bundle, Object.assign(options, {
    // for component caching
    cache: LRU({
      max: 1000,
      maxAge: 1000 * 60 * 15
    }),
    // this is only needed when vue-server-renderer is npm-linked
    basedir: resolve('./dist'),
    // recommended for performance
    runInNewContext: false
  }))
}
const isProd = false
let renderer
let readyPromise
const templatePath = resolve('./src/index.template.html')
// const template = require('fs').readFileSync(./src/index.template.html, 'utf-8')
// const serverBundle = require('/path/to/vue-ssr-server-bundle.json')
// const clientManifest = require('/path/to/vue-ssr-client-manifest.json')

// const renderer = createBundleRenderer(serverBundle, {
//   template,
//   clientManifest
// })

readyPromise = require('./build/setup-dev-server')(
  app,
  templatePath,
  (bundle, options) => {
    renderer = createRenderer(bundle, options)
  }
)

// 在服务器处理函数中……
// app.get('*', (req, res) => {
//   const context = { url: req.url }
//   // 这里无需传入一个应用程序，因为在执行 bundle 时已经自动创建过。
//   // 现在我们的服务器与应用程序已经解耦！
//   renderer.renderToString(context, (err, html) => {
//     // 处理异常……
//     res.end(html)
//   })
// })
const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

function render (req, res) {
  const s = Date.now()

  // res.setHeader("Content-Type", "text/html")
  // res.setHeader("Server", serverInfo)

  const handleError = err => {
    if (err.url) {
      res.redirect(err.url)
    } else if(err.code === 404) {
      res.status(404).send('404 | Page Not Found')
    } else {
      // Render Error Page or Redirect
      res.status(500).send('500 | Internal Server Error')
      console.error(`error during render : ${req.url}`)
      console.error(err.stack)
    }
  }

  const context = {
    title: 'Vue HN 2.0', // default title
    url: req.url
  }
  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err)
    }
    res.send(html)
    if (!isProd) {
      console.log(`whole request: ${Date.now() - s}ms`)
    }
  })
}

app.get('*', (req, res) => {
  readyPromise.then(() => render(req, res))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})