export default {
  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    add: 'Add',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    noData: 'No Data',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    search: 'Search',
    copy: 'Copy',
    uploadSuccess: 'Upload successful',
    uploadFailed: 'Upload failed',
    copySuccess: 'Copy successful',
    copyFailed: 'Copy failed',
    deleteSuccess: 'Delete successful',
    deleteFailed: 'Delete failed',
    downloadSuccess: 'Download successful',
    downloadFailed: 'Download failed',
    shareSuccess: 'Share successful',
    shareFailed: 'Share failed',
    expiredFile: 'File has expired',
    fileNotFound: 'File not found',
    networkError: 'Network error',
    unknownError: 'Unknown error',
    invalidFileType: 'Invalid file type',
    fileTooLarge: 'File too large',
    uploadCanceled: 'Upload canceled',
    processing: 'Processing',
    pleaseWait: 'Please wait',
    fileDetails: 'File Details',
    enabled: 'Enabled',
    disabled: 'Disabled',
    minute: 'minute',
    files: 'files',
    second: 'second',
    hour: 'hour',
    day: 'day',
    times: 'times',
    appName: 'FileCodeBox - File Transfer',
    appDescription: 'Ready-to-use file transfer system'
  },

  // Admin module
  admin: {
    dashboard: {
      title: 'Dashboard',
      totalFiles: 'Total Files',
      storageSpace: 'Storage Space',
      activeUsers: 'Active Users',
      systemStatus: 'System Status',
      yesterday: 'Yesterday:',
      today: 'Today:',
      weeklyChange: '↓ 5% from last week',
      normal: 'Normal',
      serverUptime: 'Server Uptime:',
      version: 'Version v2.2.1 Updated: 2025-09-04'
    },
    fileManage: {
      title: 'File Management'
    },
    settings: {
      title: 'System Settings',
      basicSettings: 'General',
      websiteInfo: 'Site Information',
      websiteName: 'Site Name',
      websiteDescription: 'Site Description',
      siteName: 'Site Name',
      adminPassword: 'Admin Password',
      passwordPlaceholder: 'Enter new password to change',
      passwordNote: 'Leave empty to keep current',
      keywords: 'SEO Keywords',
      themeSelection: 'Theme',
      robotsFile: 'Robots.txt Configuration',
      notificationSettings: 'Notifications',
      notificationTitle: 'Announcement Title',
      notificationContent: 'Announcement Content',
      storageSettings: 'Storage',
      storagePath: 'Storage Path',
      storagePathPlaceholder: 'Leave empty for default path',
      storageMethod: 'Storage Type',
      localStorage: 'Local Storage',
      s3Storage: 'S3 Object Storage',
      webdavStorage: 'WebDAV Storage',
      chunkUploadNote: 'Chunked Upload (experimental, better for large files)',
      s3AccessKeyId: 'Access Key ID',
      s3SecretAccessKey: 'Secret Access Key',
      s3BucketName: 'Bucket Name',
      s3EndpointUrl: 'Endpoint URL',
      s3RegionName: 'Region Name',
      s3SignatureVersion: 'Signature Version',
      s3Hostname: 'Custom Domain',
      s3v2: 'S3v2',
      s3v4: 'S3v4',
      autoPlaceholder: 'Auto-detect',
      enabled: 'Enabled',
      disabled: 'Disabled',
      webdavUrl: 'Enter WebDAV server URL',
      webdavUsername: 'Enter WebDAV username',
      webdavPassword: 'Enter WebDAV password',
      webdavUrlPlaceholder: 'Enter WebDAV server URL',
      webdavUsernamePlaceholder: 'Enter WebDAV username',
      webdavPasswordPlaceholder: 'Enter WebDAV password',
      enableProxy: 'Enable Download Proxy',
      uploadLimits: 'Upload Settings',
      uploadRateLimit: 'Time Window (limit uploads within this period)',
      uploadPerMinute: 'Time Window (limit uploads within this period)',
      minute: 'min',
      uploadCountLimit: 'Max Files Allowed (within the time window)',
      files: 'files',
      fileSizeLimit: 'Max File Size',
      expirationMethod: 'Expiration Options',
      expirationType: 'Expiration Options',
      expiration: {
        day: 'Days',
        hour: 'Hours',
        minute: 'Minutes',
        forever: 'Never Expire',
        count: 'Download Count'
      },
      maxSaveTime: 'Max Retention Period',
      timeUnits: {
        second: 'sec',
        minute: 'min',
        hour: 'hr',
        day: 'day'
      },
      guestUpload: 'Allow Guest Uploads',
      errorLimits: 'Access Protection',
      errorRateLimit: 'Detection Window (count errors within this period)',
      errorPerMinute: 'Detection Window (count errors within this period)',
      errorCountLimit: 'Max Errors Allowed (block after exceeding)',
      times: 'times',
      saveChanges: 'Save Settings',
      fileSizeUnits: {
        kb: 'KB',
        mb: 'MB',
        gb: 'GB'
      }
    }
  },

  // Navigation
  nav: {
    sendFile: 'Send File',
    retrieveFile: 'Retrieve',
    fileRecords: 'File Records'
  },

  // Retrieve page
  retrieve: {
    title: 'File Retrieval',
    codeInput: {
      placeholder: 'Enter 5-digit retrieval code',
      label: 'Retrieval Code'
    },
    submit: 'Retrieve',
    needSendFile: 'Need to send a file? Click here',
    recordsDrawer: 'Retrieval Records',
    messages: {
      invalidCode: 'Please enter a 5-digit retrieval code',
      retrieveSuccess: 'File retrieved successfully',
      invalidCodeError: 'Invalid retrieval code',
      retrieveFailure: 'Failed to retrieve file: ',
      networkError: 'Retrieval failed, please try again later: ',
      unknownError: 'Unknown error'
    }
  },

  // Send page
  send: {
    title: 'File Send',
    sendText: 'Send Text',
    uploadArea: {
      dragText: 'Drag files here or',
      clickText: 'click to select files',
      textInput: 'Enter text to send here...',
      placeholder: 'Click or drag files here to upload',
      description: 'Supports various common formats'
    },
    submit: 'Secure Send',
    needRetrieveFile: 'Need to retrieve? Click here',
    sendRecords: 'Send Records',
    secureEncryption: 'Secure Encryption',
    fileDetails: 'File Details',
    expirationMethod: 'Expiration Method',
    expiration: {
      day: 'By Day',
      hour: 'By Hour',
      minute: 'By Minute',
      forever: 'Forever',
      count: 'By Count',
      label: 'Expiration Time',
      placeholders: {
        days: 'Enter days',
        hours: 'Enter hours',
        minutes: 'Enter minutes',
        count: 'Enter view count',
        forever: 'Forever',
        default: 'Enter value'
      },
      units: {
        days: 'days',
        hours: 'hours',
        minutes: 'minutes',
        times: 'times',
        forever: 'Forever'
      }
    },
     time: {
      day: 'By Day',
      hour: 'By Hour',
      minute: 'By Minute',
      forever: 'Forever',
      count: 'By Count'
    },
    messages: {
      selectFile: 'Please select a file to upload',
      enterText: 'Please enter text to send',
      enterExpirationValue: 'Please enter expiration value',
      expirationTooLong: 'Expiration time cannot exceed {days} days',
      sendSuccess: 'File sent successfully! Retrieve code: {code}',
      initChunkUploadFailed: 'Failed to initialize chunk upload',
      chunkUploadFailed: 'Chunk {index} upload failed',
      completeUploadFailed: 'Failed to complete upload',
      uploadFailed: 'Upload failed, please try again later',
      guestUploadDisabled: 'Guest upload feature is disabled',
      fileSizeExceeded: 'File size exceeds limit ({size})',
      serverError: 'Server response error',
      sendFailed: 'Send failed, please try again later',
      expiresAfterCount: 'Expires after {count} times',
      expiresAt: 'Expires at {date}',
      emptyFileError: 'Cannot read empty file',
      fileAddedFromClipboard: 'File added from clipboard: {filename}',
      fileProcessingFailed: 'File processing failed',
      expiresAfter: 'Expires after {value} {unit}'
    }
  },

  // File records
  fileRecord: {
    filename: 'Filename',
    size: 'Size',
    date: 'Date',
    code: 'Code',
    actions: 'Actions',
    download: 'Download',
    viewDetails: 'View Details',
    deleteRecord: 'Delete Record',
    preview: 'Preview',
    copyContent: 'Copy Content',
    contentCopied: 'Content copied to clipboard',
    copyFailed: 'Copy failed, please try again'
  },

  // File Detail Modal
  fileDetail: {
    title: 'File Details',
    content: 'File Content',
    previewContent: 'Preview Content',
    download: 'Click to Download',
    qrCode: 'Retrieve QR Code',
    scanQrCode: 'Scan QR code for quick retrieval'
  },

  // Content Preview Modal
  contentPreview: {
    title: 'Content Preview'
  },

  // File Management
  fileManage: {
    title: 'File Management',
    searchPlaceholder: 'Search file name, description...',
    allFiles: 'All Files',
    editFileInfo: 'Edit File Information',
    saveChanges: 'Save Changes',
    headers: {
      code: 'Retrieve Code',
      name: 'Name',
      size: 'Size',
      description: 'Description',
      expiration: 'Expiration',
      actions: 'Actions'
    },
    form: {
      code: 'Retrieve Code',
      codePlaceholder: 'Enter retrieve code',
      filename: 'File Name',
      filenamePlaceholder: 'Enter file name',
      suffix: 'File Extension',
      suffixPlaceholder: 'Enter file extension',
      downloadLimit: 'Download Limit',
      downloadLimitPlaceholder: 'Enter download limit'
    }
  },

   // Side drawer
  drawer: {
    noRecords: 'No records'
  },

  // Admin pages
  manage: {
    settings: {
      title: 'System Settings',
      basicSettings: 'General',
      websiteInfo: 'Site Information',
      websiteName: 'Site Name',
      websiteDescription: 'Site Description',
      siteName: 'Site Name',
      adminPassword: 'Admin Password',
      passwordPlaceholder: 'Enter new password to change',
      passwordNote: 'Leave empty to keep current',
      keywords: 'SEO Keywords',
      themeSelection: 'Theme',
      notificationSettings: 'Notifications',
      notificationTitle: 'Announcement Title',
      notificationContent: 'Announcement Content',
      storageSettings: 'Storage',
      storagePath: 'Storage Path',
      storagePathPlaceholder: 'Leave empty for default path',
      storageMethod: 'Storage Type',
      localStorage: 'Local Storage',
      s3Storage: 'S3 Object Storage',
      webdavStorage: 'WebDAV Storage',
      chunkUploadNote: 'Chunked Upload (experimental, better for large files)',
      enabled: 'Enabled',
      disabled: 'Disabled',
      webdavUrl: 'Enter WebDAV server URL',
      webdavUsername: 'Enter WebDAV username',
      webdavPassword: 'Enter WebDAV password',
      webdavUrlPlaceholder: 'Enter WebDAV server URL',
      webdavUsernamePlaceholder: 'Enter WebDAV username',
      webdavPasswordPlaceholder: 'Enter WebDAV password',
      enableProxy: 'Enable Download Proxy',
      uploadLimits: 'Upload Settings',
      uploadRateLimit: 'Time Window (limit uploads within this period)',
      uploadPerMinute: 'Time Window (limit uploads within this period)',
      minute: 'min',
      uploadCountLimit: 'Max Files Allowed (within the time window)',
      files: 'files',
      fileSizeLimit: 'Max File Size',
      expirationMethod: 'Expiration Options',
      expirationType: 'Expiration Options',
      expiration: {
        day: 'Days',
        hour: 'Hours',
        minute: 'Minutes',
        forever: 'Never Expire',
        count: 'Download Count'
      },
      maxSaveTime: 'Max Retention Period',
      timeUnits: {
        second: 'sec',
        minute: 'min',
        hour: 'hr',
        day: 'day'
      },
      guestUpload: 'Allow Guest Uploads',
      errorLimits: 'Access Protection',
      errorRateLimit: 'Detection Window (count errors within this period)',
      errorPerMinute: 'Detection Window (count errors within this period)',
      errorCountLimit: 'Max Errors Allowed (block after exceeding)',
      times: 'times',
      fileSizeUnits: {
        kb: 'KB',
        mb: 'MB',
        gb: 'GB'
      },
      saveChanges: 'Save Settings'
    },
    systemSettings: {
      title: 'System Settings',
      basicSettings: 'General',
      websiteInfo: 'Site Information',
      websiteName: 'Site Name',
      websiteDescription: 'Site Description',
      adminPassword: 'Admin Password',
      passwordPlaceholder: 'Enter new password to change',
      passwordNote: 'Leave empty to keep current',
      keywords: 'SEO Keywords',
      themeSelection: 'Theme',
      notificationSettings: 'Notifications',
      notificationTitle: 'Announcement Title',
      notificationContent: 'Announcement Content',
      storageSettings: 'Storage',
      storagePath: 'Storage Path',
      storagePathPlaceholder: 'Leave empty for default path',
      storageMethod: 'Storage Type',
      localStorage: 'Local Storage',
      s3Storage: 'S3 Object Storage',
      webdavStorage: 'WebDAV Storage',
      chunkUploadNote: 'Chunked Upload (experimental, better for large files)',
      enabled: 'Enabled',
      disabled: 'Disabled',
      webdavUrl: 'Enter WebDAV server URL',
      webdavUsername: 'Enter WebDAV username',
      webdavPassword: 'Enter WebDAV password',
      enableProxy: 'Enable Download Proxy',
      uploadLimits: 'Upload Settings',
      uploadRateLimit: 'Time Window (limit uploads within this period)',
      minute: 'min',
      uploadCountLimit: 'Max Files Allowed (within the time window)',
      files: 'files',
      fileSizeLimit: 'Max File Size',
      expirationMethod: 'Expiration Options',
      expirationMethods: {
        day: 'Days',
        hour: 'Hours',
        minute: 'Minutes',
        forever: 'Never Expire',
        count: 'Download Count'
      },
      expiration: {
        day: 'Days',
        hour: 'Hours',
        minute: 'Minutes',
        forever: 'Never Expire',
        count: 'Download Count'
      },
      maxSaveTime: 'Max Retention Period',
      timeUnits: {
        second: 'sec',
        minute: 'min',
        hour: 'hr',
        day: 'day'
      },
      guestUpload: 'Allow Guest Uploads',
      errorLimits: 'Access Protection',
      errorRateLimit: 'Detection Window (count errors within this period)',
      errorCountLimit: 'Max Errors Allowed (block after exceeding)',
      times: 'times',
      saveSettings: 'Save Settings',
      saveSuccess: 'Settings saved successfully',
      saveFailed: 'Failed to save, please try again',
      getConfigFailed: 'Failed to load settings, please refresh'
    },
    dashboard: {
      title: 'Dashboard',
      totalFiles: 'Total Files',
      storageSpace: 'Storage Space',
      activeUsers: 'Active Users',
      systemStatus: 'System Status',
      yesterday: 'Yesterday:',
      today: 'Today:',
      weeklyChange: '↓ 5% from last week',
      normal: 'Normal',
      serverUptime: 'Server Uptime:',
      version: 'Version v2.2.1 Updated: 2025-09-04'
    },
    fileManage: {
       title: 'File Management',
       searchPlaceholder: 'Search file name, description...',
       allFiles: 'All Files',
       editFileInfo: 'Edit File Info',
       saveChanges: 'Save Changes',
       headers: {
         code: 'Code',
         name: 'Name',
         size: 'Size',
         description: 'Description',
         expiration: 'Expiration',
         actions: 'Actions'
       },
       form: {
         code: 'Code',
         codePlaceholder: 'Enter code',
         filename: 'File Name',
         filenamePlaceholder: 'Enter file name',
         suffix: 'File Suffix',
         suffixPlaceholder: 'Enter file suffix',
         downloadLimit: 'Download Limit',
         downloadLimitPlaceholder: 'Enter download limit'
       },
       updateFailed: 'Update failed',
       deleteFailed: 'Delete failed',
       loadFileListFailed: 'Failed to load file list'
     },
     login: {
       title: 'Login',
       password: 'Password',
       passwordPlaceholder: 'Password',
       loginButton: 'Login',
       loggingIn: 'Logging in...',
       invalidPassword: 'Invalid password',
       passwordTooShort: 'Password must be at least 6 characters',
       loginFailed: 'Login failed',
      noValidToken: 'Login failed: No valid token received'
    }
  },

  // File size units
  fileSize: {
    bytes: 'Bytes',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB',
    tb: 'TB'
  },

  // Utility functions
  utils: {
    // Time formatting
    formatTime: 'Format timestamp to readable format',
    formatFileSize: 'Format file size',
    formatDuration: 'Format duration',
    time: {
      forever: 'Forever',
      day: 'day',
      hour: 'hour',
      minute: 'minute',
      second: 'second'
    },
    copyToClipboard: 'Copy text to clipboard',
    copyFailed: 'Copy failed:',
    debounce: 'Debounce function',
    throttle: 'Throttle function',
    validateEmail: 'Validate email format',
    validateUrl: 'Validate URL format',
    generateRandomString: 'Generate random string',
    deepClone: 'Deep clone object',
    getFileExtension: 'Get file extension',
    isMobileDevice: 'Check if mobile device',
    formatNumber: 'Format number with thousand separators',
    clipboard: {
      title: 'Clipboard utility functions',
      copyText: 'Copy text to clipboard',
      copySuccess: 'Copy successful',
      copyFailed: 'Copy failed, please copy manually'
    }
  },

  // Components
  components: {
    pagination: {
      showing: 'Showing',
      to: 'to',
      of: 'of',
      total: 'total',
      previous: 'Previous',
      next: 'Next'
    },
    languageSwitcher: {
      clickOutsideToClose: 'Click outside to close dropdown menu'
    },
    borderProgressBar: {
      borderWidth: 'Border width',
      cornerRadius: 'Corner radius',
      createGradient: 'Create gradient',
      drawBackground: 'Draw background',
      calculateProgress: 'Calculate progress',
      drawProgress: 'Draw progress'
    }
  },

  // Miscellaneous
  misc: {
    emptyFileError: 'Cannot read empty file',
    fileAddedFromClipboard: 'File added from clipboard: ',
    fileProcessFailed: 'File processing failed',
    chunkSize: 'Keep 2MB chunk size for hash calculation',
    secureContext: 'If not in secure context (HTTP), return an alternative hash based on file info',
    cryptoFallback: 'If crypto.subtle.digest fails, use fallback method',
    generateAlternativeHash: 'Function to generate alternative hash',
    fileInfoHash: 'Generate simple hash using filename, size and last modified time',
    convertToHex: 'Convert to hex string and pad to 64 bits',
    defaultChunkSize: 'Default chunk size is 5MB',
    initChunkUpload: '1. Initialize chunk upload',
    uploadChunk: '2. Upload chunk',
    completeUpload: '3. Complete upload',
    chunkUploadFailed: 'Chunk upload failed: ',
    uploadProgressListener: 'Add upload progress listener',
    noLimitCheck: 'If no limit, return true directly',
    expirationValidation: 'Add expiration time validation',
    chunkUploadReplacement: 'Use chunk upload to replace direct upload',
    textUploadUnchanged: 'Text upload remains unchanged',
    addSendRecord: 'Add new send record',
    permanent: 'Permanent',
    sendSuccessMessage: 'Show send success message',
    resetForm: 'Reset form - only reset file and text content, keep expiration info',
    showDetails: 'Show details',
    autoCopyLink: 'Auto copy retrieve code link',
    delayedLoading: 'Use onMounted hook to delay load non-critical resources or initialization',
    nonCriticalInit: 'Place non-immediately needed initialization code here'
  }
}