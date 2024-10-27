import SparkMD5 from 'spark-md5';

const spark = new SparkMD5.ArrayBuffer(); // 在 Worker 中创建一个实例

self.onmessage = async (e: MessageEvent) => {
  try {
    const chunk = e.data;
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        spark.append(arrayBuffer); // 追加当前块的哈希
        const hash = spark.end(); // 每次读取完块时更新哈希
        self.postMessage(hash);
      } catch (error) {
        self.postMessage({ error: '计算哈希值失败' });
      }
    };

    reader.onerror = () => {
      self.postMessage({ error: '读取文件块失败' });
    };

    reader.readAsArrayBuffer(chunk);
  } catch (error) {
    self.postMessage({ error: '处理文件块失败' });
  }
};
