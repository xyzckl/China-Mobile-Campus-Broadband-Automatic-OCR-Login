CMCBA 主题系统文件规范 (V1)

本文档定义了 CMCBA 主题系统的 JSON 文件结构及其各项参数的具体含义。

# 1. 基础结构

主题文件必须是一个合法的 .json 文件，根对象包含以下一级字段：

| 字段 | 类型 | 说明 |\
| signature | String | 固定为 CMCBA_THEME_V1，用于版本校验。 |\
| theme_id | String | 主题的唯一标识符，建议使用小写字母、数字和下划线。 |\
| metadata | Object | 包含主题的可视化描述信息。 |\
| compatibility | String | 兼容的最低版本号（例如 10.1）。 |\
| config | Object | 功能开关与逻辑配置。 |\
| assets | Object | 核心代码资源（CSS/HTML/JS）。 |

# 2. 详细字段说明

## 2.1 Metadata (元数据)

用于在主题中心或设置界面显示的信息。

name: 主题名称。

author: 作者署名。

version: 主题自身的版本号。

description: 功能简介。

## 2.2 Config (配置项)

控制系统原有功能的行为。

override_wallpaper (Boolean):

true: 隐藏系统原生壁纸层（通常是 #xyz-bg-layer），允许主题通过 CSS 完全自定义背景。

false: 保留系统壁纸。

apply_blur (Boolean):

是否在 UI 层面应用毛玻璃/模糊效果。

## 2.3 Assets (资源载荷)

这是主题的核心部分，系统会将这些内容注入到页面中。

css:

注入 <style> 标签的内容。

建议针对 .xyz-hover-card 等核心组件进行样式覆盖。

若 override_wallpaper 为 true，务必在此处设置 body 的 background。

html:

直接插入到 DOM 中的 HTML 片段。通常用于添加浮动挂件、自定义页脚或装饰性元素。

js:

在页面加载完成后执行的脚本代码。

严禁使用 document.write，建议使用 console.log 进行调试记录。

# 3. 开发建议

样式优先级：为了确保主题样式能覆盖系统默认样式，建议在关键 CSS 属性后添加 !important。

选择器规范：系统背景层 ID 通常为 #xyz-bg-layer，悬浮卡片类名为 .xyz-hover-card。

性能优化：尽量减少 assets.js 中的高频 DOM 操作，避免引起页面卡顿。

# 4. 示例文件

你可以参考 [主题示例](./example_theme.json)n 作为模板进行快速开发。
