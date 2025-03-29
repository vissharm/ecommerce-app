import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { getAuthData } from '../../utils/secureStorage';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contact: '',
    dob: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { token } = getAuthData();
    console.log('Current token:', token); // Debug log
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile...'); 
      const { token } = getAuthData();
      console.log('Using token:', token);
      
      const response = await axiosInstance.get('/api/users/profile');
      console.log('Profile response:', response.data);
      setProfile(response.data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      console.error('Error response:', err.response);
      setError('Failed to load profile');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put('/api/users/profile', 
        { email: profile.email, name: profile.name }
      );
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            disabled
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Contact</label>
          <input
            type="tel"
            name="contact"
            value={profile.contact}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={profile.dob?.split('T')[0]}
            disabled
          />
        </div>
        {isEditing ? (
          <div className="button-group">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)}>Edit</button>
        )}
      </form>
    </div>
  );
};

export default Profile;



