export const formatFileSize = (bytesInput: string) => {
  var bytes = parseInt(bytesInput, 10);
  if (bytes < 1024) return bytes + " Bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MB";
  else return (bytes / 1073741824).toFixed(3) + " GB";
}

export const isImage = (fileName: string) => {
  const ext = fileName.split('.').pop();
  return ext && ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
}

export const isVideo = (fileName: string) => {
  const ext = fileName.split('.').pop();
  return ext && ['mp4'].includes(ext);
}

export const isDownload = (fileName: string) => {
  return !isImage(fileName) && !isVideo(fileName);
}