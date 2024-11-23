import React from 'react'
import { Button } from './ui/button'
import { Info } from 'lucide-react'

export const MatchHeader = () => {
  return (
    <div>
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
              <img
                src="https://probo.in/_next/image?url=https%3A%2F%2Fprobo.gumlet.io%2Fimage%2Fupload%2Fprobo_product_images%2FIMAGE_7c6faa25-de22-4db9-93f7-5375789fad45.png&w=96&q=75"
                alt="Match thumbnail"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Mumbai to win the kabaddi match against Bengaluru?
              </h1>
              <Button variant="ghost" size="sm" className="mt-2">
                <Info className="w-4 h-4 mr-2" />
                More Info
              </Button>
            </div>
          </div>
    </div>
  )
}
