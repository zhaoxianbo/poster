export function uuid() {
  return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getConfig(type) {
  let config = {
    text: {
      c: '#000000',
      h: 60,
      name: '文本',
      s: 16,
      t: 'text',
      uuid: uuid(),
      v: '多行文本测试1多行文本测试2多行文本测试3多行文本测试4',
      w: 200,
      x: 0,
      y: 0,
    },
    qrcode: {
      c: '#000000',
      h: 80,
      name: '二维码',
      s: 15,
      t: 'qrcode',
      uuid: uuid(),
      v: location.href,
      w: 80,
      x: 0,
      y: 0,
    },
    avatar: {
      c: '#000000',
      h: 40,
      name: '头像',
      s: 15,
      t: 'avatar',
      uuid: uuid(),
      v: require('@/assets/images/avatar.png'),
      w: 40,
      x: 0,
      y: 0,
    },
    image: {
      c: '#000000',
      h: 100,
      name: '图片',
      s: 15,
      t: 'image',
      uuid: uuid(),
      v: require('@/assets/images/image.png'),
      w: 100,
      x: 0,
      y: 0,
    },
  }
  return config[type]
}
