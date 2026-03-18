import React, { useState, useEffect } from 'react';
import { getDoctorStatus, bookToken } from './api';

function App() {
  const [doctorId, setDoctorId] = useState(''); 
  const [queue, setQueue] = useState([]);
  const [form, setForm] = useState({ patientName: '', type: 'Walk-in' });

  useEffect(() => {
    if (doctorId) {
      const interval = setInterval(async () => {
        try {
          const res = await getDoctorStatus(doctorId);
          setQueue(res.data[0]?.tokens || []);
        } catch (err) {
          console.error("Sync error:", err);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [doctorId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await bookToken({ ...form, doctorId });
      setForm({ patientName: '', type: 'Walk-in' }); 
      alert("Booking Successful!");
    } catch (err) {
      alert("Booking failed: Slot likely full.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-primary">🏥 OPD Token Engine</h1>
        <p className="lead">Elastic Capacity & Priority Management System</p>
      </div>
      
      <div className="row">
        {/* Left Side: Controls */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Setup</h5>
              <input 
                className="form-control"
                placeholder="Paste Doctor ID..." 
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              />
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">New Appointment</h5>
              <form onSubmit={handleBooking}>
                <div className="mb-3">
                  <input 
                    className="form-control"
                    placeholder="Patient Name" 
                    value={form.patientName}
                    onChange={(e) => setForm({...form, patientName: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <select className="form-select" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Paid">Paid Priority</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <button className="btn btn-primary w-100" type="submit">Book Token</button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Live Queue */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Live Queue Status</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((token) => (
                    <tr key={token._id} className={token.status === 'Bumped' ? 'table-danger text-decoration-line-through' : ''}>
                      <td className="fw-bold">{token.patientName}</td>
                      <td>
                        <span className={`badge ${
                          token.type === 'Emergency' ? 'bg-danger' : 
                          token.type === 'Paid' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {token.type}
                        </span>
                      </td>
                      <td>
                        <span className={`text-uppercase small fw-bold ${token.status === 'Bumped' ? 'text-danger' : 'text-success'}`}>
                          {token.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;