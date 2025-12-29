import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestionById, deleteQuestion, toggleVerification } from '../api';

export default function QuestionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await getQuestionById(id);
      setQuestion(response.data.data?.question);
    } catch (err) {
      setError('Failed to load question: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await deleteQuestion(id);
      alert('Question deleted successfully!');
      navigate('/questions');
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleToggleVerification = async () => {
    try {
      await toggleVerification(id);
      alert('Verification status updated!');
      fetchQuestion();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading question...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Question not found'}
        </div>
        <button
          onClick={() => navigate('/questions')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Questions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/questions')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Questions
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Edit
          </button>
          <button
            onClick={handleToggleVerification}
            className={`px-4 py-2 rounded text-white ${
              question.isVerified ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {question.isVerified ? 'Unverify' : 'Verify'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Question Details */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Metadata */}
        <div className="border-b pb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
              {question.questionId}
            </span>
            {question.isVerified && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                ✓ Verified
              </span>
            )}
            <span className={`px-3 py-1 rounded text-sm ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {question.difficulty}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Year:</span> {question.year}
            </div>
            <div>
              <span className="font-semibold">Exam Type:</span> {question.examType}
            </div>
            <div>
              <span className="font-semibold">Exam Name:</span> {question.examName}
            </div>
            <div>
              <span className="font-semibold">Marks:</span> {question.marks}
            </div>
            <div>
              <span className="font-semibold">Subject:</span> {question.subject}
            </div>
            <div>
              <span className="font-semibold">Topic:</span> {question.topic || '-'}
            </div>
            <div>
              <span className="font-semibold">Views:</span> {question.viewCount}
            </div>
            <div>
              <span className="font-semibold">Attempts:</span> {question.attemptCount}
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Question:</h3>
          <div 
            className="preview-content prose max-w-none p-4 bg-gray-50 rounded"
            dangerouslySetInnerHTML={{ __html: question.questionText }}
          />
        </div>

        {/* Options */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Options:</h3>
          <div className="space-y-2">
            {Object.entries(question.options || {}).map(([key, value]) => (
              <div
                key={key}
                className={`p-3 rounded border-2 ${
                  question.correctAnswer === key
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <span className="font-semibold">{key}:</span> {value}
                {question.correctAnswer === key && (
                  <span className="ml-2 text-green-600 font-semibold">✓ Correct Answer</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {question.explanation && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Explanation:</h3>
            <div 
              className="preview-content prose max-w-none p-4 bg-gray-50 rounded"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </div>
        )}

        {/* Images */}
        {question.questionImages && question.questionImages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Question Images:</h3>
            <div className="grid grid-cols-2 gap-4">
              {question.questionImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Question image ${idx + 1}`}
                  className="w-full rounded border"
                />
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t pt-4 text-sm text-gray-600">
          <div>Created: {new Date(question.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(question.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
