export async function urlToBase64(url: string): Promise<string> {
  if (!url) {
    throw new Error('No URL provided')
  }

  try {
    // For data URLs, return as is
    if (url.startsWith('data:')) {
      return url
    }

    // Create a proxy URL to handle CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        'Accept': 'image/*'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    if (blob.size === 0) {
      throw new Error('Empty image data received')
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Invalid image data format'))
          return
        }
        resolve(reader.result)
      }

      reader.onerror = () => {
        reject(new Error('Failed to read image data: ' + reader.error?.message))
      }

      reader.readAsDataURL(blob)
    })
  } catch (error) {
    // Try direct fetch if proxy fails
    try {
      const directResponse = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          'Accept': 'image/*'
        }
      })
      
      const blob = await directResponse.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (directError) {
      throw new Error('Failed to load image. Please try again.')
    }
  }
}

export function validateImageUrl(url: string): boolean {
  return (
    url.startsWith('data:image/') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  )
}

export function createImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    
    if (url.startsWith('data:')) {
      img.src = url
    } else {
      // Use proxy for non-data URLs
      img.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    }
  })
}

export async function resizeImage(
  imageUrl: string, 
  maxWidth: number = 800, 
  maxHeight: number = 800
): Promise<string> {
  const img = await createImageFromUrl(imageUrl)
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  let width = img.width
  let height = img.height

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width)
      width = maxWidth
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height)
      height = maxHeight
    }
  }

  canvas.width = width
  canvas.height = height

  ctx.drawImage(img, 0, 0, width, height)
  
  return canvas.toDataURL('image/png')
}