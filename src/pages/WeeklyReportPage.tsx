import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { getLowStockItems, InventoryItem } from '../utils/db';
import { generateAndDownloadPurchaseList } from '../utils/generateMarkdown';
import { useLanguage } from '../i18n/LanguageContext';
import { PageLayout } from '../components/PageLayout';
import { StatCard } from '../components/StatCard';

export const WeeklyReportPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStockItems();
  }, []);

  const loadLowStockItems = async () => {
    setLoading(true);
    const items = await getLowStockItems();
    setLowStockItems(items);
    setLoading(false);
  };

  const handleGenerateReport = async () => {
    if (lowStockItems.length === 0) {
      alert(t.reports.noLowStock);
      return;
    }
    await generateAndDownloadPurchaseList(lowStockItems, language);
    alert(t.inventory.purchaseListGenerated);
  };

  const getCategoryCount = (categoryKey: string) => {
    return lowStockItems.filter(item => item.category === categoryKey).length;
  };

  // Helper function to get translated category name
  const getCategoryLabel = (categoryKey: string): string => {
    const categoryMap: { [key: string]: string } = {
      'ingredients': t.inventory.categories.ingredients,
      'supplies': t.inventory.categories.supplies,
      'cleaning': t.inventory.categories.cleaning,
      'equipment': t.inventory.categories.equipment,
      'other': t.inventory.categories.other,
    };
    return categoryMap[categoryKey] || categoryKey;
  };

  // Helper function to get translated unit name
  const getUnitLabel = (unitKey: string): string => {
    const unitMap: { [key: string]: string } = {
      'kg': 'kg',
      'g': 'g',
      'liter': t.inventory.units.liter,
      'bottle': t.inventory.units.bottle,
      'piece': t.inventory.units.piece,
      'pack': t.inventory.units.pack,
      'strip': t.inventory.units.strip,
      // Legacy Chinese keys for backward compatibility
      '升': t.inventory.units.liter,
      '瓶': t.inventory.units.bottle,
      '个': t.inventory.units.piece,
      '包': t.inventory.units.pack,
      '条': t.inventory.units.strip,
    };
    return unitMap[unitKey] || unitKey;
  };

  const urgentItemsCount = lowStockItems.filter(item => item.quantity <= item.threshold / 2).length;
  const affectedCategoriesCount = ['ingredients', 'supplies', 'cleaning', 'equipment', 'other']
    .filter(category => getCategoryCount(category) > 0).length;

  return (
    <PageLayout>
      {/* Header */}
      <div className="max-w-3xl mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-coffee-700 flex items-center gap-2">
          <Icon name="assessment" size={28} />
          {t.reports.title}
        </h1>
        <p className="text-sm text-coffee-500 mt-1">{t.reports.subtitle}</p>
      </div>

      <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Summary Card */}
      <Card className="mb-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard label={t.reports.lowStockCount} value={lowStockItems.length} tone="danger" />
          <StatCard label={t.reports.categoryBreakdown} value={affectedCategoriesCount} tone="info" />
          <StatCard label={t.reports.needRestock} value={urgentItemsCount} tone="success" />
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="mb-0" title={t.reports.categoryBreakdown}>
        <div className="space-y-2">
          {[
            { key: 'ingredients', icon: 'grass' },
            { key: 'supplies', icon: 'inventory_2' },
            { key: 'cleaning', icon: 'cleaning_services' },
            { key: 'equipment', icon: 'hardware' },
            { key: 'other', icon: 'more_horiz' }
          ].map((cat) => {
            const count = getCategoryCount(cat.key);

            return (
              <div key={cat.key} className="flex items-center justify-between">
                <span className="text-coffee-600 flex items-center gap-2">
                  <Icon name={cat.icon} size={18} />
                  {getCategoryLabel(cat.key)}
                </span>
                <span className={`font-bold ${count > 0 ? 'text-red-600' : 'text-coffee-400'}`}>
                  {count} {t.inventory.items}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      </div>

      {/* Generate Button */}
      <Button
        variant="primary"
        className="w-full sm:w-auto mb-6 flex items-center justify-center gap-2"
        onClick={handleGenerateReport}
        disabled={loading}
      >
        <Icon name="download" size={20} />
        <span>{t.reports.generateDownload}</span>
      </Button>

      {/* Low Stock Items List */}
      {loading ? (
        <Card>
          <div className="text-center py-8 text-coffee-400">
            <Icon name="hourglass_empty" size={48} className="mx-auto mb-2" />
            <p>{t.common.loading}</p>
          </div>
        </Card>
      ) : lowStockItems.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-coffee-400">
            <Icon name="check_circle" size={48} className="mx-auto mb-2 text-green-500" />
            <p className="font-semibold text-coffee-600">{t.reports.stockSufficient}</p>
            <p className="text-sm mt-1">{t.reports.noLowStockDesc}</p>
          </div>
        </Card>
      ) : (
        <div className="max-w-3xl mt-4">
          <h2 className="text-lg font-semibold text-coffee-700 mb-3 flex items-center gap-2">
            <Icon name="warning" size={24} className="text-red-600" />
            <span>{t.reports.lowStockList}</span>
          </h2>
          <div className="space-y-4">
            {lowStockItems.map(item => {
              const suggestedQuantity = Math.max(item.threshold * 2 - item.quantity, item.threshold);
              
              return (
                <Card key={item.id} className="border-2 border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-coffee-700">{item.name}</h3>
                        <span className="text-xs text-coffee-400 px-2 py-0.5 bg-cream-100 rounded">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-coffee-400">{t.reports.currentStock}：</span>
                          <span className="text-red-600 font-bold">
                            {item.quantity} {getUnitLabel(item.unit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-coffee-400">{t.reports.suggestedPurchase}：</span>
                          <span className="text-green-600 font-bold">
                            {suggestedQuantity} {getUnitLabel(item.unit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="max-w-3xl mt-4 bg-cream-100">
        <div className="text-sm text-coffee-600 space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <Icon name="lightbulb" size={18} />
            <span>{t.reports.usageInstructions}</span>
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs ml-4">
            <li>{t.reports.instructions.autoDetect}</li>
            <li>{t.reports.instructions.clickGenerate}</li>
            <li>{t.reports.instructions.suggestedQty}</li>
            <li>{t.reports.instructions.weeklyCheck}</li>
          </ul>
        </div>
      </Card>
    </PageLayout>
  );
};


