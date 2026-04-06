
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HostDashboard from './components/HostDashboard';
import UserDashboard from './components/UserDashboard';
import CompleteProfile from './components/CompleteProfile';
import { User, TrainingProgram, CompletionRecord } from './types';
import { MOCK_USERS, INITIAL_PROGRAMS } from './constants';
import { Dumbbell, Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, Loader2, X } from 'lucide-react';
import apiClient from './services/apiClient';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [trainees, setTrainees] = useState<User[]>([]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'host' | 'user'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTraineeForAssignment, setSelectedTraineeForAssignment] = useState<User | null>(null);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  // Initialize: Check if user is already logged in
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const currentUser = await apiClient.getMe();
        if (currentUser) {
          setUser(currentUser);
          // Fetch programs and completions
          await fetchPrograms();
          await fetchCompletions();
          if (currentUser.role === 'host') {
            await fetchTrainees();
          }
        }
      } catch (error) {
        // User not logged in or session expired
        console.log('User not authenticated');
      }
    };

    initializeApp();
  }, []);

  // Set up real-time listeners when user logs in
  useEffect(() => {
    if (!user) return;

    // Listen for real-time program updates
    apiClient.on('program:created', (program: TrainingProgram) => {
      setPrograms(prev => {
        // Only add if it's relevant to this user
        if (user.role === 'host' && program.hostId === user.id) {
          return [program, ...prev];
        } else if (user.role === 'user' && program.assignedUserIds.includes(user.id)) {
          return [program, ...prev];
        }
        return prev;
      });
    });

    apiClient.on('program:updated', (program: TrainingProgram) => {
      setPrograms(prev => 
        prev.map(p => p.id === program.id ? program : p)
      );
    });

    apiClient.on('program:assigned', (data: any) => {
      if (data.userId === user.id) {
        setPrograms(prev => [data.program, ...prev]);
      }
    });

    apiClient.on('workout:completed', (completion: CompletionRecord) => {
      setCompletions(prev => [...prev, completion]);
    });

    return () => {
      apiClient.off('program:created', () => {});
      apiClient.off('program:updated', () => {});
      apiClient.off('program:assigned', () => {});
      apiClient.off('workout:completed', () => {});
    };
  }, [user]);

  const fetchPrograms = async () => {
    try {
      const data = await apiClient.getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const fetchCompletions = async () => {
    try {
      const data = await apiClient.getCompletions();
      setCompletions(data);
    } catch (error) {
      console.error('Failed to fetch completions:', error);
    }
  };

  const fetchTrainees = async () => {
    try {
      const data = await apiClient.getTrainees();
      setTrainees(data);
    } catch (error) {
      console.error('Failed to fetch trainees:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[App] Starting authentication...', { authMode, email, role: authMode === 'signup' ? role : undefined });
      
      if (authMode === 'signup') {
        console.log('[App] Calling register with:', { name, email, role });
        const response = await apiClient.register(name, email, password, role);
        console.log('[App] Registration successful:', response);
        setUser(response.user);
        if (response.profileIncomplete || response.user.dateOfBirth == null || response.user.height == null) {
          setShowCompleteProfile(true);
        }
        await fetchPrograms();
        await fetchCompletions();
        if (response.user.role === 'host') {
          await fetchTrainees();
        }
      } else {
        console.log('[App] Calling login with email:', email);
        const response = await apiClient.login(email, password);
        console.log('[App] Login successful:', response);
        setUser(response.user);
        if (response.profileIncomplete || response.user.dateOfBirth == null || response.user.height == null) {
          setShowCompleteProfile(true);
        }
        await fetchPrograms();
        await fetchCompletions();
        if (response.user.role === 'host') {
          await fetchTrainees();
        }
      }
    } catch (error: any) {
      console.error('[App] Authentication error:', error);
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      console.error('[App] Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    setUser(null);
    setEmail('');
    setPassword('');
    setName('');
    setPrograms([]);
    setCompletions([]);
    setShowCompleteProfile(false);
  };

  const handleAddProgram = async (p: TrainingProgram) => {
    try {
      const newProgram = await apiClient.createProgram({
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        durationWeeks: p.durationWeeks,
        workouts: p.workouts
      });
      setPrograms(prev => [newProgram, ...prev]);
    } catch (error) {
      console.error('Failed to create program:', error);
    }
  };

  const handleOpenAssignmentModal = (trainee: User) => {
    setSelectedTraineeForAssignment(trainee);
    setShowAssignmentModal(true);
  };

  const handleAssignProgram = async (programId: string) => {
    if (!selectedTraineeForAssignment) return;
    try {
      const isLoading = true;
      const updatedProgram = await apiClient.assignProgram(programId, selectedTraineeForAssignment.id);
      setPrograms(prev => 
        prev.map(p => p.id === updatedProgram.id ? updatedProgram : p)
      );
      setShowAssignmentModal(false);
      setSelectedTraineeForAssignment(null);
      alert(`Program assigned to ${selectedTraineeForAssignment.name} successfully!`);
    } catch (error) {
      console.error('Failed to assign program:', error);
      alert('Failed to assign program. Please try again.');
    }
  };

  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false);
    setSelectedTraineeForAssignment(null);
  };

  const handleCompleteWorkout = async (workoutId: string) => {
    if (!user || !programs.length) return;
    try {
      const programId = programs[0].id;
      const completion = await apiClient.completeWorkout(workoutId, programId);
      setCompletions(prev => [...prev, completion]);
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200 rounded-full blur-[120px] opacity-50" />

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl text-white shadow-2xl mb-6">
              <Dumbbell className="w-6 h-6" />
              <span className="text-xl font-black tracking-tighter">PT TAK</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {authMode === 'login' 
                ? 'Sign in to access your personal training plans.' 
                : 'Join PT TAK to start your custom fitness journey.'}
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('user')}
                      className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                        role === 'user' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'
                      }`}
                    >
                      Trainee
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('host')}
                      className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                        role === 'host' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                    >
                      Host / Coach
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl flex items-center gap-2 border border-red-100">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="text-slate-500 font-bold hover:text-blue-600 transition-colors"
              >
                {authMode === 'login' ? "Don't have an account? Create one" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {showCompleteProfile && user && (
        <CompleteProfile
          initial={{ dateOfBirth: user.dateOfBirth ?? undefined, height: user.height ?? undefined, weight: user.weight ?? undefined, age: (user as any).age ?? undefined }}
          onClose={() => setShowCompleteProfile(false)}
          onSaved={(updated: any) => setUser(updated)}
        />
      )}
      {user.role === 'host' ? (
        <>
          {activeTab === 'dashboard' && (
            <HostDashboard 
              programs={programs} 
              trainees={trainees}
              onAddProgram={handleAddProgram}
            />
          )}
          {activeTab === 'programs' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-slate-900">Training Programs</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map(program => (
                  <div key={program.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
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
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">{program.description}</p>
                      <p className="text-xs text-slate-600 mb-6"><strong>{program.durationWeeks}</strong> weeks • <strong>{program.workouts.length}</strong> workouts</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {program.assignedUserIds.slice(0, 3).map((uid, i) => (
                            <img key={uid} src={`https://picsum.photos/seed/${uid}/40`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                          ))}
                          {program.assignedUserIds.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                              +{program.assignedUserIds.length - 3}
                            </div>
                          )}
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'trainees' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-slate-900">Manage Trainees</h1>
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Programs Assigned</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trainees.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          No trainees found. They will appear here once they register.
                        </td>
                      </tr>
                    ) : (
                      trainees.map(trainee => {
                        // Count programs assigned to this trainee
                        const assignedPrograms = programs.filter(p => 
                          p.assignedUserIds && p.assignedUserIds.includes(trainee.id)
                        ).length;
                        
                        return (
                          <tr key={trainee.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={trainee.avatar} className="w-8 h-8 rounded-full" alt="" />
                                <span className="text-sm font-bold text-slate-900">{trainee.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{trainee.email}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {assignedPrograms} program(s)
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleOpenAssignmentModal(trainee)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                Assign
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assignment Modal */}
          {showAssignmentModal && selectedTraineeForAssignment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Assign Program</h3>
                  <button 
                    onClick={handleCloseAssignmentModal}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-6">
                  <p className="text-slate-600 mb-6">
                    Select a program to assign to <strong>{selectedTraineeForAssignment.name}</strong>
                  </p>

                  {programs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No programs available. Create a program first.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {programs.map(program => {
                        const isAlreadyAssigned = program.assignedUserIds?.includes(selectedTraineeForAssignment.id);
                        return (
                          <div 
                            key={program.id}
                            className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{program.title}</h4>
                                <p className="text-xs text-slate-600 mt-1">{program.description}</p>
                                <div className="flex gap-2 mt-3">
                                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {program.difficulty}
                                  </span>
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                    {program.durationWeeks} weeks
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleAssignProgram(program.id)}
                              disabled={isAlreadyAssigned}
                              className={`w-full mt-4 py-2 px-4 rounded font-semibold text-sm transition-colors ${
                                isAlreadyAssigned 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isAlreadyAssigned ? '✓ Already Assigned' : 'Assign Program'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Coach Name</label>
                    <input type="text" value={user.name} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input type="email" value={user.email} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <UserDashboard 
              program={programs.find(p => p.assignedUserIds.includes(user.id)) || null} 
              completions={completions.filter(c => c.userId === user.id)}
              user={user}
              onComplete={handleCompleteWorkout}
            />
          )}
          {activeTab === 'schedule' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-slate-900">Schedule</h1>
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <p className="text-slate-600">Schedule view coming soon...</p>
              </div>
            </div>
          )}
          {activeTab === 'progress' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-slate-900">Progress</h1>
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <p className="text-slate-600">Progress tracking coming soon...</p>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                    <input type="text" value={user.name} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input type="email" value={user.email} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
