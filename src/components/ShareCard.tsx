import React, { useRef } from 'react'
import { Share2 } from 'lucide-react'

interface ShareCardProps {
  username: string
  score: number
  moneySaved: number
  lbsDiverted: number
  streak: number
  mealsCooked: number
  referralCode: string
  rank: string
}

export const ShareCard: React.FC<ShareCardProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Dimensions
    canvas.width = 1080
    canvas.height = 1080

    // Background
    ctx.fillStyle = '#ecfdf5' // emerald-50
    ctx.fillRect(0, 0, 1080, 1080)

    // Border
    ctx.strokeStyle = '#10b981' // emerald-500
    ctx.lineWidth = 40
    ctx.strokeRect(20, 20, 1040, 1040)

    // Logo/Header
    ctx.fillStyle = '#064e3b' // emerald-900
    ctx.font = 'bold 60px Inter, sans-serif'
    ctx.fillText('ScrappyChef', 80, 120)

    // Main Score
    ctx.textAlign = 'center'
    ctx.font = 'bold 80px Inter, sans-serif'
    ctx.fillStyle = '#065f46' // emerald-800
    ctx.fillText('MY SCRAPPY SCORE', 540, 300)

    ctx.font = 'bold 360px Inter, sans-serif'
    ctx.fillStyle = '#10b981' // emerald-500
    ctx.fillText(props.score.toString(), 540, 600)

    // Subtitle
    ctx.font = '50px Inter, sans-serif'
    ctx.fillStyle = '#064e3b'
    ctx.fillText(`I saved $${props.moneySaved.toFixed(2)} with ScrappyChef!`, 540, 700)

    // Rank
    ctx.font = 'bold 60px Inter, sans-serif'
    ctx.fillStyle = '#10b981'
    ctx.fillText(`RANK: ${props.rank.toUpperCase()}`, 540, 770)

    // Stats Row
    const stats = [
      { label: 'Lbs Saved', val: props.lbsDiverted.toFixed(1) },
      { label: 'Streak', val: `${props.streak}d` },
      { label: 'Meals', val: props.mealsCooked }
    ]

    stats.forEach((stat, i) => {
      const x = 270 + i * 270
      ctx.font = 'bold 60px Inter, sans-serif'
      ctx.fillText(stat.val.toString(), x, 820)
      ctx.font = '40px Inter, sans-serif'
      ctx.fillStyle = '#6b7280' // gray-500
      ctx.fillText(stat.label, x, 870)
      ctx.fillStyle = '#064e3b'
    })

    // Referral Code
    ctx.fillStyle = '#10b981'
    ctx.fillRect(0, 960, 1080, 120)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 50px Inter, sans-serif'
    ctx.fillText(`USE CODE: ${props.referralCode}`, 540, 1035)

    return canvas.toDataURL('image/png')
  }

  const handleShare = async () => {
    const dataUrl = generateImage()
    if (!dataUrl) return

    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'scrappy-score.png', { type: 'image/png' })

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Scrappy Score',
          text: `Check out my Scrappy Score on ScrappyChef! I've saved $${props.moneySaved.toFixed(2)} so far.`,
          files: [file],
          url: window.location.origin
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback: download
      const link = document.createElement('a')
      link.download = 'scrappy-score.png'
      link.href = dataUrl
      link.click()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button 
        onClick={handleShare}
        className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition shadow-lg"
      >
        <Share2 size={20} />
        Share Your Score
      </button>
      <p className="text-xs text-gray-500">Auto-generates your Scrappy Hall of Fame card</p>
    </div>
  )
}
