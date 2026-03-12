import antfu from "@antfu/eslint-config"

export default antfu({
  // 库项目类型
  type: "lib",

  // 忽略的目录
  ignores: [
    "examples",
    "test",
    "**/dist",
    "**/fixtures",
  ],

  // 启用样式规则
  stylistic: {
    indent: 2,
    quotes: "double",
  },
})
