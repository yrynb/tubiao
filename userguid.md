## 关于下载

Gallery和资源中心都可以批量下载组件，区别在于资源中心可以圈定一部分组件并记录下来，且可以按照项目对组件进一步分类

## 关于引用

> <font color=red>该组件的 ID 是：C/****/compId/****/</font> (重要!)
> 
> 组件ID在后续使用中是唯一标识符

  通用 umd 方式引入下载的 js 资源包

  ```html
  <script src="您的工程静态文件路径/comp.js"></script>
  ```

## 使用组件

- Spray 中使用

  ```javascript
  // 1. 获取Spray布局元素实例
  const ct = spr.getElementById('xxxid')
  // 2. 在布局元素实例上创建该组件的适配器
  ct.createAdapter(ConchAdapter, 'C/****/compId/****/')
  // 3. 初始化组件适配器,参数options是组件要访问的静态附件文件路径
  // options详情见文档: https://www.yuque.com/khth0u/ngd5zk/nbgvds#GSfEb
  ct.initAdapter({ prefix: "./static/conch" })
  ```

  > Spray 中获取组件实例

  ```javascript
  // 1. 先获取Spray布局元素实例
  const ct = spr.getElementById('xxxid')
  // 2. 布局元素实例中获取组件实例
  const app = ct.app //app就是返回组件实例
  ```

- 普通工程中使用

  ```javascript
  // 1.创建组件实例
  const app = new window.conch['C/****/compId/****/']('dom节点', { prefix: '.' })
  // 2.执行渲染操作
  app.render()
  ```

## 调整组件样式

> 组件可调整的样式 option 见本文档最后一节组件样式表

  ```javascript
  // 例如调整组件字体颜色
  app.setOption({ color: '#ff0000' })
  ```

## 对接数据

- Spray 中组件对接数据

  ```javascript
  // Spray实例中直接setData即可将数据传递给对应布局容器中的组件
  const data = { '布局实例id': '实际数据' }
  spray.setData(data);
  ```
  
- 普通工程中组件对接数据

  ```javascript
  // 组件实例的setData的API直接设置该组件的数据
  app.setData({ xxx: value })
  ```
