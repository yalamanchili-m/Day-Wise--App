import React, { useMemo, useState } from 'react';
import { Package, ShoppingBag, CheckCircle, Circle } from 'lucide-react';

const GroceryList = ({ items }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (name) => {
    setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Helper to normalize and sum ingredients
  const aggregatedData = useMemo(() => {
    const totals = {};

    items.forEach(item => {
      // 1. Normalize Name (Handle "Eggs" vs "Egg")
      let name = item.name.toLowerCase().trim();
      if (name.endsWith('s') && name.length > 3) name = name.slice(0, -1);
      
      const unit = item.unit.toLowerCase().trim();
      let amount = item.amount;
      let targetUnit = 'units';

      // 2. Unit Conversion Logic
      // We convert everything to a "base" unit per category
      if (['tablespoon', 'tbsp', 'stick', 'cup', 'ml', 'teaspoon', 'tsp'].some(u => unit.includes(u))) {
        targetUnit = 'cups';
        if (unit.includes('tablespoon') || unit === 'tbsp') amount = amount / 16;
        if (unit.includes('teaspoon') || unit === 'tsp') amount = amount / 48;
        if (unit.includes('stick')) amount = amount / 2; // 1 stick = 0.5 cup
        if (unit.includes('ml')) amount = amount / 236.6;
        // if already cup, amount stays as is
      } else if (['large', 'small', 'medium', 'unit', ''].some(u => unit.includes(u))) {
        targetUnit = 'pieces';
      } else {
        targetUnit = unit; // Keep weight units (g, oz) as they are
      }

      const key = `${name}-${targetUnit}`;

      if (!totals[key]) {
        totals[key] = { ...item, name, unit: targetUnit, amount: 0 };
      }
      totals[key].amount += amount;
    });

    // Grouping by Aisle
    return Object.values(totals).reduce((acc, item) => {
      const aisle = item.aisle || 'General';
      if (!acc[aisle]) acc[aisle] = [];
      acc[aisle].push(item);
      return acc;
    }, {});
  }, [items]);

  const aisles = Object.keys(aggregatedData).sort();

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Grocery List</h2>
          <p className="text-slate-500 text-sm">Quantities are combined and rounded.</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg">
          <ShoppingBag size={14} /> Consolidating {items.length} items
        </div>
      </div>

      <div className="space-y-12">
        {aisles.map((aisle) => (
          <section key={aisle}>
            <h3 className="sticky top-16 bg-slate-50/95 backdrop-blur-md py-4 z-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 border-b border-slate-200 px-2 flex items-center gap-2">
              <Package size={14} className="text-blue-500" /> {aisle}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aggregatedData[aisle].map((item, idx) => {
                const isChecked = checkedItems[item.name];
                
                // Pretty format for display
                let displayQty = `${Math.ceil(item.amount)} ${item.unit}`;
                if (item.unit === 'cups' && item.amount < 1) {
                   displayQty = `${(item.amount * 16).toFixed(0)} tbsp`;
                }

                return (
                  <div 
                    key={idx}
                    onClick={() => toggleItem(item.name)}
                    className={`flex justify-between items-center p-5 rounded-[2rem] border-2 transition-all cursor-pointer select-none
                      ${isChecked ? 'bg-slate-100 border-transparent' : 'bg-white border-slate-50 shadow-sm hover:shadow-xl hover:border-blue-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      {isChecked ? (
                        <CheckCircle className="text-emerald-500" size={24} fill="currentColor" fillOpacity="0.1" />
                      ) : (
                        <Circle className="text-slate-200" size={24} />
                      )}
                      <span className={`text-sm font-bold capitalize ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black transition-colors ${isChecked ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                      {displayQty}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default GroceryList;