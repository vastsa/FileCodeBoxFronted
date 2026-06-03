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
    logout: 'Logout',
    dashboard: {
      title: 'Dashboard',
      totalFiles: 'Total Files',
      storageSpace: 'Storage Space',
      todayShares: 'Today Shares',
      totalRetrievals: 'Total Retrievals',
      activeFiles: 'Active files: {count}',
      todayIncrease: 'Today added: {count}',
      yesterdayShares: 'Yesterday: {count}',
      serverUptime: 'Uptime',
      refresh: 'Refresh',
      refreshing: 'Refreshing',
      lastUpdated: 'Last updated: {time}',
      loadFailed: 'Failed to load dashboard data',
      fileHealth: 'File Health',
      fileHealthDesc: 'Status insights for available, risky, and pending file queues.',
      activeFileRatio: 'Active Ratio',
      fileShareRatio: 'File Ratio',
      textShareRatio: 'Text Ratio',
      binaryFiles: '{count} file shares',
      textShares: '{count} text shares',
      expiredFiles: 'Expired Files',
      needCleanup: 'Clean up in file management',
      chunkedFiles: 'Chunked Files',
      storagePolicy: 'Storage & Upload Policy',
      storagePolicyDesc: 'Current settings that affect upload behavior.',
      storageBackend: 'Storage Backend',
      singleFileLimit: 'Single File Limit',
      guestUpload: 'Guest Upload',
      maxSaveTime: 'Max Retention',
      noSaveLimit: 'Unlimited',
      todayCapacityReference: 'Today Size / Single File Limit',
      fileTypeDistribution: 'Type Distribution',
      textType: 'Text',
      recentActivities: 'Recent Activity',
      recentActivitiesDesc: 'Key admin changes for quick operational traceability.',
      operationalInsightsTitle: 'Operational Insights',
      operationalInsightsDesc:
        'Suggested next actions generated from file health, upload policy, and recent capacity.',
      operationalInsightActionSettings: 'Adjust settings',
      operationalInsightActionFileQueue: 'View queue',
      operationalInsightSeverity: {
        danger: 'High risk',
        warning: 'Action needed',
        success: 'Stable',
        neutral: 'Suggestion'
      },
      maintenanceQueueTitle: 'Maintenance Queue',
      maintenanceQueueDesc:
        'Groups file health, retention policy, and upload settings into actionable queues. Click an item to open the related view.',
      maintenanceActionable: 'Actionable',
      maintenanceFileQueue: 'File queue',
      maintenanceSettings: 'Settings',
      maintenanceQueueActionSettings: 'Adjust settings',
      maintenanceQueueActionFileQueue: 'View queue',
      maintenanceQueueItems: {
        storage_issue: {
          title: '{count} storage issues',
          description:
            'Review records missing download metadata and verify storage settings and file details.'
        },
        expired_cleanup: {
          title: '{count} expired items',
          description:
            'Review expired shares, delete stale records, or extend files that should stay available.'
        },
        expiring_soon: {
          title: '{count} expiring soon',
          description: 'These shares will expire soon. Extend them early or notify recipients.'
        },
        never_retrieved: {
          title: '{count} never retrieved',
          description:
            'Review shares that have not been retrieved to identify ineffective uploads or follow-up gaps.'
        },
        permanent_review: {
          title: '{count} permanent shares',
          description:
            'Periodically review long-retention shares to prevent unbounded historical growth.'
        },
        guest_upload_retention: {
          title: 'Guest uploads lack retention limits',
          description:
            'Guest uploads are enabled without a maximum retention period. Add a default retention policy.'
        },
        chunking_disabled: {
          title: 'Large-file experience can improve',
          description:
            "Today's capacity is near the single-file limit. Enable chunked upload for better reliability."
        },
        healthy: {
          title: 'Maintenance queue is stable',
          description: 'No maintenance item needs priority attention right now.'
        }
      },
      viewAllActivities: 'View all',
      activityTimelineTitle: 'Activity Timeline',
      activityTimelineFiltered: 'Current Results',
      activityTimelineStoredTotal: 'Retained Records',
      activityKeyword: 'Keyword',
      activityKeywordPlaceholder: 'Search target, action, or ID',
      activityActionFilter: 'Action',
      activityAllActions: 'All actions',
      activityTargetTypeFilter: 'Target type',
      activityAllTargets: 'All targets',
      activityResetFilters: 'Reset',
      activityRefresh: 'Refresh',
      activityApplyFilters: 'Apply',
      activityLoading: 'Loading activity records...',
      activityNoFiltered: 'No matching activity records',
      activityLoadFailed: 'Failed to load activity timeline',
      noActivities: 'No activity yet',
      activityUnknownTarget: 'Unnamed target',
      activityDescription: 'Target: {target}',
      activityBatchDescription: 'Target: {target}, {count} items',
      activityActions: {
        'file.delete': 'Deleted file',
        'files.batch_delete': 'Batch deleted files',
        'file.update': 'Edited file',
        'files.batch_update': 'Batch updated files',
        'file.policy_action': 'Updated file policy',
        'files.batch_policy_action': 'Batch updated policies',
        'file.metadata_update': 'Updated operations notes',
        'file.view_preset_create': 'Created view preset',
        'file.view_preset_update': 'Updated view preset',
        'file.view_preset_delete': 'Deleted view preset',
        'config.update': 'Updated system settings',
        'local_file.delete': 'Deleted local file',
        'local_file.share': 'Shared local file'
      },
      activityTargetTypes: {
        file: 'File',
        view_preset: 'View preset',
        config: 'System settings',
        local_file: 'Local file',
        system: 'System'
      },
      operationalInsights: {
        storage_issue: {
          title: 'Fix {count} storage issues',
          description:
            'Some records are missing download metadata. Review storage settings and file details first.'
        },
        expired_cleanup: {
          title: 'Clean up {count} expired files',
          description:
            'Expired records add management noise. Delete them in bulk or extend the files that should remain available.'
        },
        expiring_soon: {
          title: '{count} files expiring soon',
          description:
            'These shares will become unavailable soon. Extend them early or notify the recipients.'
        },
        never_retrieved: {
          title: '{count} files never retrieved',
          description:
            'Shares that were never retrieved can reveal ineffective uploads or follow-up gaps.'
        },
        guest_upload_retention: {
          title: 'Guest uploads lack retention limits',
          description:
            'Guest upload is enabled with unlimited retention. Set a default retention window to reduce storage pressure.'
        },
        chunking_disabled: {
          title: 'Consider enabling chunked upload',
          description:
            "Today's added capacity is near the single-file limit. Chunked upload can improve large-file reliability."
        },
        healthy: {
          title: 'Operations look stable',
          description:
            'No high-priority operational risk was detected. Keep watching the file health trend.'
        }
      },
      recentFiles: 'Recent Shares',
      recentFilesDesc: 'Recently created share records for quick status checks.',
      available: 'Available',
      healthActions: {
        attention: {
          title: 'Needs Attention',
          description: 'Handle issue and warning files together'
        },
        storageIssue: {
          title: 'Storage Issues',
          description: 'Review files missing download metadata'
        },
        expiringSoon: {
          title: 'Expiring Soon',
          description: 'Extend shares that should stay available'
        },
        neverRetrieved: {
          title: 'Never Retrieved',
          description: 'Find shares that have not been retrieved yet'
        },
        permanent: {
          title: 'Permanent',
          description: 'View long-retention share records'
        }
      },
      table: {
        file: 'File',
        size: 'Size',
        usage: 'Retrievals',
        status: 'Status'
      }
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
      unknownError: 'Unknown error',
      previewUnavailable: 'Preview is unavailable, you can still retrieve directly'
    },
    workspace: {
      sendFile: 'Send File',
      inspect: 'Preview',
      inspecting: 'Previewing',
      retrieving: 'Retrieving',
      ready: 'Ready',
      noPreview: 'Waiting for a code',
      noPreviewDesc:
        'Enter a 5-character retrieval code to preview file details before consuming a retrieval.',
      latestRecord: 'Latest Retrieval',
      noRecord: 'No retrieval records yet',
      currentCode: 'Code',
      fileSize: 'File Size',
      viewDetail: 'View Detail',
      historyCount: '{count} records',
      openRecords: 'Open retrieval records',
      security: 'Safe Retrieval',
      securityState:
        'Previewing does not consume retrieval count. Access is recorded only after confirmation.',
      noExpiry: 'No limit',
      unlimited: 'Unlimited',
      remainingCount: '{count} left',
      textType: 'Text Content',
      fileType: 'File Download',
      expiresAt: 'Expires At',
      remainingDownloads: 'Remaining',
      usedCount: 'Retrieved',
      emptyCode: 'Empty',
      previewState: 'Preview State',
      waiting: 'Waiting'
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
      description: 'Supports various common formats',
      descriptionWithLimit: 'Supports common formats, up to {size}',
      retry: 'Retry',
      selectedFiles: '{count} files selected',
      status: {
        initializing: 'Preparing upload...',
        uploading: 'Uploading files...',
        confirming: 'Confirming upload...',
        success: 'Upload complete!'
      }
    },
    submit: 'Secure Send',
    submitting: 'Sending...',
    needRetrieveFile: 'Need to retrieve? Click here',
    sendRecords: 'Send Records',
    secureEncryption: 'Secure Encryption',
    workspace: {
      uploadLimit: 'Single File Limit',
      uploadMode: 'Upload Mode',
      standardMode: 'Standard',
      chunkMode: 'Chunked',
      guestPolicy: 'Guest Upload',
      guestOpen: 'Allowed',
      guestClosed: 'Disabled',
      currentTask: 'Current Task',
      awaitingFile: 'Waiting for files',
      fileReady: '{count} files ready',
      textDraft: 'Text draft, {count} chars',
      payload: 'Payload',
      expirationPreview: 'Expiration',
      security: 'Security',
      latestRecord: 'Latest Send',
      noRecord: 'No records yet',
      copyLink: 'Copy Link',
      viewDetail: 'View Detail',
      historyTitle: 'Send History',
      historyCount: '{count} records',
      openRecords: 'Open send records'
    },
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
    subtitle: '{count} share records. Filter by status, type, and usage.',
    searchPlaceholder: 'Search code, name, or text...',
    allFiles: 'All Files',
    detail: 'Details',
    detailTitle: 'File Details',
    detailLoading: 'Loading details...',
    detailFailed: 'Failed to load details',
    editFileInfo: 'Edit File Information',
    saveChanges: 'Save Changes',
    refresh: 'Refresh List',
    resetFilters: 'Reset Filters',
    totalFiles: 'All Records',
    activeFiles: 'Available',
    expiredFiles: 'Expired',
    storageUsed: 'Storage Used',
    statusLabel: 'Status',
    typeLabel: 'Type',
    healthLabel: 'Health',
    viewPreset: 'View',
    viewPresetCustom: 'Custom Filters',
    viewPresetAll: 'All Files',
    viewPresetAttention: 'Needs Attention',
    viewPresetExpiringSoon: 'Expiring Soon',
    viewPresetStorageIssue: 'Storage Issues',
    viewPresetNeverRetrieved: 'Never Retrieved',
    viewPresetPermanent: 'Permanent',
    saveViewPreset: 'Save View',
    updateViewPreset: 'Update View',
    deleteViewPreset: 'Delete View',
    viewPresetNamePrompt: 'Enter a view name',
    viewPresetSaveSuccess: 'View saved',
    viewPresetSaveFailed: 'Failed to save view',
    viewPresetDeleteConfirm: 'Delete view "{name}"?',
    viewPresetDeleteSuccess: 'View deleted',
    viewPresetDeleteFailed: 'Failed to delete view',
    viewPresetLoadFailed: 'Failed to load saved views; using built-in views',
    viewSummary: {
      title: 'Current View Action Summary',
      description:
        'Groups risks and next actions from the current filters. Click an item to open its queue.',
      filteredTotal: 'Current results',
      allTotal: 'All records',
      activeFilters: 'Filters',
      action: 'View queue',
      reset: 'Clear filters',
      severity: {
        success: 'Stable',
        warning: 'Action needed',
        danger: 'High risk',
        info: 'Info',
        neutral: 'Watch'
      },
      items: {
        storage_issue: {
          title: '{count} storage issues',
          description:
            'Review records missing download metadata and verify storage paths, file names, and settings.'
        },
        expired: {
          title: '{count} expired items',
          description:
            'Handle unavailable shares by deleting stale records or extending files that should remain available.'
        },
        expiring_soon: {
          title: '{count} expiring soon',
          description:
            'These shares expire within 24 hours. Extend them early or notify recipients.'
        },
        never_retrieved: {
          title: '{count} never retrieved',
          description:
            'Review shares that have not been retrieved to identify ineffective uploads or follow-up gaps.'
        },
        permanent: {
          title: '{count} permanent shares',
          description: 'Review long-retention shares to prevent unbounded historical growth.'
        },
        healthy: {
          title: 'Current view is stable',
          description: 'No file in the current filters needs priority handling.'
        },
        empty: {
          title: 'No results in this view',
          description: 'Adjust or clear filters to inspect other file queues.'
        }
      }
    },
    all: 'All',
    active: 'Available',
    expired: 'Expired',
    fileType: 'File',
    textType: 'Text',
    chunkedType: 'Chunked',
    healthFilters: {
      all: 'All',
      attention: 'Needs Attention',
      danger: 'Issues',
      warning: 'Warnings',
      expiringSoon: 'Expiring Soon',
      storageIssue: 'Storage Issues',
      neverRetrieved: 'Never Retrieved',
      healthy: 'Healthy',
      permanent: 'Permanent'
    },
    sortBy: 'Sort',
    unlimited: 'Unlimited',
    remaining: '{count} left',
    loadError: 'Failed to load file list',
    noMatches: 'No matching files',
    viewText: 'View',
    textPreview: 'Text Preview',
    copyText: 'Copy Text',
    copyCode: 'Copy Code',
    copyLink: 'Copy Link',
    copySuccess: 'Text copied to clipboard',
    copyCodeSuccess: 'Retrieve code copied to clipboard',
    copyLinkSuccess: 'Retrieve link copied to clipboard',
    copyFailed: 'Copy failed, please try again',
    charCount: '{count} characters',
    downloadFile: 'Download File',
    exportText: 'Export Text',
    downloadSuccess: 'Downloaded: {name}',
    exportSuccess: 'Exported: {name}',
    downloadFailed: 'Download failed',
    previewFailed: 'Failed to load preview',
    loadingPreview: 'Loading preview...',
    previewComplete: 'Loaded full content, {count} characters',
    previewTruncated: 'Showing {shown} / {total} characters',
    previewFallback: 'Preview endpoint unavailable; using text from the list',
    selectCurrentPage: 'Select current page',
    selectedCount: '{count} selected',
    selectFile: 'Select {name}',
    clearSelection: 'Clear Selection',
    batchDelete: 'Batch Delete',
    batchDeleteConfirm: 'Delete the selected {count} files? This action cannot be undone.',
    batchDeleteSuccess: 'Deleted {count} files',
    batchDeletePartialSuccess: 'Deleted {count} files, {failed} failed',
    batchDeleteFailed: 'Batch delete failed',
    batchEdit: 'Batch Edit',
    batchEditTitle: 'Batch Edit File Policy',
    batchEditSelected: 'Update the selected {count} files',
    batchEditMode: 'Update Mode',
    batchEditExpiresAt: 'Set Expiration Time',
    batchEditDownloadLimit: 'Set Retrieval Limit',
    batchEditForever: 'Make Permanent',
    batchEditForeverHint: 'Clear the expiration time and make retrievals unlimited.',
    batchUpdateConfirm: 'Update the selected {count} files?',
    batchUpdateSuccess: 'Updated {count} files',
    batchUpdatePartialSuccess: 'Updated {count} files, {failed} failed',
    batchUpdateFailed: 'Batch update failed',
    batchUpdateNoFields: 'Choose a policy to update',
    batchPolicyActionConfirm: 'Apply "{action}" to the selected {count} files?',
    batchPolicyActionSuccess: 'Processed {count} files',
    batchPolicyActionPartialSuccess: 'Processed {count} files, {failed} failed',
    batchPolicyActionFailed: 'Batch policy action failed',
    policyActionSuccess: 'File policy updated',
    policyActionFailed: 'Failed to apply policy action',
    metadataInfo: 'Operations Notes',
    metadataHint:
      'Visible to admins only. Use it for handling notes, archive tags, and follow-up actions.',
    metadataNote: 'Note',
    metadataNotePlaceholder: 'Record context, handling history, or ownership...',
    metadataTags: 'Tags',
    metadataTagsPlaceholder: 'Comma-separated, e.g. Client A, Renew, Important',
    metadataUpdatedAt: 'Last saved: {time}',
    metadataNeverUpdated: 'No notes saved yet',
    saveMetadata: 'Save Notes',
    metadataSaveSuccess: 'Notes and tags saved',
    metadataSaveFailed: 'Failed to save notes',
    policyActions: {
      extend24h: 'Extend 24h',
      extend7d: 'Extend 7d',
      makePermanent: 'Make Permanent',
      resetDownloadLimit: 'Reset to {count}'
    },
    policyActionDescriptions: {
      extend24h: 'Add one day from the active expiration',
      extend7d: 'Good for a one-week temporary extension',
      makePermanent: 'Clear expiration time and retrieval limits',
      resetDownloadLimit: 'Restore retrievals to {count}'
    },
    applyBatchEdit: 'Apply Changes',
    overview: 'Overview',
    policyInfo: 'Policy',
    storageInfo: 'Storage',
    statusInsight: 'Status Insight',
    nextAction: 'Next Action',
    lifecycle: 'Lifecycle',
    permanent: 'Permanent',
    createdAt: 'Created Time',
    remainingDownloads: 'Remaining Downloads',
    textLength: 'Text Length',
    hasDownloadLimit: 'Has Retrieval Limit',
    hasExpirationTime: 'Has Expiration',
    canPreviewText: 'Can Preview Text',
    canDownload: 'Can Download',
    storageBackend: 'Storage Backend',
    fileHash: 'File Hash',
    isChunked: 'Chunked Upload',
    filePath: 'Storage Path',
    uuidFileName: 'Stored File Name',
    uploadId: 'Upload Session',
    yes: 'Yes',
    no: 'No',
    insightSeverity: {
      success: 'Healthy',
      warning: 'Needs Attention',
      danger: 'Issue',
      info: 'Info',
      neutral: 'Watch'
    },
    insightStates: {
      available: 'Available for retrieval',
      expired: 'Unavailable for retrieval',
      storage_incomplete: 'Storage metadata incomplete',
      expiring_soon: 'Expiring soon',
      permanent: 'Permanent'
    },
    insightActions: {
      monitor: 'Keep monitoring',
      extend_or_delete: 'Extend retention or clean up',
      inspect_storage: 'Inspect storage path and file name',
      extend_expiration: 'Extend expiration if needed'
    },
    insightReasons: {
      expired: 'Past expiration time',
      download_limit_exhausted: 'Retrieval limit exhausted',
      expires_soon: 'Expires within 24 hours',
      never_retrieved: 'Never retrieved',
      storage_metadata_incomplete: 'Missing downloadable storage metadata',
      chunked_upload: 'Created by chunked upload'
    },
    timeline: {
      status: {
        done: 'Done',
        pending: 'Pending',
        active: 'Active',
        expired: 'Expired',
        exhausted: 'Exhausted',
        unlimited: 'Unlimited'
      },
      created: {
        title: 'Record Created',
        description: 'The share record has been created and is currently {status}.'
      },
      content_ready: {
        title: 'Content Ready',
        description: 'Content type is {detail}; current status is {status}.'
      },
      upload_session: {
        title: 'Upload Session',
        description: 'Upload session recorded: {detail}.'
      },
      expiration_policy: {
        title: 'Expiration Policy',
        description: 'Expiration policy is currently {status}.',
        remaining: '{time} left',
        overdue: '{time} overdue'
      },
      download_limit: {
        title: 'Retrieval Limit',
        description: 'Retrieval limit is currently {status}; {value}.'
      },
      retrieved: {
        title: 'Retrieval History',
        description: 'Retrieved {value}; current status is {status}.'
      }
    },
    headers: {
      select: 'Select',
      code: 'Retrieve Code',
      name: 'Name',
      type: 'Type',
      size: 'Size',
      usage: 'Retrievals',
      status: 'Status',
      description: 'Description',
      expiration: 'Expiration',
      actions: 'Actions'
    },
    sort: {
      createdAt: 'Created Time',
      expiredAt: 'Expiration',
      name: 'Name',
      size: 'Size',
      usedCount: 'Retrievals',
      code: 'Retrieve Code',
      desc: 'Descending',
      asc: 'Ascending'
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
      saveChanges: 'Save Settings',
      refreshConfig: 'Refresh Config',
      refreshing: 'Refreshing',
      saving: 'Saving',
      unsavedChanges: 'Unsaved configuration changes',
      allChangesSaved: 'All configuration changes are saved',
      refreshBlocked: 'Save current changes before refreshing',
      diagnosticsTitle: 'Configuration Checkup',
      diagnosticsDesc:
        'Automatically checks security, storage, upload, and retention policies. Click a suggestion to jump to the related field.',
      diagnosticsRefresh: 'Refresh checkup',
      diagnosticsTotal: 'Suggestions',
      diagnosticsDanger: 'High risk',
      diagnosticsWarning: 'Action needed',
      diagnosticsFocusAction: 'Locate setting',
      diagnosticSeverity: {
        danger: 'High risk',
        warning: 'Action needed',
        success: 'Stable',
        neutral: 'Suggestion'
      },
      diagnosticsItems: {
        default_admin_password: {
          title: 'Default admin password is still in use',
          description:
            'The default admin password is a security risk. Set a strong password as soon as possible.'
        },
        s3_incomplete: {
          title: 'S3 configuration is incomplete',
          description: 'S3 is missing {count} fields. Complete them before enabling object storage.'
        },
        webdav_incomplete: {
          title: 'WebDAV configuration is incomplete',
          description:
            'WebDAV is missing {count} fields. Complete them before enabling remote storage.'
        },
        guest_upload_retention: {
          title: 'Guest uploads have no retention limit',
          description:
            'Guest upload is enabled with unlimited retention. Set a default retention window to reduce storage pressure.'
        },
        chunking_recommended: {
          title: 'Chunked upload is recommended',
          description:
            'Enable chunked upload for large files to improve upload stability and recovery after failures.'
        },
        upload_guard_disabled: {
          title: 'Upload rate limiting is disabled',
          description:
            'Upload count limits are not active. Set an upload window and maximum upload count.'
        },
        access_guard_disabled: {
          title: 'Access protection is disabled',
          description:
            'Error access protection is not active. Set a detection window and maximum error count.'
        },
        expiration_style_empty: {
          title: 'Expiration method is not configured',
          description:
            'Choose a default expiration method so uploaded files are retained or expired as expected.'
        },
        healthy: {
          title: 'Configuration looks stable',
          description: 'No configuration risks need priority attention right now.'
        }
      }
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
      todayShares: 'Today Shares',
      totalRetrievals: 'Total Retrievals',
      activeFiles: 'Active files: {count}',
      todayIncrease: 'Today added: {count}',
      yesterdayShares: 'Yesterday: {count}',
      serverUptime: 'Uptime',
      refresh: 'Refresh',
      fileHealth: 'File Health',
      fileHealthDesc: 'Real file records grouped by availability, expiry, and type.',
      activeFileRatio: 'Active Ratio',
      fileShareRatio: 'File Ratio',
      textShareRatio: 'Text Ratio',
      binaryFiles: '{count} file shares',
      textShares: '{count} text shares',
      expiredFiles: 'Expired Files',
      needCleanup: 'Clean up in file management',
      chunkedFiles: 'Chunked Files',
      storagePolicy: 'Storage & Upload Policy',
      storagePolicyDesc: 'Current settings that affect upload behavior.',
      storageBackend: 'Storage Backend',
      singleFileLimit: 'Single File Limit',
      guestUpload: 'Guest Upload',
      maxSaveTime: 'Max Retention',
      noSaveLimit: 'Unlimited',
      todayCapacityReference: 'Today Size / Single File Limit',
      fileTypeDistribution: 'Type Distribution',
      textType: 'Text',
      recentActivities: 'Recent Activity',
      recentActivitiesDesc: 'Key admin changes for quick operational traceability.',
      operationalInsightsTitle: 'Operational Insights',
      operationalInsightsDesc:
        'Suggested next actions generated from file health, upload policy, and recent capacity.',
      operationalInsightActionSettings: 'Adjust settings',
      operationalInsightActionFileQueue: 'View queue',
      operationalInsightSeverity: {
        danger: 'High risk',
        warning: 'Action needed',
        success: 'Stable',
        neutral: 'Suggestion'
      },
      maintenanceQueueTitle: 'Maintenance Queue',
      maintenanceQueueDesc:
        'Groups file health, retention policy, and upload settings into actionable queues. Click an item to open the related view.',
      maintenanceActionable: 'Actionable',
      maintenanceFileQueue: 'File queue',
      maintenanceSettings: 'Settings',
      maintenanceQueueActionSettings: 'Adjust settings',
      maintenanceQueueActionFileQueue: 'View queue',
      maintenanceQueueItems: {
        storage_issue: {
          title: '{count} storage issues',
          description:
            'Review records missing download metadata and verify storage settings and file details.'
        },
        expired_cleanup: {
          title: '{count} expired items',
          description:
            'Review expired shares, delete stale records, or extend files that should stay available.'
        },
        expiring_soon: {
          title: '{count} expiring soon',
          description: 'These shares will expire soon. Extend them early or notify recipients.'
        },
        never_retrieved: {
          title: '{count} never retrieved',
          description:
            'Review shares that have not been retrieved to identify ineffective uploads or follow-up gaps.'
        },
        permanent_review: {
          title: '{count} permanent shares',
          description:
            'Periodically review long-retention shares to prevent unbounded historical growth.'
        },
        guest_upload_retention: {
          title: 'Guest uploads lack retention limits',
          description:
            'Guest uploads are enabled without a maximum retention period. Add a default retention policy.'
        },
        chunking_disabled: {
          title: 'Large-file experience can improve',
          description:
            "Today's capacity is near the single-file limit. Enable chunked upload for better reliability."
        },
        healthy: {
          title: 'Maintenance queue is stable',
          description: 'No maintenance item needs priority attention right now.'
        }
      },
      viewAllActivities: 'View all',
      activityTimelineTitle: 'Activity Timeline',
      activityTimelineFiltered: 'Current Results',
      activityTimelineStoredTotal: 'Retained Records',
      activityKeyword: 'Keyword',
      activityKeywordPlaceholder: 'Search target, action, or ID',
      activityActionFilter: 'Action',
      activityAllActions: 'All actions',
      activityTargetTypeFilter: 'Target type',
      activityAllTargets: 'All targets',
      activityResetFilters: 'Reset',
      activityRefresh: 'Refresh',
      activityApplyFilters: 'Apply',
      activityLoading: 'Loading activity records...',
      activityNoFiltered: 'No matching activity records',
      activityLoadFailed: 'Failed to load activity timeline',
      noActivities: 'No activity yet',
      activityUnknownTarget: 'Unnamed target',
      activityDescription: 'Target: {target}',
      activityBatchDescription: 'Target: {target}, {count} items',
      activityActions: {
        'file.delete': 'Deleted file',
        'files.batch_delete': 'Batch deleted files',
        'file.update': 'Edited file',
        'files.batch_update': 'Batch updated files',
        'file.policy_action': 'Updated file policy',
        'files.batch_policy_action': 'Batch updated policies',
        'file.metadata_update': 'Updated operations notes',
        'file.view_preset_create': 'Created view preset',
        'file.view_preset_update': 'Updated view preset',
        'file.view_preset_delete': 'Deleted view preset',
        'config.update': 'Updated system settings',
        'local_file.delete': 'Deleted local file',
        'local_file.share': 'Shared local file'
      },
      activityTargetTypes: {
        file: 'File',
        view_preset: 'View preset',
        config: 'System settings',
        local_file: 'Local file',
        system: 'System'
      },
      operationalInsights: {
        storage_issue: {
          title: 'Fix {count} storage issues',
          description:
            'Some records are missing download metadata. Review storage settings and file details first.'
        },
        expired_cleanup: {
          title: 'Clean up {count} expired files',
          description:
            'Expired records add management noise. Delete them in bulk or extend the files that should remain available.'
        },
        expiring_soon: {
          title: '{count} files expiring soon',
          description:
            'These shares will become unavailable soon. Extend them early or notify the recipients.'
        },
        never_retrieved: {
          title: '{count} files never retrieved',
          description:
            'Shares that were never retrieved can reveal ineffective uploads or follow-up gaps.'
        },
        guest_upload_retention: {
          title: 'Guest uploads lack retention limits',
          description:
            'Guest upload is enabled with unlimited retention. Set a default retention window to reduce storage pressure.'
        },
        chunking_disabled: {
          title: 'Consider enabling chunked upload',
          description:
            "Today's added capacity is near the single-file limit. Chunked upload can improve large-file reliability."
        },
        healthy: {
          title: 'Operations look stable',
          description:
            'No high-priority operational risk was detected. Keep watching the file health trend.'
        }
      },
      recentFiles: 'Recent Shares',
      recentFilesDesc: 'Recently created share records for quick status checks.',
      available: 'Available',
      table: {
        file: 'File',
        size: 'Size',
        usage: 'Retrievals',
        status: 'Status'
      }
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
      deleteConfirm: 'Delete this file? This action cannot be undone.',
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
