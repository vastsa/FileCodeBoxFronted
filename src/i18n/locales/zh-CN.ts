export default {
  // 通用
  common: {
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    add: '添加',
    back: '返回',
    next: '下一页',
    previous: '上一页',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    search: '搜索',
    copy: '复制',
    uploadSuccess: '上传成功',
    uploadFailed: '上传失败',
    copySuccess: '复制成功',
    copyFailed: '复制失败',
    deleteSuccess: '删除成功',
    deleteFailed: '删除失败',
    downloadSuccess: '下载成功',
    downloadFailed: '下载失败',
    shareSuccess: '分享成功',
    shareFailed: '分享失败',
    expiredFile: '文件已过期',
    fileNotFound: '文件不存在',
    networkError: '网络错误',
    unknownError: '未知错误',
    invalidFileType: '不支持的文件类型',
    fileTooLarge: '文件过大',
    uploadCanceled: '上传已取消',
    processing: '处理中...',
    pleaseWait: '请稍候...',
    fileDetails: '文件详情',
    enabled: '已开启',
    disabled: '已关闭',
    minute: '分钟',
    files: '个文件',
    second: '秒',
    hour: '小时',
    day: '天',
    times: '次',
    appName: '文件快递柜 - FileCodeBox',
    appDescription: '开箱即用的文件快传系统'
  },

  // 管理员模块
  admin: {
    dashboard: {
      title: '仪表盘',
      totalFiles: '总文件数',
      storageSpace: '存储空间',
      activeUsers: '活跃用户',
      systemStatus: '系统状态',
      yesterday: '昨天：',
      today: '今天：',
      weeklyChange: '↓ 5% 较上周',
      normal: '正常',
      serverUptime: '服务器运行时间:',
      version: '版本 v2.2.1 更新时间：2025-09-04'
    },
    fileManage: {
      title: '文件管理'
    },
    settings: {
      title: '系统设置',
      basicSettings: '基本设置',
      websiteInfo: '网站基本信息',
      websiteName: '网站名称',
      websiteDescription: '网站描述',
      siteName: '网站名称',
      adminPassword: '管理员密码',
      passwordPlaceholder: '如需修改请输入新密码',
      passwordNote: '不修改请留空',
      keywords: 'SEO 关键词',
      themeSelection: '界面主题',
      robotsFile: 'Robots.txt 配置',
      notificationSettings: '通知设置',
      notificationTitle: '公告标题',
      notificationContent: '公告内容',
      storageSettings: '存储配置',
      storagePath: '文件存储路径',
      storagePathPlaceholder: '使用默认路径可留空',
      storageMethod: '存储方式',
      localStorage: '本地存储',
      s3Storage: 'S3 对象存储',
      webdavStorage: 'WebDAV 存储',
      chunkUploadNote: '分片上传（实验性功能，大文件上传更稳定）',
      s3AccessKeyId: 'Access Key ID',
      s3SecretAccessKey: 'Secret Access Key',
      s3BucketName: '存储桶名称',
      s3EndpointUrl: '服务端点 URL',
      s3RegionName: '区域名称',
      s3SignatureVersion: '签名版本',
      s3Hostname: '自定义域名',
      s3v2: 'S3v2',
      s3v4: 'S3v4',
      autoPlaceholder: '自动识别',
      enabled: '已启用',
      disabled: '已禁用',
      webdavUrl: '输入 WebDAV 服务地址',
      webdavUsername: '输入 WebDAV 用户名',
      webdavPassword: '输入 WebDAV 密码',
      webdavUrlPlaceholder: '输入 WebDAV 服务地址',
      webdavUsernamePlaceholder: '输入 WebDAV 用户名',
      webdavPasswordPlaceholder: '输入 WebDAV 密码',
      enableProxy: '启用下载代理',
      uploadLimits: '上传设置',
      uploadRateLimit: '限流时间窗口（在此时间内限制上传次数）',
      uploadPerMinute: '限流时间窗口（在此时间内限制上传次数）',
      minute: '分钟',
      uploadCountLimit: '允许上传文件数（限流窗口内最多上传几个文件）',
      files: '个文件',
      fileSizeLimit: '单文件大小上限',
      expirationMethod: '过期方式',
      expirationType: '过期方式',
      expiration: {
        day: '按天数',
        hour: '按小时',
        minute: '按分钟',
        forever: '永久有效',
        count: '按下载次数'
      },
      maxSaveTime: '文件最长保存时间',
      timeUnits: {
        second: '秒',
        minute: '分钟',
        hour: '小时',
        day: '天'
      },
      guestUpload: '允许游客上传',
      errorLimits: '访问保护',
      errorRateLimit: '检测时间窗口（在此时间内统计错误次数）',
      errorPerMinute: '检测时间窗口（在此时间内统计错误次数）',
      errorCountLimit: '允许错误次数（超过后临时封禁）',
      times: '次',
      saveChanges: '保存设置',
      fileSizeUnits: {
        kb: 'KB',
        mb: 'MB',
        gb: 'GB'
      }
    }
  },

  // 页面标题和导航
  nav: {
    sendFile: '发送文件',
    retrieveFile: '取件',
    fileRecords: '取件记录'
  },

  // 取件页面
  retrieve: {
    title: '文件取件',
    codeInput: {
      placeholder: '请输入5位取件码',
      label: '取件码'
    },
    submit: '取件',
    needSendFile: '需要发送文件？点击这里',
    recordsDrawer: '取件记录',
    messages: {
      invalidCode: '请输入5位取件码',
      retrieveSuccess: '文件获取成功',
      invalidCodeError: '无效的取件码',
      retrieveFailure: '获取文件失败：',
      networkError: '取件失败，请稍后重试：',
      unknownError: '未知错误'
    }
  },

  // 发送页面
  send: {
    title: '文件发送',
    sendText: '发送文本',
    fileDetails: '文件详情',
    expirationMethod: '过期方式',
    uploadArea: {
      dragText: '拖拽文件到此处或',
      clickText: '点击选择文件',
      textInput: '在此输入要发送的文本...',
      placeholder: '点击或拖放文件到此处上传',
      description: '支持各种常见格式'
    },
    submit: '安全寄送',
    needRetrieveFile: '需要取件？点击这里',
    sendRecords: '发件记录',
    secureEncryption: '安全加密',
    fileDetail: {
      title: '文件详情',
      content: '文件内容',
      previewContent: '预览内容',
      download: '点击下载',
      qrCode: '取件二维码',
      scanQrCode: '扫描二维码快速取件'
    },
    contentPreview: {
      title: '内容预览'
    },
    fileManage: {
      title: '文件管理',
      searchPlaceholder: '搜索文件名称、描述...',
      allFiles: '所有文件',
      editFileInfo: '编辑文件信息',
      saveChanges: '保存更改',
      headers: {
        code: '取件码',
        name: '名称',
        size: '大小',
        description: '描述',
        expiration: '过期时间',
        actions: '操作'
      },
      form: {
        code: '取件码',
        codePlaceholder: '输入取件码',
        filename: '文件名称',
        filenamePlaceholder: '输入文件名称',
        suffix: '文件后缀',
        suffixPlaceholder: '输入文件后缀',
        downloadLimit: '下载次数限制',
        downloadLimitPlaceholder: '输入下载次数限制'
      }
    },
    expiration: {
      label: '过期时间',
      placeholders: {
        days: '输入天数',
        hours: '输入小时数',
        minutes: '输入分钟数',
        count: '输入查看次数',
        forever: '永久',
        default: '输入值'
      },
      units: {
        days: '天',
        hours: '小时',
        minutes: '分钟',
        times: '次',
        forever: '永久'
      }
    },
    time: {
      day: '按天',
      hour: '按小时',
      minute: '按分钟',
      forever: '永久',
      count: '按次数'
    },
    messages: {
      selectFile: '请选择要上传的文件',
      enterText: '请输入要发送的文本',
      enterExpirationValue: '请输入过期值',
      expirationTooLong: '过期时间不能超过{days}天',
      sendSuccess: '文件发送成功！取件码：{code}',
      initChunkUploadFailed: '初始化切片上传失败',
      chunkUploadFailed: '切片 {index} 上传失败',
      completeUploadFailed: '完成上传失败',
      uploadFailed: '上传失败,请稍后重试',
      guestUploadDisabled: '游客上传功能已关闭',
      fileSizeExceeded: '文件大小超过限制 ({size})',
      serverError: '服务器响应异常',
      sendFailed: '发送失败,请稍后重试',
      expiresAfterCount: '{count}次后过期',
      expiresAt: '{date}过期',
      emptyFileError: '无法读取空文件',
      fileAddedFromClipboard: '已从剪贴板添加文件：{filename}',
      fileProcessingFailed: '文件处理失败',
      expiresAfter: '{value}{unit}后过期'
    }
  },

  // 文件管理
  fileManage: {
    title: '文件管理',
    searchPlaceholder: '搜索文件名称、描述...',
    allFiles: '所有文件',
    editFileInfo: '编辑文件信息',
    saveChanges: '保存更改',
    headers: {
      code: '取件码',
      name: '名称',
      size: '大小',
      description: '描述',
      expiration: '过期时间',
      actions: '操作'
    },
    form: {
      code: '取件码',
      codePlaceholder: '输入取件码',
      filename: '文件名称',
      filenamePlaceholder: '输入文件名称',
      suffix: '文件后缀',
      suffixPlaceholder: '输入文件后缀',
      downloadLimit: '下载次数限制',
      downloadLimitPlaceholder: '输入下载次数限制'
    }
  },

  // 文件记录
   fileRecord: {
      filename: '文件名',
      size: '文件大小',
      date: '取件日期',
      code: '取件码',
      actions: '操作',
      download: '下载',
      viewDetails: '查看详情',
      deleteRecord: '删除记录',
      preview: '预览',
      copyContent: '复制内容',
      contentCopied: '内容已复制到剪贴板',
      copyFailed: '复制失败，请重试'
    },

  // 文件详情模态框
  fileDetail: {
     title: '文件详情',
     content: '文件内容',
     previewContent: '预览内容',
     download: '点击下载',
     qrCode: '取件二维码',
     scanQrCode: '扫描二维码快速取件'
   },

   // 内容预览
   contentPreview: {
     title: '内容预览'
   },

  // 侧边抽屉
  drawer: {
    noRecords: '暂无记录'
  },

  // 文件大小单位
  fileSize: {
    bytes: 'Bytes',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB',
    tb: 'TB'
  },

  // 管理页面
  manage: {
    settings: {
      title: '系统设置',
      basicSettings: '基本设置',
      siteName: '网站名称',
      adminPassword: '管理员密码',
      passwordPlaceholder: '如需修改请输入新密码',
      passwordNote: '不修改请留空',
      keywords: 'SEO 关键词',
      themeSelection: '界面主题',
      robotsFile: 'Robots.txt 配置',
      notificationSettings: '通知设置',
      notificationTitle: '公告标题',
      notificationContent: '公告内容',
      storageSettings: '存储配置',
      storagePath: '文件存储路径',
      storagePathPlaceholder: '使用默认路径可留空',
      storageMethod: '存储方式',
      localStorage: '本地存储',
      s3Storage: 'S3 对象存储',
      webdavStorage: 'WebDAV 存储',
      chunkUploadNote: '分片上传（实验性功能，大文件上传更稳定）',
      uploadLimits: '上传设置',
      uploadPerMinute: '限流时间窗口（在此时间内限制上传次数）',
      uploadCountLimit: '允许上传文件数（限流窗口内最多上传几个文件）',
      fileSizeLimit: '单文件大小上限',
      expiration: {
        day: '按天数',
        hour: '按小时',
        minute: '按分钟',
        forever: '永久有效',
        count: '按下载次数'
      },
      maxSaveTime: '文件最长保存时间',
      s3AccessKeyId: 'Access Key ID',
      s3SecretAccessKey: 'Secret Access Key',
      s3BucketName: '存储桶名称',
      s3EndpointUrl: '服务端点 URL',
      s3RegionName: '区域名称',
      s3SignatureVersion: '签名版本',
      s3Hostname: '自定义域名',
      s3v2: 'S3v2',
      s3v4: 'S3v4',
      autoPlaceholder: '自动识别',
      enableProxy: '启用下载代理',
      webdavUrlPlaceholder: '输入 WebDAV 服务地址',
      webdavUsernamePlaceholder: '输入 WebDAV 用户名',
      webdavPasswordPlaceholder: '输入 WebDAV 密码',
      fileSizeUnits: {
        kb: 'KB',
        mb: 'MB',
        gb: 'GB'
      },
      expirationType: '过期方式',
      guestUpload: '允许游客上传',
      errorLimits: '访问保护',
      errorPerMinute: '检测时间窗口（在此时间内统计错误次数）',
      errorCountLimit: '允许错误次数（超过后临时封禁）',
      saveChanges: '保存设置'
    },
    dashboard: {
      title: '仪表盘',
      totalFiles: '总文件数',
      storageSpace: '存储空间',
      activeUsers: '活跃用户',
      systemStatus: '系统状态',
      yesterday: '昨天：',
      today: '今天：',
      weeklyChange: '↓ 5% 较上周',
      normal: '正常',
      serverUptime: '服务器运行时间:',
      version: '版本 v2.2.1 更新时间：2025-09-04'
    },
    fileManage: {
      title: '文件管理',
      searchPlaceholder: '搜索文件名称、描述...',
      allFiles: '所有文件',
      editFileInfo: '编辑文件信息',
      saveChanges: '保存更改',
      headers: {
        code: '取件码',
        name: '名称',
        size: '大小',
        description: '描述',
        expiration: '过期时间',
        actions: '操作'
      },
      form: {
        code: '取件码',
        codePlaceholder: '输入取件码',
        filename: '文件名称',
        filenamePlaceholder: '输入文件名称',
        suffix: '文件后缀',
        suffixPlaceholder: '输入文件后缀',
        downloadLimit: '下载次数限制',
        downloadLimitPlaceholder: '输入下载次数限制'
      },
      updateFailed: '更新失败',
      deleteFailed: '删除失败',
      loadFileListFailed: '加载文件列表失败'
    },
    systemSettings: {
      title: '系统设置',
      basicSettings: '基本设置',
      websiteInfo: '网站基本信息',
      websiteName: '网站名称',
      websiteDescription: '网站描述',
      adminPassword: '管理员密码',
      passwordPlaceholder: '如需修改请输入新密码',
      passwordNote: '不修改请留空',
      keywords: 'SEO 关键词',
      themeSelection: '界面主题',
      notificationSettings: '通知设置',
      notificationTitle: '公告标题',
      notificationContent: '公告内容',
      storageSettings: '存储配置',
      storagePath: '文件存储路径',
      storagePathPlaceholder: '使用默认路径可留空',
      storageMethod: '存储方式',
      localStorage: '本地存储',
      s3Storage: 'S3 对象存储',
      webdavStorage: 'WebDAV 存储',
      chunkUploadNote: '分片上传（实验性功能，大文件上传更稳定）',
      enabled: '已启用',
      disabled: '已禁用',
      webdavUrl: '输入 WebDAV 服务地址',
      webdavUsername: '输入 WebDAV 用户名',
      webdavPassword: '输入 WebDAV 密码',
      enableProxy: '启用下载代理',
      uploadLimits: '上传设置',
      uploadRateLimit: '限流时间窗口（在此时间内限制上传次数）',
      minute: '分钟',
      uploadCountLimit: '允许上传文件数（限流窗口内最多上传几个文件）',
      files: '个文件',
      fileSizeLimit: '单文件大小上限',
      expirationMethod: '过期方式',
      expirationMethods: {
        day: '按天数',
        hour: '按小时',
        minute: '按分钟',
        forever: '永久有效',
        count: '按下载次数'
      },
      expiration: {
        day: '按天数',
        hour: '按小时',
        minute: '按分钟',
        forever: '永久有效',
        count: '按下载次数'
      },
      maxSaveTime: '文件最长保存时间',
      timeUnits: {
        second: '秒',
        minute: '分钟',
        hour: '小时',
        day: '天'
      },
      guestUpload: '允许游客上传',
      errorLimits: '访问保护',
      errorRateLimit: '检测时间窗口（在此时间内统计错误次数）',
      errorCountLimit: '允许错误次数（超过后临时封禁）',
      times: '次',
      saveSettings: '保存设置',
      saveSuccess: '设置已保存',
      saveFailed: '保存失败，请重试',
      getConfigFailed: '获取配置失败，请刷新页面'
    },
    login: {
      title: '登录',
      password: '密码',
      passwordPlaceholder: '密码',
      loginButton: '登录',
      loggingIn: '登录中...',
      invalidPassword: '无效的密码',
      passwordTooShort: '密码长度至少为6位',
      loginFailed: '登录失败',
      noValidToken: '登录失败：未获取到有效令牌'
    }
  },

  // 工具函数相关
  utils: {
    common: {
      formatTime: '格式化时间戳为可读格式',
      formatFileSize: '格式化文件大小',
      formatDuration: '格式化持续时间',
      time: {
        forever: '永久',
        day: '天',
        hour: '小时',
        minute: '分钟',
        second: '秒'
      },
      copyToClipboard: '复制文本到剪贴板',
      copyFailed: '复制失败:',
      debounce: '防抖函数',
      throttle: '节流函数',
      validateEmail: '验证邮箱格式',
      validateUrl: '验证URL格式',
      generateRandomString: '生成随机字符串',
      deepClone: '深度克隆对象',
      getFileExtension: '获取文件扩展名',
      isMobileDevice: '检查是否为移动设备',
      formatNumber: '格式化数字，添加千分位分隔符'
    },
    clipboard: {
      title: '剪贴板工具函数',
      copyText: '复制文本到剪贴板',
      copySuccess: '复制成功',
      copyFailed: '复制失败，请手动复制'
    }
  },

  // 组件相关
  components: {
    pagination: {
      showing: '显示第',
      to: '到',
      of: '条，共',
      total: '条',
      previous: '上一页',
      next: '下一页'
    },
    languageSwitcher: {
      clickOutsideToClose: '点击外部关闭下拉菜单'
    },
    borderProgressBar: {
      borderWidth: '边框宽度',
      cornerRadius: '拐角半径',
      createGradient: '创建渐变',
      drawBackground: '绘制背景',
      calculateProgress: '计算进度',
      drawProgress: '绘制进度'
    }
  },

  // 其他通用文本
  misc: {
    emptyFileError: '无法读取空文件',
    fileAddedFromClipboard: '已从剪贴板添加文件：',
    fileProcessFailed: '文件处理失败',
    chunkSize: '保持 2MB 的切片大小用于计算哈希',
    secureContext: '如果不是安全上下文（HTTP），则返回一个基于文件信息的替代哈希',
    cryptoFallback: '如果 crypto.subtle.digest 失败，使用替代方案',
    generateAlternativeHash: '生成替代哈希的函数',
    fileInfoHash: '使用文件名、大小和最后修改时间生成一个简单的哈希',
    convertToHex: '转换为16进制字符串并填充到64位',
    defaultChunkSize: '默认切片大小为5MB',
    initChunkUpload: '1. 初始化切片上传',
    uploadChunk: '2. 上传切片',
    completeUpload: '3. 完成上传',
    chunkUploadFailed: '切片上传失败:',
    uploadProgressListener: '添加上传进度监听',
    noLimitCheck: '如果没有限制，直接返回true',
    expirationValidation: '添加过期时间验证',
    chunkUploadReplacement: '使用切片上传替代原来的直接上传',
    textUploadUnchanged: '文本上传保持不变',
    addSendRecord: '添加新的发送记录',
    permanent: '永久',
    sendSuccessMessage: '显示发送成功消息',
    resetForm: '重置表单 - 只重置文件和文本内容,保留过期信息',
    showDetails: '显示详情',
    autoCopyLink: '自动复制取件码链接',
    delayedLoading: '使用 onMounted 钩子延迟加载一些非关键资源或初始化',
    nonCriticalInit: '这里可以放置一些非立即需要的初始化代码'
  }
}