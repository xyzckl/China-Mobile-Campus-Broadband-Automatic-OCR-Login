{
    "signature": "CMCBA_THEME_V2", // 固定的签名，用于系统验证主题文件的有效性
    "theme_id": "material_warm_vibe_001", // 主题的唯一 ID，建议使用小写字母和下划线
    "metadata": {
        "name": "暖色物质 (Material Warmth)", // 主题显示名称
        "author": "xyzckl", // 作者姓名
        "version": "1.1.0", // 主题版本号
        "description": "基于 Material You 风格，采用温暖的橙色系色彩提取与大圆角设计，为数字空间注入温度。" // 主题简介
    },
    "compatibility": "10.2.1", // 兼容的最低系统版本
    "config": {
        "override_wallpaper": true, // 是否覆盖系统壁纸：true 表示由主题接管背景，false 反之
        "apply_blur": true // 是否启用系统级毛玻璃模糊效果
    },
    "assets": {
        "css": `body { background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        } .xyz-hover-card { background: rgba(255,
            255,
            255,
            0.3) !important;
        }`,
        "html": `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; z-index: 1000;">欢迎使用主题系统！</div>`,
        "js": `console.log('主题已加载！');`
    }
}
