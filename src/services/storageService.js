import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage, DEMO_MODE } from './firebase'

/**
 * Upload a product image to Firebase Storage.
 * Returns download URL or a blob URL in demo mode.
 */
export async function uploadProductImage(file, productId, onProgress) {
  if (DEMO_MODE) {
    // In demo mode return a local object URL
    return URL.createObjectURL(file)
  }

  const ext = file.name.split('.').pop()
  const path = `products/${productId}_${Date.now()}.${ext}`
  const storageRef = ref(storage, path)

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onProgress?.(progress)
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

/**
 * Delete an image from Firebase Storage by its download URL.
 */
export async function deleteProductImage(url) {
  if (DEMO_MODE || !url || url.startsWith('blob:') || url.startsWith('https://images.unsplash.com')) return
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
  } catch (err) {
    console.warn('Could not delete image:', err.message)
  }
}
