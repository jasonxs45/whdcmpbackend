const express = require('express')
const https = require('https')
const app = new express()
const WXBizDataCrypt = require('./src/WXBizDataCrypt')

// 武汉地产
// const secret = '7d240696ada121693bcf62347d76cfa7'
// const appid = 'wxea86102ae2731259'
// 保利
const appid = 'wx0d84f26eb0336e5b'
const secret = '7606ad25b0092841330d4413f51eb48d'
let session_key, openid
app.get('/', (req, res) => {
  res.send('123')
})
app.get('/login', (request, response) => {
  let js_code = request.query.code
  let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`
  https.get(url, res => {
    console.log('statusCode:', res.statusCode)
    console.log('headers:', res.headers)
    let rawData = ''
    res.on('data', chunk => { rawData += chunk })
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData)
        console.log(parsedData)
        session_key = parsedData.session_key
        openid = parsedData.openid
        response.json({
          success: true,
          openid
        })
      } catch (e) {
        console.error(e.message)
      }
    })
  }).on('error', e => {
    console.error(e)
  })
})
app.get('/userinfo', (request, response) => {
  let pc = new WXBizDataCrypt(appid, session_key)
  let encryptedData = request.query.encryptedData
  let iv = request.query.iv
  let data = pc.decryptData(encryptedData , iv)
  response.json({
    success: true,
    userInfo: data
  })
})

app.listen(2000)