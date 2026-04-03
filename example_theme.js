{
    "signature": "CMCBA_THEME_V2", // 固定的签名，用于系统验证主题文件的有效性
    "theme_id": "material_warm_vibe_001", // 主题的唯一 ID，建议使用小写字母和下划线
    "metadata": {
        "name": "物质", // 主题显示名称
        "author": "xyzckl", // 作者姓名
        "version": "1.1.0", // 主题版本号
        "description": "这是一个示例主题文件，演示新主题系统的基本功能。" // 主题简介
    },
    "compatibility": "10.2.1",
        "config": {
        "override_wallpaper": false,
            "apply_blur": true
    }
}

<style>
body {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}
.xyz-hover-card {
    background: rgba(255, 255, 255, 0.3) !important;
}
</style>
<script>
console.log('主题已加载！');
</script>
<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; z-index: 1000;">
欢迎使用新主题系统！
</div>
