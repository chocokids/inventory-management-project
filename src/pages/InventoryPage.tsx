import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input, Select } from '../components/Input';
import { Icon } from '../components/Icon';
import {
  InventoryItem,
  getAllInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
} from '../utils/db';
import { generateAndDownloadPurchaseList } from '../utils/generateMarkdown';
import { PageLayout } from '../components/PageLayout';
import { useLanguage } from '../i18n/LanguageContext';

export const InventoryPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLowStock, setFilterLowStock] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'kg',
    threshold: 5,
    category: 'ingredients',
    imageUrl: '',
  });

  // Category keys are language-independent, we translate them on display
  const categories = [
    { value: 'ingredients', label: `🌱 ${t.inventory.categories.ingredients}` },
    { value: 'supplies', label: `📦 ${t.inventory.categories.supplies}` },
    { value: 'cleaning', label: `🧹 ${t.inventory.categories.cleaning}` },
    { value: 'equipment', label: `🔧 ${t.inventory.categories.equipment}` },
    { value: 'other', label: `📌 ${t.inventory.categories.other}` },
  ];

  const units = [
    { value: 'kg', label: t.inventory.units.kg },
    { value: 'g', label: t.inventory.units.g },
    { value: 'liter', label: t.inventory.units.liter },
    { value: 'bottle', label: t.inventory.units.bottle },
    { value: 'piece', label: t.inventory.units.piece },
    { value: 'pack', label: t.inventory.units.pack },
    { value: 'strip', label: t.inventory.units.strip },
  ];

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

  // Helper function to get translated category name
  const getCategoryLabel = (categoryKey: string): string => {
    const categoryMap: { [key: string]: string } = {
      'all': t.inventory.categories.all,
      'ingredients': t.inventory.categories.ingredients,
      'supplies': t.inventory.categories.supplies,
      'cleaning': t.inventory.categories.cleaning,
      'equipment': t.inventory.categories.equipment,
      'other': t.inventory.categories.other,
    };
    return categoryMap[categoryKey] || categoryKey;
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, filterCategory, filterLowStock, searchKeyword]);

  const loadInventory = async () => {
    const items = await getAllInventory();
    setInventory(items);
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    // 按关键字搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
      );
    }

    // 按类别筛选
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // 按低库存筛选
    if (filterLowStock) {
      filtered = filtered.filter(item => item.quantity <= item.threshold);
    }

    // 排序：低库存商品优先显示
    filtered.sort((a, b) => {
      const aIsLowStock = a.quantity <= a.threshold;
      const bIsLowStock = b.quantity <= b.threshold;
      
      // 低库存商品排在前面
      if (aIsLowStock && !bIsLowStock) return -1;
      if (!aIsLowStock && bIsLowStock) return 1;
      
      // 如果都是低库存或都不是低库存，按库存量从低到高排序
      if (aIsLowStock && bIsLowStock) {
        return a.quantity - b.quantity;
      }
      
      // 正常库存按名称排序
      return a.name.localeCompare(b.name);
    });

    setFilteredInventory(filtered);
  };

  const resetFilters = () => {
    setFilterCategory('all');
    setFilterLowStock(false);
    setSearchKeyword('');
  };

  const hasActiveFilters = () => {
    return filterCategory !== 'all' || filterLowStock || searchKeyword.trim() !== '';
  };

  const getFilteredCount = () => {
    return filteredInventory.length;
  };

  const getLowStockCount = () => {
    return inventory.filter(item => item.quantity <= item.threshold).length;
  };

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        threshold: item.threshold,
        category: item.category,
        imageUrl: item.imageUrl || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        quantity: 0,
        unit: 'kg',
        threshold: 5,
        category: 'ingredients',
        imageUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem?.id) {
      await updateInventoryItem(editingItem.id, formData);
    } else {
      await addInventoryItem({
        ...formData,
        lastUpdated: new Date(),
      });
    }
    
    await loadInventory();
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    
    const confirmMessage = `${t.inventory.deleteConfirm}\n\n${t.inventory.productName}: ${item.name}\n${t.inventory.stock}: ${item.quantity} ${getUnitLabel(item.unit)}\n${t.inventory.thresholdLabel}: ${item.threshold} ${getUnitLabel(item.unit)}`;
    
    if (window.confirm(confirmMessage)) {
      await deleteInventoryItem(id);
      await loadInventory();
    }
  };

  const handleGeneratePurchaseList = async () => {
    const lowStock = await getLowStockItems();
    if (lowStock.length === 0) {
      alert(`✅ ${t.reports.noLowStock}`);
      return;
    }
    await generateAndDownloadPurchaseList(lowStock, language);
    alert(`✅ ${t.reports.reportGenerated}`);
  };

  const isLowStock = (item: InventoryItem) => item.quantity <= item.threshold;

  return (
    <PageLayout>
      {/* Header with Action Buttons */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-coffee-700 flex items-center gap-2">
            <Icon name="inventory_2" size={28} />
            {t.inventory.title}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="w-10 h-10 flex items-center justify-center bg-coffee-500 text-white rounded-lg shadow hover:bg-coffee-600 transition-all"
              title={t.inventory.addProduct}
            >
              <Icon name="add" className="text-white" size={24} />
            </button>
            <button
              onClick={handleGeneratePurchaseList}
              className="w-10 h-10 flex items-center justify-center bg-cream-200 text-coffee-600 rounded-lg shadow hover:bg-cream-300 transition-all"
              title={t.inventory.generatePurchaseList}
            >
              <Icon name="description" size={24} />
            </button>
          </div>
        </div>
        <p className="text-sm text-coffee-400">{t.inventory.subtitle}</p>
      </div>

      {/* Search Bar and Filter Toggle */}
      <div className="flex gap-2 mb-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Icon 
            name="search" 
            size={20} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={t.inventory.searchPlaceholder}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent text-sm"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-coffee-600"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-2.5 bg-white border border-cream-300 rounded-lg text-sm font-medium text-coffee-600 hover:bg-cream-50 transition-all flex items-center gap-1.5 flex-shrink-0"
          title={t.inventory.advancedFilter}
        >
          <Icon name="filter_list" size={20} />
          {hasActiveFilters() && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
              {(filterCategory !== 'all' ? 1 : 0) + (filterLowStock ? 1 : 0) + (searchKeyword.trim() ? 1 : 0)}
            </span>
          )}
          <Icon name={showFilters ? 'expand_less' : 'expand_more'} size={16} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
        <div className="bg-cream-100 rounded-lg p-2 text-center">
          <p className="text-xs text-coffee-500">{t.inventory.totalItems}</p>
          <p className="text-lg font-bold text-coffee-700">{inventory.length}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <p className="text-xs text-red-600">{t.inventory.lowStock}</p>
          <p className="text-lg font-bold text-red-600">{getLowStockCount()}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-xs text-blue-600">{t.inventory.filterResult}</p>
          <p className="text-lg font-bold text-blue-700">{getFilteredCount()}</p>
        </div>
      </div>

      {/* Filters (Collapsible) */}
      {showFilters && (
        <Card className="mb-4">
        <div className="space-y-3">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-2">{t.inventory.filterOptions.categoryLabel}</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', icon: '📦' },
                { key: 'ingredients', icon: '🌱' },
                { key: 'supplies', icon: '📦' },
                { key: 'cleaning', icon: '🧹' },
                { key: 'equipment', icon: '🔧' },
                { key: 'other', icon: '📌' }
              ].map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setFilterCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterCategory === cat.key
                      ? 'bg-coffee-500 text-white shadow-md'
                      : 'bg-cream-100 text-coffee-600 hover:bg-cream-200'
                  }`}
                >
                  {cat.icon} {getCategoryLabel(cat.key)}
                </button>
              ))}
            </div>
          </div>

          {/* Low Stock Filter */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterLowStock}
                onChange={(e) => setFilterLowStock(e.target.checked)}
                className="w-4 h-4 rounded border-coffee-300 text-coffee-600 focus:ring-2 focus:ring-coffee-400"
              />
              <span className="text-sm font-medium text-coffee-700">
                🔴 {t.inventory.filterOptions.showLowStock}
              </span>
            </label>
          </div>

          {/* Active Filters Display */}
          {(filterCategory !== 'all' || filterLowStock || searchKeyword.trim()) && (
            <div className="flex items-center gap-2 pt-2 border-t border-cream-200">
              <span className="text-xs text-coffee-500">{t.inventory.filterOptions.activeFilters}</span>
              {searchKeyword.trim() && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {t.common.search}: {searchKeyword}
                </span>
              )}
              {filterCategory !== 'all' && (
                <span className="text-xs bg-coffee-100 text-coffee-700 px-2 py-1 rounded">
                  {getCategoryLabel(filterCategory)}
                </span>
              )}
              {filterLowStock && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                  {t.inventory.lowStock}
                </span>
              )}
              <button
                onClick={resetFilters}
                className="ml-auto text-xs text-coffee-500 hover:text-coffee-700 underline"
              >
                {t.inventory.filterOptions.clearAll}
              </button>
            </div>
          )}
        </div>
      </Card>
      )}

      {/* Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {inventory.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <div className="text-center py-8 text-coffee-400">
              <p className="text-4xl mb-2">📦</p>
              <p>{t.inventory.noProducts}</p>
              <p className="text-sm mt-1">{t.inventory.noProductsHint}</p>
            </div>
          </Card>
        ) : filteredInventory.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <div className="text-center py-8 text-coffee-400">
              <p className="text-4xl mb-2">🔍</p>
              <p>{t.inventory.noFilterResults}</p>
              <p className="text-sm mt-1">{t.inventory.noFilterResultsHint}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-3"
              >
                {t.inventory.clearFilters}
              </Button>
            </div>
          </Card>
        ) : (
          filteredInventory.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-lg p-2.5 shadow hover:shadow-md transition-shadow ${
                isLowStock(item) ? 'border-l-4 border-red-500' : 'border-l-4 border-transparent'
              }`}
            >
              {/* Header Row - Name and Category in one line */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="font-semibold text-coffee-700 truncate">{item.name}</h3>
                  <span className="text-xs text-coffee-400 px-1.5 py-0.5 bg-cream-100 rounded flex-shrink-0">
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                {isLowStock(item) && (
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded flex-shrink-0 ml-2 flex items-center">
                    <Icon name="warning" size={14} />
                  </span>
                )}
              </div>

              {/* Info Row */}
              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                <div className="bg-cream-50 px-2 py-1 rounded">
                  <span className="text-coffee-400 text-xs">{t.inventory.stock}：</span>
                  <span className={`font-bold ml-1 ${isLowStock(item) ? 'text-red-600' : 'text-coffee-700'}`}>
                    {item.quantity} {getUnitLabel(item.unit)}
                  </span>
                </div>
                <div className="bg-cream-50 px-2 py-1 rounded">
                  <span className="text-coffee-400 text-xs">{t.inventory.thresholdLabel}：</span>
                  <span className="text-coffee-600 font-medium ml-1">
                    {item.threshold} {getUnitLabel(item.unit)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="flex-1 py-1.5 text-xs font-medium bg-cream-100 text-coffee-600 rounded hover:bg-cream-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Icon name="edit" size={14} />
                  {t.common.edit}
                </button>
                <button
                  onClick={() => item.id && handleDelete(item.id)}
                  className="flex-1 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Icon name="delete" size={14} />
                  {t.common.delete}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? t.inventory.editProductTitle : t.inventory.addProductTitle}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label={t.inventory.productName}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder={t.inventory.placeholders.productName}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.inventory.quantity}
              type="number"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
              onFocus={e => e.target.select()}
              required
              min="0"
              step="0.1"
            />

            <Select
              label={t.inventory.unit}
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
              options={units}
            />
          </div>

          <Input
            label={t.inventory.threshold}
            type="number"
            value={formData.threshold}
            onChange={e => setFormData({ ...formData, threshold: Number(e.target.value) })}
            onFocus={e => e.target.select()}
            required
            min="0"
            step="0.1"
          />

          <Select
            label={t.inventory.category}
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            options={categories}
          />

          <Input
            label={t.inventory.imageUrl}
            value={formData.imageUrl}
            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder={t.inventory.placeholders.imageUrl}
          />

          <div className="flex gap-2 mt-6">
            <Button type="submit" variant="primary" className="flex-1">
              {editingItem ? t.common.save : t.common.add}
            </Button>
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
};

