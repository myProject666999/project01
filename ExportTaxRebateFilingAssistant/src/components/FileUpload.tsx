import { useState, useCallback, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => Promise<unknown>
  accept?: string
  title?: string
}

export default function FileUpload({ onUpload, accept = '.csv', title = '上传CSV文件' }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndUpload = useCallback(
    async (file: File) => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      if (!accept.split(',').map((a) => a.trim()).includes(ext)) {
        setResult({ success: false, message: `仅支持 ${accept} 格式文件` })
        return
      }
      setUploading(true)
      setResult(null)
      try {
        const res = await onUpload(file)
        const count = (res as { count?: number })?.count
        setResult({ success: true, message: count != null ? `成功导入 ${count} 条记录` : '上传成功' })
      } catch (err) {
        setResult({ success: false, message: (err as Error).message || '上传失败' })
      } finally {
        setUploading(false)
      }
    },
    [onUpload, accept]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) validateAndUpload(file)
    },
    [validateAndUpload]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) validateAndUpload(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [validateAndUpload]
  )

  return (
    <div className="mb-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors',
          dragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
        {uploading ? (
          <>
            <Loader2 size={32} className="text-primary-500 animate-spin mb-2" />
            <p className="text-sm text-gray-500">正在上传...</p>
          </>
        ) : (
          <>
            <Upload size={32} className="text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xs text-gray-400 mt-1">拖拽文件到此处或点击选择文件（支持 {accept} 格式）</p>
          </>
        )}
      </div>

      {result && (
        <div
          className={cn(
            'flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-sm',
            result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}
        >
          {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
