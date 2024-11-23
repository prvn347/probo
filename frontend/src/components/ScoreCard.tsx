export const ScoreCard = () =>{

    return <div>
         <div className="bg-zinc-900 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">SCORECARD</div>
              <div className="text-sm text-zinc-400">24 days ago</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded-full" />
                <div className="font-medium">BEN</div>
              </div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-2xl font-bold">0</div>
              <div className="flex items-center gap-2">
                <div className="font-medium">MUM</div>
                <div className="w-8 h-8 bg-blue-500 rounded-full" />
              </div>
            </div>
          </div>
    </div>
}