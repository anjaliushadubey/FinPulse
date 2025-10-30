import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- SVG Icon for Progress Ring ---
const ProgressRing = ({ percentage }) => {
    const stroke = 8;
    const radius = 54;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let color = '#34D399'; // Green-400
    if (percentage > 75) color = '#FBBF24'; // Yellow-400
    if (percentage > 90) color = '#EF4444'; // Red-500

    return (
        // Reduced size slightly to better fit cards
        <div className="relative w-24 h-24 flex-shrink-0"> 
            <svg height="100%" width="100%" viewBox="0 0 120 120" className="transform -rotate-90">
                <circle stroke="#e5e7eb" cx={radius + stroke} cy={radius + stroke} r={normalizedRadius} strokeWidth={stroke} fill="transparent" />
                <circle
                    stroke={color} cx={radius + stroke} cy={radius + stroke} r={normalizedRadius} strokeWidth={stroke} fill="transparent"
                    strokeDasharray={`${circumference} ${circumference}`} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-700"> {/* Reduced text size */}
                {`${Math.round(percentage)}%`}
            </span>
        </div>
    );
};

// --- Main App Component: Controls the overall flow ---
const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [currentView, setCurrentView] = useState('loading'); 

    // Define setAuthToken using useCallback
    const setAuthToken = useCallback((newToken) => {
        if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
            // After login/register, check if budgets exist before deciding next step
            checkUserSetup(newToken); 
        } else {
            localStorage.removeItem('token');
            setToken(null);
            setCurrentView('welcome');
        }
    }, []); // Empty dependency array, setAuthToken itself doesn't depend on outside vars
    
    // Define checkUserSetup using useCallback - Checks if user exists and needs onboarding
    const checkUserSetup = useCallback(async (currentToken) => {
         if (!currentToken) {
             setCurrentView('welcome');
             return;
         }
        try {
            console.log("Checking user setup with token:", currentToken); // Debug log
            const config = { headers: { 'x-auth-token': currentToken } };
            const budgetRes = await axios.get('/api/budgets', config);
            console.log("Budget response:", budgetRes.data); // Debug log
            // Check specifically if budgets array exists and is not empty
            if (budgetRes.data.budgets && budgetRes.data.budgets.length > 0) { 
                 console.log("User has budgets, going to dashboard"); // Debug log
                 setCurrentView('dashboard'); 
            } else {
                 // If no budgets or empty array, start onboarding
                 console.log("User has no budgets, starting onboarding"); // Debug log
                 setCurrentView('linkAccount'); 
            }
        } catch (error) {
             console.error("Error checking user setup:", error.response?.data || error.message); // Log more details
             // If error likely means token is invalid or backend issue
             setAuthToken(null); // Force logout
        }
    }, [setAuthToken]); // Include setAuthToken as dependency


    useEffect(() => {
        // On initial load, check token and setup status
        console.log("Initial load effect, token:", token); // Debug log
        checkUserSetup(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkUserSetup, token]); // Add token and checkUserSetup

    const handleGetStarted = () => setCurrentView('auth');
    const handleLinkAccount = () => setCurrentView('setBudgets');
    const handleSetBudgets = () => setCurrentView('dashboard');

    const renderView = () => {
         if (currentView === 'loading') {
             return <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>; 
         }
        switch (currentView) {
            case 'welcome':
                return <WelcomeScreen onGetStarted={handleGetStarted} />;
            case 'auth':
                return (
                    // Added overflow-y-auto to ensure content fits on smaller screens
                    <div className="h-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center p-4 overflow-y-auto"> 
                        <AuthScreen setAuthToken={setAuthToken} />
                    </div>
                );
            case 'linkAccount':
                return <LinkAccountScreen onLinkAccount={handleLinkAccount} token={token} />;
            case 'setBudgets':
                return <SetBudgetsScreen onSetBudgets={handleSetBudgets} token={token} />;
            case 'dashboard':
                return <Dashboard token={token} setAuthToken={setAuthToken} />;
            default:
                return <WelcomeScreen onGetStarted={handleGetStarted} />;
        }
    };

    return (
        <div className="bg-gray-200 flex justify-center items-center h-screen p-4">
            {/* Phone Shell */}
            <div className="w-full max-w-sm h-full max-h-[896px] bg-white rounded-[40px] border-[10px] border-black overflow-hidden shadow-2xl flex flex-col">
                {renderView()}
            </div>
        </div>
    );
};


// --- ONBOARDING SCREENS ---
const WelcomeScreen = ({ onGetStarted }) => (
    <div className="h-full flex flex-col justify-between p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center">
        {/* Content remains the same */}
        <div/>
        <div>
            <div className="flex justify-center items-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
            <h1 className="text-5xl font-extrabold tracking-tight">FinPulse</h1>
            <p className="text-lg text-indigo-200 mt-2">Stop Tracking Expenses. Start Controlling Them.</p>
        </div>
        <div className="w-full">
            <button onClick={onGetStarted} className="w-full bg-white text-indigo-600 font-bold py-4 px-4 rounded-xl text-lg shadow-2xl hover:bg-gray-100 transition-transform transform hover:scale-105">Get Started</button>
        </div>
    </div>
);

const LinkAccountScreen = ({ onLinkAccount, token }) => {
    // ... (Functionality remains the same, adjusted padding/margins slightly)
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleLink = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const config = { headers: { 'x-auth-token': token } };
            const accountData = { bankName, accountNumber, ifsc };
            await axios.post('/api/accounts', accountData, config);
            setIsLoading(false);
            onLinkAccount(); // Move to the next step
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.msg || 'Could not link account. Please try again.');
            console.error(err);
        }
    };

    return (
         // Added overflow-y-auto to ensure content fits
        <div className="h-full bg-gray-100 flex flex-col justify-center items-center p-6 text-center overflow-y-auto">
             <div className="bg-indigo-100 w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 flex-shrink-0"> 
                 <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             </div>
             <h2 className="text-2xl font-bold text-gray-800">Link Your Bank Account</h2> 
             <p className="text-gray-600 mt-2 text-sm leading-relaxed">This allows us to simulate incoming transaction notifications.</p>
             <form onSubmit={handleLink} className="mt-6 w-full space-y-3"> 
                 <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-4 py-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required disabled={isLoading}/>
                 <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required disabled={isLoading}/>
                 <input type="text" placeholder="IFSC Code" value={ifsc} onChange={(e) => setIfsc(e.target.value)} className="w-full px-4 py-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required disabled={isLoading}/>
                 {error && <p className="text-red-500 text-xs">{error}</p>} 
                 <button type="submit" className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl text-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? 'Linking...' : 'Link Account & Continue'}
                 </button>
             </form>
        </div>
    );
};

const SetBudgetsScreen = ({ onSetBudgets, token }) => {
    // ... (Functionality remains the same, adjusted padding/margins slightly)
    const [budgets, setBudgets] = useState([
        { category: 'Food', limit: 5000, icon: '🍕' },
        { category: 'Shopping', limit: 4000, icon: '🛍️' },
        { category: 'Travel', limit: 10000, icon: '✈️' },
        { category: 'Other', limit: 2000, icon: '🎁' },
    ]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleBudgetChange = (index, value) => {
        const newBudgets = [...budgets];
        newBudgets[index].limit = parseInt(value);
        setBudgets(newBudgets);
    };

    const handleFinish = async () => {
        setError('');
        setIsLoading(true);
        try {
            const config = { headers: { 'x-auth-token': token } };
            const budgetsToSave = budgets.map(({ category, limit }) => ({ category, limit }));
            await axios.post('/api/budgets/setup', { budgets: budgetsToSave }, config);
            setIsLoading(false);
            onSetBudgets();
        } catch (err) {
            setIsLoading(false);
            setError('Could not save budgets. Please try again.');
            console.error(err);
        }
    };

    return (
         // Added overflow-y-auto to ensure content fits
        <div className="h-full bg-gray-100 flex flex-col justify-center p-6 overflow-y-auto">
            <header className="text-center mb-6 flex-shrink-0"> 
                <h2 className="text-2xl font-bold text-gray-800">Set Your Budgets</h2> 
                <p className="text-gray-500 text-sm">You can always change these later.</p>
            </header>
            <div className="space-y-4 flex-grow"> 
                {budgets.map((budget, index) => (
                    <div key={budget.category}>
                        <label className="flex justify-between items-center font-semibold text-gray-700 text-sm"> 
                            <span>{budget.icon} {budget.category}</span>
                            <span className="font-bold text-indigo-600 text-md">₹{budget.limit.toLocaleString()}</span> 
                        </label>
                        <input type="range" min="500" max="50000" step="500" value={budget.limit} onChange={(e) => handleBudgetChange(index, e.target.value)} className="w-full mt-1" disabled={isLoading}/>
                    </div>
                ))}
            </div>
            {error && <p className="text-red-500 text-xs text-center mt-3">{error}</p>} 
            <button onClick={handleFinish} className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl text-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex-shrink-0" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Finish Setup'}
            </button>
        </div>
    );
};


// --- AUTHENTICATION COMPONENTS ---
// ... (AuthScreen, RegisterForm, LoginForm - adjusted slightly for space)
const AuthScreen = ({ setAuthToken }) => {
    const [isRegister, setIsRegister] = useState(true);
    return (
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full"> {/* Reduced padding */}
            <div className="flex justify-center items-center mb-4"> {/* Reduced margin */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h1 className="text-3xl font-extrabold text-gray-800 ml-2">FinPulse</h1>
            </div>
            {isRegister ? (
                <RegisterForm setIsRegister={setIsRegister} setAuthToken={setAuthToken} />
            ) : (
                <LoginForm setIsRegister={setIsRegister} setAuthToken={setAuthToken} />
            )}
        </div>
    );
}

const RegisterForm = ({ setIsRegister, setAuthToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/register', { email, password });
            setIsLoading(false);
            setAuthToken(res.data.token);
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.msg || 'An unexpected error occurred.');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-center text-gray-800">Create Your Account</h2> 
            <form onSubmit={handleRegister} className="mt-6 space-y-3"> 
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required disabled={isLoading}/> 
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required disabled={isLoading}/> 
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
            {error && <p className="text-red-500 text-xs text-center mt-3">{error}</p>} 
            <p className="text-center text-xs text-gray-500 mt-4"> 
                Already have an account? <button onClick={() => setIsRegister(false)} className="font-semibold text-indigo-600 hover:underline" disabled={isLoading}>Login</button>
            </p>
        </div>
    );
};

const LoginForm = ({ setIsRegister, setAuthToken }) => {
    // ... (Added Forgot Password)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            setIsLoading(false);
            setAuthToken(res.data.token);
        } catch (err) {
            setIsLoading(false);
            setError(err.response?.data?.msg || 'Invalid credentials.');
        }
    };

    const handleForgotPassword = () => {
        // For hackathon: Just log a message. Real implementation requires backend.
        console.log("Forgot Password clicked!");
        alert("Password reset functionality is not implemented in this demo.");
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-center text-gray-800">Welcome Back!</h2> 
            <form onSubmit={handleLogin} className="mt-6 space-y-3"> 
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required disabled={isLoading}/> 
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" required disabled={isLoading}/> 
                 <div className="text-right">
                     <button type="button" onClick={handleForgotPassword} className="text-xs text-indigo-600 hover:underline" disabled={isLoading}>Forgot Password?</button>
                 </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
             {error && <p className="text-red-500 text-xs text-center mt-3">{error}</p>} 
            <p className="text-center text-xs text-gray-500 mt-4"> 
                Don't have an account? <button onClick={() => setIsRegister(true)} className="font-semibold text-indigo-600 hover:underline" disabled={isLoading}>Register</button>
            </p>
        </div>
    );
};

// --- DASHBOARD COMPONENTS ---
const Dashboard = ({ token, setAuthToken }) => {
    // ... (This component is now fully functional)
    const [budgets, setBudgets] = useState([]);
    const [showCategorizationModal, setShowCategorizationModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [simulatedTransaction, setSimulatedTransaction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBudgets = useCallback(async () => {
        setIsLoading(true); 
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get('/api/budgets', config);
            setBudgets(res.data.budgets || []);
        } catch (err) {
            console.error("Fetch Budgets Error:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setAuthToken(null); 
            }
        } finally {
            setIsLoading(false); 
        }
    }, [token, setAuthToken]);

    useEffect(() => {
        if (token) { 
            fetchBudgets();
        }
    }, [fetchBudgets, token]); 


    const handleSimulatePayment = () => {
        const transaction = { description: 'Zomato Order', amount: 450 };
        setSimulatedTransaction(transaction);
        setShowCategorizationModal(true);
    };

    const handleCategorize = async (category) => {
        setShowCategorizationModal(false);
        if (!simulatedTransaction) return; 

        try {
            const config = { headers: { 'x-auth-token': token } };
            const transactionData = { 
                ...simulatedTransaction, 
                category, 
                amount: Number(simulatedTransaction.amount) || 0 
            }; 
            const res = await axios.post('/api/budgets/transaction', transactionData, config);
            
            setBudgets(res.data.budgets || []); 

            const updatedBudget = res.data.budgets.find(b => b.category === category);
            if (updatedBudget) {
                const limit = updatedBudget.limit > 0 ? updatedBudget.limit : 1;
                const percentage = (updatedBudget.spent / limit) * 100;
                if (percentage >= 90) {
                    setShowWarningModal(true);
                }
            }
        } catch (err) {
             console.error("Categorization failed", err);
        } finally {
            setSimulatedTransaction(null); 
        }
    };
    
    const handleLogout = () => setAuthToken(null);

    return (
        <div className="h-full flex flex-col bg-gray-100">
            {showCategorizationModal && <CategorizationModal transaction={simulatedTransaction} onCategorize={handleCategorize} onCancel={() => setShowCategorizationModal(false)} />}
            {showWarningModal && <WarningAlertModal onClose={() => setShowWarningModal(false)} />}

            {/* Header: Fixed Height */}
            <header className="bg-indigo-600 text-white shadow-lg flex-shrink-0">
                <div className="px-6 py-3 flex justify-between items-center"> 
                    <h1 className="text-lg font-bold">FinPulse</h1> 
                    <button onClick={handleLogout} className="bg-white text-indigo-600 font-bold py-1 px-3 rounded-lg hover:bg-gray-200 transition text-xs">Logout</button> 
                </div>
            </header>
            
            {/* Main Content: Takes remaining space and scrolls */}
            <main className="flex-grow p-4 overflow-y-auto"> 
                <div className="bg-white rounded-xl shadow-md p-4 mb-4 text-center"> 
                    <p className="text-gray-500 text-xs">Safe to Spend Today</p> 
                    <p className="text-4xl font-extrabold text-gray-800 tracking-tight mt-1">₹1,250</p> 
                </div>

                <h2 className="text-lg font-bold text-gray-700 mb-3">Monthly Budgets</h2> 
                <div className="space-y-4"> 
                    {isLoading ? (
                        <p className="text-gray-500 text-sm text-center">Loading budgets...</p>
                    ) : budgets.length > 0 ? (
                         budgets.map(budget => <BudgetCard key={budget.category} budget={budget} />)
                    ) : (
                         <p className="text-gray-500 text-sm text-center">No budgets set up yet.</p>
                    )}
                </div>
            </main>
             
             {/* Footer: Fixed Height */}
             <footer className="p-4 flex-shrink-0 border-t bg-white">
                <button onClick={handleSimulatePayment} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-md">
                    Simulate UPI Payment
                </button>
            </footer>
        </div>
    );
};

const BudgetCard = ({ budget }) => {
    // ... (Adjusted padding/margins slightly)
    const { category = 'Unknown', spent = 0, limit = 1, transactions = [] } = budget || {};
    const effectiveLimit = limit > 0 ? limit : 1; 
    const percentage = Math.min((spent / effectiveLimit) * 100, 100);

    return (
        <div className="bg-white p-3 rounded-xl shadow-md flex items-center space-x-3"> 
            <ProgressRing percentage={percentage} />
            <div className="flex-grow">
                <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-bold text-gray-800">{category}</h3> 
                     <p className="text-xs font-semibold text-gray-500">₹{spent.toLocaleString()} / <span className="text-gray-400">₹{limit.toLocaleString()}</span></p> 
                </div>
                <div className="mt-1 text-xs text-gray-500 space-y-1 border-t pt-1"> 
                    <h4 className="font-bold text-gray-400 uppercase tracking-wider text-right text-[10px]">Recent</h4> 
                    {(transactions || []).slice(-2).map((t, index) => ( 
                        <div key={t._id || index} className="flex justify-between text-[10px]"> 
                            <span>- {t.description}</span>
                            <span>₹{t.amount}</span>
                        </div>
                    ))}
                    {(transactions || []).length === 0 && <p className="text-right italic text-[10px]">No transactions yet.</p>}
                </div>
            </div>
        </div>
    );
};


// --- MODAL COMPONENTS ---
// ... (These components are mostly unchanged)
const CategorizationModal = ({ transaction, onCategorize, onCancel }) => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm text-center">
            <p className="text-gray-600 mb-2">New UPI Transaction Detected!</p>
            <p className="text-sm text-gray-500">{transaction?.description || 'Unknown Transaction'}</p>
            <p className="text-5xl font-bold text-gray-900 my-4">₹{transaction?.amount || 0}</p>
            <p className="text-lg font-semibold mb-6">What was this for?</p>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onCategorize('Food')} className="bg-yellow-100 text-yellow-800 font-semibold p-4 rounded-lg text-lg flex items-center justify-center space-x-2 transition transform hover:scale-105"><span>🍕</span><span>Food</span></button>
                <button onClick={() => onCategorize('Shopping')} className="bg-blue-100 text-blue-800 font-semibold p-4 rounded-lg text-lg flex items-center justify-center space-x-2 transition transform hover:scale-105"><span>🛍️</span><span>Shopping</span></button>
                <button onClick={() => onCategorize('Travel')} className="bg-green-100 text-green-800 font-semibold p-4 rounded-lg text-lg flex items-center justify-center space-x-2 transition transform hover:scale-105"><span>✈️</span><span>Travel</span></button>
                <button onClick={() => onCategorize('Other')} className="bg-gray-100 text-gray-800 font-semibold p-4 rounded-lg text-lg flex items-center justify-center space-x-2 transition transform hover:scale-105"><span>🎁</span><span>Other</span></button>
            </div>
            <button onClick={onCancel} className="text-xs text-gray-400 mt-6">Cancel</button>
        </div>
    </div>
);

const WarningAlertModal = ({ onClose }) => (
    <div className="absolute inset-0 bg-red-600/90 backdrop-blur-sm flex justify-center items-center p-6 text-white text-center z-50">
        <div>
            <div className="text-7xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold mb-2">Budget Limit Warning!</h2>
            <p className="text-xl leading-relaxed">You have spent over 90% of your budget for this category.</p>
            <button onClick={onClose} className="mt-8 bg-white text-red-600 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105">I Understand</button>
        </div>
    </div>
);

export default App;

