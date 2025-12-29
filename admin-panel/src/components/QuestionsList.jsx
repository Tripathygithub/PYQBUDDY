import { useState, useEffect } from 'react';
import { getAllQuestions, deleteQuestion, searchQuestions } from '../api';

export default function QuestionsList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    examType: '',
    subject: '',
    topic: '',
    difficulty: '',
    isVerified: ''
  });

  // Fetch questions
  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.year) params.year = filters.year;
      if (filters.examType) params.examType = filters.examType;
      if (filters.subject) params.subject = filters.subject;
      if (filters.topic) params.topic = filters.topic;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.isVerified !== '') params.isVerified = filters.isVerified;

      const response = await getAllQuestions(params);
      console.log('API Response:', response.data);
      setQuestions(response.data.data?.questions || []);
    } catch (err) {
      setError('Failed to fetch questions: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search questions
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchQuestions();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await searchQuestions(searchTerm, filters);
      console.log('Search Response:', response.data);
      setQuestions(response.data.data?.questions || []);
    } catch (err) {
      setError('Search failed: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const handleDelete = async (id, questionId) => {
    if (!confirm(`Are you sure you want to delete question ${questionId}?`)) {
      return;
    }

    try {
      await deleteQuestion(id);
      alert('Question deleted successfully!');
      fetchQuestions();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
      console.error(err);
    }
  };

  // Load questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Apply filters
  const applyFilters = () => {
    fetchQuestions();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      year: '',
      examType: '',
      subject: '',
      topic: '',
      difficulty: '',
      isVerified: ''
    });
    setSearchTerm('');
    setTimeout(() => fetchQuestions(), 100);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Questions Management</h1>
        <p className="text-gray-600">View, search, edit, and delete questions</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            type="number"
            placeholder="Year"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="px-3 py-2 border rounded-md"
          />
          
          <select
            value={filters.examType}
            onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Exam Types</option>
            <option value="prelims">Prelims</option>
            <option value="mains">Mains</option>
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="px-3 py-2 border rounded-md"
          />

          <input
            type="text"
            placeholder="Topic"
            value={filters.topic}
            onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
            className="px-3 py-2 border rounded-md"
          />

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={filters.isVerified}
            onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      )}

      {/* Questions Count */}
      {!loading && (
        <div className="mb-4 text-gray-600">
          Found {questions.length} question(s)
        </div>
      )}

      {/* Questions Table */}
      {!loading && questions.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Question ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Exam Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Topic</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Difficulty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{q.questionId}</td>
                    <td className="px-4 py-3 text-sm">{q.year}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {q.examType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{q.subject}</td>
                    <td className="px-4 py-3 text-sm">{q.topic || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {q.isVerified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.location.href = `/questions/${q._id}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                        >
                          View
                        </button>
                        <button
                          onClick={() => window.location.href = `/edit/${q._id}`}
                          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q._id, q.questionId)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && questions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No questions found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
