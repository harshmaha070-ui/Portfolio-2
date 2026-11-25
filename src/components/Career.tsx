import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Self-Taught &amp; PC Training</h4>
                <h5>Red &amp; White Multimedia Education</h5>
              </div>
              <h3>START</h3>
            </div>
            <p>
              Self-taught mobile video editor who learned through YouTube
              tutorials and regular practice, later learning PC video editing
              from Red &amp; White Multimedia Education.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Video Editor</h4>
                <h5>Marketing Company (12-2025 – 04-2026)</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Worked as a Video Editor at a marketing company from December 2025
              to April 2026, turning raw footage into engaging and professional
              videos.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Freelance Video Editor</h4>
                <h5>Red &amp; White &amp; Freelance (2025 – Present)</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Freelance Video Editor (2025 – Present) editing YouTube Videos,
              Shorts, and Instagram Reels, alongside client video edits at Red
              &amp; White Multimedia Education (05-2026 – Present).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
