import React from 'react';
import { Plus, Users, ClipboardList, Target, Sparkles, Loader2, X } from 'lucide-react';
import { TrainingProgram, User } from '../types';
import apiClient from '../services/apiClient';

interface HostDashboardProps {
  programs: TrainingProgram[];
  trainees: User[];
  onAddProgram: (program: TrainingProgram) => void;
}

// Mock AI suggestions
const AI_PROGRAM_TEMPLATES = [
  {
    title: "HIIT Cardio Blast",
    description: "High-intensity interval training focused on cardiovascular endurance and fat burning",
    difficulty: "Intermediate" as const,
    durationWeeks: 4,
    workouts: [
      {
        id: "w1",
        title: "Monday - Sprint Intervals",
        day: "Monday",
        exercises: [
          { id: "e1", name: "Warm-up Jog", sets: 1, reps: "5 min", rest: "30s" },
          { id: "e2", name: "30s Sprint / 30s Walk", sets: 8, reps: "8 rounds", rest: "2 min" },
          { id: "e3", name: "Cool-down Walk", sets: 1, reps: "5 min", rest: "N/A" }
        ]
      },
      {
        id: "w2",
        title: "Wednesday - Burpee Circuit",
        day: "Wednesday",
        exercises: [
          { id: "e4", name: "Burpees", sets: 3, reps: "15", rest: "45s" },
          { id: "e5", name: "Jump Squats", sets: 3, reps: "20", rest: "45s" },
          { id: "e6", name: "Mountain Climbers", sets: 3, reps: "30", rest: "45s" }
        ]
      }
    ]
  },
  {
    title: "Full Body Strength",
    description: "Comprehensive strength training targeting all major muscle groups",
    difficulty: "Beginner" as const,
    durationWeeks: 6,
    workouts: [
      {
        id: "w1",
        title: "Monday - Upper Body",
        day: "Monday",
        exercises: [
          { id: "e1", name: "Bench Press", sets: 4, reps: "6-8", rest: "90s" },
          { id: "e2", name: "Bent Over Rows", sets: 4, reps: "6-8", rest: "90s" },
          { id: "e3", name: "Pull-ups", sets: 3, reps: "8-10", rest: "60s" }
        ]
      },
      {
        id: "w2",
        title: "Wednesday - Lower Body",
        day: "Wednesday",
        exercises: [
          { id: "e4", name: "Squats", sets: 4, reps: "6-8", rest: "90s" },
          { id: "e5", name: "Deadlifts", sets: 3, reps: "5-6", rest: "2 min" },
          { id: "e6", name: "Leg Press", sets: 3, reps: "8-10", rest: "60s" }
        ]
      }
    ]
  }
];

const HostDashboard: React.FC<HostDashboardProps> = ({ programs, trainees, onAddProgram }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState<TrainingProgram | null>(null);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    durationWeeks: 4
  });

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const programData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        durationWeeks: formData.durationWeeks,
        workouts: [
          {
            id: `w-${Date.now()}`,
            title: `${formData.title} - Workout 1`,
            day: 'Monday',
            exercises: [
              { id: 'e1', name: 'Exercise 1', sets: 3, reps: '10', rest: '60s' },
              { id: 'e2', name: 'Exercise 2', sets: 3, reps: '10', rest: '60s' }
            ]
          }
        ]
      };

      const newProgram = await apiClient.createProgram(programData);
      onAddProgram(newProgram);
      
      setShowCreateModal(false);
      setFormData({ title: '', description: '', difficulty: 'Beginner', durationWeeks: 4 });
      alert(`✅ Program "${newProgram.title}" created successfully!`);
    } catch (error) {
      console.error('Failed to create program:', error);
      alert('Failed to create program. Please try again.');
    }
  };

  const handleAISuggestion = async () => {
    setIsGenerating(true);
    try {
      // Use a random AI template
      const randomTemplate = AI_PROGRAM_TEMPLATES[Math.floor(Math.random() * AI_PROGRAM_TEMPLATES.length)];
      
      const programData = {
        title: randomTemplate.title,
        description: randomTemplate.description,
        difficulty: randomTemplate.difficulty,
        durationWeeks: randomTemplate.durationWeeks,
        workouts: randomTemplate.workouts.map((w, idx) => ({
          ...w,
          id: `w-ai-${Date.now()}-${idx}`
        }))
      };

      const newProgram = await apiClient.createProgram(programData);
      onAddProgram(newProgram);
      alert(`✨ AI generated program created: ${newProgram.title}`);
    } catch (error) {
      console.error('AI Generation failed:', error);
      alert('Failed to generate AI program. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Trainees</p>
            <p className="text-3xl font-bold text-slate-900">{trainees.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Programs</p>
            <p className="text-3xl font-bold text-slate-900">{programs.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Compliance Rate</p>
            <p className="text-3xl font-bold text-slate-900">84%</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-5 h-5" />
          Create New Program
        </button>
        <button 
          onClick={handleAISuggestion}
          disabled={isGenerating}
          className="flex-1 bg-white text-slate-900 border border-slate-200 p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-70"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-600" />
          )}
          AI Smart Suggest
        </button>
      </div>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Trainee Health Monitor</h2>
            <p className="text-sm text-slate-500">View the latest metrics and location updates from your active trainees.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {trainees.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-slate-500">No trainees available.</div>
          ) : (
            trainees.map((trainee) => (
              <div key={trainee.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img src={trainee.avatar} className="w-12 h-12 rounded-2xl" alt={trainee.name} />
                    <div>
                      <p className="font-bold text-slate-900">{trainee.name}</p>
                      <p className="text-sm text-slate-500">{trainee.email}</p>
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest Update</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                  <div className="bg-white p-4 rounded-3xl border border-slate-100">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Steps</p>
                    <p className="font-semibold text-slate-900">{trainee.latestHealthMetric?.steps ?? '—'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl border border-slate-100">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Heart Rate</p>
                    <p className="font-semibold text-slate-900">{trainee.latestHealthMetric?.heartRate ? `${trainee.latestHealthMetric.heartRate} bpm` : '—'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-3xl border border-slate-100">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Distance</p>
                    <p className="font-semibold text-slate-900">{trainee.latestHealthMetric?.distanceKm ? `${trainee.latestHealthMetric.distanceKm} km` : '—'}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-3xl bg-slate-100 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Last Known Location</p>
                    <p className="font-semibold text-slate-900">{trainee.gpsLocation ? `${trainee.gpsLocation.latitude.toFixed(4)}, ${trainee.gpsLocation.longitude.toFixed(4)}` : 'No location'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-100 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">Health Note</p>
                    <p className="font-semibold text-slate-900">{trainee.latestHealthMetric?.notes ?? 'No note'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Create Program Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create New Program</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Program Name</label>
                <input
                  type="text"
                  placeholder="e.g., Push Day Blast"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Description</label>
                <textarea
                  placeholder="Describe the program goals and target areas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium h-24 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Duration (weeks)</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={formData.durationWeeks}
                    onChange={(e) => setFormData({ ...formData, durationWeeks: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedProgram.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedProgram.description}</p>
              </div>
              <button 
                onClick={() => setSelectedProgram(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Difficulty</p>
                <p className="text-lg font-bold text-slate-900">{selectedProgram.difficulty}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Duration</p>
                <p className="text-lg font-bold text-slate-900">{selectedProgram.durationWeeks} weeks</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Workouts</p>
                <p className="text-lg font-bold text-slate-900">{selectedProgram.workouts.length}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-4">Workouts</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedProgram.workouts.length === 0 ? (
                <p className="text-slate-500 py-4">No workouts in this program</p>
              ) : (
                selectedProgram.workouts.map((workout, wIdx) => (
                  <div key={workout.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{workout.title}</h4>
                        <p className="text-xs text-slate-500">{workout.day}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                        {workout.exercises.length} exercises
                      </span>
                    </div>

                    <div className="space-y-2">
                      {workout.exercises.map((exercise, eIdx) => (
                        <div key={exercise.id} className="bg-white rounded-lg p-3 border border-slate-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 text-sm">{exercise.name}</p>
                              <div className="flex gap-4 mt-1 text-xs text-slate-600">
                                <span>Sets: <span className="font-bold text-slate-900">{exercise.sets}</span></span>
                                <span>Reps: <span className="font-bold text-slate-900">{exercise.reps}</span></span>
                                <span>Rest: <span className="font-bold text-slate-900">{exercise.rest}</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <button
                onClick={() => setSelectedProgram(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProgram(null);
                  alert('Edit functionality coming soon! For now, you can view all workouts and exercises.');
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
              >
                Edit Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Training Programs</h2>
          <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map(program => (
            <div key={program.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all group">
              <div className="relative h-32 bg-slate-100">
                <img src={`https://picsum.photos/seed/${program.id}/400/200`} className="w-full h-full object-cover opacity-80" alt="" />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded">
                    {program.difficulty}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-2">{program.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-6">{program.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {program.assignedUserIds.map((uid, i) => (
                      <img key={uid} src={`https://picsum.photos/seed/${uid}/40`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                    ))}
                  </div>
                  <button 
                    onClick={() => setSelectedProgram(program)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    View Workouts
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Trainee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Workout</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainees.map(trainee => (
                <tr key={trainee.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={trainee.avatar} className="w-8 h-8 rounded-full" alt="" />
                      <span className="text-sm font-bold text-slate-900">{trainee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">Push Session A</td>
                  <td className="px-6 py-4 text-sm text-slate-600">2 hours ago</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700 uppercase">Completed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default HostDashboard;
