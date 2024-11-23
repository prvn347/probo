import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const mockOrderBook = {
  BTCUSD: {
    yes: {
      "40000": {
        total: 10,
        orders: [
          { quantity: 5, userId: "user1", type: "buy" },
          { quantity: 5, userId: "user2", type: "buy" },
        ],
      },
      "41000": {
        total: 15,
        orders: [
          { quantity: 10, userId: "user3", type: "buy" },
          { quantity: 5, userId: "user4", type: "buy" },
        ],
      },
    },
    no: {
      "42000": {
        total: 8,
        orders: [
          { quantity: 3, userId: "user5", type: "sell" },
          { quantity: 5, userId: "user6", type: "sell" },
        ],
      },
      "43000": {
        total: 12,
        orders: [
          { quantity: 7, userId: "user7", type: "sell" },
          { quantity: 5, userId: "user8", type: "sell" },
        ],
      },
    },
  },
};

export const OrderbookChart = () => {
  return (
    <div>
      <Tabs defaultValue="orderbook">
        <TabsList>
          <TabsTrigger value="orderbook">Orderbook</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="orderbook" className="space-y-4">
          <div className="flex gap-4 border-b">
            <Button variant="link" className="font-semibold">
              Order Book
            </Button>
            <Button variant="link" className="text-muted-foreground">
              Activity
            </Button>
          </div>
          <div className="border rounded-lg">
            <div className="grid grid-cols-3 p-4 border-b bg-muted/50">
              <div>PRICE</div>
              <div>QTY AT YES</div>
              <div>QTY AT NO</div>
            </div>
            <div className="divide-y">
              {[
                { price: 7, qtyYes: 101683, qtyNo: 146015 },
                { price: 7.5, qtyYes: 128315, qtyNo: 101504 },
                { price: 8, qtyYes: 11262, qtyNo: 7266 },
                { price: 8.5, qtyYes: 10307, qtyNo: 9282 },
                { price: 9, qtyYes: 15008, qtyNo: 7262 },
              ].map((row) => (
                <div key={row.price} className="grid grid-cols-3 p-4">
                  <div>{row.price}</div>
                  <div className="relative">
                    {row.qtyYes}
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-100/50"
                      style={{
                        width: `${(row.qtyYes / 150000) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="relative">
                    {row.qtyNo}
                    <div
                      className="absolute inset-y-0 left-0 bg-red-100/50"
                      style={{
                        width: `${(row.qtyNo / 150000) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
