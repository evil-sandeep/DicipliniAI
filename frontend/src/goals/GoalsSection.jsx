import React, { useState, useEffect } from 'react';
import { FiTarget, FiPlus, FiTrash2, FiEdit2, FiCalendar, FiCheckSquare, FiSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from './api';

export default function GoalsSection() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); // id of goal being edited
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'short-term',
    label: '🎯 Short-term Target',
    title: '',
    description: '',
    status: 'not-started',
    deadline: '',
    milestones: [] // Array of { title: string, completed: boolean }
  });
  
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

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

  const calculateProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    // Auto-calculate progress based on milestones
    const progress = calculateProgress(formData.milestones);
    
    // Auto-update status based on progress
    let status = formData.status;
    if (progress === 100) status = 'completed';
    else if (progress > 0 && status === 'not-started') status = 'in-progress';
    
    const goalData = { ...formData, progress, status };
    
    try {
      const data = await createGoal(goalData);
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
    
    const progress = calculateProgress(formData.milestones);
    let status = formData.status;
    if (progress === 100) status = 'completed';
    else if (progress > 0 && status === 'not-started') status = 'in-progress';
    else if (progress < 100 && status === 'completed') status = 'in-progress';
    
    const goalData = { ...formData, progress, status };
    
    try {
      await updateGoal(id, goalData);
      setGoals(goals.map(g => g._id === id ? { ...g, ...goalData } : g));
      setIsEditing(null);
      resetForm();
    } catch (error) {
      console.error('Error updating goal', error);
    }
  };

  const handleDeleteGoal = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id);
      setGoals(goals.filter(g => g._id !== id));
    } catch (error) {
      console.error('Error deleting goal', error);
    }
  };

  const handleToggleMilestone = async (goalId, milestoneIndex, e) => {
    e.stopPropagation();
    const goal = goals.find(g => g._id === goalId);
    if (!goal) return;
    
    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIndex].completed = !updatedMilestones[milestoneIndex].completed;
    
    const progress = calculateProgress(updatedMilestones);
    let status = goal.status;
    if (progress === 100) status = 'completed';
    else if (progress > 0 && status === 'not-started') status = 'in-progress';
    else if (progress < 100 && status === 'completed') status = 'in-progress';
    
    // Optimistic UI update
    setGoals(goals.map(g => g._id === goalId ? { ...g, milestones: updatedMilestones, progress, status } : g));
    
    try {
      await updateGoal(goalId, { milestones: updatedMilestones, progress, status });
    } catch (error) {
      console.error('Error updating milestone', error);
      // Revert if error
      loadGoals();
    }
  };

  const handleStatusChange = async (goalId, newStatus, e) => {
    e.stopPropagation();
    try {
      setGoals(goals.map(g => g._id === goalId ? { ...g, status: newStatus } : g));
      await updateGoal(goalId, { status: newStatus });
    } catch (error) {
      console.error('Error updating status', error);
      loadGoals();
    }
  };

  const startEdit = (goal, e) => {
    e.stopPropagation();
    setFormData({
      type: goal.type,
      label: goal.label,
      title: goal.title,
      description: goal.description,
      status: goal.status || 'not-started',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      milestones: goal.milestones || []
    });
    setIsEditing(goal._id);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      type: 'short-term',
      label: '🎯 Short-term Target',
      title: '',
      description: '',
      status: 'not-started',
      deadline: '',
      milestones: []
    });
    setNewMilestoneTitle('');
    setIsEditing(null);
    setShowAddForm(false);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    const label = type === 'short-term' ? '🎯 Short-term Target' : '🚀 Monthly Vision';
    setFormData({ ...formData, type, label });
  };
  
  const handleAddMilestoneToForm = () => {
    if (!newMilestoneTitle.trim()) return;
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: newMilestoneTitle, completed: false }]
    });
    setNewMilestoneTitle('');
  };
  
  const handleRemoveMilestoneFromForm = (index) => {
    const updated = [...formData.milestones];
    updated.splice(index, 1);
    setFormData({ ...formData, milestones: updated });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };
  
  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderForm = (onSubmit, id = null) => (
    <form onSubmit={(e) => onSubmit(id, e)} className="bg-white p-5 rounded-2xl shadow-md border border-[#e2e8f0] mb-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Top Row: Type & Status */}
      <div className="flex flex-wrap gap-4 justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-[#172554] cursor-pointer">
            <input type="radio" value="short-term" checked={formData.type === 'short-term'} onChange={handleTypeChange} className="text-[#6366f1] focus:ring-[#6366f1]" />
            Short-term
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-[#172554] cursor-pointer">
            <input type="radio" value="monthly" checked={formData.type === 'monthly'} onChange={handleTypeChange} className="text-[#6366f1] focus:ring-[#6366f1]" />
            Monthly
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select 
            value={formData.status} 
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="text-xs border border-slate-200 rounded-md p-1 focus:outline-none focus:border-[#6366f1]"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {/* Title & Description */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Goal Title (e.g. Learn React Native)"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
          autoFocus
          required
        />
        <textarea
          placeholder="Why is this goal important? Add context..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border border-[#cbd5e1] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] resize-none h-20"
        />
      </div>
      
      {/* Deadline & Milestones Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Deadline */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Target Deadline</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full border border-[#cbd5e1] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#6366f1]"
            />
          </div>
        </div>
        
        {/* Milestones */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Milestones / Steps</label>
          <div className="flex flex-col gap-2">
            {formData.milestones.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                <FiCheckSquare className={m.completed ? 'text-emerald-500' : 'text-slate-300'} size={14} />
                <span className={`text-xs flex-1 ${m.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{m.title}</span>
                <button type="button" onClick={() => handleRemoveMilestoneFromForm(idx)} className="text-slate-400 hover:text-red-500"><FiTrash2 size={12}/></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add a step..." 
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMilestoneToForm(); } }}
                className="flex-1 border border-[#cbd5e1] rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#6366f1]"
              />
              <button 
                type="button" 
                onClick={handleAddMilestoneToForm}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-md text-xs font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
      </div>

      <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
        <button type="button" onClick={resetForm} className="px-5 py-2 text-sm font-medium text-[#64748b] hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
        <button type="submit" className="px-5 py-2 text-sm font-medium bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] shadow-sm transition-colors">
          {id ? 'Save Changes' : 'Create Goal'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2e8f0] flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#172554] flex items-center gap-2">
            <FiTarget className="text-[#f59e0b]" /> Goals & Milestones
          </h2>
          <p className="text-sm text-[#64748b] mt-1">Track your progress and build momentum step-by-step.</p>
        </div>
        {!showAddForm && !isEditing && (
          <button
            onClick={() => { setShowAddForm(true); setIsEditing(null); }}
            className="flex items-center gap-2 bg-[#172554] hover:bg-[#1e3a8a] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <FiPlus size={16} /> New Goal
          </button>
        )}
      </div>

      {showAddForm && renderForm(handleAddGoal)}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
        </div>
      ) : goals.length === 0 && !showAddForm && !isEditing ? (
        <div className="text-center bg-white border border-dashed border-slate-300 rounded-2xl py-12 flex flex-col items-center justify-center">
          <div className="bg-amber-100 text-amber-500 p-4 rounded-full mb-4">
            <FiTarget size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No goals set yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">Start setting targets for yourself to stay motivated and track your journey.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-6 text-sm font-medium text-[#6366f1] hover:text-[#4f46e5] underline underline-offset-4"
          >
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {goals.map((goal) => (
            isEditing === goal._id ? (
              <div key={goal._id} className="lg:col-span-2">
                {renderForm(handleUpdateGoal, goal._id)}
              </div>
            ) : (
              <div 
                key={goal._id} 
                onClick={() => setExpandedGoalId(expandedGoalId === goal._id ? null : goal._id)}
                className={`flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${
                  goal.status === 'completed' ? 'border-emerald-200' : 'border-[#e2e8f0]'
                } overflow-hidden`}
              >
                {/* Card Header area */}
                <div className={`p-5 relative ${goal.type === 'short-term' ? 'bg-[#fffbeb]/50' : 'bg-[#eef2ff]/50'}`}>
                  
                  {/* Actions (Hover) */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                    <button onClick={(e) => startEdit(goal, e)} className="p-1.5 bg-white text-slate-400 hover:text-[#6366f1] rounded-md shadow-sm border border-slate-100 transition-colors">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={(e) => handleDeleteGoal(goal._id, e)} className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-md shadow-sm border border-slate-100 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex gap-2 items-center mb-2">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                      goal.type === 'short-term' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {goal.label || (goal.type === 'short-term' ? '🎯 Short-term Target' : '🚀 Monthly Vision')}
                    </span>
                    
                    {/* Status Badge */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={goal.status || 'not-started'} 
                        onChange={(e) => handleStatusChange(goal._id, e.target.value, e)}
                        className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border appearance-none cursor-pointer pr-5 ${getStatusColor(goal.status || 'not-started')}`}
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <FiChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </div>
                  
                  <h3 className={`text-lg font-bold mt-1 pr-16 leading-tight ${goal.status === 'completed' ? 'text-slate-500 line-through' : 'text-[#172554]'}`}>
                    {goal.title}
                  </h3>
                  
                  {goal.deadline && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-2 bg-white/60 inline-flex px-2 py-1 rounded-md border border-slate-200">
                      <FiCalendar size={12} className={new Date(goal.deadline) < new Date() && goal.status !== 'completed' ? 'text-red-500' : 'text-slate-400'} /> 
                      <span className={new Date(goal.deadline) < new Date() && goal.status !== 'completed' ? 'text-red-600' : ''}>
                        Due: {formatDate(goal.deadline)}
                      </span>
                    </div>
                  )}
                  
                  {/* Progress Bar Mini */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.progress === 100 ? 'bg-emerald-500' : 'bg-[#6366f1]'
                        }`} 
                        style={{ width: `${goal.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-8 text-right">{goal.progress || 0}%</span>
                  </div>
                </div>

                {/* Body (Description & Milestones) */}
                <div className="p-5 border-t border-slate-100 flex-1 flex flex-col">
                  {goal.description && (
                    <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">{goal.description}</p>
                  )}
                  
                  {/* Milestones Checklist */}
                  {goal.milestones && goal.milestones.length > 0 ? (
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestones ({goal.milestones.filter(m=>m.completed).length}/{goal.milestones.length})</h4>
                        {goal.milestones.length > 3 && (
                          <button className="text-xs text-[#6366f1] hover:underline flex items-center gap-1">
                            {expandedGoalId === goal._id ? <><FiChevronUp/> Hide</> : <><FiChevronDown/> View All</>}
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {(expandedGoalId === goal._id ? goal.milestones : goal.milestones.slice(0, 3)).map((milestone, idx) => (
                          <div 
                            key={idx} 
                            onClick={(e) => handleToggleMilestone(goal._id, idx, e)}
                            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${
                              milestone.completed ? 'bg-emerald-50/50 border-emerald-100' : 'hover:bg-slate-50 border-transparent'
                            }`}
                          >
                            <div className="mt-0.5">
                              {milestone.completed ? 
                                <FiCheckSquare className="text-emerald-500" size={16} /> : 
                                <FiSquare className="text-slate-300 group-hover:text-[#6366f1]" size={16} />
                              }
                            </div>
                            <span className={`text-sm ${milestone.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                        {!expandedGoalId && goal.milestones.length > 3 && (
                          <div className="text-xs text-slate-400 text-center py-1 font-medium bg-slate-50 rounded-md">
                            +{goal.milestones.length - 3} more steps
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-100">
                      <FiTarget size={14} /> No milestones added. <button onClick={(e) => startEdit(goal, e)} className="underline font-bold">Edit goal</button> to break it down into steps.
                    </div>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
