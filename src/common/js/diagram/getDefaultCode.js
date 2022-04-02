const getCode = (category, data) => {
  switch (category) {
    case 'echarts':
      return `constructor(dom, config) {
    super(dom, config);
    // 图表的配置参数，可右键通过Generate Opts生成
    this.config = {};
    // 组件初始化的数据
    this.data = {};
    this.type = 'echarts';
  }

  /**
  * 组装echarts的option
  * return 返回echarts的option
  */
  transformOptions() {
    return {}
  }`
    case 'fromEcharts':
      return `constructor(dom, config) {
    super(dom, config);
    // 组件的配置参数
    this.opts = {};
    // 组件初始化的数据
    this.data = {};
    this.type = 'echarts';
  }
  mounted() {
    this.setOption(${data})
  }`
    default:
      return `constructor(dom, config) {
    super(dom, config);
    // 组件的配置参数
    this.opts = {};
    // 组件初始化的数据
    this.data = {};
    this.useResizeScale = true;
  }
  /**
  * 渲染组件
  * @param {*} data 组件数据
  * @param {*} opts 组件配置参数
  * return 返回html字符串
  */
  render(h, data, opts) {
    return <div></div>;
  }`
  }
}
export default (category, data, imports = '') =>
  `${
    category === 'echarts' || category === 'fromEcharts'
      ? 'import echarts from "lib/echarts"'
      : ''
  }
${imports}
/**
* 该组件必须返回一个构造函数对象（此处代码无效）
*/
${`return class item extends Base {
  ${getCode(category, data)}
};`}
`.replace(/↵/g, '\n')
