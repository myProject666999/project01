export interface CellarSlotWithWine {
  id: number;
  rackNo: number;
  layerNo: number;
  positionNo: number;
  status: 'empty' | 'occupied' | 'approaching' | 'overdue';
  wineId: number | null;
  wine?: {
    chateau: string;
    vintage: number;
    region: string;
    drinkTo: number;
  };
}

export interface CellarLayout {
  totalRacks: number;
  layersPerRack: number;
  positionsPerLayer: number;
}
