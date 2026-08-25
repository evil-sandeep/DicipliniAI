import React, { useState, useEffect } from 'react';
import { FiTarget, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from './api';

export default function GoalsSection() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); // id of goal being edited
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'short-term',
    label: '🎯 Short-term Target',
    title: '',
    description: ''
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await fetchGoals();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error loading goals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    try {
      const data = await createGoal(formData);
      setGoals([...goals, data.goal]);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Error adding goal', error);
    }
  };

  const handleUpdateGoal = async (id, e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    try {
      await updateGoal(id, formData);
      setGoals(goals.map(g => g._id === id ? { ...g, ...formData } : g));
      setIsEditing(null);
      resetForm();
    } catch (error) {
      console.error('Error updating goal', error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id);
      setGoals(goals.filter(g => g._id !== id));
    } catch (error) {
      console.error('Error deleting goal', error);
    }
  };

  const startEdit = (goal) => {
    setFormData({
      type: goal.type,
      label: goal.label,
      title: goal.title,
      description: goal.description
    });
    setIsEditing(goal._id);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      type: 'short-term',
      label: '🎯 Short-term Target',
      title: '',
      description: ''
    });
    setIsEditing(null);
    setShowAddForm(false);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const label = type === 'short-term' ? '🎯 Short-term Target' : '🚀 Monthly Vision';
    setFormData({ ...formData, type, label });
  };

  const renderForm = (onSubmit, id = null) => (
    <form onSubmit={(e) => onSubmit(id, e)} className="bg-white p-4 rounded-2xl shadow-sm border border-[#e2e8f0] mb-6 flex flex-col gap-3">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-[#172554]">
          <input type="radio" value="short-term" checked={formData.type === 'short-term'} onChange={handleTypeChange} />
          Short-term
        </label>
        <label className="flex items-center gap-2 text-sm text-[#172554]">
          <input type="radio" value="monthly" checked={formData.type === 'monthly'} onChange={handleTypeChange} />
          Monthly
        </label>
      </div>
      <input
        type="text"
        placeholder="Goal Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
        autoFocus
        required
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366f1] resize-none h-20"
      />
      <div className="flex gap-2 justify-end mt-2">
        <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-[#64748b] hover:text-[#172554]">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5]">
          {id ? 'Save Changes' : 'Add Goal'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      <div className="border-b border-[#cbd5e1] pb-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#172554] flex items-center gap-2">
            <FiTarget className="text-[#f59e0b]" /> Weekly & Monthly Goals
          </h2>
          <p className="text-xs text-[#64748b] mt-1">Set target milestones for personal growth</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setIsEditing(null); }}
          className="flex items-center gap-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#172554] px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          <FiPlus size={14} /> Add Goal
        </button>
      </div>

      {showAddForm && renderForm(handleAddGoal)}

      {loading ? (
        <div className="text-center text-[#64748b] py-8 text-sm">Loading goals...</div>
      ) : goals.length === 0 && !showAddForm ? (
        <div className="text-center text-[#94a3b8] py-8 text-sm">No goals set yet. Add one!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            isEditing === goal._id ? (
              <div key={goal._id} className="md:col-span-2">
                {renderForm(handleUpdateGoal, goal._id)}
              </div>
            ) : (
              <div 
                key={goal._id} 
                className={`p-4 rounded-2xl shadow-sm border relative group ${
                  goal.type === 'short-term' 
                    ? 'bg-[#fffbeb] border-[#fde68a]' 
                    : 'bg-[#eef2ff] border-[#c7d2fe]'
                }`}
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(goal)} className="p-1 text-[#64748b] hover:text-[#4f46e5]">
                    <FiEdit2 size={12} />
                  </button>
                  <button onClick={() => handleDeleteGoal(goal._id)} className="p-1 text-[#64748b] hover:text-[#ef4444]">
                    <FiTrash2 size={12} />
                  </button>
                </div>
                
                <span className={`text-xs font-bold tracking-wider uppercase ${
                  goal.type === 'short-term' ? 'text-[#d97706]' : 'text-[#4f46e5]'
                }`}>
                  {goal.label || (goal.type === 'short-term' ? '🎯 Short-term Target' : '🚀 Monthly Vision')}
                </span>
                <h3 className="text-base font-bold text-[#172554] mt-1 pr-12">{goal.title}</h3>
                <p className="text-xs text-[#64748b] mt-1">{goal.description}</p>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
