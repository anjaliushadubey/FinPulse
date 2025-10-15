import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- SVG Icon for Progress Ring ---
const ProgressRing = ({ percentage }) => {
    const stroke = 8;
    const radius = 54;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let color = '#34D399'; // Green
    if (percentage > 75) color = '#FBBF24'; // Yellow
    if (percentage > 90) color = '#EF4444'; // Red

    return (
        <div className="relative w-28 h-28 flex-shrink-0">
            <svg height="100%" width="100%" viewBox="0 0 120 120" className="transform -rotate-90">
                <circle stroke="#e5e7eb" cx={radius + stroke} cy={radius + stroke} r={normalizedRadius} strokeWidth={stroke} fill="transparent" />
                <circle
                    stroke={color} cx={radius + stroke} cy={radius + stroke} r={normalizedRadius} strokeWidth={stroke} fill="transparent"
                    strokeDasharray={`${circumference} ${circumference}`} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-700">{`${Math.round(percentage)}%`}</span>
        </div>
    );
};

// --- Main App Component: Controls the overall flow ---
const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [currentView, setCurrentView] = useState(token ? 'dashboard' : 'welcome');

    const setAuthToken = (newToken) => {
        if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setCurrentView('linkAccount'); 
        } else {
            localStorage.removeItem('token');
            setToken(null);
            setCurrentView('welcome');
        }
    };

    useEffect(() => {
        if (token) {
            setCurrentView('dashboard');
        }
    }, [token]);

    const handleGetStarted = () => setCurrentView('auth');
    const handleLinkAccount = () => setCurrentView('setBudgets');
    const handleSetBudgets = () => setCurrentView('dashboard');

    const renderView = () => {
        switch (currentView) {
            case 'welcome':
                return <WelcomeScreen onGetStarted={handleGetStarted} />;
            case 'auth':
                return (
                    <div className="h-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center p-4">
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
            <div className="w-full max-w-sm h-full max-h-[896px] bg-white rounded-[40px] border-[10px] border-black overflow-hidden shadow-2xl flex flex-col">
                {renderView()}
            </div>
        </div>
    );
};


// --- ONBOARDING SCREENS ---
const WelcomeScreen = ({ onGetStarted }) => (
    <div className="h-full flex flex-col justify-between p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-center">
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
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [error, setError] = useState('');

    const handleLink = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const config = { headers: { 'x-auth-token': token } };
            const accountData = { bankName, accountNumber, ifsc };
            await axios.post('/api/accounts', accountData, config);
            onLinkAccount(); // Move to the next step
        } catch (err) {
            setError('Could not link account. Please check details and try again.');
            console.error(err);
        }
    };

    return (
        <div className="h-full bg-gray-100 flex flex-col justify-center items-center p-8 text-center">
             <div className="bg-indigo-100 w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6">
                 <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
             </div>
             <h2 className="text-3xl font-bold text-gray-800">Link Your Bank Account</h2>
             <p className="text-gray-600 mt-2 text-sm leading-relaxed">This allows us to simulate incoming transaction notifications.</p>
             <form onSubmit={handleLink} className="mt-6 w-full space-y-4">
                 <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-4 py-3 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                 <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-3 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                 <input type="text" placeholder="IFSC Code" value={ifsc} onChange={(e) => setIfsc(e.target.value)} className="w-full px-4 py-3 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                 {error && <p className="text-red-500 text-sm">{error}</p>}
                 <button type="submit" className="mt-4 w-full bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl text-lg hover:bg-indigo-700 transition shadow-lg">Link Account & Continue</button>
             </form>
        </div>
    );
};

const SetBudgetsScreen = ({ onSetBudgets, token }) => {
    const [budgets, setBudgets] = useState([
        { category: 'Food', limit: 5000, icon: '🍕' },
        { category: 'Shopping', limit: 4000, icon: '🛍️' },
        { category: 'Travel', limit: 10000, icon: '✈️' },
        { category: 'Other', limit: 2000, icon: '🎁' },
    ]);
    const [error, setError] = useState('');

    const handleBudgetChange = (index, value) => {
        const newBudgets = [...budgets];
        newBudgets[index].limit = parseInt(value);
        setBudgets(newBudgets);
    };

    const handleFinish = async () => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            const budgetsToSave = budgets.map(({ category, limit }) => ({ category, limit }));
            await axios.post('/api/budgets/setup', { budgets: budgetsToSave }, config);
            onSetBudgets();
        } catch (err) {
            setError('Could not save budgets. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="h-full bg-gray-100 flex flex-col justify-center p-8">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Set Your Budgets</h2>
                <p className="text-gray-500">You can always change these later.</p>
            </header>
            <div className="space-y-6">
                {budgets.map((budget, index) => (
                    <div key={budget.category}>
                        <label className="flex justify-between items-center font-semibold text-gray-700">
                            <span>{budget.icon} {budget.category}</span>
                            <span className="font-bold text-indigo-600 text-lg">₹{budget.limit.toLocaleString()}</span>
                        </label>
                        <input type="range" min="500" max="50000" step="500" value={budget.limit} onChange={(e) => handleBudgetChange(index, e.target.value)} className="w-full mt-2" />
                    </div>
                ))}
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            <button onClick={handleFinish} className="mt-8 w-full bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl text-lg hover:bg-indigo-700 transition shadow-lg">Finish Setup</button>
        </div>
    );
};


// --- AUTHENTICATION COMPONENTS ---
const AuthScreen = ({ setAuthToken }) => {
    const [isRegister, setIsRegister] = useState(true);
    return (
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full">
            <div className="flex justify-center items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <h1 className="text-4xl font-extrabold text-gray-800 ml-2">FinPulse</h1>
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/auth/register', { email, password });
            setAuthToken(res.data.token);
        } catch (err) {
            setError(err.response?.data?.msg || 'An unexpected error occurred.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-gray-800">Create Your Account</h2>
            <form onSubmit={handleRegister} className="mt-8 space-y-4">
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">Register</button>
            </form>
            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account? <button onClick={() => setIsRegister(false)} className="font-semibold text-indigo-600 hover:underline">Login</button>
            </p>
        </div>
    );
};

const LoginForm = ({ setIsRegister, setAuthToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            setAuthToken(res.data.token);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid credentials.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back!</h2>
            <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">Login</button>
            </form>
             {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account? <button onClick={() => setIsRegister(true)} className="font-semibold text-indigo-600 hover:underline">Register</button>
            </p>
        </div>
    );
};

// --- DASHBOARD COMPONENTS ---
const Dashboard = ({ token, setAuthToken }) => {
    const [budgets, setBudgets] = useState([]);
    const [showCategorizationModal, setShowCategorizationModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [simulatedTransaction, setSimulatedTransaction] = useState(null);

    const fetchBudgets = useCallback(async () => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get('/api/budgets', config);
            setBudgets(res.data.budgets || []);
        } catch (err) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setAuthToken(null);
            }
        }
    }, [token, setAuthToken]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const handleSimulatePayment = () => {
        const transaction = { description: 'Zomato Order', amount: 450 };
        setSimulatedTransaction(transaction);
        setShowCategorizationModal(true);
    };

    const handleCategorize = async (category) => {
        setShowCategorizationModal(false);
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post('/api/budgets/transaction', { ...simulatedTransaction, category }, config);
            
            const updatedBudget = res.data.budgets.find(b => b.category === category);
            if (updatedBudget) {
                const percentage = (updatedBudget.spent / updatedBudget.limit) * 100;
                if (percentage >= 90) {
                    setShowWarningModal(true);
                }
            }
            fetchBudgets();
        } catch (err) {
             console.error("Categorization failed", err);
        }
    };
    
    const handleLogout = () => setAuthToken(null);

    return (
        <div className="h-full flex flex-col bg-gray-100">
            {showCategorizationModal && <CategorizationModal transaction={simulatedTransaction} onCategorize={handleCategorize} onCancel={() => setShowCategorizationModal(false)} />}
            {showWarningModal && <WarningAlertModal onClose={() => setShowWarningModal(false)} />}

            <header className="bg-indigo-600 text-white shadow-lg flex-shrink-0">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">FinPulse</h1>
                    <button onClick={handleLogout} className="bg-white text-indigo-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition text-sm">Logout</button>
                </div>
            </header>
            
            <main className="flex-grow p-6 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 text-center">
                    <p className="text-gray-500 text-sm">Safe to Spend Today</p>
                    <p className="text-5xl font-extrabold text-gray-800 tracking-tight mt-1">₹1,250</p>
                </div>

                <h2 className="text-xl font-bold text-gray-700 mb-4">Monthly Budgets</h2>
                <div className="space-y-6">
                    {budgets.length > 0 ? budgets.map(budget => <BudgetCard key={budget.category} budget={budget} />) : <p className="text-gray-500">Setting up your budgets...</p>}
                </div>
            </main>
             <footer className="p-4 flex-shrink-0">
                <button onClick={handleSimulatePayment} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-md">Simulate UPI Payment</button>
            </footer>
        </div>
    );
};

const BudgetCard = ({ budget }) => {
    // ... (This component is unchanged)
    const { category = 'Unknown', spent = 0, limit = 1, transactions = [] } = budget || {};
    const percentage = Math.min((spent / limit) * 100, 100);

    return (
        <div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-4">
            <ProgressRing percentage={percentage} />
            <div className="flex-grow">
                <div className="flex justify-between items-baseline">
                    <h3 className="text-xl font-bold text-gray-800">{category}</h3>
                     <p className="text-sm font-semibold text-gray-500">₹{spent.toLocaleString()} / <span className="text-gray-400">₹{limit.toLocaleString()}</span></p>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1 border-t pt-2">
                    <h4 className="font-bold text-gray-400 uppercase tracking-wider text-right">Recent</h4>
                    {transactions.slice(-2).map(t => (
                        <div key={t._id} className="flex justify-between">
                            <span>- {t.description}</span>
                            <span>₹{t.amount}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- MODAL COMPONENTS ---
// ... (These components are unchanged)
const CategorizationModal = ({ transaction, onCategorize, onCancel }) => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm text-center">
            <p className="text-gray-600 mb-2">New UPI Transaction Detected!</p>
            <p className="text-sm text-gray-500">{transaction.description}</p>
            <p className="text-5xl font-bold text-gray-900 my-4">₹{transaction.amount}</p>
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

