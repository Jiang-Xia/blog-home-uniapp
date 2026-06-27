/**
 * 分片上传 composable — 对齐 blog-home-nuxt/pages/tool/upload-slice/index.vue
 */
import SparkMD5 from 'spark-md5'
import { checkFile, mergeFile, uploadFileChunk } from '@/api/tool'

const CHUNK_SIZE = 2097152
const MAX_CONCURRENCY = 3

export interface UploadChunk {
  hash: string
  index: number
  fileName: string
  file: Blob | string
}

/** 大文件分片上传 */
export function useUploadSlice() {
  const fileName = ref('')
  const fileHash = ref('')
  const loading = ref(false)
  const starting = ref(false)
  const chunkTotal = ref(0)
  const curProgress = ref(0)
  const stopUpload = ref(false)

  const progressValue = computed(() => {
    if (!chunkTotal.value)
      return 0
    return Math.round((curProgress.value / chunkTotal.value) * 100)
  })

  const statusLabel = computed(() => {
    if (progressValue.value === 100)
      return '完成'
    return starting.value ? '上传中' : '已暂停'
  })

  /** H5：File 分片 + MD5 */
  async function createChunksFromFile(file: File): Promise<{ chunkList: UploadChunk[], hash: string }> {
    const spark = new SparkMD5.ArrayBuffer()
    const chunkList: UploadChunk[] = []
    let index = 0
    for (let start = 0; start < file.size; start += CHUNK_SIZE) {
      const chunk = file.slice(start, start + CHUNK_SIZE)
      const buffer = await chunk.arrayBuffer()
      spark.append(buffer)
      chunkList.push({
        hash: '',
        index,
        fileName: file.name,
        file: chunk,
      })
      index++
    }
    const hash = spark.end()
    chunkList.forEach(c => (c.hash = hash))
    return { chunkList, hash }
  }

  /** 小程序：tempFilePath 分片读取 */
  async function createChunksFromPath(path: string, name: string, size: number): Promise<{ chunkList: UploadChunk[], hash: string }> {
    const fs = uni.getFileSystemManager()
    const spark = new SparkMD5.ArrayBuffer()
    const chunkList: UploadChunk[] = []
    let index = 0
    for (let start = 0; start < size; start += CHUNK_SIZE) {
      const length = Math.min(CHUNK_SIZE, size - start)
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        fs.readFile({
          filePath: path,
          position: start,
          length,
          success: res => resolve(res.data as ArrayBuffer),
          fail: reject,
        })
      })
      spark.append(buffer)
      const tempPath = await writeChunkTemp(buffer, `${name}.${index}`)
      chunkList.push({ hash: '', index, fileName: name, file: tempPath })
      index++
    }
    const hash = spark.end()
    chunkList.forEach(c => (c.hash = hash))
    return { chunkList, hash }
  }

  function writeChunkTemp(buffer: ArrayBuffer, name: string): Promise<string> {
    const fs = uni.getFileSystemManager()
    const path = `${(uni as any).env.USER_DATA_PATH}/${Date.now()}-${name}`
    return new Promise((resolve, reject) => {
      fs.writeFile({
        filePath: path,
        data: buffer,
        success: () => resolve(path),
        fail: reject,
      })
    })
  }

  async function uploadChunks(chunks: UploadChunk[]) {
    let cursor = 0
    const workers = Array.from({ length: MAX_CONCURRENCY }, async () => {
      while (cursor < chunks.length && !stopUpload.value) {
        const i = cursor++
        const chunk = chunks[i]!
        await uploadFileChunk({
          hash: chunk.hash,
          index: chunk.index,
          fileName: chunk.fileName,
          file: chunk.file,
        })
        curProgress.value++
      }
    })
    await Promise.all(workers)
  }

  async function uploadFileSource(file: File | null, path?: string, size?: number, name?: string) {
    loading.value = true
    starting.value = true
    stopUpload.value = false
    curProgress.value = 0

    try {
      let chunkList: UploadChunk[] = []
      let hash = ''
      // #ifdef H5
      if (!file)
        return
      fileName.value = file.name
      const h5Result = await createChunksFromFile(file)
      chunkList = h5Result.chunkList
      hash = h5Result.hash
      // #endif
      // #ifndef H5
      if (!path || !size || !name)
        return
      fileName.value = name
      const mpResult = await createChunksFromPath(path, name, size)
      chunkList = mpResult.chunkList
      hash = mpResult.hash
      // #endif

      fileHash.value = hash
      chunkTotal.value = chunkList.length

      const check = await checkFile({ hash })
      if (check.isExist) {
        uni.showToast({ title: '文件已存在', icon: 'none' })
        return
      }
      const uploaded = new Set(check.chunks ?? [])
      curProgress.value = uploaded.size
      const pending = chunkList.filter(c => !uploaded.has(c.index))
      await uploadChunks(pending)
      if (stopUpload.value)
        return
      await mergeFile({ chunks: chunkTotal.value, fileName: fileName.value, hash })
      uni.showToast({ title: '上传成功', icon: 'success' })
    }
    catch {
      uni.showToast({ title: '上传失败', icon: 'none' })
    }
    finally {
      loading.value = false
      starting.value = false
    }
  }

  function pickFileH5() {
    // #ifdef H5
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file)
        void uploadFileSource(file)
    }
    input.click()
    // #endif
  }

  function pickFileMp() {
    // #ifndef H5
    uni.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const f = res.tempFiles[0]
        if (f)
          void uploadFileSource(null, f.path, f.size, f.name)
      },
    })
    // #endif
  }

  function pickFile() {
    // #ifdef H5
    pickFileH5()
    // #endif
    // #ifndef H5
    pickFileMp()
    // #endif
  }

  function togglePause() {
    if (starting.value)
      stopUpload.value = true
    starting.value = !starting.value
  }

  return {
    fileName,
    fileHash,
    loading,
    starting,
    chunkTotal,
    curProgress,
    progressValue,
    statusLabel,
    pickFile,
    togglePause,
  }
}
