import React, { useState } from 'react'
import { Button } from './ui/button'
import { ChevronDown, Info, Minus, Plus } from 'lucide-react'

export const BettingControl = () => {

    const [quantity, setQuantity] = useState(1)
    const [price, setPrice] = useState(7.0)
  return (
    <div> <div className="border rounded-lg p-4 space-y-4">
    <div className="grid grid-cols-2 gap-2">
      <Button variant="outline" className="bg-blue-50">
        Yes ₹7.0
      </Button>
      <Button variant="outline" className="bg-red-50">
        No ₹3.0
      </Button>
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Price</div>
        <div className="text-sm text-muted-foreground">
          101683 qty available
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPrice((p) => Math.max(0, p - 0.5))}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <input
          type="number"
          value={9}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          className="flex-1 border rounded px-3 py-2 text-center"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPrice((p) => p + 0.5)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>

    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Quantity</div>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="flex-1 border rounded px-3 py-2 text-center"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity((q) => q + 1)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 py-2">
      <div>
        <div className="text-sm text-muted-foreground">You put</div>
        <div className="font-medium">₹{price.toFixed(1)}</div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground">You get</div>
        <div className="font-medium text-green-600">₹10.0</div>
      </div>
    </div>

    <Button variant="outline" className="w-full justify-between">
      Advanced Options
      <ChevronDown className="w-4 h-4" />
    </Button>

    <Button className="w-full">Place order</Button>
    </div>
    </div>
  )
}
