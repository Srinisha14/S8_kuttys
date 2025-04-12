import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Login from './Login';
import Register from './Register';
import './App.css';
import CourseCarousel from './CourseCarousel'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please try again.</h2>;
    }
    return this.props.children;
  }
}


const colors = ["#3498db", "#2ecc71", "#f39c12", "#9b59b6"];
const RADIAN = Math.PI / 180;

// Custom Label for PieChart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
// Search Input Component - Revised
const SearchInput = ({ onSearch, initialQuery }) => {
  const [localQuery, setLocalQuery] = useState(initialQuery || '');
  
  // Update local state when parent query changes
  useEffect(() => {
    setLocalQuery(initialQuery || '');
  }, [initialQuery]);
  
  const handleChange = (e) => {
    setLocalQuery(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localQuery);
  };
  
  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input 
        type="text" 
        className="search-input" 
        value={localQuery} 
        onChange={handleChange} 
        placeholder="Search courses..." 
      />
      <button type="submit" className="btn btn-primary">Search</button>
    </form>
  );
};

// Course Card Component
const CourseCard = ({ course, enrollCourse }) => {
  const categoryClass = `category-${course.Category.toLowerCase()}`;
  
  return (
    <div className="course-card">
      <div className="course-header">
        <h3 className="course-title">{course.Title}</h3>
        <span className={`course-category ${categoryClass}`}>{course.Category}</span>
      </div>
      <div className="course-content">
        <p className="course-description">{course.short_intro}</p>
      </div>
      <div className="course-actions">
      <button className="btn btn-outline" onClick={() => window.open(course.URL, '_blank')}>
  View Course </button>
        <button className="btn btn-primary" onClick={() => enrollCourse(course)}>
          Enroll
        </button>
      </div>
    </div>
  );
};

// Updated Questionnaire Component with Modal/Popup styling
const Questionnaire = ({ submitQuestionnaire, cancelQuestionnaire }) => {
  const [educationLevel, setEducationLevel] = useState('');
  const [domain, setDomain] = useState('');
  const [knowledgeLevel, setKnowledgeLevel] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const domains = [
    "Machine Learning", "Data Analysis", "Business Essentials", "Data Management", 
    "Security", "Software Development", "Design and Product", "Cloud Computing", 
    "Mobile and Web Development", "Algorithms", "Finance", "Leadership and Management", 
    "Music and Art", "Learning English", "Entrepreneurship", "Marketing", 
    "Business Strategy", "Personal Development", "Governance and Society", 
    "Healthcare Management", "Networking", "Education", "Computer Security and Networks", 
    "Nutrition", "Public Health", "Probability and Statistics", "Electrical Engineering", 
    "Basic Science", "Patient Care", "Health Informatics", "Philosophy", 
    "Environmental Science and Sustainability", "Math and Logic", "Other Languages", 
    "Psychology", "Mechanical Engineering", "Physics and Astronomy", "Law", 
    "Biology", "Support and Operations", "Research Methods", "Research", 
    "Economics", "Chemistry", "History"
  ];

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    submitQuestionnaire({
      education_level: educationLevel,
      domain: domain,
      knowledge_level: knowledgeLevel,
      learning_style: learningStyle
    });
  };

  return (
    <div className="questionnaire-modal-overlay">
      <div className="questionnaire-modal">
        <div className="questionnaire-modal-header">
          <h2>Course Recommendation Questionnaire</h2>
          <button className="close-button" onClick={cancelQuestionnaire}>×</button>
        </div>
        
        <div className="progress-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className="progress-line"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className="progress-line"></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
          <div className="progress-line"></div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4</div>
        </div>
        
        <div className="questionnaire-modal-content">
          {currentStep === 1 && (
            <div className="question-step">
              <h3>What is your highest level of study?</h3>
              <div className="options">
                <label className={`option ${educationLevel === 'High school' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="educationLevel" 
                    value="High school" 
                    checked={educationLevel === 'High school'} 
                    onChange={(e) => setEducationLevel(e.target.value)} 
                  />
                  High school
                </label>
                <label className={`option ${educationLevel === 'Under graduate' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="educationLevel" 
                    value="Under graduate" 
                    checked={educationLevel === 'Under graduate'} 
                    onChange={(e) => setEducationLevel(e.target.value)} 
                  />
                  Under graduate
                </label>
                <label className={`option ${educationLevel === 'Post graduate' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="educationLevel" 
                    value="Post graduate" 
                    checked={educationLevel === 'Post graduate'} 
                    onChange={(e) => setEducationLevel(e.target.value)} 
                  />
                  Post graduate
                </label>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="question-step">
              <h3>Which domain are you interested in?</h3>
              <div className="domain-select">
                <select 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)}
                  className="domain-dropdown"
                >
                  <option value="">-- Select a domain --</option>
                  {domains.map((d, index) => (
                    <option key={index} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="question-step">
              <h3>What is your level of knowledge?</h3>
              <div className="options">
                <label className={`option ${knowledgeLevel === 'Beginner' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="knowledgeLevel" 
                    value="Beginner" 
                    checked={knowledgeLevel === 'Beginner'} 
                    onChange={(e) => setKnowledgeLevel(e.target.value)} 
                  />
                  Beginner
                </label>
                <label className={`option ${knowledgeLevel === 'Intermediate' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="knowledgeLevel" 
                    value="Intermediate" 
                    checked={knowledgeLevel === 'Intermediate'} 
                    onChange={(e) => setKnowledgeLevel(e.target.value)} 
                  />
                  Intermediate
                </label>
                <label className={`option ${knowledgeLevel === 'Advanced' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="knowledgeLevel" 
                    value="Advanced" 
                    checked={knowledgeLevel === 'Advanced'} 
                    onChange={(e) => setKnowledgeLevel(e.target.value)} 
                  />
                  Advanced
                </label>
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="question-step">
              <h3>Which learning style do you prefer?</h3>
              <div className="options">
                <label className={`option ${learningStyle === 'Visual' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="learningStyle" 
                    value="Visual" 
                    checked={learningStyle === 'Visual'} 
                    onChange={(e) => setLearningStyle(e.target.value)} 
                  />
                  Visual
                </label>
                <label className={`option ${learningStyle === 'Auditory' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="learningStyle" 
                    value="Auditory" 
                    checked={learningStyle === 'Auditory'} 
                    onChange={(e) => setLearningStyle(e.target.value)} 
                  />
                  Auditory
                </label>
                <label className={`option ${learningStyle === 'Kinesthetic' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="learningStyle" 
                    value="Kinesthetic" 
                    checked={learningStyle === 'Kinesthetic'} 
                    onChange={(e) => setLearningStyle(e.target.value)} 
                  />
                  Kinesthetic
                </label>
                <label className={`option ${learningStyle === 'General' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="learningStyle" 
                    value="General" 
                    checked={learningStyle === 'General'} 
                    onChange={(e) => setLearningStyle(e.target.value)} 
                  />
                  General
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="questionnaire-modal-footer">
          {currentStep > 1 && (
            <button className="btn btn-outline" onClick={handlePrev}>
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button 
              className="btn btn-primary" 
              onClick={handleNext} 
              disabled={
                (currentStep === 1 && !educationLevel) || 
                (currentStep === 2 && !domain) || 
                (currentStep === 3 && !knowledgeLevel)
              }
            >
              Next
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit} 
              disabled={!learningStyle}
            >
              Get Recommendations
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [query, setQuery] = useState('');
  const [vakg, setVakg] = useState([]);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({
    Visual: 0,
    Auditory: 0,
    Kinesthetic: 0,
    General: 0
  });
  const [recommendations, setRecommendations] = useState([]);
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [activeTab, setActiveTab] = useState('home');
  // New state for questionnaire
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireResults, setQuestionnaireResults] = useState([]);
  const [showQuestionnaireResults, setShowQuestionnaireResults] = useState(false);
  // New state for username and enrolled courses
  const [username, setUsername] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const navigate = useNavigate();

  // Modified useEffect to check authentication without immediate redirects
  useEffect(() => {
      const token = localStorage.getItem('token');
      
      // Just check authentication status, don't navigate
      setIsAuthenticated(!!token);
      
      if (token) {
          // Get user info including username
          axios.get('http://localhost:5000/user-info', {
              headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => {
              setUsername(res.data.username || 'User');
              setEnrolledCourses(res.data.enrolled_courses || []);
          })
          .catch(error => handleAuthError(error));

          // Get user progress
          axios.get('http://localhost:5000/progress', {
              headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => setProgress(res.data))
          .catch(error => handleAuthError(error));

          // Get recommendations
          axios.get('http://localhost:5000/recommend', {
              headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => setRecommendations(res.data))
          .catch(error => handleAuthError(error));
          
          // Simulate fetching trending courses
          // In a real app, you would have an API endpoint for this
          const mockTrendingCourses = [
              {
                  Title: "Advanced Deep Learning",
                  Category: "Visual",
                  short_intro: "Master deep learning techniques with practical exercises and real-world applications."
              },
              {
                  Title: "Data Storytelling",
                  Category: "Auditory",
                  short_intro: "Learn to communicate data insights effectively through compelling narratives."
              },
              {
                  Title: "Hands-on Robotics",
                  Category: "Kinesthetic",
                  short_intro: "Build your own robots and learn mechanical engineering principles through practice."
              }
          ];
          setTrendingCourses(mockTrendingCourses);
      }
      
      // Mark loading as complete after we've set the authentication state
      setIsLoading(false);
  }, []); // Only run once on component mount

  // Remove this useEffect that was causing problems
  // useEffect(() => {
  //   if (window.location.pathname === '/register') {
  //     console.log("On register page, preventing redirects");
  //     // Force isAuthenticated to false when on register page
  //     setIsAuthenticated(false);
  //   }
  // }, [window.location.pathname]);

  const handleAuthError = (error) => {
      if (error.response && error.response.status === 401) {
          alert('Session expired. Please log in again.');
          logout();
      }
  };

  const handleSearch = (page = 1, searchQuery = query) => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    // Create query string manually to ensure proper formatting
    let url = `http://localhost:5000/search?query=${encodeURIComponent(searchQuery)}&page=${page}`;
    
    // Add each category parameter
    if (vakg && vakg.length > 0) {
        vakg.forEach(category => {
            url += `&vakg=${encodeURIComponent(category)}`;
        });
    }
  
    axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        setCourses(res.data.courses);
        setTotalPages(res.data.total_pages);
        setCurrentPage(res.data.current_page);
    })
    .catch(error => handleAuthError(error));
  };

  // Handle search input change
  const handleQueryChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
  };

  const enrollCourse = (course) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      axios.post('http://localhost:5000/enroll', { course }, {
          headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
          alert('Enrolled successfully!');
          // Update enrolled courses
          setEnrolledCourses([...enrolledCourses, { ...course, progress: 0 }]);
          // Update progress after enrolling
          axios.get('http://localhost:5000/progress', {
              headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => setProgress(res.data))
          .catch(error => handleAuthError(error));
      })
      .catch(error => handleAuthError(error));
  };

  const logout = () => {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      navigate('/login');
  };

  // Handle questionnaire submission
  const submitQuestionnaire = (answers) => {
      const token = localStorage.getItem('token');
      if (!token) return;

      axios.post('http://localhost:5000/questionnaire-recommend', answers, {
          headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
          setQuestionnaireResults(res.data);
          setShowQuestionnaire(false);
          setShowQuestionnaireResults(true);
      })
      .catch(error => handleAuthError(error));
  };

  // Hide questionnaire and results
  const cancelQuestionnaire = () => {
      setShowQuestionnaire(false);
      setShowQuestionnaireResults(false);
  };

  // Create chart data in the format recharts expects
  const chartData = Object.keys(progress).map(key => ({
      name: key,
      value: progress[key]
  }));

  // Dashboard Home Page
  const HomePage = () => (
    <div className="dashboard">
      <div className="dashboard-main">
        <CourseCarousel 
          title="Recommended For You" 
          courses={recommendations} 
          enrollCourse={enrollCourse} 
        />
        
        <CourseCarousel 
          title="Trending Courses" 
          courses={trendingCourses} 
          enrollCourse={enrollCourse} 
        />
      </div>
    </div>
  );

  // Modified Recommendations Page with fixed search functionality
  const RecommendationsPage = () => (
      <div>
          <div className="search-container">
              <div className="search-header">
                  <h2 className="section-title">Find Courses</h2>
                  <button 
                      className="btn btn-secondary help-button"
                      onClick={() => setShowQuestionnaire(true)}
                  >
                      Don't know what to choose?
                  </button>
              </div>
              <SearchInput 
                  initialQuery={query} 
                  onSearch={(searchQuery) => {
                      setQuery(searchQuery);
                      handleSearch(1, searchQuery);
                  }} 
              />
              
              <div className="filter-group">
                  {["Visual", "Auditory", "Kinesthetic", "General"].map(style => (
                      <label key={style} className="filter-label">
                          <input 
                              type="checkbox" 
                              value={style} 
                              checked={vakg.includes(style)}
                              onChange={e => {
                                  setVakg(e.target.checked 
                                      ? [...vakg, style] 
                                      : vakg.filter(v => v !== style))
                              }} 
                          />
                          {style}
                      </label>
                  ))}
              </div>
          </div>

          {/* Questionnaire popup */}
          {showQuestionnaire && (
              <Questionnaire 
                  submitQuestionnaire={submitQuestionnaire}
                  cancelQuestionnaire={cancelQuestionnaire}
              />
          )}

          {/* Questionnaire results */}
          {showQuestionnaireResults && (
              <div className="recommendation-results">
                  <h2 className="section-title">Personalized Recommendations</h2>
                  <p>Based on your answers, we think these courses would be great for you:</p>
                  <div className="course-grid">
                      {questionnaireResults.length > 0 ? questionnaireResults.map((course, index) => (
                          <CourseCard key={index} course={course} enrollCourse={enrollCourse} />
                      )) : <p>No matching courses found. Try different preferences.</p>}
                  </div>
                  <button className="btn btn-outline" onClick={cancelQuestionnaire}>
                      Clear Results
                  </button>
              </div>
          )}

          {!showQuestionnaire && !showQuestionnaireResults && (
              <>
                  <h2 className="section-title">Search Results</h2>
                  <div className="course-grid">
                      {courses.length > 0 ? courses.map((course, index) => (
                          <CourseCard key={index} course={course} enrollCourse={enrollCourse} />
                      )) : <p>No courses found matching your criteria</p>}
                  </div>

                  {courses.length > 0 && (
                      <div className="pagination">
                          <button 
                              disabled={currentPage <= 1} 
                              onClick={() => handleSearch(currentPage - 1)}
                          >
                              Previous
                          </button>
                          <span>Page {currentPage} of {totalPages}</span>
                          <button 
                              disabled={currentPage >= totalPages} 
                              onClick={() => handleSearch(currentPage + 1)}
                          >
                              Next
                          </button>
                      </div>
                  )}
              </>
          )}
      </div>
  );
  const ProfilePage = () => {
    const [username, setUsername] = useState("");
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [showCertificateForm, setShowCertificateForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [certificateLink, setCertificateLink] = useState("");
    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    useEffect(() => {
        fetchProfileData();
    }, []);

    // Fetch user profile data
    const fetchProfileData = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        setUsername(data.username || "User");
        
        // Ensure courses have a status field (default to "ongoing")
        const coursesWithStatus = (data.enrolled_courses || []).map(course => ({
            ...course,
            status: course.status || "ongoing"
        }));
        
        setEnrolledCourses(coursesWithStatus);
        
        // Prepare learning chart data
        const learningStats = {
            Visual: 0,
            Auditory: 0,
            Kinesthetic: 0,
            General: 0
        };
        coursesWithStatus.forEach(course => {
            learningStats[course.Category] += 1;
        });

        setChartData(Object.keys(learningStats).map(key => ({
            name: key,
            value: learningStats[key]
        })));
    };
    
    const handleCertificateSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedCourse || !certificateLink) {
            alert("Please select a course and provide a certificate link");
            return;
        }
        
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5000/complete-course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    course_title: selectedCourse,
                    certificate_link: certificateLink
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert("Course marked as completed!");
                setShowCertificateForm(false);
                setSelectedCourse("");
                setCertificateLink("");
                fetchProfileData(); // Refresh data
            } else {
                alert(data.error || "Failed to complete course");
            }
        } catch (error) {
            console.error("Error completing course:", error);
            alert("Failed to complete course. Please try again.");
        }
    };

    // Filter courses by status
    const ongoingCourses = enrolledCourses.filter(course => course.status === "ongoing");
    const completedCourses = enrolledCourses.filter(course => course.status === "completed");

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="welcome-message">Welcome, {username}!</h1>
            </div>

            <div className="profile-content">
                {/* Ongoing Courses Section */}
                <div className="profile-section enrolled-courses">
                    <div className="enrolled-header">
                        <h2 className="section-title">Your Ongoing Courses</h2>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowCertificateForm(true)}
                            disabled={ongoingCourses.length === 0}
                        >
                            Complete a Course
                        </button>
                    </div>
                    
                    {/* Certificate Submission Form */}
                    {showCertificateForm && (
                        <div className="certificate-form-container">
                            <form onSubmit={handleCertificateSubmit} className="certificate-form">
                                <h3>Submit Course Certificate</h3>
                                
                                <div className="form-group">
                                    <label>Select Course:</label>
                                    <select 
                                        value={selectedCourse} 
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select a course --</option>
                                        {ongoingCourses.map((course, index) => (
                                            <option key={index} value={course.Title}>
                                                {course.Title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Certificate Link or Code:</label>
                                    <input 
                                        type="text" 
                                        value={certificateLink}
                                        onChange={(e) => setCertificateLink(e.target.value)}
                                        placeholder="https://example.com/certificate or code"
                                        required
                                    />
                                </div>
                                
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline"
                                        onClick={() => setShowCertificateForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {ongoingCourses.length > 0 ? (
                        <div className="enrolled-courses-list">
                            {ongoingCourses.map((course, index) => (
                                <div key={index} className="enrolled-course-card">
                                    <div className="course-info">
                                        <h3 className="course-title">{course.Title}</h3>
                                        <span className={`course-category category-${course.Category.toLowerCase()}`}>
                                            {course.Category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-courses-message">
                            You don't have any ongoing courses.
                            <br /><a href="/recommendations">Explore courses</a> to start your learning journey!
                        </p>
                    )}
                </div>

                {/* Completed Courses Section */}
                <div className="profile-section completed-courses">
                    <h2 className="section-title">Your Completed Courses</h2>
                    
                    {completedCourses.length > 0 ? (
                        <div className="completed-courses-list">
                            {completedCourses.map((course, index) => (
                                <div key={index} className="completed-course-card">
                                    <div className="course-info">
                                        <h3 className="course-title">{course.Title}</h3>
                                        <span className={`course-category category-${course.Category.toLowerCase()}`}>
                                            {course.Category}
                                        </span>
                                        <span className="course-status status-completed">
                                            Completed
                                        </span>
                                    </div>
                                    
                                    {course.certificate_link && (
                                        <div className="certificate-info">
                                            <a 
                                                href={course.certificate_link.startsWith('http') ? course.certificate_link : '#'} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="certificate-link"
                                            >
                                                {course.certificate_link.startsWith('http') ? 'View Certificate' : `Certificate Code: ${course.certificate_link}`}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-courses-message">
                            You haven't completed any courses yet.
                            <br />Complete your ongoing courses to see them here.
                        </p>
                    )}
                </div>

                {/* Learning Journey Chart */}
                <div className="profile-section learning-chart">
                    <h2 className="section-title">Your Learning Journey</h2>
                    <div className="chart-container">
                        <PieChart width={400} height={300}>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Show loading indicator while checking authentication
if (isLoading) {
  return <div className="loading">Loading...</div>;
}

// Main app layout with conditional rendering based on authentication
return (
  <div className="container">
    <ErrorBoundary>
      <Routes>
        {/* Public routes that don't require authentication */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <Register setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        
        {/* All other routes - check authentication */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <>
                <header className="header">
                  <div className="logo">Course Dashboard</div>
                  <nav className="nav">
                    <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Home
                    </NavLink>
                    <NavLink to="/recommendations" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Explore
                    </NavLink>
                    <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Profile
                    </NavLink>
                    <button onClick={logout} className="btn btn-outline">Logout</button>
                  </nav>
                </header>
                <div className="content-wrapper">
                  <HomePage />
                </div>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route 
          path="/recommendations" 
          element={
            isAuthenticated ? (
              <>
                <header className="header">
                  <div className="logo">Course Dashboard</div>
                  <nav className="nav">
                    <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Home
                    </NavLink>
                    <NavLink to="/recommendations" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Explore
                    </NavLink>
                    <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Profile
                    </NavLink>
                    <button onClick={logout} className="btn btn-outline">Logout</button>
                  </nav>
                </header>
                <div className="content-wrapper">
                  <RecommendationsPage />
                </div>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <>
                <header className="header">
                  <div className="logo">Course Dashboard</div>
                  <nav className="nav">
                    <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Home
                    </NavLink>
                    <NavLink to="/recommendations" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Explore
                    </NavLink>
                    <NavLink to="/profile" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                      Profile
                    </NavLink>
                    <button onClick={logout} className="btn btn-outline">Logout</button>
                  </nav>
                </header>
                <div className="content-wrapper">
                  <ProfilePage />
                </div>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </ErrorBoundary>
  </div>
);
}




export default App;