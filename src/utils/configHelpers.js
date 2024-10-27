export function getLabel(key) {
  const labels = {
    file_storage: '文件存储方式',
    s3_access_key_id: 'S3 Access Key ID',
    s3_secret_access_key: 'S3 Secret Access Key',
    s3_bucket_name: 'S3 Bucket 名称',
    s3_endpoint_url: 'S3 Endpoint URL',
    s3_hostname: 'S3 主机名',
    s3_proxy: 'S3 代理',
    aws_session_token: 'AWS Session Token',
    onedrive_domain: 'OneDrive 域名',
    onedrive_client_id: 'OneDrive Client ID',
    onedrive_username: 'OneDrive 用户名',
    onedrive_password: 'OneDrive 密码',
    onedrive_root_path: 'OneDrive 根路径',
    onedrive_proxy: 'OneDrive 代理',
    name: '网站名称',
    description: '网站描述',
    notify_title: '通知标题',
    notify_content: '通知内容',
    page_explain: '页面说明',
    keywords: '关键词',
    max_save_seconds: '最大保存时间（秒）',
    port: '端口',
    showAdminAddr: '显示管理地址',
    openUpload: '开放上传',
    uploadSize: '上传大小限制',
    expireStyle: '过期样式',
    uploadMinute: '上传时间限制（分钟）',
    opacity: '透明度',
    background: '背景图片',
    uploadCount: '上传��数限制',
    errorMinute: '错误限制时间（分钟）',
    errorCount: '错误次数限制',
    robotsText: 'Robots.txt 内容',
    admin_token: '管理员令牌',
  };
  return labels[key] || key;
}

export function getInputType(key) {
  const types = {
    s3_secret_access_key: 'password',
    onedrive_password: 'password',
    admin_token: 'password',
    opacity: 'range',
    background: 'url',
    notify_content: 'textarea',
    page_explain: 'textarea',
    robotsText: 'textarea',
  };
  return types[key] || 'text';
}
