/**
 * Centralized Skills Constants
 * Used across JobDetailScreen, SkillsEditScreen, and JobTracker
 */

export const allSkills = [
  // Design Skills
  'Interaction Design', 'Visual Design', 'Sketching', 'Typography',
  'Adobe XD', 'Figma', 'Sketch', 'Prototype', 'Information Architecture',
  'Conceptualization', 'Adobe Creative Suite', 'Wireframing', 'User Research',
  'UI Design', 'UX Design', 'Graphic Design', 'Illustration', 'Animation',
  'InVision', 'Axure', 'Balsamiq', 'Zeplin', 'Abstract',
  
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl',
  'Objective-C', 'Dart', 'Elixir', 'Haskell', 'SQL', 'HTML', 'CSS',
  
  // Web Development
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'Nuxt.js',
  'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Laravel', 'Ruby on Rails',
  'Gatsby', 'Svelte', 'Ember.js', 'jQuery', 'Bootstrap', 'Tailwind CSS',
  'Material-UI', 'Sass', 'Less', 'Webpack', 'Vite', 'Babel',
  
  // Mobile Development
  'React Native', 'Flutter', 'iOS Development', 'Android Development',
  'Xamarin', 'Ionic', 'Cordova', 'SwiftUI', 'Jetpack Compose',
  
  // Database & Data
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
  'Firebase', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'Neo4j',
  'Data Analysis', 'Data Science', 'Machine Learning', 'Deep Learning',
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
  'Data Visualization', 'Tableau', 'Power BI', 'Apache Spark', 'Hadoop',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
  'CI/CD', 'Terraform', 'Ansible', 'Git', 'GitHub', 'GitLab', 'Bitbucket',
  'CircleCI', 'Travis CI', 'DevOps', 'Linux', 'Bash', 'PowerShell',
  
  // Testing
  'Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'PyTest',
  'Test Automation', 'Unit Testing', 'Integration Testing', 'E2E Testing',
  
  // Soft Skills
  'Project Management', 'Agile', 'Scrum', 'Kanban', 'Leadership',
  'Team Collaboration', 'Communication', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Stakeholder Management', 'Presentation Skills',
  
  // Marketing & Business
  'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
  'Email Marketing', 'Google Analytics', 'Facebook Ads', 'Google Ads',
  'Marketing Automation', 'CRM', 'Salesforce', 'HubSpot', 'Business Analysis',
  'Product Management', 'Strategic Planning', 'Market Research',
  
  // Other Technical Skills
  'Cybersecurity', 'Network Security', 'Penetration Testing', 'Blockchain',
  'IoT', 'AR/VR', 'Unity', 'Unreal Engine', 'Game Development',
  'API Development', 'RESTful APIs', 'GraphQL', 'Microservices',
  'System Design', 'Algorithm Design', 'Data Structures',
].sort();

export const skillCategories = {
  "Design": [
    'Interaction Design', 'Visual Design', 'Sketching', 'Typography',
    'Adobe XD', 'Figma', 'Sketch', 'Prototype', 'Information Architecture',
    'Conceptualization', 'Adobe Creative Suite', 'Wireframing', 'User Research',
    'UI Design', 'UX Design', 'Graphic Design', 'Illustration', 'Animation',
    'InVision', 'Axure', 'Balsamiq', 'Zeplin', 'Abstract',
  ],
  "Programming Languages": [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl',
    'Objective-C', 'Dart', 'Elixir', 'Haskell', 'SQL', 'HTML', 'CSS',
  ],
  "Web Development": [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'Nuxt.js',
    'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Laravel', 'Ruby on Rails',
    'Gatsby', 'Svelte', 'Ember.js', 'jQuery', 'Bootstrap', 'Tailwind CSS',
    'Material-UI', 'Sass', 'Less', 'Webpack', 'Vite', 'Babel',
  ],
  "Mobile Development": [
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'Xamarin', 'Ionic', 'Cordova', 'SwiftUI', 'Jetpack Compose',
  ],
  "Database & Data": [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server',
    'Firebase', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'Neo4j',
    'Data Analysis', 'Data Science', 'Machine Learning', 'Deep Learning',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
    'Data Visualization', 'Tableau', 'Power BI', 'Apache Spark', 'Hadoop',
  ],
  "Cloud & DevOps": [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'CI/CD', 'Terraform', 'Ansible', 'Git', 'GitHub', 'GitLab', 'Bitbucket',
    'CircleCI', 'Travis CI', 'DevOps', 'Linux', 'Bash', 'PowerShell',
  ],
  "Testing": [
    'Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'PyTest',
    'Test Automation', 'Unit Testing', 'Integration Testing', 'E2E Testing',
  ],
  "Soft Skills": [
    'Project Management', 'Agile', 'Scrum', 'Kanban', 'Leadership',
    'Team Collaboration', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Time Management', 'Stakeholder Management', 'Presentation Skills',
  ],
  "Marketing & Business": [
    'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Email Marketing', 'Google Analytics', 'Facebook Ads', 'Google Ads',
    'Marketing Automation', 'CRM', 'Salesforce', 'HubSpot', 'Business Analysis',
    'Product Management', 'Strategic Planning', 'Market Research',
  ],
  "Other Technical Skills": [
    'Cybersecurity', 'Network Security', 'Penetration Testing', 'Blockchain',
    'IoT', 'AR/VR', 'Unity', 'Unreal Engine', 'Game Development',
    'API Development', 'RESTful APIs', 'GraphQL', 'Microservices',
    'System Design', 'Algorithm Design', 'Data Structures',
  ],
};
