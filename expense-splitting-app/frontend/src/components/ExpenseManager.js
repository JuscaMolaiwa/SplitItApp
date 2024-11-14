import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GroupMembers from './GroupMembers';
import CreateExpense from './CreateExpenses';

const ExpenseManager = () => {
    const [expenses, setExpenses] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [balances, setBalances] = useState({});
    const [error, setError] = useState(null);

    const groupId = localStorage.getItem('group_id'); // Retrieve groupId from localStorage
    console.log('The Selected group ID:', groupId);
    // Fetch expenses and members when groupId is available
    useEffect(() => {
        console.log('Group ID from localStorage:', groupId);
        if (groupId) {
            fetchExpenses();
            fetchGroupMembers();
        } else {
            setError('Group ID is missing.');
        }
    }, [groupId]); // This effect runs when groupId changes

    const fetchExpenses = async () => {
        
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (!token) {
            setError('Authentication token is missing!');
            return;
        }
        try {
            
            const response = await fetch(`http://127.0.0.1:5000/api/expenses?group_id=${groupId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setExpenses(data.expenses);
            } else {
                setError(data.error || 'Failed to fetch expenses.');
            }
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
            setError('An error occurred while fetching expenses.');
        }
    };

    const fetchGroupMembers = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('Authentication token is missing!');
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/groups/members?group_id=${groupId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setGroupMembers(data.members);
            } else {
                setError(data.error || 'Failed to fetch group members.');
            }
        } catch (error) {
            console.error('Failed to fetch group members:', error);
            setError('An error occurred while fetching group members.');
        }
    };

    const calculateBalances = () => {
        const balances = {};
        groupMembers.forEach(member => balances[member.id] = 0);

        expenses.forEach(expense => {
            const amountPerMember = expense.amount / groupMembers.length;
            balances[expense.paid_by] = (balances[expense.paid_by] || 0) + expense.amount;

            // Subtract the split expense from each member's balance
            groupMembers.forEach(member => {
                if (member.id !== expense.paid_by) {
                    balances[member.id] = (balances[member.id] || 0) - amountPerMember;
                }
            });
        });

        setBalances(balances);
    };

    useEffect(() => {
        calculateBalances();
    }, [expenses, groupMembers]);

    // Calculate the total group balance
    const totalGroupBalance = Object.values(balances).reduce((total, balance) => total + balance, 0).toFixed(2);

    return (
        <div>
            <h2>Expense Manager</h2>
            <CreateExpense groupId={groupId} onExpenseCreated={fetchExpenses} />
            <GroupMembers groupId={groupId} />
            <h3>Group Balances</h3>
            {error && <p className="text-red-500">{error}</p>}
            <ul>
                {Object.entries(balances).map(([memberId, balance]) => (
                    <li key={memberId}>
                        Member ID: {memberId} - Balance: {balance.toFixed(2)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExpenseManager;
