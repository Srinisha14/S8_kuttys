import React, { useState } from 'react';
import axios from 'axios';

const Questionnaire = () => {
    const [form, setForm] = useState({
        study_level: "",
        domain: "",
        knowledge_level: "",
        learning_style: ""
    });
    const [courses, setCourses] = useState([]);
    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        axios.post('http://localhost:5000/questionnaire', form, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setCourses(res.data))
          .catch(err => console.error(err));
    };

    const handleEnroll = (courseTitle) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        axios.post('http://localhost:5000/enroll', { course: courseTitle }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => alert(res.data.message))
          .catch(err => console.error(err));
    };

    return (
        <div className="questionnaire">
            <h2>Find the Right Course for You</h2>
            <form onSubmit={handleSubmit}>
                <label>Highest Level of Study:</label>
                <select name="study_level" onChange={handleChange}>
                    <option>High School</option>
                    <option>Undergraduate</option>
                    <option>Postgraduate</option>
                </select>

                <label>Interested Domain:</label>
                <select name="domain" onChange={handleChange}>
                    <option>Machine Learning</option>
                    <option>Data Analysis</option>
                    <option>Business Essentials</option>
                </select>

                <label>Level of Knowledge:</label>
                <select name="knowledge_level" onChange={handleChange}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                </select>

                <label>Preferred Learning Style:</label>
                <select name="learning_style" onChange={handleChange}>
                    <option>Visual</option>
                    <option>Auditory</option>
                    <option>Kinesthetic</option>
                    <option>General</option>
                </select>

                <button type="submit">Get Recommendations</button>
            </form>

            {courses.length > 0 && (
                <div>
                    <h3>Recommended Courses</h3>
                    <div className="course-list">
                        {courses.map((course, index) => (
                            <div key={index} className="course-card">
                                <h4>{course.Title}</h4>
                                <p>{course.Description}</p>
                                <button onClick={() => handleEnroll(course.Title)}>Enroll</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Questionnaire;
