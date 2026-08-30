import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  UserX, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  BookOpen, 
  BarChart3, 
  Layers, 
  X,
  Sparkles,
  Edit,
  SlidersHorizontal,
  PlusCircle,
  MinusCircle,
  PackagePlus
} from 'lucide-react';

// 預設器材清單與庫存
const INITIAL_EQUIPMENT = [
  { id: 'eq-1', name: '標準籃球 (Molten 7號)', category: '球類', total: 30, available: 22, icon: '🏀' },
  { id: 'eq-2', name: '標準排球 (Mikasa)', category: '球類', total: 25, available: 18, icon: '🏐' },
  { id: 'eq-3', name: '五號足球', category: '球類', total: 15, available: 12, icon: '⚽' },
  { id: 'eq-4', name: '羽球拍組 (含2拍1筒球)', category: '拍類', total: 20, available: 14, icon: '🏸' },
  { id: 'eq-5', name: '桌球拍組 (含2拍3球)', category: '拍類', total: 20, available: 16, icon: '🏓' },
  { id: 'eq-6', name: '大隊接力接力棒 (組)', category: '田徑', total: 10, available: 8, icon: '🏃' },
  { id: 'eq-7', name: '競賽跳繩 (一般/長繩)', category: '健身', total: 40, available: 35, icon: '🪢' },
  { id: 'eq-8', name: '競技飛盤', category: '休閒', total: 20, available: 19, icon: '🥏' },
  { id: 'eq-9', name: '計時碼表 (秒錶)', category: '裁判器材', total: 15, available: 12, icon: '⏱️' },
  { id: 'eq-10', name: '訓練用三角錐 (10入)', category: '訓練器材', total: 12, available: 10, icon: '📐' },
];

// 預設借還紀錄
const INITIAL_RECORDS = [
  {
    id: 'REC-20260830-001',
    studentClass: '高二忠班',
    studentId: '1120101',
    studentName: '王小明',
    borrowTime: '2026-08-30 09:10',
    expectedReturnTime: '2026-08-30 11:00',
    returnTime: null,
    status: 'borrowed',
    items: [
      { id: 'eq-1', name: '標準籃球 (Molten 7號)', qty: 2 },
      { id: 'eq-9', name: '計時碼表 (秒錶)', qty: 1 }
    ],
    note: '體育課分組練習'
  },
  {
    id: 'REC-20260830-002',
    studentClass: '高三孝班',
    studentId: '1110204',
    studentName: '李美美',
    borrowTime: '2026-08-30 08:30',
    expectedReturnTime: '2026-08-30 10:00',
    returnTime: null,
    status: 'borrowed',
    items: [
      { id: 'eq-4', name: '羽球拍組 (含2拍1筒球)', qty: 3 }
    ],
    note: '社團活動'
  }
];

const CATEGORIES = ['球類', '拍類', '田徑', '健身', '休閒', '裁判器材', '訓練器材', '其他'];
const PRESET_ICONS = ['🏀', '🏐', '⚽', '⚾', '🏸', '🏓', '🎾', '🏃', '🪢', '🥏', '⏱️', '📐', '🥊', '🎯', '🛹', '🚴'];

export default function App() {
  const [activeTab, setActiveTab] = useState('borrow');
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);

  const [formData, setFormData] = useState({
    studentClass: '',
    studentId: '',
    studentName: '',
    expectedReturnHours: '2',
    note: '',
    selectedItems: [{ equipmentId: 'eq-1', qty: 1 }]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  const [newEqForm, setNewEqForm] = useState({
    name: '',
    category: '球類',
    icon: '🏀',
    total: 10,
    available: 10
  });

  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    icon: '',
    total: 0,
    available: 0
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const lockedStudentsMap = useMemo(() => {
    const map = {};
    records
      .filter(r => r.status === 'borrowed')
      .forEach(r => {
        if (!map[r.studentId]) map[r.studentId] = [];
        map[r.studentId].push(r);
      });
    return map;
  }, [records]);

  const currentStudentLockedRecords = useMemo(() => {
    const cleanId = formData.studentId.trim();
    if (!cleanId) return null;
    return lockedStudentsMap[cleanId] || null;
  }, [formData.studentId, lockedStudentsMap]);

  const borrowedCountMap = useMemo(() => {
    const map = {};
    records
      .filter(r => r.status === 'borrowed')
      .forEach(r => {
        r.items.forEach(item => {
          map[item.id] = (map[item.id] || 0) + item.qty;
        });
      });
    return map;
  }, [records]);

  const handleAddItemRow = () => {
    const existingIds = formData.selectedItems.map(item => item.equipmentId);
    const availableItem = equipment.find(eq => !existingIds.includes(eq.id)) || equipment[0];
    if (!availableItem) return;
    setFormData(prev => ({
      ...prev,
      selectedItems: [...prev.selectedItems, { equipmentId: availableItem.id, qty: 1 }]
    }));
  };

  const handleRemoveItemRow = (index) => {
    if (formData.selectedItems.length <= 1) {
      showToast('至少需借用一項器材！', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.selectedItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, selectedItems: updated }));
  };

  const getCurrentDateTimeString = (offsetHours = 0) => {
    const now = new Date();
    if (offsetHours > 0) now.setHours(now.getHours() + offsetHours);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleBorrowSubmit = (e) => {
    e.preventDefault();
    const cleanClass = formData.studentClass.trim();
    const cleanId = formData.studentId.trim();
    const cleanName = formData.studentName.trim();

    if (!cleanClass || !cleanId || !cleanName) {
      showToast('請完整填寫班級、學號與姓名！', 'error');
      return;
    }

    if (currentStudentLockedRecords) {
      showToast(`借用失敗：學號 ${cleanId} 目前有未歸還的器材，系統已鎖定！`, 'error');
      return;
    }

    for (const item of formData.selectedItems) {
      const eq = equipment.find(e => e.id === item.equipmentId);
      const qtyNum = parseInt(item.qty, 10);
      if (!eq) return;
      if (qtyNum <= 0 || isNaN(qtyNum)) {
        showToast(`「${eq.name}」的借用數量必須大於 0！`, 'error');
        return;
      }
      if (qtyNum > eq.available) {
        showToast(`庫存不足！「${eq.name}」僅剩 ${eq.available} 件`, 'error');
        return;
      }
    }

    const borrowTimeStr = getCurrentDateTimeString();
    const expectedReturnStr = getCurrentDateTimeString(parseInt(formData.expectedReturnHours, 10) || 2);

    const recordItems = formData.selectedItems.map(item => {
      const eq = equipment.find(e => e.id === item.equipmentId);
      return { id: eq.id, name: eq.name, qty: parseInt(item.qty, 10) };
    });

    const newRecord = {
      id: `REC-${Date.now().toString().slice(-8)}`,
      studentClass: cleanClass,
      studentId: cleanId,
      studentName: cleanName,
      borrowTime: borrowTimeStr,
      expectedReturnTime: expectedReturnStr,
      returnTime: null,
      status: 'borrowed',
      items: recordItems,
      note: formData.note.trim() || '無備註'
    };

    setEquipment(prev => prev.map(eq => {
      const borrowed = recordItems.find(i => i.id === eq.id);
      return borrowed ? { ...eq, available: eq.available - borrowed.qty } : eq;
    }));

    setRecords(prev => [newRecord, ...prev]);
    setFormData({
      studentClass: '', studentId: '', studentName: '', expectedReturnHours: '2', note: '',
      selectedItems: [{ equipmentId: equipment[0]?.id || 'eq-1', qty: 1 }]
    });

    showToast(`✅ 成功為【${cleanClass} ${cleanName}】登記借用`, 'success');
  };

  const handleReturnRecord = (recordId) => {
    const targetRecord = records.find(r => r.id === recordId);
    if (!targetRecord || targetRecord.status === 'returned') return;

    const returnTimeStr = getCurrentDateTimeString();

    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: 'returned', returnTime: returnTimeStr } : r));
    setEquipment(prev => prev.map(eq => {
      const returnedItem = targetRecord.items.find(i => i.id === eq.id);
      return returnedItem ? { ...eq, available: Math.min(eq.total, eq.available + returnedItem.qty) } : eq;
    }));

    showToast(`🎉 歸還成功！學號 ${targetRecord.studentId} (${targetRecord.studentName}) 已解除鎖定！`, 'success');
  };

  const handleOpenEdit = (eq) => {
    setEditingEquipment(eq);
    setEditForm({ name: eq.name, category: eq.category, icon: eq.icon, total: eq.total, available: eq.available });
  };

  const handleSaveEditEquipment = (e) => {
    e.preventDefault();
    if (!editingEquipment) return;

    const totalNum = parseInt(editForm.total, 10);
    const availableNum = parseInt(editForm.available, 10);
    const cleanName = editForm.name.trim();

    if (!cleanName || isNaN(totalNum) || totalNum < 0 || isNaN(availableNum) || availableNum < 0) {
      showToast('請正確輸入名稱與數量！', 'error');
      return;
    }

    if (availableNum > totalNum) {
      showToast('在庫可用數量不能大於總數量！', 'error');
      return;
    }

    const currentlyBorrowed = borrowedCountMap[editingEquipment.id] || 0;
    if (totalNum < currentlyBorrowed) {
      showToast(`目前有 ${currentlyBorrowed} 件借出中，總數不可低於借出量！`, 'error');
      return;
    }

    setEquipment(prev => prev.map(item => item.id === editingEquipment.id ? {
      ...item, name: cleanName, category: editForm.category, icon: editForm.icon || '📦', total: totalNum, available: availableNum
    } : item));

    setEditingEquipment(null);
    showToast(`✅ 已更新器材「${cleanName}」資訊！`, 'success');
  };

  const handleCreateEquipment = (e) => {
    e.preventDefault();
    const cleanName = newEqForm.name.trim();
    const totalNum = parseInt(newEqForm.total, 10);
    const availableNum = parseInt(newEqForm.available, 10);

    if (!cleanName || isNaN(totalNum) || totalNum <= 0 || availableNum > totalNum) {
      showToast('請正確設定器材名稱與數量！', 'error');
      return;
    }

    const newEntry = {
      id: `eq-${Date.now()}`,
      name: cleanName,
      category: newEqForm.category || '球類',
      icon: newEqForm.icon || '🏀',
      total: totalNum,
      available: availableNum
    };

    setEquipment(prev => [...prev, newEntry]);
    setIsAddModalOpen(false);
    setNewEqForm({ name: '', category: '球類', icon: '🏀', total: 10, available: 10 });
    showToast(`🎉 成功新增器材「${cleanName}」！`, 'success');
  };

  const handleDeleteEquipment = (eqId, eqName) => {
    const currentlyBorrowed = borrowedCountMap[eqId] || 0;
    if (currentlyBorrowed > 0) {
      showToast(`無法刪除：尚有 ${currentlyBorrowed} 件借出中！`, 'error');
      return;
    }

    setEquipment(prev => prev.filter(e => e.id !== eqId));
    showToast(`🗑️ 已刪除器材「${eqName}」`, 'success');
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterStatus === 'borrowed' && r.status !== 'borrowed') return false;
      if (filterStatus === 'returned' && r.status !== 'returned') return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return r.studentId.toLowerCase().includes(term) ||
               r.studentName.toLowerCase().includes(term) ||
               r.studentClass.toLowerCase().includes(term) ||
               r.items.some(i => i.name.toLowerCase().includes(term));
      }
      return true;
    });
  }, [records, filterStatus, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                <Dumbbell className="w-6 h-6 text-sky-200" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider">學校運動器材借還管理系統</h1>
                <p className="text-xs text-sky-200">未歸還智慧鎖定與即時庫存整理</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/40 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto py-2">
            <button onClick={() => setActiveTab('borrow')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'borrow' ? 'bg-white text-blue-800 font-bold' : 'text-blue-100'}`}>
              <Plus className="w-4 h-4 inline mr-1" />登記借用
            </button>
            <button onClick={() => setActiveTab('records')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'records' ? 'bg-white text-blue-800 font-bold' : 'text-blue-100'}`}>
              <RotateCcw className="w-4 h-4 inline mr-1" />借出與歸還管理
            </button>
            <button onClick={() => setActiveTab('locked')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'locked' ? 'bg-white text-blue-800 font-bold' : 'text-blue-100'}`}>
              <UserX className="w-4 h-4 inline mr-1" />未歸還鎖定名單
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'inventory' ? 'bg-white text-blue-800 font-bold' : 'text-blue-100'}`}>
              <Layers className="w-4 h-4 inline mr-1" />器材數量與庫存整理
            </button>
          </div>
        </div>
      </header>

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`px-5 py-3 rounded-xl shadow-2xl text-white font-medium text-sm ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {activeTab === 'borrow' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" />填寫借用資料</h2>
            <form onSubmit={handleBorrowSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" placeholder="借用班級 (例：高二忠班)" value={formData.studentClass} onChange={e => setFormData({ ...formData, studentClass: e.target.value })} className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" required />
                <input type="text" placeholder="學號 (例：1120101)" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" required />
                <input type="text" placeholder="學生姓名" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm" required />
              </div>

              {currentStudentLockedRecords && (
                <div className="bg-rose-50 border border-rose-300 p-4 rounded-xl text-rose-800 text-sm flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  該學號有未歸還器材，系統已鎖定借用權限！
                </div>
              )}

              <div className="space-y-3">
                {formData.selectedItems.map((selected, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <select value={selected.equipmentId} onChange={e => handleItemChange(idx, 'equipmentId', e.target.value)} className="flex-1 p-2 rounded-lg border text-sm">
                      {equipment.map(eq => (
                        <option key={eq.id} value={eq.id} disabled={eq.available <= 0}>
                          {eq.icon} {eq.name} (可用: {eq.available}/{eq.total})
                        </option>
                      ))}
                    </select>
                    <input type="number" min="1" value={selected.qty} onChange={e => handleItemChange(idx, 'qty', e.target.value)} className="w-20 p-2 border rounded-lg text-center text-sm font-bold" />
                    <button type="button" onClick={() => handleRemoveItemRow(idx)} className="text-rose-500 p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={handleAddItemRow} className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-lg">+ 增加品項</button>
              </div>

              <button type="submit" disabled={!!currentStudentLockedRecords} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 disabled:bg-slate-300">
                確認登記借用
              </button>
            </form>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <input type="text" placeholder="搜尋學號或姓名..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-3 py-1.5 border rounded-xl text-sm" />
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3">學生</th>
                  <th className="p-3">借用品項</th>
                  <th className="p-3">借用時間</th>
                  <th className="p-3">動作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRecords.map(r => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold">{r.studentName} ({r.studentClass})<br/><span className="text-xs text-slate-400 font-mono">{r.studentId}</span></td>
                    <td className="p-3">{r.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
                    <td className="p-3 text-xs">{r.borrowTime}</td>
                    <td className="p-3">
                      {r.status === 'borrowed' ? (
                        <button onClick={() => handleReturnRecord(r.id)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">歸還</button>
                      ) : (
                        <span className="text-xs text-slate-400">已歸還</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'locked' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(lockedStudentsMap).map(([sId, recs]) => (
              <div key={sId} className="bg-white p-4 rounded-2xl border-2 border-rose-200 shadow-sm">
                <h3 className="font-bold text-slate-900">{recs[0].studentName} ({recs[0].studentClass})</h3>
                <p className="text-xs text-slate-400 font-mono mb-2">學號: {sId}</p>
                <div className="bg-rose-50 p-2 rounded-lg text-xs text-rose-800 space-y-1 mb-3">
                  {recs.map(r => r.items.map((i, k) => <div key={k}>未還: {i.name} ×{i.qty}</div>))}
                </div>
                <button onClick={() => recs.forEach(r => handleReturnRecord(r.id))} className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg">一鍵歸還並解鎖</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
              <h2 className="font-bold text-slate-800">器材庫存總覽</h2>
              <button onClick={() => setIsAddModalOpen(true)} className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">+ 新增器材品項</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {equipment.map(eq => (
                <div key={eq.id} className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-2xl">{eq.icon}</span>
                    <h4 className="font-bold text-sm mt-1">{eq.name}</h4>
                    <p className="text-xs text-slate-500">在館可用: <strong className="text-emerald-600">{eq.available}</strong> / 總量: {eq.total}</p>
                  </div>
                  <button onClick={() => handleOpenEdit(eq)} className="p-2 text-slate-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 編輯庫存彈窗 Modal */}
      {editingEquipment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-base">編輯/盤點: {editingEquipment.name}</h3>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">全校總數量</label>
              <input type="number" value={editForm.total} onChange={e => setEditForm({ ...editForm, total: e.target.value })} className="w-full p-2 border rounded-xl text-center font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">在庫可用數量</label>
              <input type="number" value={editForm.available} onChange={e => setEditForm({ ...editForm, available: e.target.value })} className="w-full p-2 border rounded-xl text-center font-bold text-emerald-600" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingEquipment(null)} className="px-4 py-2 border rounded-xl text-xs font-bold">取消</button>
              <button onClick={handleSaveEditEquipment} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">儲存變更</button>
            </div>
          </div>
        </div>
      )}

      {/* 新增器材彈窗 Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-3">
            <h3 className="font-bold text-base">新增全新器材品項</h3>
            <input type="text" placeholder="器材名稱 (例: 皮克球拍組)" value={newEqForm.name} onChange={e => setNewEqForm({ ...newEqForm, name: e.target.value })} className="w-full p-2 border rounded-xl text-sm" />
            <div className="flex gap-2">
              <input type="text" placeholder="圖示 Emoji" value={newEqForm.icon} onChange={e => setNewEqForm({ ...newEqForm, icon: e.target.value })} className="w-20 p-2 border rounded-xl text-center" />
              <input type="number" placeholder="總數量" value={newEqForm.total} onChange={e => { const v = parseInt(e.target.value, 10) || 0; setNewEqForm({ ...newEqForm, total: v, available: v }); }} className="flex-1 p-2 border rounded-xl text-center text-sm font-bold" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">取消</button>
              <button onClick={handleCreateEquipment} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">確認新增</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}