import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ExtractedItem, Person } from '@/types';

interface BillStore {
  // State
  people: Person[];
  items: ExtractedItem[];
  shares: number[][]; // shares[itemIndex][personIndex]
  taxAmount: number;
  
  // Actions
  addPerson: (name: string) => void;
  removePerson: (personId: string) => void;
  setItems: (items: ExtractedItem[]) => void;
  updateShare: (itemIndex: number, personIndex: number, share: number) => void;
  setTaxAmount: (amount: number) => void;
  reset: () => void;
  
  // Computed getters
  getPersonSubtotal: (personIndex: number) => number;
  getTotalSubtotal: () => number;
  getUnassignedQuantity: (itemIndex: number) => number;
  isAllItemsAssigned: () => boolean;
}

export const useBillStore = create<BillStore>()(
  devtools((set, get) => ({
    // Initial state
    people: [],
    items: [],
    shares: [],
    taxAmount: 0,
    
    // Actions
    addPerson: (name: string) => {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: name.trim(),
      };
      
      set((state) => {
        const newPeople = [...state.people, newPerson];
        // Extend shares matrix for new person
        const newShares = state.shares.map(itemShares => [...itemShares, 0]);
        
        return {
          people: newPeople,
          shares: newShares,
        };
      });
    },
    
    removePerson: (personId: string) => {
      set((state) => {
        const personIndex = state.people.findIndex(p => p.id === personId);
        if (personIndex === -1) return state;
        
        const newPeople = state.people.filter(p => p.id !== personId);
        // Remove person's column from shares matrix
        const newShares = state.shares.map(itemShares => 
          itemShares.filter((_, index) => index !== personIndex)
        );
        
        return {
          people: newPeople,
          shares: newShares,
        };
      });
    },
    
    setItems: (items: ExtractedItem[]) => {
      set((state) => {
        // Initialize shares matrix: items x people, all zeros
        const newShares = items.map(() => new Array(state.people.length).fill(0));
        
        return {
          items,
          shares: newShares,
        };
      });
    },
    
    updateShare: (itemIndex: number, personIndex: number, share: number) => {
      set((state) => {
        const newShares = [...state.shares];
        if (!newShares[itemIndex]) {
          newShares[itemIndex] = new Array(state.people.length).fill(0);
        }
        // Round to 2 decimal places to prevent floating point precision issues
        newShares[itemIndex][personIndex] = Math.max(0, Math.round(share * 100) / 100);
        
        return { shares: newShares };
      });
    },
    
    setTaxAmount: (amount: number) => {
      set({ taxAmount: Math.max(0, amount) });
    },
    
    reset: () => {
      set({
        people: [],
        items: [],
        shares: [],
        taxAmount: 0,
      });
    },
    
    // Computed getters
    getPersonSubtotal: (personIndex: number) => {
      const { items, shares } = get();
      return items.reduce((total, item, itemIndex) => {
        const personShare = shares[itemIndex]?.[personIndex] || 0;
        return total + (personShare * item.unit_price);
      }, 0);
    },
    
    getTotalSubtotal: () => {
      const { people } = get();
      return people.reduce((total, _, personIndex) => {
        return total + get().getPersonSubtotal(personIndex);
      }, 0);
    },
    
    getUnassignedQuantity: (itemIndex: number) => {
      const { items, shares } = get();
      const item = items[itemIndex];
      if (!item) return 0;
      
      const assignedQuantity = shares[itemIndex]?.reduce((sum, share) => sum + share, 0) || 0;
      return item.quantity - assignedQuantity;
    },
    
    isAllItemsAssigned: () => {
      const { items } = get();
      return items.every((_, itemIndex) => {
        return Math.abs(get().getUnassignedQuantity(itemIndex)) < 0.01; // Allow small floating point errors
      });
    },
  }))
);
