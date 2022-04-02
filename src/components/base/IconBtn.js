export default {
  functional: true,
  props: {
    show: {
      type: Boolean,
      default: true
    },
    list: Array,
    className: {
      type: String,
      default: ''
    }
  },
  render: (h, { props }) =>
    props.show ? (
      <ul class={'icon-btn-default ' + props.className}>
        {props.list.map(item => (
          <li key={item.icon}>
            <i
              style={'color:' + (item.color || '#fff')}
              class={'iconfont ' + item.icon}
              title={item.title || ''}
              onClick={() => item.handle(item)}
            ></i>
          </li>
        ))}
      </ul>
    ) : null
}
