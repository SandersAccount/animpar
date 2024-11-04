export class ImageLoader {
  private loadedImages: Record<number, HTMLImageElement> = {}
  private loadCallbacks: Set<() => void> = new Set()

  loadImage(id: number, src: string): HTMLImageElement | null {
    if (this.loadedImages[id]) {
      return this.loadedImages[id]
    }

    const img = new Image()
    img.src = src
    img.onload = () => {
      this.loadedImages[id] = img
      this.notifyLoadCallbacks()
    }
    return null
  }

  getImage(id: number): HTMLImageElement | null {
    return this.loadedImages[id] || null
  }

  onLoad(callback: () => void): () => void {
    this.loadCallbacks.add(callback)
    return () => this.loadCallbacks.delete(callback)
  }

  private notifyLoadCallbacks() {
    this.loadCallbacks.forEach(callback => callback())
  }
}