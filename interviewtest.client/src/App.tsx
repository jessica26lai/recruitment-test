import { useEffect, useState } from 'react';

import './App.css';
import { Employee } from '../model/Employee';

function App() {
    //const [employeeCount, setEmployeeCount] = useState<number>(0);

    const [employees, setEmployees] = useState<Employee[]>([]);

    const [newName, setNewName] = useState('');
    const [newValue, setNewValue] = useState<number>(0);
    const [showAddForm, setShowAddForm] = useState(false);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editValue, setEditValue] = useState<number>(0);

    const [sumABC, setSumABC] = useState<Employee[]>([]); 

    useEffect(() => {
        //checkConnectivity();
        fetchEmployees();
    }, []);

    const [loading, setLoading] = useState(false);

    const startEdit = (idx: number) => {
        setEditingIndex(idx);
        setEditName(employees[idx].name);
        setEditValue(employees[idx].value);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
    };

    const submitEdit = async () => {
        if (editingIndex === null) return;

        const original = employees[editingIndex];
        try {
            const res = await fetch(`/api/list/update/${encodeURIComponent(original.name)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, value: editValue }),
            });
            if (!res.ok) throw new Error(await res.text());
            await fetchEmployees();
            setEditingIndex(null);

            alert(`Employee "${editName}" updated successfully`);
        } catch (err) {
            console.error(err);
            alert(`Failed to update employee \n${err}`);
        }
    };

    const deleteEmployee = async (idx: number) => {
        const emp = employees[idx];
        if (!confirm(`Are you sure you want to delete "${emp.name}"?`)) return;
        try {
            const res = await fetch(`/api/list/delete/${encodeURIComponent(emp.name)}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error(await res.text());
            await fetchEmployees();

            setTimeout(() => {
                alert(`Employee "${emp.name}" deleted successfully`);
            }, 0);
        } catch (err) {
            console.error(err);
            alert(`Failed to delete employee \n${err}`);
        }
    };

    const incrementValue = async () => {
        cancelEdit(); 
        setShowAddForm(false);
        setLoading(true); 
        try {
            if (employees.length == 0) {
                throw Error("There are no employees.");
            }
            const res = await fetch('/api/list/increment-values', { method: 'POST' });
            if (!res.ok) throw new Error(await res.text());
            await fetchEmployees();
            alert('Increment values Success');

        } catch (err) {
            console.error(err);
            alert(`Failed to increment values \n${err}`);
        } finally {
            setLoading(false); 
        }
    };


    const getSumABC = async () => {
        setLoading(true);
        try {
            if (employees.length == 0) {
                throw Error("There are no employees.");
            }
            const res = await fetch('/api/list/sum-abc');
            if (!res.ok) throw new Error(await res.text());
            const data: Employee[] = await res.json(); 

            if (data.length == 0) {
                throw Error("No data match the requirements.");
            }

            setSumABC(data); 
        } catch (err) {
            console.error(err);
            alert(`Failed to get sum \n${err}`);
        } finally {
            setLoading(false);
        }
    };

    return (<>

        {/* Loading overlay */}
        {loading && (
            <div className="app-overlay">
                Loading, please wait...
            </div>
        )}

        {/*
        <div>Connectivity check: {employeeCount > 0 ? `OK (${employeeCount})` : `NOT READY`}</div>
        <div>Complete your app here</div>*/}
        <h2>Employees</h2>

        {/* If sumABC has data, show the sum table */}
        {sumABC.length > 0 ? (
            <div> 
                <h3>Sum of Values of A,B,C &gt;=11171</h3>
                
                <table className="app-sum-table">
                    <thead>
                        <tr>
                            <th>Initial</th>
                            <th>Sum of Values</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sumABC.map((emp, idx) => (
                            <tr key={idx}>
                                <td>{emp.name}</td>
                                <td>{emp.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="app-btn app-back-btn" onClick={() => setSumABC([])} disabled={loading}>Back</button>
            </div>
        ) : (
            <div>
                <div className="app-controls">
                        <button className="app-btn" onClick={() => setShowAddForm(!showAddForm)} disabled={loading}>Add Employee</button>
                    <button className="app-btn" onClick={() => incrementValue()} disabled={loading}>Increment Value</button>
                    <button className="app-btn" onClick={() => getSumABC()} disabled={loading}>Get Sum A/B/C</button>
                    </div>

                    {/* Show add form if add button is clicked */ }
                    {showAddForm && (
                        <div className="app-add-form">
                            <h3>Add Employee</h3>
                            <div className="app-add-inputs">
                                <label>
                                    Name:{' '}
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="app-text-input"
                                    />
                                </label>
                            </div>
                            <div className="app-add-inputs">
                                <label>
                                    Value:{' '}
                                    <input
                                        type="number"
                                        value={newValue}
                                        onChange={(e) => setNewValue(Number(e.target.value))}
                                        className="app-number-input"
                                    />
                                </label>
                            </div>
                            <div className="app-add-btn-container">
                                <button
                                    className="app-btn app-btn-primary"
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const res = await fetch('/api/list/add', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ name: newName.trim(), value: newValue }),
                                            });
                                            if (!res.ok) throw new Error(await res.text());
                                            await fetchEmployees();
                                            alert(`Employee "${newName}" added successfully`);
                                            setNewName('');
                                            setNewValue(0);
                                            setShowAddForm(false);
                                        } catch (err) {
                                            console.error(err);
                                            alert(`Failed to add employee: \n${err}`);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading || !newName.trim()}
                                >
                                    Add
                                </button>{' '}
                                <button className="app-btn" onClick={() => setShowAddForm(false)} disabled={loading}>
                                    Back
                                </button>
                            </div>
                        </div>
                    )}


                {/* Show employee list if there are employees */}

                {employees.length > 0 ? (
                            <table className="app-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Value</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        {editingIndex === idx ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                        ) : (
                                            emp.name
                                        )}
                                    </td>
                                    <td>
                                        {editingIndex === idx ? (
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) =>
                                                    setEditValue(Number(e.target.value))
                                                }
                                                className="app-number-input"
                                            />
                                        ) : (
                                            emp.value
                                        )}
                                    </td>
                                    <td>
                                        {editingIndex === idx ? (
                                            <>
                                                <button className="app-btn app-btn-primary" onClick={submitEdit} disabled={loading}>Submit</button>{' '}
                                                <button className="app-btn" onClick={cancelEdit} disabled={loading}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                    <button className="app-btn" onClick={() => startEdit(idx)} disabled={loading}>Edit</button>{' '}
                                                    <button className="app-btn app-btn-danger" onClick={() => deleteEmployee(idx)} disabled={loading}>Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No employees found.</p>
                )}
            </div>
        )}


    </>);

    //async function checkConnectivity() {
    //    const response = await fetch('api/employees');
    //    const data = await response.json();
    //    setEmployeeCount(data.length);
    //}


    async function fetchEmployees() {
        const response = await fetch('api/employees');
        const data = await response.json();
        setEmployees(data);
    }
}

export default App;