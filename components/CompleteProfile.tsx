import React, { useState } from 'react';
import apiClient from '../services/apiClient';

interface Props {
  onClose: () => void;
  onSaved: (user: any) => void;
  initial?: { dateOfBirth?: string; height?: number; weight?: number; age?: number };
}

const CompleteProfile: React.FC<Props> = ({ onClose, onSaved, initial }) => {
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth || '');
  const [height, setHeight] = useState<number | ''>(initial?.height ?? '');
  const [weight, setWeight] = useState<number | ''>(initial?.weight ?? '');
  const [age, setAge] = useState<number | ''>(initial?.age ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const payload: any = {};
      if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
      if (height !== '') payload.height = Number(height);
      if (weight !== '') payload.weight = Number(weight);
      if (age !== '') payload.age = Number(age);

      const updated = await apiClient.updateProfile(payload);
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Complete your profile</h3>
        <p className="text-sm text-slate-500 mb-4">Please add your date of birth, age and height so we can personalize your programs.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Date of birth</label>
            <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Age</label>
            <input type="number" min={0} value={age} onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Height (cm)</label>
            <input type="number" min={0} value={height} onChange={e => setHeight(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Weight (kg)</label>
            <input type="number" min={0} value={weight} onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded bg-slate-100">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 py-2 rounded bg-blue-600 text-white font-bold">{isSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
