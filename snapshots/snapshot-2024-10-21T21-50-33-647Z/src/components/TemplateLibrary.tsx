import React, { useState, useRef, useEffect } from 'react'

interface Template {
  id: string;
  name: string;
  thumbnail: string;
  sceneData: {
    shapes: any[];
    camera: any;
    duration: number;
  };
}

interface TemplateLibraryProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ templates, onSelectTemplate }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (hoveredTemplate) {
      const template = templates.find(t => t.id === hoveredTemplate)
      if (template) {
        animateTemplate(template)
      }
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [hoveredTemplate, templates])

  const animateTemplate = (template: Template) => {
    let frame = 0
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw shapes
      template.sceneData.shapes.forEach(shape => {
        const keyframe = shape.keyframes.find((kf: any) => kf.frame === frame) || shape.keyframes[0]
        ctx.save()
        ctx.translate(keyframe.x, keyframe.y)
        ctx.rotate((keyframe.rotation * Math.PI) / 180)
        ctx.scale(keyframe.scale, keyframe.scale)
        
        if (shape.type === 'image' && shape.image) {
          const img = new Image()
          img.src = shape.image
          ctx.drawImage(img, -shape.width / 2, -shape.height / 2, shape.width, shape.height)
        } else {
          ctx.fillStyle = shape.color
          ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)
        }
        
        ctx.restore()
      })

      frame = (frame + 1) % template.sceneData.duration
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
  }

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Template Library</h3>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => (
          <div 
            key={template.id} 
            className="cursor-pointer hover:bg-gray-100 p-2 rounded relative"
            onClick={() => onSelectTemplate(template)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {hoveredTemplate === template.id ? (
              <canvas 
                ref={canvasRef} 
                width={100} 
                height={100} 
                className="w-full h-auto"
              />
            ) : (
              <img src={template.thumbnail} alt={template.name} className="w-full h-auto" />
            )}
            <p className="mt-1 text-center text-sm">{template.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TemplateLibrary