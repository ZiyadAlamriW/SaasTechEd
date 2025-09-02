const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateRequired = (fields, data) => {
  const errors = [];
  
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }
  
  return errors;
};

const validateUserRegistration = (data) => {
  const errors = [];
  
  // Required fields
  const requiredFields = ['name', 'email', 'password'];
  errors.push(...validateRequired(requiredFields, data));
  
  // Email validation
  if (data.email && !validateEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Password validation
  if (data.password && !validatePassword(data.password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
  }
  
  // Name validation
  if (data.name && data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  return errors;
};

const validateStudent = (data) => {
  const errors = [];
  
  // Required fields
  const requiredFields = ['name', 'email'];
  errors.push(...validateRequired(requiredFields, data));
  
  // Email validation
  if (data.email && !validateEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Name validation
  if (data.name && data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  return errors;
};

const validateGrade = (data) => {
  const errors = [];
  
  // Required fields
  const requiredFields = ['student_id', 'subject', 'score', 'max_score'];
  errors.push(...validateRequired(requiredFields, data));
  
  // Score validation
  if (data.score !== undefined && (isNaN(data.score) || data.score < 0)) {
    errors.push('Score must be a positive number');
  }
  
  if (data.max_score !== undefined && (isNaN(data.max_score) || data.max_score <= 0)) {
    errors.push('Max score must be a positive number');
  }
  
  if (data.score !== undefined && data.max_score !== undefined && data.score > data.max_score) {
    errors.push('Score cannot be greater than max score');
  }
  
  return errors;
};

const validateQuiz = (data) => {
  const errors = [];
  
  // Required fields
  const requiredFields = ['title'];
  errors.push(...validateRequired(requiredFields, data));
  
  // Title validation
  if (data.title && data.title.trim().length < 3) {
    errors.push('Quiz title must be at least 3 characters');
  }
  
  // Deadline validation
  if (data.deadline && new Date(data.deadline) <= new Date()) {
    errors.push('Deadline must be in the future');
  }
  
  return errors;
};

const validateQuizQuestion = (data) => {
  const errors = [];
  
  // Required fields
  const requiredFields = ['question', 'correct_answer'];
  errors.push(...validateRequired(requiredFields, data));
  
  // Question validation
  if (data.question && data.question.trim().length < 5) {
    errors.push('Question must be at least 5 characters');
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  validateUserRegistration,
  validateStudent,
  validateGrade,
  validateQuiz,
  validateQuizQuestion
};
